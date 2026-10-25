import type Phaser from "phaser";

export type ObstacleName =
  | "rock"
  | "water"
  | "empty"
  | "tree"
  | "forest_deco1"
  | "forest_deco2"
  | "forest_deco3"
  | "swamp_deco1"
  | "swamp_deco2"
  | "swamp_deco3"
  | "castle_deco1"
  | "castle_deco2"
  | "castle_deco3"
  | "underworld_deco1"
  | "underworld_deco2"
  | "underworld_deco3"
  | "cloud1"
  | "cloud2"
  | "cloud3"
  | "cloud4"
  | "tree_stump"
  | "scarecrow"
  | "imp"
  | "cultist"
  | "red_stone";

export type Obstacle = {
  name: ObstacleName;
  x: number;
  y: number;
  width?: number;
  height?: number;
  originX?: number;
  originY?: number;
};

export type WeaponId =
  | "frozenSkull"
  | "bloodScythe"
  | "darknessBook"
  | "poisonVial"
  | "bloodKnife"
  | "frostFlower"
  | "mossGround"
  | "banishedJackOLantern"
  | "flyStorm"
  | "cursedCoffin"
  | "frostChain"
  | "crimsonVial";

export type WeaponLevel =
  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

// Weapon categories drive the Special Power: the category composition of
// the equipped loadout decides which power (and at what duration) is ready.
export type WeaponCategoryId = "plague" | "frost" | "curse" | "bloodyHarvest";

export type SpecialPowerKind = "pure" | "hybrid" | "partial" | "none";

export type SpecialPower = {
  kind: SpecialPowerKind;
  categories: WeaponCategoryId[];
  durationMultiplier: number;
  // Longest active window among the categories.
  activeMs: number;
  // Active window of each category power.
  activeMsByCategory: Partial<Record<WeaponCategoryId, number>>;
};

// Passive perks. The former health/speed/damage
// PlayerStatId track has been removed entirely; perks are the
// in-run, slot-limited picks players collect through the level-up pool.
export type PerkId =
  | "moveSpeed"
  | "attackSpeed"
  | "criticalChance"
  | "projectileSpeed"
  | "xpGain"
  | "luck"
  | "pickupRadius"
  | "cooldownReduction"
  | "healing"
  | "maxHealth";

export type PerkLevel =
  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export type PerkLevels = Record<PerkId, PerkLevel>;

export type PerkConfig = {
  id: PerkId;
  name: string;
  description: string;
  maxLevel: PerkLevel;
  weight: number;
  valuesPerLevel: number[];
};

export type LevelUpOption =
  | {
      kind: "newWeapon";
      weaponId: WeaponId;
      toLevel: WeaponLevel;
      bonusLevels?: 2 | 3;
    }
  | {
      kind: "upgradeWeapon";
      weaponId: WeaponId;
      toLevel: WeaponLevel;
      bonusLevels?: 2 | 3;
    }
  | {
      kind: "newPerk";
      perkId: PerkId;
      toLevel: PerkLevel;
      bonusLevels?: 2 | 3;
    }
  | {
      kind: "upgradePerk";
      perkId: PerkId;
      toLevel: PerkLevel;
      bonusLevels?: 2 | 3;
    };

export type LevelUpChoice = {
  type: "levelUp";
  id: string;
  level: number;
  options: LevelUpOption[];
  source: "levelUp" | "chest";
};

export type ChestRarity = "rare" | "epic" | "legendary";

export type DamageType =
  "physical" | "water" | "explosion" | "light" | "dot" | "summon";

export type TargetingMode =
  "nearest" | "random" | "movementVector" | "chainNext" | "inCone" | "inRadius";

export type WeaponBehavior =
  | "orbital"
  | "slash"
  | "linearProjectile"
  | "explodingProjectile"
  | "chainProjectile"
  | "orbitalShooter"
  | "snareArea"
  | "rollingProjectile"
  | "homingSummon"
  | "coffinBurst"
  | "chainAnchor"
  | "bloodTether";

export type WeaponStatKey = keyof WeaponRuntimeStats;

export type UpgradeOperation = "add" | "multiply" | "set";

export type WeaponRuntimeStats = {
  damage: number;
  cooldownMs: number;
  projectileSpeed: number;
  projectileCount: number;
  spreadDegrees: number;
  areaRadius: number;
  orbitRadius: number;
  orbitalCount: number;
  durationMs: number;
  size: number;
  pierce: number;
  bounceCount: number;
  chainRadius: number;
  arcDegrees: number;
  range: number;
  dotDamage: number;
  dotTickMs: number;
  statusDurationMs: number;
  homingSpeed: number;
  hitCooldownMs: number;
  angularSpeed: number;
  knockback: number;
};

