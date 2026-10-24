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

export const WEAPON_CATEGORIES: Record<WeaponId, WeaponCategoryId> = {
  mossGround: "plague",
  poisonVial: "plague",
  flyStorm: "plague",
  darknessBook: "curse",
  banishedJackOLantern: "curse",
  frostChain: "frost",
  frozenSkull: "frost",
  frostFlower: "frost",
  cursedCoffin: "curse",
  bloodKnife: "bloodyHarvest",
  bloodScythe: "bloodyHarvest",
  crimsonVial: "bloodyHarvest",
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
    baseActiveMs: 10000,
  },
  bloodyHarvest: {
    id: "bloodyHarvest",
    name: "minigame.category.bloodyHarvest",
    effectName: "minigame.category.effect.bloodyHarvest",
    color: "#e43b44",
    labelType: "The Bloody Harvest",
    glowColor: "#ac2121",
    baseActiveMs: 5000,
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
    partial: 0.8,
    none: 0,
  } satisfies Record<SpecialPowerKind, number>,
  // Desktop hotkey (KeyboardEvent.key, lowercase).
  hotkey: "e",
};

export const CATEGORY_POWER_EFFECTS = {
  // Level 1 / fallback values. Real values: getCategoryPowerEffects(playerLevel).
  plague: {
    id: "plaguePoison",
    durationMs: 3000,
    tickMs: 1000,
    damagePerTick: 2,
    refreshMode: "refresh",
  } satisfies StatusEffectConfig,
  frost: {
    id: "frostSlow",
    durationMs: 4000,
    speedMultiplier: 0.4,
    refreshMode: "refresh",
  } satisfies StatusEffectConfig,
  curse: {
    id: "curseWeakness",
    durationMs: 4000,
    damageMultiplier: 0.5,
    refreshMode: "refresh",
  } satisfies StatusEffectConfig,
  bloodyHarvest: {
    // HP stolen for every enemy killed while the power is active.
    healPerKill: 1,
  },
};

// ---------------------------------------------------------------------------
// Special Power effects that scale with the player level
// ---------------------------------------------------------------------------
// CATEGORY_POWER_EFFECTS above keeps the old fixed values (fallback only). The
// game reads getCategoryPowerEffects(playerLevel) and getPlaguePoisonStatus(...)
// instead. Every value is interpolated linearly from level 1 to the max level.
export const POWER_SCALING_MIN_LEVEL = 1;
// Must match PLAYER_MAX_LEVEL (PlayerLevelConstants.ts). It is not imported here
// to keep this file free of circular imports; CategoryPowerScaling.test.ts
// fails if the two ever diverge.
export const POWER_SCALING_MAX_LEVEL = 32;

type ScalingRange = { atMinLevel: number; atMaxLevel: number };

export const CATEGORY_POWER_SCALING = {
  // Poison: share of the enemy's max HP lost per second.
  plague: { percentMaxHpPerSecond: { atMinLevel: 0.01, atMaxLevel: 0.025 } },
  // Frost: enemy speed multiplier (lower = slower).
  frost: { speedMultiplier: { atMinLevel: 0.6, atMaxLevel: 0.3 } },
  // Curse: multiplier on the damage the enemy deals (lower = weaker enemy).
  curse: { damageMultiplier: { atMinLevel: 0.7, atMaxLevel: 0.4 } },
  // Bloody Harvest: HP stolen per kill (rounded to whole HP).
  bloodyHarvest: { healPerKill: { atMinLevel: 1, atMaxLevel: 4 } },
} satisfies Record<string, Record<string, ScalingRange>>;

// Optional per-tick limits for the poison (HP per tick, 1 tick = 1 second).
// Poison is a % of max HP, so it does almost nothing to 3-10 HP mobs and a lot
// to bosses (3% of 20000 HP = 600 per second). Set a cap here to tame bosses.
export const PLAGUE_MIN_DAMAGE_PER_TICK = 2;
export const PLAGUE_MAX_DAMAGE_PER_TICK = 2000;

// 0 at POWER_SCALING_MIN_LEVEL, 1 at POWER_SCALING_MAX_LEVEL (clamped).
export const getPowerLevelProgress = (playerLevel: number) => {
  const span = POWER_SCALING_MAX_LEVEL - POWER_SCALING_MIN_LEVEL;
  const progress = (playerLevel - POWER_SCALING_MIN_LEVEL) / span;

  return Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
};

const scaleByLevel = (range: ScalingRange, playerLevel: number) =>
  range.atMinLevel +
  (range.atMaxLevel - range.atMinLevel) * getPowerLevelProgress(playerLevel);

