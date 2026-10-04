import type {
  LevelUpOption,
  SpecialPower,
  SpecialPowerKind,
  StatusEffectConfig,
  WeaponCategoryId,
  WeaponId,
  WeaponLevel,
} from "../Types";
import type { TranslationKeys } from "lib/i18n/dictionaries/types";
import type { LabelType } from "components/ui/Label";

// Weapon categories + Special Power (Halloween update).
// The category composition of the equipped weapons decides which Special
// Power the player can trigger manually. While the power is active, every
// direct weapon hit applies the category effect to the enemy.

export const WEAPON_CATEGORY_IDS: WeaponCategoryId[] = [
  "plague",
  "frost",
  "curse",
  "bloodyHarvest",
];

// Frost Coffin (frost), Cadena Amaldita (curse) and Vial Carmesi
// (bloodyHarvest) are pending weapons; add them here once they exist.
export const WEAPON_CATEGORIES: Record<WeaponId, WeaponCategoryId> = {
  oil: "plague",
  corn: "plague",
  beehive: "plague",
  wateringCan: "frost",
  pumpkin: "frost",
  banana: "curse",
  sunflower: "curse",
  tomato: "bloodyHarvest",
  broomScythe: "bloodyHarvest",
};

type CategoryConfig = {
  id: WeaponCategoryId;
  name: TranslationKeys;
  effectName: TranslationKeys;
  // Single source of the category color (hex). Used by the Label component
  // ("The Plague"... types), the HUD and, via getCategoryTint, by Phaser.
  color: string;
  // Label component type with the category colors (components/ui/Label)
  labelType: LabelType;
  // Glow around level-up cards. Dark categories need a lighter tone to be
  // visible over the panel background.
  glowColor: string;
  // Special Power duration at 100% (pure). Partial/hybrid scale it.
  baseActiveMs: number;
};

export const CATEGORY_CONFIGS: Record<WeaponCategoryId, CategoryConfig> = {
  plague: {
    id: "plague",
    name: "minigame.category.plague",
    effectName: "minigame.category.effect.plague",
    color: "#3e8948",
    labelType: "The Plague",
    glowColor: "#449d48",
    baseActiveMs: 5000,
  },
  frost: {
    id: "frost",
    name: "minigame.category.frost",
    effectName: "minigame.category.effect.frost",
    color: "#8bcef7",
    labelType: "The Frost",
    glowColor: "#8bcef7",
    baseActiveMs: 10000,
  },
  curse: {
    id: "curse",
    name: "minigame.category.curse",
    effectName: "minigame.category.effect.curse",
    color: "#290264",
    labelType: "The Curse",
    glowColor: "#4203A0",
    baseActiveMs: 7000,
  },
  bloodyHarvest: {
    id: "bloodyHarvest",
    name: "minigame.category.bloodyHarvest",
    effectName: "minigame.category.effect.bloodyHarvest",
    color: "#e43b44",
    labelType: "The Bloody Harvest",
    glowColor: "#ac2121",
    baseActiveMs: 7000,
  },
};

// Phaser needs numeric colors for tints/graphics (e.g. "#3e8948" -> 0x3e8948).
export const getCategoryTint = (category: WeaponCategoryId) =>
  parseInt(CATEGORY_CONFIGS[category].color.slice(1), 16);

export const SPECIAL_POWER_CONFIG = {
  // Fixed button cooldown for every composition, started on activation.
  // Power durations live per category (CATEGORY_CONFIGS.baseActiveMs).
  cooldownMs: 30000,
  durationMultipliers: {
    pure: 1,
    hybrid: 0.5,
    partial: 0.7,
    none: 0,
  } satisfies Record<SpecialPowerKind, number>,
  // Desktop hotkey (KeyboardEvent.key, lowercase).
  hotkey: "e",
};

export const CATEGORY_POWER_EFFECTS = {
  plague: {
    id: "plaguePoison",
    durationMs: 3000,
    tickMs: 1000,
    damagePerTick: 2,
    refreshMode: "refresh",
  } satisfies StatusEffectConfig,
  frost: {
    id: "frostSlow",
    durationMs: 2000,
    speedMultiplier: 0.4,
    refreshMode: "refresh",
  } satisfies StatusEffectConfig,
  curse: {
    id: "curseStun",
    durationMs: 1200,
    speedMultiplier: 0,
    refreshMode: "refresh",
  } satisfies StatusEffectConfig,
  bloodyHarvest: {
    // HP stolen for every enemy killed while the power is active.
    healPerKill: 1,
  },
};