export type WeaponConfig = {
  id: WeaponId;
  texture: string;
  behavior: WeaponBehavior;
  damageType: DamageType;
  targeting: TargetingMode;
  baseStats: WeaponRuntimeStats;
  projectile?: ProjectileConfig;
  statusEffects?: StatusEffectConfig[];
};

export type WeaponUpgrade = {
  level: WeaponLevel;
  modifiers: {
    stat: WeaponStatKey;
    operation: UpgradeOperation;
    value: number;
  }[];
};

export type ProjectileBehavior =
  "linear" | "exploding" | "bouncing" | "light" | "rolling";

export type ProjectileConfig = {
  texture: string;
  behavior: ProjectileBehavior;
  bodySize: number;
  bodySizeMode?: "fixed" | "spriteBounds";
  bodySizeScale?: { width: number; height: number };
  rotateToVelocity?: boolean;
  rotationOffsetDegrees?: number;
  scale?: number;
  orientedHitbox?: boolean;
  ricochetTexture?: string;
};

export type StatusEffectId =
  "oilDot" | "plaguePoison" | "frostSlow" | "curseWeakness" | "bleed";

export type StatusEffectConfig = {
  id: StatusEffectId;
  durationMs: number;
  tickMs?: number;
  damagePerTick?: number;
  speedMultiplier?: number;
  damageMultiplier?: number;
  refreshMode: "refresh" | "stack";
  // Weapon credited for damage-over-time ticks (defaults to "mossGround").
  sourceWeaponId?: WeaponId;
};

export type EnemyLike = Phaser.GameObjects.GameObject & {
  x: number;
  y: number;
  active: boolean;
  body?: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
  hp?: number;
  maxHp?: number;
  isDead?: boolean;
  statusEffects?: Partial<Record<StatusEffectId, number>>;
  takeDamage?: (damage: number, payload: DamagePayload) => void;
  onDeath?: () => void;
  onCriticalHit?: () => void;
  setMovementMultiplier?: (multiplier: number) => void;
  setDamageMultiplier?: (multiplier: number) => void;
  applyKnockback?: (dx: number, dy: number, distance: number) => void;
};

export type DamagePayload = {
  damage: number;
  sourceWeaponId: WeaponId;
  amount: number;
  damageType: DamageType;
  knockback?: number;
  knockbackOrigin?: { x: number; y: number };
  statusEffects?: StatusEffectConfig[];
};

export type WeaponLoadoutItem = {
  id: WeaponId;
  level: WeaponLevel;
};

export type CombatConfig = {
  projectilePoolSize: number;
  hitboxPoolSize: number;
  orbitalPoolSize: number;
  beePoolSize: number;
  targetScanMs: number;
  maxWeaponRange: number;
  defaultEnemyScore: number;
  defaultWeaponLoadout: WeaponLoadoutItem[];
};

export type DropItemHalloweenType =
  | "relicWrath"
  | "relicSloth"
  | "relicPride"
  | "relicLust"
  | "relicGreed"
  | "relicGluttony"
  | "relicEnvy";

export type WeaponType =
  "chasing" | "orbiting" | "summoning" | "staticRange" | "slash" | "arena";
export type CodexCategoryName = "Skills" | "Enemies" | "DropItems";
export type PassiveAbilityType = "wings";
export type EnemyType =
  | StaticRangeEnemyTypes
  | PhasingEnemyTypes
  | MeleeEnemyTypes
  | BossTypes
  | MiniBossType;
export type WeaponEnemyType = BossTypes | MiniBossType | StaticRangeEnemyTypes;
export type EnemyFormation =
  "vertical line" | "horizontal line" | "circle" | "surround";
export type AreaEnemyType =
  | PhasingEnemyTypes
  | MeleeEnemyTypes
  | StaticRangeEnemyTypes
  | MiniBossType
  | BossTypes;

export type SpawnArea = 1 | 2 | 3 | 4;

export type PhasingEnemyTypes =
  // Area 1
  | "bat"
  // Area 2
  | "crow"
  | "ghost"
  // Area 3
  | "gargoyle"
  // Area 4
  | "shade";

