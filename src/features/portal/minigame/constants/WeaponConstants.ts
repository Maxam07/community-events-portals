import type {
  CombatConfig,
  ProjectileConfig,
  StatusEffectConfig,
  WeaponConfig,
  WeaponId,
  WeaponLevel,
  WeaponRuntimeStats,
  WeaponUpgrade,
} from "../Types";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { getActiveWearableBuffs } from "./WearableConstants";
import { getPerkAmount } from "./PerkConstants";
import type { PerkLevels } from "../Types";

const BASE_WEAPON_STATS = {
  damage: 1,
  cooldownMs: 1000,
  projectileSpeed: 90,
  projectileCount: 1,
  spreadDegrees: 0,
  areaRadius: 18,
  orbitRadius: 22,
  orbitalCount: 1,
  durationMs: 900,
  size: 1,
  pierce: 0,
  bounceCount: 0,
  chainRadius: 90,
  arcDegrees: 70,
  range: 48,
  dotDamage: 0,
  dotTickMs: 500,
  statusDurationMs: 1200,
  homingSpeed: 90,
  hitCooldownMs: 450,
  angularSpeed: 0.003,
  knockback: 0,
};

export const WEAPON_MAX_LEVEL: WeaponLevel = 8;

export const KNOCKBACK_DURATION_MS = 160;

export const getNextWeaponLevel = (
  level: WeaponLevel,
): WeaponLevel | undefined => {
  if (level >= WEAPON_MAX_LEVEL) return undefined;

  return (level + 1) as WeaponLevel;
};

export const WEAPON_UPGRADE_XP_COSTS: Record<WeaponLevel, number | null> = {
  0: null,
  1: 20,
  2: 20,
  3: 50,
  4: 90,
  5: 140,
  6: 200,
  7: 270,
  8: 350,
};

export const PROJECTILE_CONFIGS: Record<string, ProjectileConfig> = {
  darknessBook: {
    texture: "weapon_darkness_book_projectile",
    behavior: "linear",
    bodySize: 10,
  },
  poisonVial: {
    texture: "weapon_poison_vial_projectile",
    behavior: "exploding",
    bodySize: 10,
    rotateToVelocity: true,
    rotationOffsetDegrees: -90,
    scale: 0.8,
    orientedHitbox: true,
  },
  bloodKnife: {
    texture: "weapon_blood_knife",
    behavior: "bouncing",
    bodySize: 10,
  },
  light: {
    texture: "weapon_frost_flower",
    behavior: "light",
    bodySize: 6,
    rotateToVelocity: true,
    rotationOffsetDegrees: 90,
  },
  banishedJackOLantern: {
    texture: "weapon_banished_jack_o_lantern_horizontal",
    behavior: "rolling",
    bodySize: 14,
    bodySizeMode: "spriteBounds",
    bodySizeScale: { width: 1, height: 2 / 3 },
  },
  coffinShard: {
    texture: "weapon_cursed_coffin_shard",
    behavior: "linear",
    bodySize: 10,
    rotateToVelocity: true,
  },
};

export const STATUS_EFFECTS: Record<string, StatusEffectConfig> = {
  oilDot: {
    id: "oilDot",
    durationMs: 2400,
    tickMs: 500,
    damagePerTick: 1,
    refreshMode: "refresh",
  },
  bleed: {
    id: "bleed",
    durationMs: 1500,
    tickMs: 1000,
    damagePerTick: 2,
    refreshMode: "refresh",
    sourceWeaponId: "crimsonVial",
  },
};

