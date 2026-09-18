import type {
  LevelUpChoice,
  LevelUpOption,
  PerkId,
  PerkLevel,
  PerkLevels,
  WeaponId,
  WeaponLevel,
} from "../Types";
import {
  getNextWeaponLevel,
  WEAPON_CONFIGS,
  WEAPON_MAX_LEVEL,
} from "./WeaponConstants";
import {
  type BonusLevelChances,
  getBonusLevelChances,
  getNextPerkLevel,
  MAX_PLAYER_PERKS,
  PERK_CONFIGS,
  PERK_IDS,
  rollBonusLevels,
} from "./PerkConstants";

export const LEVEL_UP_WEAPON_IDS = Object.keys(WEAPON_CONFIGS) as WeaponId[];

export const PLAYER_INITIAL_LEVEL = 1;
export const MAX_PLAYER_WEAPONS = 4;

// The level-up screen always shows 5 slots: the 3 center ones are weapons,
// the 2 corner ones are perks. If one side runs out of eligible candidates
// (e.g. every weapon is already at WEAPON_MAX_LEVEL), its empty slots are
// backfilled from the other side instead of shrinking the offer.
export const LEVEL_UP_OPTION_COUNT = 5;
export const LEVEL_UP_WEAPON_SLOT_COUNT = 3;
export const LEVEL_UP_PERK_SLOT_COUNT = 2;

// Relative weight between "brand new" and "upgrade" candidates within the
// weapon pool. Equal by default; tune here to bias one over the other.
const NEW_WEAPON_WEIGHT = 10;
const UPGRADE_WEAPON_WEIGHT = 10;

export const PLAYER_LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 10,
  2: 25,
  3: 40,
  4: 55,
  5: 75,
  6: 100,
  7: 130,
  8: 165,
  9: 205,
  10: 250,
  11: 300,
  12: 350,
  13: 410,
  14: 470,
  15: 500,
  16: 540,
  17: 615,
  18: 695,
  19: 780,
  20: 850,
  21: 950,
  22: 1065,
  23: 1150,
  24: 1280,
  25: 1395,
  26: 1500,
};

export const PLAYER_MAX_LEVEL = Math.max(
  ...Object.keys(PLAYER_LEVEL_XP_REQUIREMENTS).map(Number),
);

export const isPlayerMaxLevel = (level: number) => level >= PLAYER_MAX_LEVEL;

export const getNextLevelXP = (level: number) => {
  if (isPlayerMaxLevel(level)) return undefined;

  return PLAYER_LEVEL_XP_REQUIREMENTS[level];
};

export const shuffleOptions = <T>(options: T[]) => {
  const shuffled = [...options];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

export const getUnlockedWeapons = (
  weaponLevels: Record<WeaponId, WeaponLevel>,
) => LEVEL_UP_WEAPON_IDS.filter((weapon) => weaponLevels[weapon] > 0);

export const getAvailableWeaponChoices = (
  weaponLevels: Record<WeaponId, WeaponLevel>,
) => LEVEL_UP_WEAPON_IDS.filter((weapon) => weaponLevels[weapon] === 0);

type WeightedEntry<T> = { item: T; weight: number };

const weightedSample = <T>(entries: WeightedEntry<T>[], count: number): T[] => {
  const pool = entries.filter((entry) => entry.weight > 0);
  const picked: T[] = [];

  while (pool.length > 0 && picked.length < count) {
    const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight <= 0) break;

    let roll = Math.random() * totalWeight;
    let index = 0;
    while (index < pool.length - 1 && roll > pool[index].weight) {
      roll -= pool[index].weight;
      index += 1;
    }

    picked.push(pool.splice(index, 1)[0].item);
  }

  return picked;
};

