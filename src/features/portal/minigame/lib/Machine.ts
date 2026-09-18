import { OFFLINE_FARM } from "features/game/lib/landData";
import { assign, createMachine, type Interpreter, type State } from "xstate";
import { CONFIG } from "lib/config";
import { decodeToken } from "features/auth/actions/login";
import {
  FREE_DAILY_ATTEMPTS,
  GAME_SECONDS,
  GAME_LIVES,
  PORTAL_NAME,
  DROP_ITEM_XP_VALUES,
  getLevelUpChoice,
  getNextLevelXP,
  getUnlockedWeapons,
  isPlayerMaxLevel,
  LEVEL_UP_WEAPON_IDS,
  PLAYER_INITIAL_LEVEL,
  ENEMY_BALANCE_STATS,
  getActiveWearableBuffs,
  NO_WEARABLE_BUFF_SCORE_MULTIPLIER,
} from "../constants";
import {
  CHEST_BONUS_LEVEL_CHANCES,
  DEFAULT_PERK_LEVELS,
  getPerkAmount,
} from "../constants/PerkConstants";
import { CHEST_LEVELS } from "../constants/ChestConstants";
import { getChestLevelUpChoice } from "../constants/PlayerLevelConstants";
import type { GameState } from "features/game/types/game";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { purchaseMinigameItem } from "features/game/events/minigames/purchaseMinigameItem";
import { startMinigameAttempt } from "features/game/events/minigames/startMinigameAttempt";
import { submitMinigameScore } from "features/game/events/minigames/submitMinigameScore";
import { submitScore, startAttempt } from "features/portal/lib/portalUtil";
import { getUrl, loadPortal } from "features/portal/actions/loadPortal";
import { getAttemptsLeft, getUnlimitedAttemptsSfl } from "./Utils";
import type {
  ChestRarity,
  DropItemType,
  EnemyType,
  LevelUpChoice,
  LevelUpOption,
  PerkLevels,
  WeaponId,
  WeaponLevel,
} from "../Types";

const getJWT = () => {
  const code = new URLSearchParams(window.location.search).get("jwt");
  return code;
};

const getRunScore = (context: Context) => context.collected;

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const getFinalRunScore = (context: Context) => {
  const baseScore = getRunScore(context);
  const bonusApplied = !context.usedWearableBuff;

  return {
    baseScore,
    bonusApplied,
    score: bonusApplied
      ? roundToTwoDecimals(baseScore * NO_WEARABLE_BUFF_SCORE_MULTIPLIER)
      : baseScore,
  };
};

const getMaxLives = (perkLevels?: PerkLevels) =>
  GAME_LIVES + getPerkAmount(perkLevels, "maxHealth");

export interface Context {
  id: number;
  jwt: string | null;
  isJoystickActive: boolean;
  state: GameState | undefined;
  score: number;
  collected: number;
  lastScore: number;
  lastBaseScore: number;
  lastScoreBonusApplied: boolean;
  usedWearableBuff: boolean;
  endAt: number;
  attemptsLeft: number;
  lives: number;
  maxLives: number;
  validations: Record<string, boolean>;
  isTraining: boolean;

  playerLevel: number;
  currentXP: number;
  nextLevelXP?: number;
  pendingLevelUpChoice?: LevelUpChoice;
  // How many more chest choice screens remain after the current one (only
  // set while pendingLevelUpChoice.source === "chest"). An epic chest (2
  // levels) starts this at 1, a legendary (3 levels) at 2; each resolved
  // chest choice decrements it until it hits 0, at which point gameplay
  // resumes instead of showing another choice.
  pendingChoiceQueue: ("levelUp" | "chest")[];
  isGameplayPaused: boolean;
  gameplayPausedAt?: number;
  weaponLevels: Record<WeaponId, WeaponLevel>;
  hudWeapons: WeaponId[];
  perkLevels: PerkLevels;
  activeWearables?: BumpkinParts;
}