export const WEAPON_CONFIGS: Record<WeaponId, WeaponConfig> = {
  frozenSkull: {
    id: "frozenSkull",
    texture: "weapon_frozen_skull",
    behavior: "orbital",
    damageType: "physical",
    targeting: "inRadius",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 4,
      orbitRadius: 30,
      orbitalCount: 1,
      hitCooldownMs: 400,
      angularSpeed: 0.004,
    },
  },
  bloodScythe: {
    id: "bloodScythe",
    texture: "weapon_blood_scythe",
    behavior: "slash",
    damageType: "physical",
    targeting: "nearest",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 6,
      cooldownMs: 1300,
      durationMs: 320,
      arcDegrees: 180,
      range: 40,
    },
  },
  darknessBook: {
    id: "darknessBook",
    texture: "weapon_darkness_book_projectile",
    behavior: "linearProjectile",
    damageType: "water",
    targeting: "nearest",
    projectile: PROJECTILE_CONFIGS.darknessBook,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 5,
      cooldownMs: 650,
      projectileSpeed: 150,
      durationMs: 900,
    },
  },
  poisonVial: {
    id: "poisonVial",
    texture: "weapon_poison_vial_projectile",
    behavior: "explodingProjectile",
    damageType: "explosion",
    targeting: "nearest",
    projectile: PROJECTILE_CONFIGS.poisonVial,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 3,
      cooldownMs: 1200,
      projectileSpeed: 95,
      areaRadius: 25,
      durationMs: 1400,
    },
  },
  bloodKnife: {
    id: "bloodKnife",
    texture: "weapon_blood_knife",
    behavior: "chainProjectile",
    damageType: "physical",
    targeting: "random",
    projectile: PROJECTILE_CONFIGS.bloodKnife,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 3,
      cooldownMs: 1100,
      projectileSpeed: 120,
      projectileCount: 1,
      bounceCount: 4,
      chainRadius: 120,
      durationMs: 2000,
    },
  },
  frostFlower: {
    id: "frostFlower",
    texture: "weapon_frost_flower",
    behavior: "orbitalShooter",
    damageType: "light",
    targeting: "nearest",
    projectile: PROJECTILE_CONFIGS.light,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 4,
      cooldownMs: 750,
      projectileSpeed: 130,
      orbitRadius: 40,
      orbitalCount: 1,
      durationMs: 900,
      angularSpeed: 0.003,
    },
  },
  mossGround: {
    id: "mossGround",
    texture: "weapon_moss_ground",
    behavior: "snareArea",
    damageType: "dot",
    targeting: "nearest",
    statusEffects: [STATUS_EFFECTS.oilDot],
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 1,
      cooldownMs: 1600,
      areaRadius: 30,
      durationMs: 2000,
      dotDamage: 2,
      dotTickMs: 500,
      statusDurationMs: 1200,
      hitCooldownMs: 500,
    },
  },
  banishedJackOLantern: {
    id: "banishedJackOLantern",
    texture: "weapon_banished_jack_o_lantern_horizontal",
    behavior: "rollingProjectile",
    damageType: "physical",
    targeting: "random",
    projectile: PROJECTILE_CONFIGS.banishedJackOLantern,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 4,
      cooldownMs: 1500,
      projectileSpeed: 85,
      durationMs: 1800,
      pierce: 5,
      size: 1.0,
    },
  },
  flyStorm: {
    id: "flyStorm",
    texture: "weapon_fly_storm",
    behavior: "homingSummon",
    damageType: "summon",
    targeting: "nearest",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 2,
      projectileCount: 2,
      homingSpeed: 110,
      hitCooldownMs: 800,
      range: 140,
    },
  },
  cursedCoffin: {
    id: "cursedCoffin",
    texture: "weapon_cursed_coffin",
    behavior: "coffinBurst",
    damageType: "physical",
    targeting: "nearest",
    projectile: PROJECTILE_CONFIGS.coffinShard,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 3,
      cooldownMs: 2200,
      projectileSpeed: 110,
      projectileCount: 3,
      areaRadius: 60,
      durationMs: 700,
      pierce: 1,
    },
  },
  frostChain: {
    id: "frostChain",
    texture: "weapon_frost_chain",
    behavior: "chainAnchor",
    damageType: "physical",
    targeting: "nearest",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 4,
      cooldownMs: 1600,
      range: 55,
      knockback: 30,
      durationMs: 220,
    },
  },
  crimsonVial: {
    id: "crimsonVial",
    texture: "weapon_crimson_vial",
    behavior: "bloodTether",
    damageType: "dot",
    targeting: "nearest",
    statusEffects: [STATUS_EFFECTS.bleed],
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 0,
      cooldownMs: 2000,
      projectileCount: 1,
      range: 140,
      dotDamage: 2,
      dotTickMs: 1000,
      statusDurationMs: 1500,
    },
  },
};

