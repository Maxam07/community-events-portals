import type { PerkConfig, PerkId, PerkLevel, PerkLevels } from "../Types";

export const PERK_INITIAL_LEVEL: PerkLevel = 0;
export const PERK_MAX_LEVEL: PerkLevel = 5;

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
    description: "+8% move speed per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 10,
    valuesPerLevel: [0, 0.08, 0.16, 0.24, 0.32, 0.4],
  },
  attackSpeed: {
    id: "attackSpeed",
    name: "Attack Speed",
    description: "Reduces weapon cooldowns per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 10,
    valuesPerLevel: [0, 0.08, 0.15, 0.22, 0.28, 0.35],
  },
  criticalChance: {
    id: "criticalChance",
    name: "Critical Chance",
    description: "Chance to deal double damage per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 8,
    valuesPerLevel: [0, 0.06, 0.12, 0.18, 0.24, 0.3],
  },
  projectileSpeed: {
    id: "projectileSpeed",
    name: "Projectile Speed",
    description: "+10% projectile/homing speed per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 7,
    valuesPerLevel: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
  },
  xpGain: {
    id: "xpGain",
    name: "XP Gain",
    description: "+10% XP gained per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 9,
    valuesPerLevel: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
  },
  luck: {
    id: "luck",
    name: "Luck",
    description: "Improves rare drop/chest odds per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 6,
    valuesPerLevel: [0, 0.08, 0.16, 0.24, 0.32, 0.4],
  },
  pickupRadius: {
    id: "pickupRadius",
    name: "Pickup Radius",
    description: "+15% item pickup/magnet radius per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 8,
    valuesPerLevel: [0, 0.15, 0.3, 0.45, 0.6, 0.75],
  },
  cooldownReduction: {
    id: "cooldownReduction",
    name: "Cooldown Reduction",
    description:
      "Reduces secondary weapon cooldowns (hit/status ticks) per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 7,
    valuesPerLevel: [0, 0.06, 0.12, 0.18, 0.24, 0.3],
  },
  healing: {
    id: "healing",
    name: "Healing",
    description: "Regenerate HP every second, amount scales per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 6,
    valuesPerLevel: [0, 1, 2, 3, 4, 5],
  },
  maxHealth: {
    id: "maxHealth",
    name: "Max HP",
    description: "+20 max HP per level",
    maxLevel: PERK_MAX_LEVEL,
    weight: 10,
    valuesPerLevel: [0, 20, 40, 60, 80, 100],
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

export const BASE_BONUS_LEVEL_CHANCE_2 = 0.2;
export const BASE_BONUS_LEVEL_CHANCE_3 = 0.05;
export const MAX_LUCK_BONUS_LEVEL_CHANCE_2 = 0.3;
export const MAX_LUCK_BONUS_LEVEL_CHANCE_3 = 0.1;

export const CHEST_BONUS_LEVEL_CHANCES: BonusLevelChances = {
  chance2: BASE_BONUS_LEVEL_CHANCE_2,
  chance3: BASE_BONUS_LEVEL_CHANCE_3,
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