const DEFAULT_WEAPON_LEVELS: Record<WeaponId, WeaponLevel> =
  LEVEL_UP_WEAPON_IDS.reduce(
    (levels, weaponId) => ({
      ...levels,
      [weaponId]: 0,
    }),
    {} as Record<WeaponId, WeaponLevel>,
  );

const getInitialProgression = ({
  withInitialWeaponChoice = false,
}: {
  withInitialWeaponChoice?: boolean;
} = {}) => {
  const weaponLevels = { ...DEFAULT_WEAPON_LEVELS };
  const perkLevels = { ...DEFAULT_PERK_LEVELS };
  const pendingLevelUpChoice = withInitialWeaponChoice
    ? getLevelUpChoice({
        level: PLAYER_INITIAL_LEVEL,
        weaponLevels,
        perkLevels,
      })
    : undefined;

  return {
    collected: 0,
    playerLevel: PLAYER_INITIAL_LEVEL,
    currentXP: 0,
    nextLevelXP: getNextLevelXP(PLAYER_INITIAL_LEVEL),
    pendingLevelUpChoice,
    pendingChoiceQueue: [] as ("levelUp" | "chest")[],
    isGameplayPaused: !!pendingLevelUpChoice,
    gameplayPausedAt: undefined,
    weaponLevels,
    hudWeapons: [] as WeaponId[],
    perkLevels,
  };
};

const pauseGameplayClock = (context: Context): Partial<Context> => ({
  isGameplayPaused: true,
  gameplayPausedAt:
    context.endAt > 0 ? (context.gameplayPausedAt ?? Date.now()) : undefined,
});

const resolveNextQueuedChoice = ({
  queue,
  playerLevel,
  weaponLevels,
  perkLevels,
}: {
  queue: ("levelUp" | "chest")[];
  playerLevel: number;
  weaponLevels: Record<WeaponId, WeaponLevel>;
  perkLevels: PerkLevels;
}): {
  pendingLevelUpChoice?: LevelUpChoice;
  pendingChoiceQueue: ("levelUp" | "chest")[];
} => {
  const remaining = [...queue];

  while (remaining.length > 0) {
    const source = remaining.shift();

    const choice =
      source === "chest"
        ? getChestLevelUpChoice({
            level: playerLevel,
            weaponLevels,
            perkLevels,
            bonusLevelChances: CHEST_BONUS_LEVEL_CHANCES,
          })
        : getLevelUpChoice({ level: playerLevel, weaponLevels, perkLevels });

    if (choice) {
      return { pendingLevelUpChoice: choice, pendingChoiceQueue: remaining };
    }
  }

  return { pendingLevelUpChoice: undefined, pendingChoiceQueue: [] };
};

const resumeGameplayClock = (context: Context): Partial<Context> => {
  const pausedDuration =
    context.endAt > 0 && context.gameplayPausedAt !== undefined
      ? Date.now() - context.gameplayPausedAt
      : 0;

  return {
    isGameplayPaused: false,
    gameplayPausedAt: undefined,
    endAt: context.endAt > 0 ? context.endAt + pausedDuration : context.endAt,
  };
};

const resolveXPProgression = ({
  context,
  gainedXP,
}: {
  context: Context;
  gainedXP: number;
}): Partial<Context> => {
  const xpGainBonus = getPerkAmount(context.perkLevels, "xpGain");
  const adjustedXP =
    xpGainBonus > 0 ? Math.round(gainedXP * (1 + xpGainBonus)) : gainedXP;

  if (isPlayerMaxLevel(context.playerLevel)) {
    return {
      collected: context.collected + adjustedXP,
    };
  }

  let playerLevel = context.playerLevel;
  let currentXP = context.currentXP + adjustedXP;
  let nextLevelXP = getNextLevelXP(playerLevel);
  const queue = [...context.pendingChoiceQueue];

  while (nextLevelXP !== undefined && currentXP >= nextLevelXP) {
    currentXP -= nextLevelXP;
    playerLevel += 1;
    nextLevelXP = getNextLevelXP(playerLevel);

    if (isPlayerMaxLevel(playerLevel)) {
      currentXP = 0;
      break;
    }

    queue.push("levelUp");
  }

  const progression = {
    collected: context.collected + adjustedXP,
    playerLevel,
    currentXP,
    nextLevelXP,
  };

  if (context.pendingLevelUpChoice) {
    return { ...progression, pendingChoiceQueue: queue };
  }

  const nextChoice = resolveNextQueuedChoice({
    queue,
    playerLevel,
    weaponLevels: context.weaponLevels,
    perkLevels: context.perkLevels,
  });

  return {
    ...progression,
    ...nextChoice,
    isGameplayPaused: nextChoice.pendingLevelUpChoice
      ? true
      : context.isGameplayPaused,
    gameplayPausedAt: nextChoice.pendingLevelUpChoice
      ? context.endAt > 0
        ? (context.gameplayPausedAt ?? Date.now())
        : undefined
      : context.gameplayPausedAt,
  };
};