export const WEAPON_UPGRADES: Record<WeaponId, WeaponUpgrade[]> = {
  frozenSkull: [
    {
      level: 2,
      modifiers: [
        { stat: "angularSpeed", operation: "multiply", value: 1.1 },
        { stat: "damage", operation: "add", value: 1 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "orbitRadius", operation: "add", value: 5 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "angularSpeed", operation: "multiply", value: 1.15 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "orbitRadius", operation: "add", value: 8 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "angularSpeed", operation: "multiply", value: 1.1 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
  ],
  bloodScythe: [
    {
      level: 2,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 20 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 20 },
        { stat: "range", operation: "add", value: 5 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 20 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 20 },
        { stat: "durationMs", operation: "add", value: 80 },
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 20 },
        { stat: "damage", operation: "add", value: 4 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 20 },
        { stat: "range", operation: "add", value: 10 },
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 30 },
        { stat: "projectileCount", operation: "set", value: 2 },
        { stat: "damage", operation: "add", value: 10 },
        { stat: "range", operation: "add", value: 10 },
      ],
    },
  ],
  darknessBook: [
    {
      level: 2,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "projectileSpeed", operation: "add", value: 10 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "add", value: 3 },
        { stat: "pierce", operation: "add", value: 1 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "add", value: 3 },
        { stat: "projectileSpeed", operation: "add", value: 20 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 4 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "pierce", operation: "add", value: 3 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 5 },
        { stat: "pierce", operation: "add", value: 5 },
      ],
    },
  ],
  poisonVial: [
    {
      level: 2,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 2 },
        { stat: "damage", operation: "add", value: 1 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "durationMs", operation: "add", value: 200 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 3 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "add", value: 3 },
        { stat: "durationMs", operation: "add", value: 300 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 4 },
        { stat: "damage", operation: "add", value: 5 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
        { stat: "projectileSpeed", operation: "add", value: 25 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "projectileSpeed", operation: "add", value: 50 },
        { stat: "areaRadius", operation: "add", value: 5 },
        { stat: "damage", operation: "add", value: 10 },
      ],
    },
  ],
  bloodKnife: [
    {
      level: 2,
      modifiers: [
        { stat: "bounceCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "projectileSpeed", operation: "add", value: 20 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "bounceCount", operation: "add", value: 2 },
        { stat: "chainRadius", operation: "add", value: 30 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "add", value: 4 },
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "bounceCount", operation: "add", value: 2 },
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 9 },
      ],
    },
  ],
  frostFlower: [
    {
      level: 2,
      modifiers: [
        { stat: "orbitRadius", operation: "add", value: 10 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "projectileSpeed", operation: "add", value: 25 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "add", value: 4 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "durationMs", operation: "add", value: 200 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "add", value: 6 },
        { stat: "orbitRadius", operation: "add", value: 15 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
        { stat: "damage", operation: "add", value: 9 },
      ],
    },
  ],
  mossGround: [
    {
      level: 2,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 6 },
        { stat: "dotDamage", operation: "add", value: 1 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "durationMs", operation: "add", value: 400 },
        { stat: "dotTickMs", operation: "multiply", value: 0.85 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 8 },
        { stat: "dotDamage", operation: "add", value: 2 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "statusDurationMs", operation: "add", value: 400 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 10 },
        { stat: "dotDamage", operation: "add", value: 3 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "dotTickMs", operation: "multiply", value: 0.75 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 15 },
        { stat: "dotDamage", operation: "add", value: 5 },
        { stat: "durationMs", operation: "add", value: 600 },
      ],
    },
  ],
  banishedJackOLantern: [
    {
      level: 2,
      modifiers: [
        { stat: "size", operation: "add", value: 0.2 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "pierce", operation: "add", value: 4 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "size", operation: "add", value: 0.25 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "projectileSpeed", operation: "add", value: 20 },
        { stat: "durationMs", operation: "add", value: 200 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "add", value: 4 },
        { stat: "pierce", operation: "add", value: 4 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
        { stat: "size", operation: "add", value: 0.3 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "size", operation: "add", value: 0.5 },
        { stat: "pierce", operation: "add", value: 8 },
        { stat: "damage", operation: "add", value: 15 },
      ],
    },
  ],
  flyStorm: [
    {
      level: 2,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "homingSpeed", operation: "add", value: 15 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "add", value: 1 },
        { stat: "range", operation: "add", value: 20 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.85 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "add", value: 2 },
        { stat: "homingSpeed", operation: "add", value: 25 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "add", value: 2 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.85 },
        { stat: "range", operation: "add", value: 30 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 2 },
        { stat: "homingSpeed", operation: "add", value: 40 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
  ],
  cursedCoffin: [
    {
      level: 2,
      modifiers: [
        { stat: "projectileCount", operation: "set", value: 4 },
        { stat: "damage", operation: "set", value: 4 },
        { stat: "areaRadius", operation: "set", value: 68 },
        { stat: "cooldownMs", operation: "set", value: 2000 },
        { stat: "pierce", operation: "set", value: 1 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "projectileCount", operation: "set", value: 4 },
        { stat: "damage", operation: "set", value: 5 },
        { stat: "areaRadius", operation: "set", value: 76 },
        { stat: "cooldownMs", operation: "set", value: 1850 },
        { stat: "pierce", operation: "set", value: 2 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "projectileCount", operation: "set", value: 5 },
        { stat: "damage", operation: "set", value: 5 },
        { stat: "areaRadius", operation: "set", value: 84 },
        { stat: "cooldownMs", operation: "set", value: 1700 },
        { stat: "pierce", operation: "set", value: 2 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "projectileCount", operation: "set", value: 5 },
        { stat: "damage", operation: "set", value: 6 },
        { stat: "areaRadius", operation: "set", value: 94 },
        { stat: "cooldownMs", operation: "set", value: 1550 },
        { stat: "pierce", operation: "set", value: 3 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "projectileCount", operation: "set", value: 6 },
        { stat: "damage", operation: "set", value: 7 },
        { stat: "areaRadius", operation: "set", value: 102 },
        { stat: "cooldownMs", operation: "set", value: 1400 },
        { stat: "pierce", operation: "set", value: 3 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "projectileCount", operation: "set", value: 7 },
        { stat: "damage", operation: "set", value: 8 },
        { stat: "areaRadius", operation: "set", value: 112 },
        { stat: "cooldownMs", operation: "set", value: 1250 },
        { stat: "pierce", operation: "set", value: 4 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "projectileCount", operation: "set", value: 8 },
        { stat: "damage", operation: "set", value: 9 },
        { stat: "areaRadius", operation: "set", value: 120 },
        { stat: "cooldownMs", operation: "set", value: 1100 },
        { stat: "pierce", operation: "set", value: 4 },
      ],
    },
  ],
  frostChain: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 5 },
        { stat: "knockback", operation: "set", value: 45 },
        { stat: "range", operation: "set", value: 60 },
        { stat: "cooldownMs", operation: "set", value: 1500 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 6 },
        { stat: "knockback", operation: "set", value: 50 },
        { stat: "range", operation: "set", value: 65 },
        { stat: "cooldownMs", operation: "set", value: 1400 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 7 },
        { stat: "knockback", operation: "set", value: 55 },
        { stat: "range", operation: "set", value: 70 },
        { stat: "cooldownMs", operation: "set", value: 1300 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 9 },
        { stat: "knockback", operation: "set", value: 60 },
        { stat: "range", operation: "set", value: 75 },
        { stat: "cooldownMs", operation: "set", value: 1150 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 10 },
        { stat: "knockback", operation: "set", value: 67.5 },
        { stat: "range", operation: "set", value: 80 },
        { stat: "cooldownMs", operation: "set", value: 1000 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 11 },
        { stat: "knockback", operation: "set", value: 75 },
        { stat: "range", operation: "set", value: 85 },
        { stat: "cooldownMs", operation: "set", value: 900 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 12 },
        { stat: "knockback", operation: "set", value: 80 },
        { stat: "range", operation: "set", value: 90 },
        { stat: "cooldownMs", operation: "set", value: 800 },
      ],
    },
  ],
  // dotDamage is bleed damage per second (dotTickMs is 1000).
  crimsonVial: [
    {
      level: 2,
      modifiers: [
        { stat: "dotDamage", operation: "set", value: 3 },
        { stat: "statusDurationMs", operation: "set", value: 1700 },
        { stat: "projectileCount", operation: "set", value: 1 },
        { stat: "cooldownMs", operation: "set", value: 1850 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "dotDamage", operation: "set", value: 3 },
        { stat: "statusDurationMs", operation: "set", value: 1900 },
        { stat: "projectileCount", operation: "set", value: 1 },
        { stat: "cooldownMs", operation: "set", value: 1700 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "dotDamage", operation: "set", value: 4 },
        { stat: "statusDurationMs", operation: "set", value: 2100 },
        { stat: "projectileCount", operation: "set", value: 1 },
        { stat: "cooldownMs", operation: "set", value: 1550 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "dotDamage", operation: "set", value: 5 },
        { stat: "statusDurationMs", operation: "set", value: 2300 },
        { stat: "projectileCount", operation: "set", value: 2 },
        { stat: "cooldownMs", operation: "set", value: 1400 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "dotDamage", operation: "set", value: 6 },
        { stat: "statusDurationMs", operation: "set", value: 2500 },
        { stat: "projectileCount", operation: "set", value: 2 },
        { stat: "cooldownMs", operation: "set", value: 1250 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "dotDamage", operation: "set", value: 6 },
        { stat: "statusDurationMs", operation: "set", value: 2700 },
        { stat: "projectileCount", operation: "set", value: 2 },
        { stat: "cooldownMs", operation: "set", value: 1100 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "dotDamage", operation: "set", value: 7 },
        { stat: "statusDurationMs", operation: "set", value: 3000 },
        { stat: "projectileCount", operation: "set", value: 2 },
        { stat: "cooldownMs", operation: "set", value: 1000 },
      ],
    },
  ],
};

