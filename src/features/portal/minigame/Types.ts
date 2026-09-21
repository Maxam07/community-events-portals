import type Phaser from "phaser";

export type ObstacleName =
  | "rock"
  | "water"
  | "tree"
  | "cloud"
  | "cloud1"
  | "tree_stump"
  | "deco_1"
  | "deco_2"
  | "deco_3"
  | "deco_4";

export type Obstacle = { name: ObstacleName; x: number; y: number };

export type WeaponId =
  | "banana"
  | "broomScythe"
  | "wateringCan"
  | "corn"
  | "tomato"
  | "sunflower"
  | "oil"
  | "pumpkin"
  | "beehive";

export type WeaponLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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

export type PerkLevel = 0 | 1 | 2 | 3 | 4 | 5;

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
  level: number;
  options: LevelUpOption[];
  source: "levelUp" | "chest";
};

export type ChestRarity = "rare" | "epic" | "legendary";

export type DamageType =
  | "physical"
  | "water"
  | "explosion"
  | "light"
  | "dot"
  | "summon";

export type TargetingMode =
  | "nearest"
  | "random"
  | "movementVector"
  | "playerForward"
  | "chainNext"
  | "inCone"
  | "inRadius";

export type WeaponBehavior =
  | "orbital"
  | "slash"
  | "linearProjectile"
  | "explodingProjectile"
  | "chainProjectile"
  | "orbitalShooter"
  | "snareArea"
  | "rollingProjectile"
  | "homingSummon";

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
  | "linear"
  | "exploding"
  | "bouncing"
  | "light"
  | "rolling";

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

export type StatusEffectId = "rooted" | "oilDot";

export type StatusEffectConfig = {
  id: StatusEffectId;
  durationMs: number;
  tickMs?: number;
  damagePerTick?: number;
  speedMultiplier?: number;
  refreshMode: "refresh" | "stack";
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
};

export type DamagePayload = {
  sourceWeaponId: WeaponId;
  amount: number;
  damageType: DamageType;
  knockback?: number;
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
  defaultEnemyScore: number;
  defaultWeaponLoadout: WeaponLoadoutItem[];
};

export type DropItemType =
  | "blueOrb"
  | "greenOrb"
  | "grayOrb"
  | "yellowOrb"
  | "purpleOrb";

export type MiniBossWeaponType = "chasing" | "orbiting" | "summoning";
export type MiniBossType = "miniBoss1" | "miniBoss2" | "miniBoss3";
export type BossTypes = "boss1" | "boss2" | "boss3";
export type PhasingEnemyTypes = "mob1" | "mob2" | "mob3" | "mob4" | "mob5";
export type CodexCategoryName = "Skills" | "Enemies" | "DropItems";
export type PassiveAbilityType = "wings";
export type EnemyType =
  | PhasingEnemyTypes
  | MeleeEnemyTypes
  | BossTypes
  | MiniBossType;
export type WeaponEnemyType = BossTypes | MiniBossType;
export type EnemyFormation =
  | "vertical line"
  | "horizontal line"
  | "circle"
  | "surround";
export type PhasingEnemyType =
  // Area 1
  | "bat"
  // Area 2
  | "crow"
  | "ghost"
  // Area 3
  | "gargoyle"
  // Area 4
  | "shade";
export type MeleeEnemyTypes =
  // Area 1
  | "carnivore_plant"
  | "rat"
  | "zombie"
  // Area 2
  | "imp"
  | "slime"
  // Area 3
  | "vampire"
  | "frankenstein"
  | "werewolf"
  // Area 4
  | "hellHound"
  | "demon";
export type RangeEnemyTypes =
  // Area 1
  | "scarecrow"
  // Area 2
  | "skeleton"
  // Area 3
  | "cultist";

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
  dropItem: DropItemType;
};

export type MiniBossConfig = {
  key: string;
  attackKey: string;
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
  dropItem: DropItemType;
};

export type MobWaveConfig = {
  triggerAt: number;
  mobType: PhasingEnemyTypes;
  totalEnemy: number;
  batchSize: number;
  delay: number;
  formation: EnemyFormation;
  flag: string;
};

export type MeleeWaveConfig = {
  triggerAt: number;
  mobType: MeleeEnemyTypes;
  totalEnemy: number;
  batchSize: number;
  delay: number;
  formation: EnemyFormation;
  flag: string;
};

export type MiniBossWaveConfig = {
  triggerAt: number;
  miniBossType: MiniBossType;
  totalEnemy: number;
  weaponType: MiniBossWeaponType[];
  flag: string;
};

export type BossWaveConfig = {
  triggerAt: number;
  bossType: BossTypes;
  totalEnemy: number;
  flag: string;
};

export type WeaponStats = {
  chasing?: {
    TEXTURE: string;
    SPEED: number;
    DURATION_MS: number;
  };

  orbiting?: {
    TEXTURE: string;
    RADIUS: number;
    SPEED_DEG_PER_SEC: number;
  };

  summoning?: {
    TEXTURE: string;
    DELAY_MS: number;
    WARNING_DURATION_MS: number;
    DURATION_MS: number;
  };
};