const round3 = (value: number) => Math.round(value * 1000) / 1000;

export const getCategoryPowerEffects = (playerLevel: number) => ({
  plague: {
    ...CATEGORY_POWER_EFFECTS.plague,
    percentMaxHpPerSecond: round3(
      scaleByLevel(
        CATEGORY_POWER_SCALING.plague.percentMaxHpPerSecond,
        playerLevel,
      ),
    ),
  },
  frost: {
    ...CATEGORY_POWER_EFFECTS.frost,
    speedMultiplier: round3(
      scaleByLevel(CATEGORY_POWER_SCALING.frost.speedMultiplier, playerLevel),
    ),
  },
  curse: {
    ...CATEGORY_POWER_EFFECTS.curse,
    damageMultiplier: round3(
      scaleByLevel(CATEGORY_POWER_SCALING.curse.damageMultiplier, playerLevel),
    ),
  },
  bloodyHarvest: {
    healPerKill: Math.round(
      scaleByLevel(
        CATEGORY_POWER_SCALING.bloodyHarvest.healPerKill,
        playerLevel,
      ),
    ),
  },
});

// Poison status for one enemy: damage per tick = % of that enemy's max HP.
// Falls back to the old flat damage when the enemy has no max HP.
export const getPlaguePoisonStatus = (
  enemyMaxHp: number | undefined,
  playerLevel: number,
): StatusEffectConfig => {
  const effect = getCategoryPowerEffects(playerLevel).plague;
  const tickSeconds = effect.tickMs / 1000;
  const percentDamage =
    enemyMaxHp !== undefined && enemyMaxHp > 0
      ? enemyMaxHp * effect.percentMaxHpPerSecond * tickSeconds
      : effect.damagePerTick;

  let damagePerTick = Math.max(PLAGUE_MIN_DAMAGE_PER_TICK, percentDamage);
  if (PLAGUE_MAX_DAMAGE_PER_TICK !== undefined) {
    damagePerTick = Math.min(PLAGUE_MAX_DAMAGE_PER_TICK, damagePerTick);
  }

  return {
    id: effect.id,
    durationMs: effect.durationMs,
    tickMs: effect.tickMs,
    damagePerTick,
    refreshMode: effect.refreshMode,
  };
};

// Values for the {{placeholders}} of the "categories.power.*" texts at a given
// player level:
//   plague        -> { percent, tick, duration }  (% of max HP per tick, seconds)
//   frost         -> { percent, duration }        (% slower, seconds)
//   curse         -> { percent, duration }        (% less damage dealt, seconds)
//   bloodyHarvest -> { amount }                   (HP per kill)
// `duration` is the duration of the status each hit applies, not of the power.
export const getCategoryPowerDescriptionParams = (
  category: WeaponCategoryId,
  playerLevel: number,
): Record<string, number> => {
  const effects = getCategoryPowerEffects(playerLevel);

  switch (category) {
    case "plague": {
      const tick = effects.plague.tickMs / 1000;

      return {
        percent:
          Math.round(effects.plague.percentMaxHpPerSecond * tick * 1000) / 10,
        tick,
        duration: effects.plague.durationMs / 1000,
      };
    }
    case "frost":
      return {
        percent: Math.round((1 - effects.frost.speedMultiplier) * 100),
        duration: effects.frost.durationMs / 1000,
      };
    case "curse":
      return {
        percent: Math.round((1 - effects.curse.damageMultiplier) * 100),
        duration: effects.curse.durationMs / 1000,
      };
    case "bloodyHarvest":
      return { amount: effects.bloodyHarvest.healPerKill };
    default:
      return {};
  }
};

// Same params as getCategoryPowerDescriptionParams, but as a level 1 -> max level
// range for screens without a player level (e.g. the Codex): a value that
// changes with the level becomes "min-max" (e.g. percent: "40-70"), the others
// stay numbers.
export const getCategoryPowerDescriptionRange = (
  category: WeaponCategoryId,
): Record<string, string | number> => {
  const low = getCategoryPowerDescriptionParams(
    category,
    POWER_SCALING_MIN_LEVEL,
  );
  const high = getCategoryPowerDescriptionParams(
    category,
    POWER_SCALING_MAX_LEVEL,
  );

  return Object.fromEntries(
    Object.keys(low).map((key) => [
      key,
      low[key] === high[key] ? low[key] : `${low[key]}-${high[key]}`,
    ]),
  );
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