export const normaliseWeaponStats = (stats: WeaponRuntimeStats) => {
  stats.cooldownMs = Math.max(80, Math.round(stats.cooldownMs));
  stats.hitCooldownMs = Math.max(80, Math.round(stats.hitCooldownMs));
  stats.dotTickMs = Math.max(80, Math.round(stats.dotTickMs));
  stats.projectileCount = Math.max(1, Math.round(stats.projectileCount));
  stats.orbitalCount = Math.max(1, Math.round(stats.orbitalCount));
  stats.pierce = Math.max(0, Math.round(stats.pierce));
  stats.bounceCount = Math.max(0, Math.round(stats.bounceCount));
  stats.areaRadius = Math.max(1, stats.areaRadius);
  stats.range = Math.max(1, stats.range);
  stats.durationMs = Math.max(80, Math.round(stats.durationMs));

  return stats;
};

export const resolveWeaponStats = (
  id: WeaponId,
  level: number,
  activeWearables?: BumpkinParts,
  perkLevels?: PerkLevels,
): WeaponRuntimeStats => {
  const stats = { ...WEAPON_CONFIGS[id].baseStats };

  WEAPON_UPGRADES[id]
    .filter((upgrade) => upgrade.level <= level)
    .forEach((upgrade) => {
      upgrade.modifiers.forEach(({ stat, operation, value }) => {
        if (operation === "add") {
          stats[stat] += value;
        } else if (operation === "multiply") {
          stats[stat] *= value;
        } else {
          stats[stat] = value;
        }
      });
    });

  getActiveWearableBuffs(activeWearables).forEach((buff) => {
    if (buff.target.type !== "weaponStat") return;
    if (buff.target.weapon !== id) return;

    stats[buff.target.stat] += buff.value;
  });

  // Passive perks (Halloween backlog 1.2) apply last, on top of upgrades
  // and wearable buffs, as global multipliers.
  const attackSpeedBonus = getPerkAmount(perkLevels, "attackSpeed");
  if (attackSpeedBonus > 0) {
    stats.cooldownMs *= 1 - attackSpeedBonus;
    if (id === "flyStorm") {
      stats.hitCooldownMs *= 1 - attackSpeedBonus;
    }
  }

  const cooldownReductionBonus = getPerkAmount(perkLevels, "cooldownReduction");
  if (cooldownReductionBonus > 0) {
    stats.hitCooldownMs *= 1 - cooldownReductionBonus;
    stats.dotTickMs *= 1 - cooldownReductionBonus;
  }

  const projectileSpeedBonus = getPerkAmount(perkLevels, "projectileSpeed");
  if (projectileSpeedBonus > 0) {
    stats.projectileSpeed *= 1 + projectileSpeedBonus;
    stats.homingSpeed *= 1 + projectileSpeedBonus;
  }

  return normaliseWeaponStats(stats);
};

export const COMBAT_CONFIG: CombatConfig = {
  projectilePoolSize: 80,
  hitboxPoolSize: 32,
  orbitalPoolSize: 24,
  beePoolSize: 32,
  targetScanMs: 150,
  maxWeaponRange: 200,
  defaultEnemyScore: 1,
  defaultWeaponLoadout: [{ id: "frozenSkull", level: 1 }],
};