// type UnlockAchievementsEvent = {
//   type: "UNLOCKED_ACHIEVEMENTS";
//   achievementNames: AchievementsName[];
// };

type SetJoystickActiveEvent = {
  type: "SET_JOYSTICK_ACTIVE";
  isJoystickActive: boolean;
};

type PurchaseRestockEvent = {
  type: "PURCHASED_RESTOCK";
  sfl: number;
};

type PurchaseUnlimitedEvent = {
  type: "PURCHASED_UNLIMITED";
  sfl: number;
};

type GainPointsEvent = {
  type: "GAIN_POINTS";
  points: number;
};

type LoseLifeEvent = {
  type: "LOSE_LIFE";
  enemyType: EnemyType;
};

type CollectItemEvent = {
  type: "COLLECT_ITEM";
  itemKey: DropItemType;
};

type SetValidationsEvent = {
  type: "SET_VALIDATIONS";
  validation: string;
};

type SelectLevelUpOptionEvent = {
  type: "SELECT_LEVEL_UP_OPTION";
  option: LevelUpOption;
};

type HealEvent = {
  type: "HEAL";
  amount: number;
};

type ChestOpenedEvent = {
  type: "CHEST_OPENED";
  rarity: ChestRarity;
};

type SetGameplayPausedEvent = {
  type: "SET_GAMEPLAY_PAUSED";
  isPaused: boolean;
};

type SetActiveWearablesEvent = {
  type: "SET_ACTIVE_WEARABLES";
  wearables: BumpkinParts;
};

export type PortalEvent =
  | SetJoystickActiveEvent
  | { type: "START" }
  | { type: "CLAIM" }
  | { type: "CANCEL_PURCHASE" }
  | PurchaseRestockEvent
  | PurchaseUnlimitedEvent
  | { type: "RETRY" }
  | { type: "CONTINUE" }
  | { type: "CONTINUE_TRAINING" }
  | { type: "END_GAME_EARLY" }
  | { type: "GAME_OVER" }
  | GainPointsEvent
  | LoseLifeEvent
  | SetValidationsEvent
  | CollectItemEvent
  | SelectLevelUpOptionEvent
  | HealEvent
  | ChestOpenedEvent
  | SetGameplayPausedEvent
  | SetActiveWearablesEvent;

export type PortalState = {
  value:
    | "initialising"
    | "error"
    | "ready"
    | "unauthorised"
    | "loading"
    | "introduction"
    | "playing"
    | "gameOver"
    | "winner"
    | "loser"
    | "complete"
    | "starting"
    | "noAttempts";
  context: Context;
};

export type MachineInterpreter = Interpreter<
  Context,
  any,
  PortalEvent,
  PortalState
>;

export type PortalMachineState = State<Context, PortalEvent, PortalState>;

const VALIDATIONS = {};

const resetGameTransition = {
  RETRY: {
    target: "starting",
    actions: assign((context: Context): Partial<Context> => {
      const progression = getInitialProgression();
      const maxLives = getMaxLives(progression.perkLevels);

      return {
        score: 0,
        lastBaseScore: 0,
        lastScoreBonusApplied: false,
        usedWearableBuff: false,
        lives: maxLives,
        maxLives,
        endAt: 0,
        ...progression,
        activeWearables: context.activeWearables,
        validations: structuredClone(VALIDATIONS),
      };
    }) as any,
  },
};