export type StaticRangeEnemyTypes =
  // Area 1
  | "scarecrow"
  // Area 2
  | "imp"
  // Area 3
  | "cultist"
  /// Area 4
  | "red_stone";

export type MeleeEnemyTypes =
  // Area 1
  | "carnivore_plant"
  | "rat"
  | "zombie"
  // Area 2
  | "skeleton"
  | "slime_green"
  | "slime_blue"
  | "slime_red"
  // Area 3
  | "vampire"
  | "frankenstein"
  | "werewolf"
  // Area 4
  | "hellHound"
  | "demon1"
  | "demon2";

export type MiniBossType =
  // Area 1
  | "golem"
  | "ent"
  // Area 2
  | "mummy"
  | "living_armor"
  // Area 3
  | "headless_horseman"
  | "medusa"
  // Area 4 - spawn the mini bosses from area 1 to 3
  | "golem_area4"
  | "ent_area4"
  | "mummy_area4"
  | "living_armor_area4"
  | "headless_horseman_area4"
  | "medusa_area4";

export type BossTypes =
  // Area 1
  | "minotaur"
  // Area 2
  | "witch"
  // Area 3
  | "cerberus"
  // Area 4
  | "sorcerer"
  | "dungeonboss";

export type EnemyConfig = {
  key: string;
  attackKey?: string;
  deathKey?: string;
  scale: number;
  bodyWidth: number;
  bodyHeight: number;
  offsetX: number;
  offsetY: number;
  frameStart: number;
  frameEnd: number;
  frameRate: number;
  depth: number;
  speed: number;
  hp: number;
  maxHp: number;
  dropItem: DropItemHalloweenType;
};

export type PhasingeWaveConfig = WaveConfig<PhasingEnemyTypes>;
export type MeleeWaveConfig = WaveConfig<MeleeEnemyTypes>;

export type WaveConfig<TMobTypes> = {
  mobType: TMobTypes;
  totalEnemy: number;
  batchSize: number;
  delay: number;
  formation: EnemyFormation;
  flag: string;
  area: number;
};

export type MiniBossWaveConfig = {
  miniBossType: MiniBossType;
  totalEnemy: number;
  weaponType: WeaponType[];
  formation: EnemyFormation;
  flag: string;
  area: number;
};

export type BossWaveConfig = {
  bossType: BossTypes;
  totalEnemy: number;
  weaponType: WeaponType[];
  formation: EnemyFormation;
  spawnPosition?: { x: number; y: number };
  flag: string;
};

export type WeaponStats = {
  chasing?: {
    TEXTURE: string[];
    SPEED: number;
    NEXT_CHASE: number;
    DURATION_MS: number;
  };
  orbiting?: {
    TEXTURE: string;
    RADIUS: number;
    SPEED_DEG_PER_SEC: number;
  };
  summoning?: {
    TEXTURE: string;
    WARNING: string;
    DELAY_MS: number;
    WARNING_DURATION_MS: number;
    DURATION_MS: number;
  };
  staticRange?: {
    TEXTURE: string;
    FRAME_END: number;
    RANGE: number;
    SPEED: number;
    COOLDOWN_MS: number;
    DURATION_MS: number;
  };
  slash?: {
    TEXTURE: string;
    RANGE: number;
    ARC_DEGREES: number;
    COOLDOWN_MS: number;
    DURATION_MS: number;
  };
  arena?: {
    RADIUS: number;
  };
};

export interface EnemyBalanceStats {
  HP: number;
  SPEED: number;
  DAMAGE: number;
  TOTAL?: number;
  BATCH_SIZE?: number;
  DELAY?: number;
  FORMATION?: EnemyFormation;
  DROP_ITEM: DropItemHalloweenType;
  WEAPON?: WeaponType[];

  WEAPONS?: {
    orbiting?: {
      RADIUS?: number;
      SPEED_DEG_PER_SEC?: number;
    };
    summoning?: {
      DELAY_MS?: number;
      WARNING_DURATION_MS?: number;
      DURATION_MS?: number;
    };
    chasing?: {
      NEXT_CHASE?: number;
      SPEED?: number;
      DURATION_MS?: number;
    };
    staticRange?: {
      FRAME_END?: number;
      RANGE?: number;
      SPEED?: number;
      COOLDOWN_MS?: number;
      DURATION_MS?: number;
    };
    slash?: {
      RANGE?: number;
      ARC_DEGREES?: number;
      COOLDOWN_MS?: number;
      DURATION_MS?: number;
    };
    arena?: {
      RADIUS?: number;
    };
  };
}