export const NO_SPECIAL_POWER: SpecialPower = {
  kind: "none",
  categories: [],
  durationMultiplier: 0,
  activeMs: 0,
  activeMsByCategory: {},
};

export const getCategoryCounts = (
  weaponLevels: Partial<Record<WeaponId, WeaponLevel>>,
): Record<WeaponCategoryId, number> => {
  const counts: Record<WeaponCategoryId, number> = {
    plague: 0,
    frost: 0,
    curse: 0,
    bloodyHarvest: 0,
  };

  (Object.keys(weaponLevels) as WeaponId[]).forEach((weaponId) => {
    const category = WEAPON_CATEGORIES[weaponId];
    if (!category || (weaponLevels[weaponId] ?? 0) <= 0) return;

    counts[category] += 1;
  });

  return counts;
};

const createSpecialPower = (
  kind: SpecialPowerKind,
  categories: WeaponCategoryId[],
): SpecialPower => {
  const durationMultiplier = SPECIAL_POWER_CONFIG.durationMultipliers[kind];
  const activeMsByCategory: SpecialPower["activeMsByCategory"] = {};

  // Each power scales its own base duration (hybrid: both at 50%).
  categories.forEach((category) => {
    activeMsByCategory[category] = Math.round(
      CATEGORY_CONFIGS[category].baseActiveMs * durationMultiplier,
    );
  });

  return {
    kind,
    categories,
    durationMultiplier,
    // Longest active window, i.e. until when any power is still running.
    activeMs: Math.max(0, ...Object.values(activeMsByCategory)),
    activeMsByCategory,
  };
};

// Composition rules (any loadout size, max 4 weapons):
// - a category with 3+ weapons      -> pure power at 100%
// - two categories with 2 weapons   -> hybrid, both powers at 50% each
// - one category with 2 weapons     -> that power at 70%
// - no category with 2+ weapons     -> no Special Power
export const resolveSpecialPower = (
  weaponLevels: Partial<Record<WeaponId, WeaponLevel>>,
): SpecialPower => {
  const counts = getCategoryCounts(weaponLevels);

  const pure = WEAPON_CATEGORY_IDS.find((category) => counts[category] >= 3);
  if (pure) return createSpecialPower("pure", [pure]);

  const pairs = WEAPON_CATEGORY_IDS.filter(
    (category) => counts[category] === 2,
  );
  if (pairs.length >= 2) return createSpecialPower("hybrid", pairs.slice(0, 2));
  if (pairs.length === 1) return createSpecialPower("partial", pairs);

  return NO_SPECIAL_POWER;
};

export const isSameSpecialPower = (a: SpecialPower, b: SpecialPower) =>
  a.kind === b.kind &&
  a.categories.length === b.categories.length &&
  a.categories.every((category, index) => b.categories[index] === category);

type Translate = (
  key: TranslationKeys,
  options?: Record<string, string | number>,
) => string;

// Receives the translate function so this file stays free of i18n runtime
// imports (it is shared with XState and Phaser code).
export const getSpecialPowerLabel = (power: SpecialPower, t: Translate) => {
  if (power.kind === "none") return t("minigame.specialPower.none");

  const categories = power.categories
    .map((category) => t(CATEGORY_CONFIGS[category].name))
    .join(" + ");

  return t("minigame.specialPower.label", {
    categories,
    percent: Math.round(power.durationMultiplier * 100),
  });
};

// Special Power the loadout would have after picking a level-up option.
// Only new weapons change the composition (upgrades/perks keep it).
export const getSpecialPowerPreview = (
  weaponLevels: Partial<Record<WeaponId, WeaponLevel>>,
  option: LevelUpOption,
) => {
  const current = resolveSpecialPower(weaponLevels);

  if (option.kind !== "newWeapon") {
    return { current, next: current, changed: false };
  }

  const next = resolveSpecialPower({
    ...weaponLevels,
    [option.weaponId]: option.toLevel,
  });

  return { current, next, changed: !isSameSpecialPower(current, next) };
};