export const portalMachine = createMachine<Context, PortalEvent, PortalState>({
  id: "portalMachine",
  initial: "initialising",
  context: {
    id: 0,
    jwt: getJWT(),

    isJoystickActive: false,

    state: CONFIG.API_URL ? undefined : OFFLINE_FARM,

    score: 0,
    lastScore: 0,
    lastBaseScore: 0,
    lastScoreBonusApplied: false,
    usedWearableBuff: false,
    lives: GAME_LIVES,
    maxLives: GAME_LIVES,
    attemptsLeft: 0,
    endAt: 0,
    isTraining: false,
    validations: structuredClone(VALIDATIONS),
    ...getInitialProgression(),

    // Portal minigame
  },
  on: {
    SET_JOYSTICK_ACTIVE: {
      actions: assign({
        isJoystickActive: (_: Context, event: SetJoystickActiveEvent) => {
          return event.isJoystickActive;
        },
      }),
    },
    SET_ACTIVE_WEARABLES: {
      actions: assign(
        (
          context: Context,
          event: SetActiveWearablesEvent,
        ): Partial<Context> => {
          const maxLives = getMaxLives(context.perkLevels);
          const maxLivesDelta = maxLives - context.maxLives;

          return {
            activeWearables: event.wearables,
            usedWearableBuff:
              context.usedWearableBuff ||
              getActiveWearableBuffs(event.wearables).length > 0,
            maxLives,
            lives:
              maxLivesDelta > 0
                ? context.lives + maxLivesDelta
                : Math.min(context.lives, maxLives),
          };
        },
      ),
    },
    SET_GAMEPLAY_PAUSED: {
      actions: assign(
        (context: Context, event: SetGameplayPausedEvent): Partial<Context> => {
          if (context.pendingLevelUpChoice) return pauseGameplayClock(context);
          if (event.isPaused) return pauseGameplayClock(context);

          return resumeGameplayClock(context);
        },
      ),
    },
    // UNLOCKED_ACHIEVEMENTS: {
    //   actions: assign({
    //     state: (context: Context, event: UnlockAchievementsEvent) => {
    //       achievementsUnlocked({ achievementNames: event.achievementNames });
    //       return unlockMinigameAchievements({
    //         state: context.state as GameState,
    //         action: {
    //           type: "minigame.achievementsUnlocked",
    //           id: PORTAL_NAME,
    //           achievementNames: event.achievementNames,
    //         },
    //       });
    //     },
    //   }),
    // },
  },
  states: {
    initialising: {
      always: [
        {
          target: "unauthorised",
          // TODO: Also validate token
          cond: (context) => !!CONFIG.API_URL && !context.jwt,
        },
        {
          target: "loading",
        },
      ],
    },
    loading: {
      id: "loading",
      invoke: {
        src: async (context) => {
          if (!getUrl()) {
            return { game: OFFLINE_FARM, attemptsLeft: FREE_DAILY_ATTEMPTS };
          }

          const { farmId } = decodeToken(context.jwt as string);

          // Load the game data
          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: context.jwt as string,
          });

          const minigame = game.minigames.games[PORTAL_NAME];
          const attemptsLeft = getAttemptsLeft(minigame, farmId);

          return { game, farmId, attemptsLeft };
        },
        onDone: [
          {
            target: "introduction",
            actions: assign({
              state: (_: Context, event) => event.data.game,
              id: (_: Context, event) => event.data.farmId,
              attemptsLeft: (_: Context, event) => event.data.attemptsLeft,
            }),
          },
        ],
        onError: {
          target: "error",
        },
      },
    },

    noAttempts: {
      on: {
        CANCEL_PURCHASE: {
          target: "introduction",
        },
        PURCHASED_RESTOCK: {
          target: "introduction",
          actions: assign({
            state: (context: Context, event: PurchaseRestockEvent) =>
              purchaseMinigameItem({
                state: context.state as GameState,
                action: {
                  id: PORTAL_NAME,
                  sfl: event.sfl,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }),
        },
        PURCHASED_UNLIMITED: {
          target: "introduction",
          cond: (context: Context, event: PurchaseUnlimitedEvent) =>
            event.sfl === getUnlimitedAttemptsSfl(context.state?.wardrobe),
          actions: assign({
            state: (context: Context, event: PurchaseUnlimitedEvent) =>
              purchaseMinigameItem({
                state: context.state as GameState,
                action: {
                  id: PORTAL_NAME,
                  sfl: event.sfl,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }),
        },
      },
    },

    starting: {
      always: [
        {
          target: "noAttempts",
          cond: (context) => {
            if (context.isTraining) return false;
            const farmId = !getUrl()
              ? 0
              : decodeToken(context.jwt as string).farmId;
            const minigame = context.state?.minigames.games[PORTAL_NAME];
            const attemptsLeft = getAttemptsLeft(minigame, farmId);
            return attemptsLeft <= 0;
          },
        },
        {
          target: "ready",
        },
      ],
    },

    introduction: {
      on: {
        CONTINUE: {
          target: "starting",
          actions: assign({
            isTraining: false,
            state: (context: Context) => context.state,
          }),
        },
        CONTINUE_TRAINING: {
          target: "starting",
          actions: assign({
            isTraining: true,
            state: (context: Context) => context.state,
          }),
        },
      },
    },

    ready: {
      on: {
        START: {
          target: "playing",
          actions: assign((context: Context): Partial<Context> => {
            const progression = getInitialProgression({
              withInitialWeaponChoice: true,
            });
            const maxLives = getMaxLives(progression.perkLevels);
            const state = (() => {
              if (context.isTraining) return context.state;
              startAttempt();
              return startMinigameAttempt({
                state: context.state as GameState,
                action: {
                  type: "minigame.attemptStarted",
                  id: PORTAL_NAME,
                },
              });
            })();

            return {
              endAt: 0,
              score: 0,
              lastScore: 0,
              lastBaseScore: 0,
              lastScoreBonusApplied: false,
              usedWearableBuff:
                getActiveWearableBuffs(context.activeWearables).length > 0,
              lives: maxLives,
              maxLives,
              ...progression,
              validations: structuredClone(VALIDATIONS),
              state,
              attemptsLeft: context.isTraining
                ? context.attemptsLeft
                : context.attemptsLeft - 1,
            };
          }) as any,
        },
      },
    },

    playing: {
      on: {
        SELECT_LEVEL_UP_OPTION: {
          actions: assign(
            (
              context: Context,
              event: SelectLevelUpOptionEvent,
            ): Partial<Context> => {
              const choice = context.pendingLevelUpChoice;
              if (choice?.type !== "levelUp") return {};

              const { option } = event;
              const isSameOption = (candidate: LevelUpOption) => {
                if (candidate.kind !== option.kind) return false;

                switch (candidate.kind) {
                  case "newWeapon":
                    return (
                      option.kind === "newWeapon" &&
                      candidate.weaponId === option.weaponId
                    );
                  case "upgradeWeapon":
                    return (
                      option.kind === "upgradeWeapon" &&
                      candidate.weaponId === option.weaponId
                    );
                  case "newPerk":
                    return (
                      option.kind === "newPerk" &&
                      candidate.perkId === option.perkId
                    );
                  case "upgradePerk":
                    return (
                      option.kind === "upgradePerk" &&
                      candidate.perkId === option.perkId
                    );
                  default:
                    return false;
                }
              };

              if (!choice.options.some(isSameOption)) return {};

              // Resolve the picked option into a weaponLevels/perkLevels
              // (+ maxLives/lives for Max HP) delta. `option.toLevel`
              // already accounts for any rolled bonus (2-3 levels at once).
              let loadoutUpdate: Partial<Context> = {};

              if (option.kind === "newWeapon") {
                if (context.weaponLevels[option.weaponId] > 0) return {};

                const weaponLevels = {
                  ...context.weaponLevels,
                  [option.weaponId]: option.toLevel,
                };
                loadoutUpdate = {
                  weaponLevels,
                  hudWeapons: getUnlockedWeapons(weaponLevels),
                };
              } else if (option.kind === "upgradeWeapon") {
                if (context.weaponLevels[option.weaponId] === 0) return {};

                loadoutUpdate = {
                  weaponLevels: {
                    ...context.weaponLevels,
                    [option.weaponId]: option.toLevel,
                  },
                };
              } else if (option.kind === "newPerk") {
                if (context.perkLevels[option.perkId] > 0) return {};

                const perkLevels = {
                  ...context.perkLevels,
                  [option.perkId]: option.toLevel,
                };
                // Max HP is a flat bonus, not a stat multiplier, so picking
                // (or upgrading, below) it needs to bump maxLives/lives the
                // same turn it's granted - otherwise the extra HP is only
                // "real" the next time something else happens to trigger a
                // maxLives recalculation (e.g. a wearable swap).
                const maxHealthIncrease =
                  option.perkId === "maxHealth"
                    ? getPerkAmount(perkLevels, "maxHealth") -
                      getPerkAmount(context.perkLevels, "maxHealth")
                    : 0;

                loadoutUpdate = {
                  perkLevels,
                  maxLives: context.maxLives + maxHealthIncrease,
                  lives: context.lives + maxHealthIncrease,
                };
              } else {
                // upgradePerk
                if (context.perkLevels[option.perkId] === 0) return {};

                const perkLevels = {
                  ...context.perkLevels,
                  [option.perkId]: option.toLevel,
                };
                const maxHealthIncrease =
                  option.perkId === "maxHealth"
                    ? getPerkAmount(perkLevels, "maxHealth") -
                      getPerkAmount(context.perkLevels, "maxHealth")
                    : 0;

                loadoutUpdate = {
                  perkLevels,
                  maxLives: context.maxLives + maxHealthIncrease,
                  lives: context.lives + maxHealthIncrease,
                };
              }

              const nextChoice = resolveNextQueuedChoice({
                queue: context.pendingChoiceQueue,
                playerLevel: context.playerLevel,
                weaponLevels:
                  loadoutUpdate.weaponLevels ?? context.weaponLevels,
                perkLevels: loadoutUpdate.perkLevels ?? context.perkLevels,
              });

              if (nextChoice.pendingLevelUpChoice) {
                return {
                  ...loadoutUpdate,
                  ...nextChoice,
                  isGameplayPaused: true,
                  gameplayPausedAt:
                    context.endAt > 0
                      ? (context.gameplayPausedAt ?? Date.now())
                      : undefined,
                };
              }

              const resumeState: Partial<Context> =
                context.endAt > 0
                  ? resumeGameplayClock(context)
                  : {
                      isGameplayPaused: false,
                      gameplayPausedAt: undefined,
                      endAt: Date.now() + GAME_SECONDS * 1000,
                    };

              return {
                ...loadoutUpdate,
                ...nextChoice,
                pendingChoiceQueue: [],
                ...resumeState,
              };
            },
          ),
        },
        CHEST_OPENED: {
          actions: assign(
            (context: Context, event: ChestOpenedEvent): Partial<Context> => {
              // A chest still counts as an interruption like a normal
              // level-up: pause the run, then walk through
              // CHEST_LEVELS[rarity] choice screens (contents are always
              // rolled at the fixed CHEST_BONUS_LEVEL_CHANCES odds -
              // Luck never affects what's inside a chest).
              const totalPicks = CHEST_LEVELS[event.rarity];
              const queue = [
                ...context.pendingChoiceQueue,
                ...Array(totalPicks).fill("chest" as const),
              ];

              if (context.pendingLevelUpChoice) {
                return { pendingChoiceQueue: queue };
              }

              const nextChoice = resolveNextQueuedChoice({
                queue,
                playerLevel: context.playerLevel,
                weaponLevels: context.weaponLevels,
                perkLevels: context.perkLevels,
              });

              if (!nextChoice.pendingLevelUpChoice) return nextChoice;

              return { ...nextChoice, ...pauseGameplayClock(context) };
            },
          ),
        },
        HEAL: {
          actions: assign({
            lives: (context: Context, event: HealEvent) =>
              Math.min(context.maxLives, context.lives + event.amount),
          }),
        },
        GAIN_POINTS: {
          actions: assign({
            score: (context: Context, event: GainPointsEvent) => {
              const { points = 1 } = event;
              return context.score + points;
            },
          }),
        },
        COLLECT_ITEM: {
          actions: assign((context: Context, event: CollectItemEvent) => {
            const gainedXP = DROP_ITEM_XP_VALUES[event.itemKey] ?? 1;

            return resolveXPProgression({ context, gainedXP });
          }),
        },
        LOSE_LIFE: {
          actions: assign({
            lives: (context, event) => {
              const damage = ENEMY_BALANCE_STATS[event.enemyType].DAMAGE;
              return Math.max(0, context.lives - damage);
            },
          }),
        },
        SET_VALIDATIONS: {
          actions: assign({
            validations: (context: Context, event: SetValidationsEvent) => {
              return {
                ...context.validations,
                [event.validation]: true,
              };
            },
          }),
        },
        END_GAME_EARLY: {
          actions: assign((context: Context): Partial<Context> => {
            const { baseScore, bonusApplied, score } =
              getFinalRunScore(context);

            return {
              endAt: Date.now(),
              collected: score,
              lastBaseScore: baseScore,
              lastScoreBonusApplied: bonusApplied,
              lastScore: score,
              state: (() => {
                if (context.isTraining) return context.state;

                submitScore({ score });
                return submitMinigameScore({
                  state: context.state as GameState,
                  action: {
                    type: "minigame.scoreSubmitted",
                    score,
                    id: PORTAL_NAME,
                  },
                });
              })(),
            };
          }),
          target: "introduction",
        },
        GAME_OVER: {
          target: "gameOver",
          actions: assign((context: Context): Partial<Context> => {
            const { baseScore, bonusApplied, score } =
              getFinalRunScore(context);
            const progression = getInitialProgression();
            const maxLives = getMaxLives(progression.perkLevels);

            return {
              endAt: 0,
              lives: maxLives,
              maxLives,
              ...progression,
              collected: score,
              lastBaseScore: baseScore,
              lastScoreBonusApplied: bonusApplied,
              validations: structuredClone(VALIDATIONS),
              lastScore: score,
              state: (() => {
                if (context.isTraining) return context.state;

                submitScore({ score });
                return submitMinigameScore({
                  state: context.state as GameState,
                  action: {
                    type: "minigame.scoreSubmitted",
                    score,
                    id: PORTAL_NAME,
                  },
                });
              })(),
            };
          }) as any,
        },
      },
    },

    gameOver: {
      always: [
        {
          target: "introduction",
          cond: (context) => {
            return context.isTraining;
          },
        },
        {
          // they have already completed the mission before
          target: "complete",
          cond: () => {
            // const dateKey = new Date().toISOString().slice(0, 10);

            // const minigame = context.state?.minigames.games[PORTAL_NAME];
            // const history = minigame?.history ?? {};

            // return !!history[dateKey]?.prizeClaimedAt;
            return false;
          },
        },
        {
          target: "winner",
          cond: (context) => {
            const prize = context.state?.minigames.prizes[PORTAL_NAME];
            if (!prize) {
              return false;
            }

            return getRunScore(context) >= prize.score;
          },
        },
        {
          target: "loser",
        },
      ],
    },

    winner: {
      on: resetGameTransition,
    },

    loser: {
      on: resetGameTransition,
    },

    complete: {
      on: resetGameTransition,
    },

    error: {
      on: {
        RETRY: {
          target: "initialising",
        },
      },
    },

    unauthorised: {},
  },
});