export const buildLevelUpOptionPool = ({
  weaponLevels,
  perkLevels,
}: {
  weaponLevels: Record<WeaponId, WeaponLevel>;
  perkLevels: PerkLevels;
}): WeightedEntry<LevelUpOption>[] => {
  const pool: WeightedEntry<LevelUpOption>[] = [];

  const unlockedWeapons = getUnlockedWeapons(weaponLevels);
  const unlockedPerks = PERK_IDS.filter((perkId) => perkLevels[perkId] > 0);

  if (unlockedWeapons.length < MAX_PLAYER_WEAPONS) {
    getAvailableWeaponChoices(weaponLevels).forEach((weaponId) => {
      pool.push({
        item: { kind: "newWeapon", weaponId, toLevel: 1 },
        weight: NEW_WEAPON_WEIGHT,
      });
    });
  }

  unlockedWeapons.forEach((weaponId) => {
    const toLevel = getNextWeaponLevel(weaponLevels[weaponId]);
    if (toLevel === undefined) return;

    pool.push({
      item: { kind: "upgradeWeapon", weaponId, toLevel },
      weight: UPGRADE_WEAPON_WEIGHT,
    });
  });

  if (unlockedPerks.length < MAX_PLAYER_PERKS) {
    PERK_IDS.filter((perkId: PerkId) => perkLevels[perkId] === 0).forEach(
      (perkId) => {
        pool.push({
          item: { kind: "newPerk", perkId, toLevel: 1 },
          weight: PERK_CONFIGS[perkId].weight,
        });
      },
    );
  }

  unlockedPerks.forEach((perkId) => {
    const toLevel = getNextPerkLevel(perkId, perkLevels[perkId]);
    if (toLevel === undefined) return;

    pool.push({
      item: { kind: "upgradePerk", perkId, toLevel },
      weight: PERK_CONFIGS[perkId].weight,
    });
  });

  return pool;
};

const optionKey = (option: LevelUpOption): string => {
  switch (option.kind) {
    case "newWeapon":
    case "upgradeWeapon":
      return `weapon:${option.weaponId}`;
    case "newPerk":
    case "upgradePerk":
      return `perk:${option.perkId}`;
  }
};

const clampWeaponLevel = (target: number): WeaponLevel =>
  Math.min(target, WEAPON_MAX_LEVEL) as WeaponLevel;

const clampPerkLevel = (perkId: PerkId, target: number): PerkLevel =>
  Math.min(target, PERK_CONFIGS[perkId].maxLevel) as PerkLevel;

const applyBonusLevels = (
  option: LevelUpOption,
  chances: BonusLevelChances,
): LevelUpOption => {
  const bonus = rollBonusLevels(chances);
  if (bonus === 1) return option;

  switch (option.kind) {
    case "newWeapon":
      return {
        ...option,
        toLevel: clampWeaponLevel(bonus),
        bonusLevels: bonus,
      };
    case "upgradeWeapon": {
      const currentLevel = option.toLevel - 1;
      return {
        ...option,
        toLevel: clampWeaponLevel(currentLevel + bonus),
        bonusLevels: bonus,
      };
    }
    case "newPerk":
      return {
        ...option,
        toLevel: clampPerkLevel(option.perkId, bonus),
        bonusLevels: bonus,
      };
    case "upgradePerk": {
      const currentLevel = option.toLevel - 1;
      return {
        ...option,
        toLevel: clampPerkLevel(option.perkId, currentLevel + bonus),
        bonusLevels: bonus,
      };
    }
  }
};

