import type { PerkConfig, PerkId, PerkLevel, PerkLevels } from "../Types";

export const PERK_INITIAL_LEVEL: PerkLevel = 0;
export const PERK_MAX_LEVEL: PerkLevel = 15;

// How many perk slots a player can hold at once
export const MAX_PLAYER_PERKS = 4;

export const PERK_IDS: PerkId[] = [
  "moveSpeed",
  "attackSpeed",
  "criticalChance",
  "projectileSpeed",
  "xpGain",
  "luck",
  "pickupRadius",
  "cooldownReduction",
  "healing",
  "maxHealth",
];

// `weight` sets how often a perk is offered relative to the others when it
// competes for a level-up slot. Higher = more common.
// Tune freely here; no other file needs to change for rebalancing.
export const PERK_CONFIGS: Record<PerkId, PerkConfig> = {
  moveSpeed: {
    id: "moveSpeed",
    name: "Swift Boots",
    description: "Grows move speed every level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 10,
    valuesPerLevel: [
      0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55,
      0.6, 0.65, 0.7,
    ],
  },
  attackSpeed: {
    id: "attackSpeed",
    name: "Attack Speed",
    description: "Reduces weapon cooldowns per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 10,
    valuesPerLevel: [
      0, 0.04, 0.08, 0.12, 0.17, 0.22, 0.27, 0.32, 0.37, 0.42, 0.47, 0.51, 0.55,
      0.58, 0.62, 0.65,
    ],
  },
  criticalChance: {
    id: "criticalChance",
    name: "Critical Chance",
    description: "Chance to deal double damage per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 8,
    valuesPerLevel: [
      0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55,
      0.6, 0.65, 0.7,
    ],
  },
  projectileSpeed: {
    id: "projectileSpeed",
    name: "Projectile Speed",
    description: "Grows projectile/homing speed every level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 7,
    valuesPerLevel: [
      0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.62, 0.74, 0.86, 0.98, 1.1, 1.24, 1.38, 1.52,
      1.66, 1.8,
    ],
  },
  xpGain: {
    id: "xpGain",
    name: "XP Gain",
    description: "Grows XP gained every level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 9,
    valuesPerLevel: [
      0, 0.1, 0.2, 0.27, 0.34, 0.41, 0.48, 0.55, 0.62, 0.69, 0.76, 0.84, 0.92,
      1, 1.05, 1.1,
    ],
  },
  luck: {
    id: "luck",
    name: "Luck",
    description: "Improves rare drop/chest odds per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 6,
    valuesPerLevel: [
      0, 0.06, 0.12, 0.18, 0.25, 0.32, 0.4, 0.48, 0.57, 0.66, 0.75, 0.84, 0.93,
      1.02, 1.11, 1.2,
    ],
  },
  pickupRadius: {
    id: "pickupRadius",
    name: "Pickup Radius",
    description: "Grows item pickup/magnet radius every level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 8,
    valuesPerLevel: [
      0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2, 1.35, 1.5, 1.8, 2.1, 2.4,
      2.7, 3,
    ],
  },
  cooldownReduction: {
    id: "cooldownReduction",
    name: "Cooldown Reduction",
    description:
      "Reduces secondary weapon cooldowns (hit/status ticks) per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 7,
    valuesPerLevel: [
      0, 0.04, 0.08, 0.12, 0.17, 0.22, 0.27, 0.32, 0.37, 0.42, 0.47, 0.51, 0.55,
      0.58, 0.62, 0.65,
    ],
  },
  healing: {
    id: "healing",
    name: "Healing",
    description:
      "Regenerate HP every second, amount scales per level, but not in every level.",
    maxLevel: PERK_MAX_LEVEL,
    weight: 6,
    valuesPerLevel: [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 7],
  },
  maxHealth: {
    id: "maxHealth",
    name: "Max HP",
    description: "Max HP Increased per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 10,
    valuesPerLevel: [
      0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 170, 190, 210, 230, 250,
    ],
  },
};

export const DEFAULT_PERK_LEVELS: PerkLevels = PERK_IDS.reduce(
  (levels, perkId) => ({
    ...levels,
    [perkId]: PERK_INITIAL_LEVEL,
  }),
  {} as PerkLevels,
);

export const getPerkValue = (perkId: PerkId, level: PerkLevel) =>
  PERK_CONFIGS[perkId].valuesPerLevel[level] ?? 0;

export const getPerkAmount = (
  perkLevels: PerkLevels | undefined,
  perkId: PerkId,
) => (perkLevels ? getPerkValue(perkId, perkLevels[perkId]) : 0);

export const getNextPerkLevel = (
  perkId: PerkId,
  level: PerkLevel,
): PerkLevel | undefined => {
  if (level >= PERK_CONFIGS[perkId].maxLevel) return undefined;

  return (level + 1) as PerkLevel;
};

export const getUnlockedPerks = (perkLevels: PerkLevels): PerkId[] =>
  PERK_IDS.filter((perkId) => perkLevels[perkId] > 0);

export const getAvailablePerkChoices = (perkLevels: PerkLevels): PerkId[] =>
  PERK_IDS.filter((perkId) => perkLevels[perkId] === 0);

// Every level-up option
// has a small chance to land 2 or 3 levels at once instead of 1. Luck
// scales these odds linearly from its own level 0 (base) to its max level
// (the stated ceiling), 20%/5% -> 30%/10%. Chest contents roll at the base,
// Luck-independent odds instead - see CHEST_BONUS_LEVEL_CHANCES below.
export type BonusLevelChances = { chance2: number; chance3: number };

export const BASE_BONUS_LEVEL_CHANCE_2 = 0.1;
export const BASE_BONUS_LEVEL_CHANCE_3 = 0.01;
export const MAX_LUCK_BONUS_LEVEL_CHANCE_2 = 0.3;
export const MAX_LUCK_BONUS_LEVEL_CHANCE_3 = 0.11;

export const CHEST_BONUS_LEVEL_CHANCES: BonusLevelChances = {
  chance2: 0.15,
  chance3: 0.03,
};

export const getBonusLevelChances = (
  perkLevels?: PerkLevels,
): BonusLevelChances => {
  const luckLevel = perkLevels?.luck ?? PERK_INITIAL_LEVEL;
  const progress = luckLevel / PERK_MAX_LEVEL;

  return {
    chance2:
      BASE_BONUS_LEVEL_CHANCE_2 +
      (MAX_LUCK_BONUS_LEVEL_CHANCE_2 - BASE_BONUS_LEVEL_CHANCE_2) * progress,
    chance3:
      BASE_BONUS_LEVEL_CHANCE_3 +
      (MAX_LUCK_BONUS_LEVEL_CHANCE_3 - BASE_BONUS_LEVEL_CHANCE_3) * progress,
  };
};

// Rolls how many levels a single level-up/chest option should grant: 3, 2,
// or the normal 1 - independent per option, so a single 5-card offer can
// mix bonus and normal cards.
export const rollBonusLevels = (chances: BonusLevelChances): 1 | 2 | 3 => {
  const roll = Math.random();

  if (roll < chances.chance3) return 3;
  if (roll < chances.chance3 + chances.chance2) return 2;

  return 1;
};
