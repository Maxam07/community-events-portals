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

export const WEAPON_MAX_LEVEL: WeaponLevel = 15;

export const KNOCKBACK_DURATION_MS = 160;

export const getNextWeaponLevel = (
  level: WeaponLevel,
): WeaponLevel | undefined => {
  if (level >= WEAPON_MAX_LEVEL) return undefined;

  return (level + 1) as WeaponLevel;
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
      arcDegrees: 120,
      range: 30,
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
      cooldownMs: 2000,
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
    targeting: "nearest",
    projectile: PROJECTILE_CONFIGS.banishedJackOLantern,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 5,
      cooldownMs: 1000,
      projectileSpeed: 100,
      durationMs: 1500,
      pierce: 10,
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
      range: 100,
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
      damage: 8,
      cooldownMs: 1900,
      range: 70,
      knockback: 25,
      durationMs: 220,
      areaRadius: 40,
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
      cooldownMs: 1300,
      projectileCount: 2,
      range: 130,
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
        { stat: "damage", operation: "set", value: 5 },
        { stat: "hitCooldownMs", operation: "set", value: 390 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 6 },
        { stat: "hitCooldownMs", operation: "set", value: 380 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 7 },
        { stat: "hitCooldownMs", operation: "set", value: 360 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 11 },
        { stat: "orbitalCount", operation: "set", value: 3 },
        { stat: "orbitRadius", operation: "set", value: 40 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 13 },
        { stat: "hitCooldownMs", operation: "set", value: 360 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 15 },
        { stat: "hitCooldownMs", operation: "set", value: 350 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 17 },
        { stat: "orbitalCount", operation: "set", value: 4 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 19 },
        { stat: "hitCooldownMs", operation: "set", value: 340 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 25 },
        { stat: "orbitalCount", operation: "set", value: 5 },
        { stat: "orbitRadius", operation: "set", value: 44 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 28 },
        { stat: "hitCooldownMs", operation: "set", value: 320 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 31 },
        { stat: "orbitalCount", operation: "set", value: 6 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 36 },
        { stat: "hitCooldownMs", operation: "set", value: 310 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 42 },
        { stat: "hitCooldownMs", operation: "set", value: 300 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 50 },
        { stat: "orbitalCount", operation: "set", value: 8 },
        { stat: "orbitRadius", operation: "set", value: 56 },
      ],
    },
  ],
  bloodScythe: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 8 },
        { stat: "cooldownMs", operation: "set", value: 1500 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 10 },
        { stat: "cooldownMs", operation: "set", value: 1450 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 12 },
        { stat: "cooldownMs", operation: "set", value: 1400 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 18 },
        { stat: "cooldownMs", operation: "set", value: 1350 },
        { stat: "arcDegrees", operation: "set", value: 180 },
        { stat: "range", operation: "set", value: 40 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 21 },
        { stat: "cooldownMs", operation: "set", value: 1300 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 24 },
        { stat: "cooldownMs", operation: "set", value: 1250 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 27 },
        { stat: "cooldownMs", operation: "set", value: 1200 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 30 },
        { stat: "cooldownMs", operation: "set", value: 1150 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 38 },
        { stat: "cooldownMs", operation: "set", value: 1000 },
        { stat: "projectileCount", operation: "set", value: 2 },
        { stat: "arcDegrees", operation: "set", value: 225 },
        { stat: "range", operation: "set", value: 50 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 42 },
        { stat: "cooldownMs", operation: "set", value: 950 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 46 },
        { stat: "cooldownMs", operation: "set", value: 900 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 53 },
        { stat: "cooldownMs", operation: "set", value: 850 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 61 },
        { stat: "cooldownMs", operation: "set", value: 800 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 72 },
        { stat: "cooldownMs", operation: "set", value: 750 },
        { stat: "arcDegrees", operation: "set", value: 270 },
        { stat: "range", operation: "set", value: 60 },
      ],
    },
  ],
  darknessBook: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 6 },
        { stat: "cooldownMs", operation: "set", value: 630 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 7 },
        { stat: "cooldownMs", operation: "set", value: 620 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 8 },
        { stat: "cooldownMs", operation: "set", value: 600 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 12 },
        { stat: "cooldownMs", operation: "set", value: 590 },
        { stat: "projectileCount", operation: "set", value: 2 },
        { stat: "pierce", operation: "set", value: 4 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 14 },
        { stat: "cooldownMs", operation: "set", value: 570 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 16 },
        { stat: "cooldownMs", operation: "set", value: 560 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 18 },
        { stat: "cooldownMs", operation: "set", value: 540 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 20 },
        { stat: "cooldownMs", operation: "set", value: 530 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 26 },
        { stat: "cooldownMs", operation: "set", value: 510 },
        { stat: "projectileCount", operation: "set", value: 4 },
        { stat: "pierce", operation: "set", value: 8 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 29 },
        { stat: "cooldownMs", operation: "set", value: 500 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 32 },
        { stat: "cooldownMs", operation: "set", value: 480 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 37 },
        { stat: "cooldownMs", operation: "set", value: 470 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 43 },
        { stat: "cooldownMs", operation: "set", value: 450 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 52 },
        { stat: "cooldownMs", operation: "set", value: 380 },
        { stat: "projectileCount", operation: "set", value: 7 },
        { stat: "pierce", operation: "set", value: 18 },
      ],
    },
  ],
  poisonVial: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 6 },
        { stat: "cooldownMs", operation: "set", value: 1180 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 8 },
        { stat: "cooldownMs", operation: "set", value: 1150 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 10 },
        { stat: "cooldownMs", operation: "set", value: 1130 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 15 },
        { stat: "cooldownMs", operation: "set", value: 1110 },
        { stat: "areaRadius", operation: "set", value: 35 },
        { stat: "projectileSpeed", operation: "set", value: 120 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 20 },
        { stat: "cooldownMs", operation: "set", value: 1080 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 25 },
        { stat: "cooldownMs", operation: "set", value: 1060 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 30 },
        { stat: "cooldownMs", operation: "set", value: 1040 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 35 },
        { stat: "cooldownMs", operation: "set", value: 1020 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 40 },
        { stat: "cooldownMs", operation: "set", value: 990 },
        { stat: "projectileSpeed", operation: "set", value: 160 },
        { stat: "areaRadius", operation: "set", value: 50 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 50 },
        { stat: "cooldownMs", operation: "set", value: 970 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 65 },
        { stat: "cooldownMs", operation: "set", value: 950 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 75 },
        { stat: "cooldownMs", operation: "set", value: 920 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 85 },
        { stat: "cooldownMs", operation: "set", value: 750 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 100 },
        { stat: "cooldownMs", operation: "set", value: 500 },
        { stat: "projectileSpeed", operation: "set", value: 200 },
        { stat: "areaRadius", operation: "set", value: 80 },
      ],
    },
  ],
  bloodKnife: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 4 },
        { stat: "cooldownMs", operation: "set", value: 1070 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 5 },
        { stat: "cooldownMs", operation: "set", value: 1050 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 6 },
        { stat: "cooldownMs", operation: "set", value: 1020 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 10 },
        { stat: "cooldownMs", operation: "set", value: 990 },
        { stat: "bounceCount", operation: "set", value: 9 },
        { stat: "chainRadius", operation: "set", value: 150 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 12 },
        { stat: "cooldownMs", operation: "set", value: 970 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 14 },
        { stat: "cooldownMs", operation: "set", value: 940 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 16 },
        { stat: "cooldownMs", operation: "set", value: 910 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 18 },
        { stat: "cooldownMs", operation: "set", value: 880 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 24 },
        { stat: "cooldownMs", operation: "set", value: 860 },
        { stat: "bounceCount", operation: "set", value: 15 },
        { stat: "chainRadius", operation: "set", value: 200 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 27 },
        { stat: "cooldownMs", operation: "set", value: 830 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 30 },
        { stat: "cooldownMs", operation: "set", value: 800 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 35 },
        { stat: "cooldownMs", operation: "set", value: 780 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 41 },
        { stat: "cooldownMs", operation: "set", value: 750 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 48 },
        { stat: "cooldownMs", operation: "set", value: 660 },
        { stat: "bounceCount", operation: "set", value: 26 },
        { stat: "chainRadius", operation: "set", value: 300 },
      ],
    },
  ],
  frostFlower: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 5 },
        { stat: "cooldownMs", operation: "set", value: 730 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 6 },
        { stat: "orbitalCount", operation: "set", value: 2 },

        { stat: "cooldownMs", operation: "set", value: 710 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 7 },
        { stat: "cooldownMs", operation: "set", value: 690 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 11 },
        { stat: "orbitalCount", operation: "set", value: 3 },

        { stat: "cooldownMs", operation: "set", value: 670 },
        { stat: "orbitRadius", operation: "set", value: 50 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 13 },
        { stat: "cooldownMs", operation: "set", value: 650 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 15 },
        { stat: "cooldownMs", operation: "set", value: 630 },
        { stat: "orbitalCount", operation: "set", value: 4 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 17 },
        { stat: "cooldownMs", operation: "set", value: 600 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 19 },
        { stat: "cooldownMs", operation: "set", value: 580 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 25 },
        { stat: "cooldownMs", operation: "set", value: 560 },
        { stat: "orbitalCount", operation: "set", value: 5 },
        { stat: "orbitRadius", operation: "set", value: 61 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 28 },
        { stat: "cooldownMs", operation: "set", value: 540 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 31 },
        { stat: "cooldownMs", operation: "set", value: 520 },
        { stat: "orbitalCount", operation: "set", value: 6 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 36 },
        { stat: "cooldownMs", operation: "set", value: 500 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 42 },
        { stat: "cooldownMs", operation: "set", value: 480 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 50 },
        { stat: "cooldownMs", operation: "set", value: 420 },
        { stat: "orbitalCount", operation: "set", value: 7 },
        { stat: "orbitRadius", operation: "set", value: 80 },
      ],
    },
  ],
  mossGround: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 2 },
        { stat: "cooldownMs", operation: "set", value: 1900 },
        { stat: "dotDamage", operation: "set", value: 3 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 3 },
        { stat: "cooldownMs", operation: "set", value: 1800 },
        { stat: "dotDamage", operation: "set", value: 4 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 4 },
        { stat: "dotDamage", operation: "set", value: 5 },
        { stat: "cooldownMs", operation: "set", value: 1750 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 8 },
        { stat: "cooldownMs", operation: "set", value: 1700 },
        { stat: "areaRadius", operation: "set", value: 41 },
        { stat: "dotDamage", operation: "set", value: 7 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 10 },
        { stat: "dotDamage", operation: "set", value: 9 },
        { stat: "cooldownMs", operation: "set", value: 1650 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 12 },
        { stat: "dotDamage", operation: "set", value: 12 },
        { stat: "cooldownMs", operation: "set", value: 1600 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 14 },
        { stat: "dotDamage", operation: "set", value: 15 },
        { stat: "cooldownMs", operation: "set", value: 1550 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 16 },
        { stat: "dotDamage", operation: "set", value: 18 },
        { stat: "cooldownMs", operation: "set", value: 1500 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 22 },
        { stat: "cooldownMs", operation: "set", value: 1450 },
        { stat: "areaRadius", operation: "set", value: 50 },
        { stat: "dotDamage", operation: "set", value: 21 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 25 },
        { stat: "dotDamage", operation: "set", value: 25 },
        { stat: "cooldownMs", operation: "set", value: 1400 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 28 },
        { stat: "dotDamage", operation: "set", value: 30 },
        { stat: "cooldownMs", operation: "set", value: 1350 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 33 },
        { stat: "dotDamage", operation: "set", value: 35 },
        { stat: "cooldownMs", operation: "set", value: 1300 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 39 },
        { stat: "dotDamage", operation: "set", value: 40 },
        { stat: "cooldownMs", operation: "set", value: 1250 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 48 },
        { stat: "cooldownMs", operation: "set", value: 1200 },
        { stat: "areaRadius", operation: "set", value: 65 },
        { stat: "dotDamage", operation: "set", value: 50 },
      ],
    },
  ],
  banishedJackOLantern: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 7 },
        { stat: "cooldownMs", operation: "set", value: 1400 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 9 },
        { stat: "cooldownMs", operation: "set", value: 1300 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 12 },
        { stat: "cooldownMs", operation: "set", value: 1200 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 18 },
        { stat: "cooldownMs", operation: "set", value: 1100 },
        { stat: "pierce", operation: "set", value: 15 },
        { stat: "size", operation: "set", value: 1.5 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 20 },
        { stat: "cooldownMs", operation: "set", value: 1000 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 25 },
        { stat: "cooldownMs", operation: "set", value: 900 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 30 },
        { stat: "cooldownMs", operation: "set", value: 800 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 35 },
        { stat: "cooldownMs", operation: "set", value: 750 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 37 },
        { stat: "cooldownMs", operation: "set", value: 700 },
        { stat: "pierce", operation: "set", value: 30 },
        { stat: "size", operation: "set", value: 2 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 42 },
        { stat: "cooldownMs", operation: "set", value: 650 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 47 },
        { stat: "cooldownMs", operation: "set", value: 600 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 52 },
        { stat: "cooldownMs", operation: "set", value: 550 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 57 },
        { stat: "cooldownMs", operation: "set", value: 500 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 70 },
        { stat: "cooldownMs", operation: "set", value: 400 },
        { stat: "pierce", operation: "set", value: 60 },
        { stat: "size", operation: "set", value: 2.5 },
      ],
    },
  ],
  flyStorm: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 3 },
        { stat: "hitCooldownMs", operation: "set", value: 850 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 4 },
        { stat: "hitCooldownMs", operation: "set", value: 800 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 5 },
        { stat: "hitCooldownMs", operation: "set", value: 750 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 6 },
        { stat: "range", operation: "set", value: 120 },
        { stat: "projectileCount", operation: "set", value: 4 },
        { stat: "hitCooldownMs", operation: "set", value: 700 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 7 },
        { stat: "hitCooldownMs", operation: "set", value: 650 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 8 },
        { stat: "hitCooldownMs", operation: "set", value: 600 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 9 },
        { stat: "hitCooldownMs", operation: "set", value: 550 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 10 },
        { stat: "hitCooldownMs", operation: "set", value: 500 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 15 },
        { stat: "range", operation: "set", value: 135 },
        { stat: "projectileCount", operation: "set", value: 8 },
        { stat: "hitCooldownMs", operation: "set", value: 430 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 18 },
        { stat: "hitCooldownMs", operation: "set", value: 390 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 20 },
        { stat: "hitCooldownMs", operation: "set", value: 350 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 24 },
        { stat: "hitCooldownMs", operation: "set", value: 310 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 27 },
        { stat: "hitCooldownMs", operation: "set", value: 280 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 35 },
        { stat: "projectileCount", operation: "set", value: 12 },
        { stat: "range", operation: "set", value: 150 },
        { stat: "hitCooldownMs", operation: "set", value: 250 },
      ],
    },
  ],
  cursedCoffin: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 4 },
        { stat: "cooldownMs", operation: "set", value: 2120 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 5 },
        { stat: "cooldownMs", operation: "set", value: 2050 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 6 },
        { stat: "cooldownMs", operation: "set", value: 1970 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 10 },
        { stat: "cooldownMs", operation: "set", value: 1890 },
        { stat: "projectileCount", operation: "set", value: 6 },
        { stat: "areaRadius", operation: "set", value: 75 },
        { stat: "pierce", operation: "set", value: 5 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 12 },
        { stat: "cooldownMs", operation: "set", value: 1820 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 15 },
        { stat: "cooldownMs", operation: "set", value: 1740 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 19 },
        { stat: "cooldownMs", operation: "set", value: 1660 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 22 },
        { stat: "cooldownMs", operation: "set", value: 1580 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 30 },
        { stat: "cooldownMs", operation: "set", value: 1510 },
        { stat: "projectileCount", operation: "set", value: 9 },
        { stat: "areaRadius", operation: "set", value: 95 },
        { stat: "pierce", operation: "set", value: 10 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 35 },
        { stat: "cooldownMs", operation: "set", value: 1430 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 40 },
        { stat: "cooldownMs", operation: "set", value: 1350 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 45 },
        { stat: "cooldownMs", operation: "set", value: 1280 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 50 },
        { stat: "cooldownMs", operation: "set", value: 1200 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 55 },
        { stat: "cooldownMs", operation: "set", value: 1000 },
        { stat: "projectileCount", operation: "set", value: 16 },
        { stat: "areaRadius", operation: "set", value: 150 },
        { stat: "pierce", operation: "set", value: 15 },
      ],
    },
  ],
  frostChain: [
    {
      level: 2,
      modifiers: [
        { stat: "damage", operation: "set", value: 8 },
        { stat: "cooldownMs", operation: "set", value: 1950 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "set", value: 15 },
        { stat: "cooldownMs", operation: "set", value: 1900 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "damage", operation: "set", value: 22 },
        { stat: "cooldownMs", operation: "set", value: 1875 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "set", value: 26 },
        { stat: "cooldownMs", operation: "set", value: 1825 },
        { stat: "range", operation: "set", value: 100 },
        { stat: "areaRadius", operation: "set", value: 50 },
        { stat: "knockback", operation: "set", value: 30 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "set", value: 30 },
        { stat: "cooldownMs", operation: "set", value: 1750 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "set", value: 34 },
        { stat: "cooldownMs", operation: "set", value: 1700 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "damage", operation: "set", value: 38 },
        { stat: "cooldownMs", operation: "set", value: 1650 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "damage", operation: "set", value: 45 },
        { stat: "cooldownMs", operation: "set", value: 1625 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "damage", operation: "set", value: 56 },
        { stat: "cooldownMs", operation: "set", value: 1550 },
        { stat: "range", operation: "set", value: 120 },
        { stat: "areaRadius", operation: "set", value: 65 },
        { stat: "knockback", operation: "set", value: 35 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "damage", operation: "set", value: 76 },
        { stat: "cooldownMs", operation: "set", value: 1475 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "damage", operation: "set", value: 98 },
        { stat: "cooldownMs", operation: "set", value: 1400 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "damage", operation: "set", value: 116 },
        { stat: "cooldownMs", operation: "set", value: 1275 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "damage", operation: "set", value: 152 },
        { stat: "cooldownMs", operation: "set", value: 1150 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "damage", operation: "set", value: 198 },
        { stat: "cooldownMs", operation: "set", value: 1050 },
        { stat: "range", operation: "set", value: 150 },
        { stat: "areaRadius", operation: "set", value: 75 },
        { stat: "knockback", operation: "set", value: 40 },
      ],
    },
  ],
  crimsonVial: [
    {
      level: 2,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 1200 },
        { stat: "dotDamage", operation: "set", value: 3 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 1100 },
        { stat: "dotDamage", operation: "set", value: 4 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 1050 },
        { stat: "dotDamage", operation: "set", value: 6 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 1000 },
        { stat: "projectileCount", operation: "set", value: 4 },
        { stat: "dotDamage", operation: "set", value: 9 },
        { stat: "dotTickMs", operation: "set", value: 750 },
        { stat: "statusDurationMs", operation: "set", value: 2500 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 950 },
        { stat: "dotDamage", operation: "set", value: 12 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 900 },
        { stat: "dotDamage", operation: "set", value: 16 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 850 },
        { stat: "dotDamage", operation: "set", value: 20 },
      ],
    },
    {
      level: 9,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 800 },
        { stat: "dotDamage", operation: "set", value: 25 },
      ],
    },
    {
      level: 10,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 750 },
        { stat: "projectileCount", operation: "set", value: 6 },
        { stat: "dotDamage", operation: "set", value: 25 },
        { stat: "dotTickMs", operation: "set", value: 600 },
        { stat: "statusDurationMs", operation: "set", value: 3600 },
      ],
    },
    {
      level: 11,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 700 },
        { stat: "dotDamage", operation: "set", value: 30 },
      ],
    },
    {
      level: 12,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 650 },
        { stat: "dotDamage", operation: "set", value: 35 },
      ],
    },
    {
      level: 13,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 600 },
        { stat: "dotDamage", operation: "set", value: 40 },
      ],
    },
    {
      level: 14,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 550 },
        { stat: "dotDamage", operation: "set", value: 45 },
      ],
    },
    {
      level: 15,
      modifiers: [
        { stat: "cooldownMs", operation: "set", value: 500 },
        { stat: "projectileCount", operation: "set", value: 10 },
        { stat: "dotDamage", operation: "set", value: 60 },
        { stat: "dotTickMs", operation: "set", value: 500 },
        { stat: "statusDurationMs", operation: "set", value: 5500 },
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