// Picks the 5 level-up slots: 3 center weapon slots, 2 corner perk slots.
// If either side doesn't have enough eligible candidates (e.g. every
// weapon is already at WEAPON_MAX_LEVEL, or every perk slot is full and
// maxed), the other side's pool backfills the empty slots instead of the
// offer shrinking below 5. `bonusLevelChances` controls the odds of any one
// slot landing 2 or 3 levels at once - pass getBonusLevelChances(perkLevels)
// for a normal level-up (Luck-scaled) or CHEST_BONUS_LEVEL_CHANCES for a
// chest (fixed, Luck-independent - see ChestConstants.ts).
export const pickLevelUpOptions = ({
  weaponLevels,
  perkLevels,
  bonusLevelChances,
}: {
  weaponLevels: Record<WeaponId, WeaponLevel>;
  perkLevels: PerkLevels;
  bonusLevelChances: BonusLevelChances;
}): LevelUpOption[] => {
  const pool = buildLevelUpOptionPool({ weaponLevels, perkLevels });

  const weaponEntries = pool.filter(
    (entry) =>
      entry.item.kind === "newWeapon" || entry.item.kind === "upgradeWeapon",
  );
  const perkEntries = pool.filter(
    (entry) =>
      entry.item.kind === "newPerk" || entry.item.kind === "upgradePerk",
  );

  const used = new Set<string>();

  const draw = (entries: WeightedEntry<LevelUpOption>[], count: number) => {
    const available = entries.filter(
      (entry) => !used.has(optionKey(entry.item)),
    );
    const picked = weightedSample(available, count);
    picked.forEach((option) => used.add(optionKey(option)));

    return picked;
  };

  // Safety net: this is effectively "level 1" (the player hasn't picked
  // their first weapon yet). Offering a perk corner here risks the player
  // ending up with zero weapons and no way to deal damage, so every slot
  // is a weapon instead of the usual 3 center / 2 corner split. From the
  // moment a first weapon is picked onward, every later level-up goes back
  // to normal (including all of its usual backfill exceptions below).
  if (getUnlockedWeapons(weaponLevels).length === 0) {
    const firstWeaponPicks = draw(weaponEntries, LEVEL_UP_OPTION_COUNT);

    return firstWeaponPicks.map((option) =>
      applyBonusLevels(option, bonusLevelChances),
    );
  }

  const weaponPicks = draw(weaponEntries, LEVEL_UP_WEAPON_SLOT_COUNT);
  const perkPicks = draw(perkEntries, LEVEL_UP_PERK_SLOT_COUNT);

  // Overflow: borrow from the other pool so empty slots still get filled.
  if (weaponPicks.length < LEVEL_UP_WEAPON_SLOT_COUNT) {
    weaponPicks.push(
      ...draw(perkEntries, LEVEL_UP_WEAPON_SLOT_COUNT - weaponPicks.length),
    );
  }
  if (perkPicks.length < LEVEL_UP_PERK_SLOT_COUNT) {
    perkPicks.push(
      ...draw(weaponEntries, LEVEL_UP_PERK_SLOT_COUNT - perkPicks.length),
    );
  }

  // Corners (perks, or their overflow) on the outside, weapons (or their
  // overflow) in the middle three - matches how Portal.tsx lays the
  // options out left-to-right.
  const options = [
    perkPicks[0],
    weaponPicks[0],
    weaponPicks[1],
    weaponPicks[2],
    perkPicks[1],
  ].filter((option): option is LevelUpOption => option !== undefined);

  return options.map((option) => applyBonusLevels(option, bonusLevelChances));
};

export const getLevelUpChoice = ({
  level,
  weaponLevels,
  perkLevels,
}: {
  level: number;
  weaponLevels: Record<WeaponId, WeaponLevel>;
  perkLevels: PerkLevels;
}): LevelUpChoice | undefined => {
  const options = pickLevelUpOptions({
    weaponLevels,
    perkLevels,
    bonusLevelChances: getBonusLevelChances(perkLevels),
  });

  if (options.length === 0) return undefined;

  return {
    type: "levelUp",
    level,
    options,
    source: "levelUp",
  };
};

export const getChestLevelUpChoice = ({
  level,
  weaponLevels,
  perkLevels,
  bonusLevelChances,
}: {
  level: number;
  weaponLevels: Record<WeaponId, WeaponLevel>;
  perkLevels: PerkLevels;
  bonusLevelChances: BonusLevelChances;
}): LevelUpChoice | undefined => {
  const options = pickLevelUpOptions({
    weaponLevels,
    perkLevels,
    bonusLevelChances,
  });

  if (options.length === 0) return undefined;

  return {
    type: "levelUp",
    level,
    options,
    source: "chest",
  };
};
