import type { ChestRarity, PerkLevels } from "../Types";
import { PERK_MAX_LEVEL, PERK_INITIAL_LEVEL } from "./PerkConstants";

// - Rare: can drop from any regular enemy, small Luck-scaled chance.
// - Epic: guaranteed drop from a mini-boss kill.
// - Legendary: guaranteed drop from a main boss kill.
// NOTE: the current build has no unique "main boss" (every BossEnemy is a
// recurring mid-wave tough enemy, closer in spirit to a mini-boss) - see
// Scene.ts handleBossDefeat for where to flip a future main-boss flag over
// to legendary once Biomes/proper bosses (backlog 4/7/8) land.
export const CHEST_LEVELS: Record<ChestRarity, number> = {
  rare: 1,
  epic: 2,
  legendary: 3,
};

// Rare chest drop chance from a regular enemy kill: 0.5% with no Luck,
// scaling linearly up to 1% at Luck's max level. Epic/legendary aren't
// chance-based - they're guaranteed on their respective enemy type's death.
export const RARE_CHEST_BASE_DROP_CHANCE = 0.005;
export const RARE_CHEST_MAX_LUCK_DROP_CHANCE = 0.01;

export const getRareChestDropChance = (perkLevels?: PerkLevels) => {
  const luckLevel = perkLevels?.luck ?? PERK_INITIAL_LEVEL;
  const progress = luckLevel / PERK_MAX_LEVEL;

  return (
    RARE_CHEST_BASE_DROP_CHANCE +
    (RARE_CHEST_MAX_LUCK_DROP_CHANCE - RARE_CHEST_BASE_DROP_CHANCE) * progress
  );
};

export const rollForRareChest = (perkLevels?: PerkLevels) =>
  Math.random() < getRareChestDropChance(perkLevels);

// Placeholder art/animation keys - swap for real assets whenever they land.
// idleAnimationKey plays on a loop while the chest sits in the world;
// openAnimationKey plays once when the player walks into it, and the
// level-up-style choice is offered once that animation completes (see
// ChestContainer.ts).
export const CHEST_VISUALS: Record<
  ChestRarity,
  { textureKey: string; idleAnimationKey: string; openAnimationKey: string }
> = {
  rare: {
    textureKey: "chest_rare",
    idleAnimationKey: "chest_rare_idle",
    openAnimationKey: "chest_rare_open",
  },
  epic: {
    textureKey: "chest_epic",
    idleAnimationKey: "chest_epic_idle",
    openAnimationKey: "chest_epic_open",
  },
  legendary: {
    textureKey: "chest_legendary",
    idleAnimationKey: "chest_legendary_idle",
    openAnimationKey: "chest_legendary_open",
  },
};

// Placeholder SFX key played when a chest finishes opening. Register a real
// sound under this key in the scene's audio loader when art/audio lands.
export const CHEST_OPEN_SFX_KEY = "chest_open";
