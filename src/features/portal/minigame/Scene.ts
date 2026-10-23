import mapJson from "assets/map/halloween_2026.json";
import tilesetConfig from "assets/map/halloween_2026_tileset.json";
import type { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "./Core/BaseScene";
import type { MachineInterpreter } from "./lib/Machine";
import type { EventObject } from "xstate";
import { isTouchDevice } from "features/world/lib/device";
import {
  BLOCKADE_GUIDE_MIN_TILES,
  HOLE_INTERACT_TILES,
  PLAYER_WATER_SPEED_MULTIPLIER,
  PORTAL_NAME,
  WALKING_SPEED,
  getPerkAmount,
  rollForRareChest,
  CHEST_VISUALS,
  STATIC_RANGE_POS,
} from "./constants";
import { EventBus } from "./lib/EventBus";
import { SUNNYSIDE } from "assets/sunnyside";
import type { BoundingBox } from "./lib/collisionDetection";
import { addStaticObstacle } from "./containers/ObstaclesContainer";
import { WeaponManager } from "./lib/combat/WeaponManager";
import type { BumpkinContainer } from "./Core/BumpkinContainer";
import { OBSTACLES_LAYOUT, resolveSpecialPower } from "./constants";
import { PhasingEnemy } from "./containers/PhasingEnemyContainer";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { translate } from "lib/i18n/translate";
import { DropItem } from "./containers/DropItemsContainer";
import { Chest } from "./containers/ChestContainer";
import type {
  WeaponId,
  WeaponLoadoutItem,
  BossTypes,
  PhasingEnemyTypes,
  WeaponLevel,
  EnemyFormation,
  MiniBossType,
  WeaponType,
  ChestRarity,
  MeleeEnemyTypes,
  StaticRangeEnemyTypes,
  EnemyType,
  SpawnArea,
  MiniBossWaveConfig,
  DropItemHalloweenType,
} from "./Types";
import { BossEnemy } from "./containers/BossEnemyContainer";
import {
  BOSS_WAVE_THRESHOLDS,
  MELEE_WAVE_THRESHOLDS,
  MINIBOSS_WAVE_THRESHOLDS,
  PHASING_WAVE_THRESHOLDS,
} from "./containers/BalanceEnemy/WaveConfig";
import { getFormationPositions } from "./containers/EnemyFormations";
import { MiniBoss } from "./containers/MiniBossContainer";
import { createEnemyWeapon } from "./containers/enemyWeapons/WeaponsProjectile";
import type { EnemyWeapon } from "./containers/enemyWeapons/EnemyWeapons";
import { MeleeEnemy } from "./containers/MeleeEnemyContainer";
import { StaticRangeEnemy } from "./containers/StaticRangeEnemyContainer";
import {
  ENEMY_SPAWN_AREAS,
  ENEMY_AREAS,
} from "./containers/BalanceEnemy/SpawnAreaLimit";

// export const NPCS: NPCBumpkin[] = [
//   {
//     x: 380,
//     y: 400,
//     // View NPCModals.tsx for implementation of pop up modal
//     npc: "portaller",
//   },
// ];
export class Scene extends BaseScene {
  private static readonly DISABLE_COLLIDERS = false;
  private static readonly WEAPON_FROZEN_SKULL_ANIMATION_KEY =
    "weapon_frozen_skull_active";
  private static readonly WEAPON_FROST_CHAIN_ANIMATION_KEY =
    "weapon_frost_chain_active";
  private static readonly FROST_HIT_EFFECT_ANIMATION_KEY =
    "frost_hit_effect_active";
  private static readonly POWER_FROST_GROUND_ANIMATION_KEY =
    "power_frost_ground_active";
  private static readonly WEAPON_SCYTHE_ANIMATION_KEY =
    "weapon_blood_scythe_active";
  private static readonly WEAPON_DARKNESS_BOOK_PROJECTILE_ANIMATION_KEY =
    "weapon_darkness_book_projectile_active";
  private static readonly WEAPON_POISON_VIAL_PROJECTILE_ANIMATION_KEY =
    "weapon_poison_vial_projectile_active";
  private static readonly WEAPON_POISON_VIAL_EXPLOSION_ANIMATION_KEY =
    "weapon_poison_vial_explosion_active";
  private static readonly WEAPON_BLOOD_KNIFE_ANIMATION_KEY =
    "weapon_blood_knife_active";
  private static readonly WEAPON_FROST_FLOWER_ANIMATION_KEY =
    "weapon_frost_flower_active";
  private static readonly WEAPON_MOSS_GROUND_ANIMATION_KEY =
    "weapon_moss_ground_active";
  private static readonly WEAPON_HORIZONTAL_JACK_O_LANTERN_ANIMATION_KEY =
    "weapon_banished_jack_o_lantern_horizontal_active";
  private static readonly WEAPON_VERTICAL_JACK_O_LANTERN_ANIMATION_KEY =
    "weapon_banished_jack_o_lantern_vertical_active";
  private static readonly WEAPON_DIAGONAL_JACK_O_LANTERN_ANIMATION_KEY =
    "weapon_banished_jack_o_lantern_diagonal_active";
  private static readonly WEAPON_DIAGONAL_JACK_O_LANTERN_REVERSE_ANIMATION_KEY =
    "weapon_banished_jack_o_lantern_diagonal_active_reverse";
  private static readonly WEAPON_FLY_STORM_ANIMATION_KEY =
    "weapon_fly_storm_active";
  private static readonly WEAPON_FLY_STORM_SPAWN_ANIMATION_KEY =
    "weapon_fly_storm_spawn_active";
  private static createEnemyKillsByArea(): Record<SpawnArea, number> {
    return { 1: 0, 2: 0, 3: 0, 4: 0 };
  }
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private obstacles: BoundingBox[] = [];
  private obstacleGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private weaponManager?: WeaponManager;
  // Active Special Power categories already pushed to WeaponManager.
  private appliedSpecialPowerKey = "";
  private seaBeastDefeated = false;
  private healingElapsedMs = 0;
  private static readonly HEALING_TICK_MS = 1000;
  private static readonly BLOCKADE_ARROW_OFFSET_Y = 15;
  private static readonly BLOCKADE_ARROW_FLOAT_PX = 3;
  private static readonly BLOCKADE_ARROW_FLOAT_MS = 600;
  private waveState = new Map<string, boolean>();
  waterGroup!: Phaser.Physics.Arcade.StaticGroup;
  staticRangeEnemies: StaticRangeEnemy[] = [];
  staticRangeGroup!: Phaser.Physics.Arcade.Group;
  phasingEnemies: PhasingEnemy[] = [];
  phasingGroup!: Phaser.Physics.Arcade.Group;
  meleeEnemies: MeleeEnemy[] = [];
  meleeGroup!: Phaser.Physics.Arcade.Group;
  bossEnemies: BossEnemy[] = [];
  bossGroup!: Phaser.Physics.Arcade.Group;
  miniBosses: MiniBoss[] = [];
  miniBossGroup!: Phaser.Physics.Arcade.Group;
  weaponGroup!: Phaser.Physics.Arcade.Group;
  enemyWeapons: EnemyWeapon[] = [];
  smokeExplosion?: Phaser.GameObjects.Sprite;
  area1Blockade?: Phaser.GameObjects.Image;
  area2Blockade?: Phaser.GameObjects.Image;
  area3Blockade?: Phaser.GameObjects.Image;
  cloud1Blockade?: Phaser.GameObjects.Image;
  cloud2Blockade?: Phaser.GameObjects.Image;
  private unlockedBlockades: Phaser.GameObjects.Image[] = [];
  private blockadeArrowFloat?: Phaser.Tweens.Tween;
  private finalHole?: Phaser.GameObjects.Sprite;
  private isHoleEntered = false;
  private isEnteringUnderworld = false;
  defeatedMiniBosses = new Set<MiniBossType>();
  defeatedBosses = new Set<BossTypes>();
  enteredAreas = new Set<number>();
  private currentWorld: "overworld" | "underworld" = "overworld";
  enemyKillsByArea = Scene.createEnemyKillsByArea();
  sceneId: SceneId = PORTAL_NAME;

  constructor() {
    super({
      name: PORTAL_NAME,
      map: {
        json: mapJson,
        imageKey: "halloween_2026_tileset",
        defaultTilesetConfig: tilesetConfig,
        tilesetMargin: 0,
        tilesetSpacing: 0,
      },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }

  private get isGameReady() {
    return this.portalService?.state.matches("ready") === true;
  }

  private get isGamePlaying() {
    return this.portalService?.state.matches("playing") === true;
  }

  private get isGameplayPaused() {
    return this.portalService?.state.context.isGameplayPaused === true;
  }

  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter;
  }

  preload() {
    super.preload();

    // Minigame assets
    // Phasing mobs
    this.load.spritesheet("bat1", "world/portal/halloween/bat1_phasing.webp", {
      frameWidth: 34,
      frameHeight: 32,
    });
    this.load.spritesheet("crow", "world/portal/halloween/enemy-crow.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("ghost", "world/portal/halloween/ghost.webp", {
      frameWidth: 37,
      frameHeight: 40,
    });
    this.load.spritesheet("gargoyle", "world/portal/halloween/gargoyle.webp", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("shade", "world/portal/halloween/shade-Sheet.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Static range mobs
    this.load.spritesheet(
      "scarecrow",
      "world/portal/halloween/scarecrow.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "scarecrow_attack",
      "world/portal/halloween/scarecrow_attack.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet("imp", "world/portal/halloween/imp.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "imp_attack",
      "world/portal/halloween/imp_attack.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "cultist",
      "world/portal/halloween/cultist_idle_Sheet.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "cultist_attack",
      "world/portal/halloween/cultist_attack_Sheet.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "red_stone",
      "world/portal/halloween/area4_static.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "red_stone_attack",
      "world/portal/halloween/area4_static_attack.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );

    // Melee mobs
    this.load.spritesheet(
      "carnivore_plant",
      "world/portal/halloween/carnivore_plant-Sheet.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet("rat", "world/portal/halloween/rat.webp", {
      frameWidth: 22,
      frameHeight: 16,
    });
    this.load.spritesheet("zombie", "world/portal/halloween/zombie.webp", {
      frameWidth: 96,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "skeleton",
      "world/portal/halloween/SkeletonNormal-Sheet.webp",
      {
        frameWidth: 14,
        frameHeight: 17,
      },
    );
    this.load.spritesheet(
      "slime_red",
      "world/portal/halloween/slime_red.webp",
      {
        frameWidth: 18,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "slime_green",
      "world/portal/halloween/slime_green.webp",
      {
        frameWidth: 18,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "slime_blue",
      "world/portal/halloween/slime_blue.webp",
      {
        frameWidth: 18,
        frameHeight: 16,
      },
    );
    this.load.spritesheet("vampire", "world/portal/halloween/vampire.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "frankenstein",
      "world/portal/halloween/frankenstein-Sheet.webp",
      {
        frameWidth: 39,
        frameHeight: 50,
      },
    );
    this.load.spritesheet(
      "werewolf",
      "world/portal/halloween/Enemy_Werewolf.webp",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "hellHound",
      "world/portal/halloween/HellHound_melee-Sheet.webp",
      {
        frameWidth: 38,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "hellHound_walk",
      "world/portal/halloween/HellHound_walk-Sheet.webp",
      {
        frameWidth: 38,
        frameHeight: 32,
      },
    );
    this.load.spritesheet("demon1", "world/portal/halloween/meleeDemon1.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("demon2", "world/portal/halloween/meleeDemon2.webp", {
      frameWidth: 66,
      frameHeight: 48,
    });

    // MiniBoss
    this.load.spritesheet(
      "golem_walk",
      "world/portal/halloween/dungeonGolem-walking.webp",
      {
        frameWidth: 64,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "ent",
      "world/portal/halloween/ent_miniBoss-Sheet.webp",
      {
        frameWidth: 48,
        frameHeight: 49,
      },
    );
    this.load.spritesheet(
      "mummy_walk",
      "world/portal/halloween/dungeonMummy-walk.webp",
      {
        frameWidth: 64,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "living_armor",
      "world/portal/halloween/Living-armor.webp",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "headless_horseman",
      "world/portal/halloween/HeadlessHorseman.webp",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "medusa",
      "world/portal/halloween/medusa-Sheet.webp",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );

    // Boss enemy
    this.load.spritesheet(
      "minotaur",
      "world/portal/halloween/minotaur-Sheet.webp",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet("witch", "world/portal/halloween/boss_witch.webp", {
      frameWidth: 32,
      frameHeight: 36,
    });
    this.load.spritesheet(
      "cerberus",
      "world/portal/halloween/cerberus-walk.webp",
      {
        frameWidth: 80,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "cerberus-attack-top",
      "world/portal/halloween/cerberus-attack-top.webp",
      {
        frameWidth: 80,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "sorcerer",
      "world/portal/halloween/sorcerer-walking.webp",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "sorcerer_death",
      "world/portal/halloween/sorcerer-death.webp",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "dungeonboss_walk",
      "world/portal/halloween/dungeonboss-walk.webp",
      {
        frameWidth: 160,
        frameHeight: 160,
      },
    );
    this.load.spritesheet(
      "dungeonboss_death",
      "world/portal/halloween/dungeonboss-defeat.webp",
      {
        frameWidth: 160,
        frameHeight: 160,
      },
    );

    // Enemy weapon
    this.load.spritesheet("Fire", "world/portal/halloween/fire.webp", {
      frameWidth: 10,
      frameHeight: 15,
    });
    this.load.spritesheet(
      "cultist_fireBall",
      "world/portal/halloween/fireball-Sheet.webp",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "imp_fireball",
      "world/portal/halloween/imp_fireball.webp",
      {
        frameWidth: 13,
        frameHeight: 10,
      },
    );
    this.load.spritesheet(
      "red_stone_fireball",
      "world/portal/halloween/area4_static_fireball.webp",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "minotaur-hammer",
      "world/portal/halloween/minotaur-hammer.webp",
      {
        frameWidth: 46,
        frameHeight: 34,
      },
    );
    this.load.spritesheet(
      "headless-magmaPuddle",
      "world/portal/halloween/MagmaPuddle.webp",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "ent_tree",
      "world/portal/halloween/spring_shake_sheet.webp",
      {
        frameWidth: 45,
        frameHeight: 41,
      },
    );
    this.load.spritesheet(
      "fang-the-curse",
      "world/portal/halloween/fang-the-curse.webp",
      {
        frameWidth: 48,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "fang-the-frost",
      "world/portal/halloween/fang-the-frost.png",
      {
        frameWidth: 48,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "fang-the-plague",
      "world/portal/halloween/fang-the-plague.webp",
      {
        frameWidth: 48,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "eyeball",
      "world/portal/halloween/eyeball_noShadow.webp",
      {
        frameWidth: 16,
        frameHeight: 21,
      },
    );
    this.load.spritesheet(
      "eyeball_single",
      "world/portal/halloween/eyeball_single.webp",
      {
        frameWidth: 16,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "sorcerer_clone",
      "world/portal/halloween/sorcerer-Sheet.webp",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "scarecrow_pumpkin",
      "world/portal/halloween/scarecrow_pumpkin.webp",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "armor_weapon",
      "world/portal/halloween/livingArmor-Weapon.webp",
      {
        frameWidth: 11,
        frameHeight: 15,
      },
    );
    this.load.spritesheet(
      "sand_vortex",
      "world/portal/halloween/sand_vortex-Sheet.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.image("medusa_head", "world/portal/halloween/medusa_head.webp");
    this.load.image("ent_stump", "world/portal/halloween/stump.webp");
    this.load.image("golem_stone", "world/portal/halloween/stone.png");
    this.load.image("shadow_warning", "world/portal/halloween/shadow1.webp");

    // Chests
    this.load.spritesheet("chest_rare", "world/portal/images/rare_chest.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("chest_epic", "world/portal/images/epic_chest.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "chest_legendary",
      "world/portal/images/legendary_chest.png",
      { frameWidth: 32, frameHeight: 32 },
    );

    // Drop items
    this.load.image("blueOrb", "world/portal/images/dropItem1.webp");
    this.load.image("greenOrb", "world/portal/images/dropItem2.webp");
    this.load.image("grayOrb", "world/portal/images/dropItem3.webp");
    this.load.image("yellowOrb", "world/portal/images/dropItem4.webp");
    this.load.image("purpleOrb", "world/portal/images/dropItem5.webp");
    this.load.image("boss_dropItem1", SUNNYSIDE.icons.lightning);
    this.load.image("boss_dropItem2", SUNNYSIDE.icons.happy);
    this.load.image("heart", SUNNYSIDE.icons.heart);
    this.load.image("relicWrath", "world/portal/halloween/relics_wrath.webp");
    this.load.image("relicSloth", "world/portal/halloween/relics_sloth.webp");
    this.load.image("relicPride", "world/portal/halloween/relics_pride.webp");
    this.load.image("relicLust", "world/portal/halloween/relics_lust.webp");
    this.load.image("relicGreed", "world/portal/halloween/relics_greed.webp");
    this.load.image(
      "relicGluttony",
      "world/portal/halloween/relics_gluttony.webp",
    );
    this.load.image("relicEnvy", "world/portal/halloween/relics_envy.webp");

    // Obstacles
    this.load.image("rock", "world/portal/images/TematicRock.webp");
    this.load.image("tree", "world/portal/images/TematicTree.webp");
    this.load.image("tree_stump", SUNNYSIDE.decorations.spookyTree);
    this.load.spritesheet(
      "smoke_explosion",
      "world/portal/halloween/smoke_explosion_large.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );
    this.load.image("bridge", "world/portal/halloween/bridge.png");
    this.load.image("castle_door", "world/portal/halloween/castle_door.png");
    this.load.image("castle_wall", "world/portal/halloween/castle_wall.png");
    this.load.image("portal", "world/portal/halloween/portal.png");
    this.load.image("blockade_arrow", SUNNYSIDE.icons.arrow_up);
    this.load.spritesheet("hole", "world/portal/halloween/hole.png", {
      frameWidth: 72,
      frameHeight: 48,
    });
    this.load.image("blockade1", "world/goblin_exchange.png");
    this.load.image(
      "forest_deco1",
      "world/portal/halloween/forest_decor1.webp",
    );
    this.load.image(
      "forest_deco2",
      "world/portal/halloween/forest_decor2.webp",
    );
    this.load.image(
      "forest_deco3",
      "world/portal/halloween/forest_decor3.webp",
    );
    this.load.image("swamp_deco1", "world/portal/halloween/swamp_deco1.webp");
    this.load.image("swamp_deco2", "world/portal/halloween/swamp_deco2.webp");
    this.load.image("swamp_deco3", "world/portal/halloween/swamp_deco3.webp");
    this.load.image("castle_deco1", "world/portal/halloween/castle_deco1.webp");
    this.load.image("castle_deco2", "world/portal/halloween/castle_deco2.webp");
    this.load.image("castle_deco3", "world/portal/halloween/castle_deco3.webp");
    this.load.image(
      "underworld_deco1",
      "world/portal/halloween/underworld_deco1.webp",
    );
    this.load.image(
      "underworld_deco2",
      "world/portal/halloween/underworld_deco2.webp",
    );
    this.load.image(
      "underworld_deco3",
      "world/portal/halloween/underworld_deco3.webp",
    );
    this.load.image("cloud1", "world/portal/halloween/cloud_1.webp");
    this.load.image("cloud2", "world/portal/halloween/cloud_2.webp");
    this.load.image("cloud3", "world/portal/halloween/cloud_3.webp");
    this.load.image("cloud4", "world/portal/halloween/cloud_4.webp");
    this.load.image(
      "cloud_cover",
      "world/portal/halloween/main_clouds_top.webp",
    );

    // Boss icons
    this.load.image("icon_boss_1", "world/portal/images/icon_boss_1.webp");
    this.load.image("icon_boss_2", "world/portal/images/icon_boss_2.webp");
    this.load.image("icon_boss_3", "world/portal/images/icon_boss_3.webp");

    // Weapons
    this.load.spritesheet(
      "weapon_frozen_skull",
      "world/portal/halloween/weapons/the_frost/frozen_skull.png",
      { frameWidth: 21, frameHeight: 23 },
    );
    this.load.spritesheet(
      "weapon_frost_chain",
      "world/portal/halloween/weapons/the_frost/frost_chain.png",
      { frameWidth: 128, frameHeight: 44 },
    );
    this.load.spritesheet(
      "frost_hit_effect",
      "world/portal/halloween/weapons/the_frost/frost_hit_effect.png",
      { frameWidth: 16, frameHeight: 16 },
    );
    this.load.spritesheet(
      "power_frost_ground",
      "world/portal/halloween/categories/the_frost/ground_frost.png",
      { frameWidth: 32, frameHeight: 16 },
    );
    this.load.spritesheet(
      "weapon_blood_scythe",
      "world/portal/halloween/weapons/the_bloody_harvest/blood_scythe.png",
      { frameWidth: 45, frameHeight: 44 },
    );
    this.load.spritesheet(
      "weapon_crimson_vial",
      "world/portal/halloween/weapons/the_bloody_harvest/crimson_vial.png",
      { frameWidth: 139, frameHeight: 24 },
    );
    this.load.spritesheet(
      "bloody_hit_effect",
      "world/portal/halloween/weapons/the_bloody_harvest/bloody_haverst_hit_effect.png",
      { frameWidth: 18, frameHeight: 13 },
    );
    this.load.spritesheet(
      "bleed_effect",
      "world/portal/halloween/categories/the_bloody_harvest/bleed_effect.png",
      { frameWidth: 16, frameHeight: 16 },
    );
    this.load.spritesheet(
      "crimson_vial_effect",
      "world/portal/halloween/weapons/the_bloody_harvest/crimson_vial_effect.png",
      { frameWidth: 16, frameHeight: 32 },
    );
    this.load.spritesheet(
      "poison_effect",
      "world/portal/halloween/categories/the_plague/poison_effect.png",
      { frameWidth: 16, frameHeight: 16 },
    );
    this.load.image(
      "weapon_darkness_book",
      "world/portal/halloween/weapons/the_curse/darkness_book.png",
    );
    this.load.spritesheet(
      "weapon_darkness_book_projectile",
      "world/portal/halloween/weapons/the_curse/darkness_book_projectile.png",
      {
        frameWidth: 20,
        frameHeight: 20,
      },
    );
    this.load.spritesheet(
      "weapon_cursed_coffin",
      "world/portal/halloween/weapons/the_curse/cursed_coffin.png",
      { frameWidth: 32, frameHeight: 32 },
    );
    this.load.image(
      "weapon_cursed_coffin_shard",
      "world/portal/halloween/weapons/the_curse/cursed_coffin_projectile.png",
    );
    this.load.spritesheet(
      "weakness_effect",
      "world/portal/halloween/categories/the_curse/weakness_effect.png",
      { frameWidth: 16, frameHeight: 16 },
    );
    this.load.spritesheet(
      "weapon_poison_vial_projectile",
      "world/portal/halloween/weapons/the_plague/poison_vial_projectile.png",
      {
        frameWidth: 14,
        frameHeight: 38,
      },
    );
    this.load.spritesheet(
      "weapon_poison_vial_explosion",
      "world/portal/halloween/weapons/the_plague/poison_vial_explosion.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_blood_knife",
      "world/portal/halloween/weapons/the_bloody_harvest/blood_knife.png",
      { frameWidth: 21, frameHeight: 24 },
    );
    this.load.spritesheet(
      "weapon_frost_flower",
      "world/portal/halloween/weapons/the_frost/frost_flower.png",
      { frameWidth: 16, frameHeight: 24 },
    );
    this.load.spritesheet(
      "weapon_moss_ground",
      "world/portal/halloween/weapons/the_plague/moss_ground.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "weapon_banished_jack_o_lantern_horizontal",
      "world/portal/halloween/weapons/the_curse/banished_jack_o_lantern_horizontal.png",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_banished_jack_o_lantern_vertical",
      "world/portal/halloween/weapons/the_curse/banished_jack_o_lantern_vertical.png",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_banished_jack_o_lantern_diagonal",
      "world/portal/halloween/weapons/the_curse/banished_jack_o_lantern_diagonal.png",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_fly_storm_spawn",
      "world/portal/halloween/weapons/the_plague/fly_storm_spawn.png",
      {
        frameWidth: 16,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "weapon_fly_storm",
      "world/portal/halloween/weapons/the_plague/fly_storm.png",
      {
        frameWidth: 16,
        frameHeight: 32,
      },
    );
    // this.load.image("weapon_slash", "/world/portal/images/weapons/slash.png");
    // this.load.image(
    //   "weapon_water_drop",
    //   "/world/portal/images/weapons/water_drop.png",
    // );
    // this.load.image("weapon_tomato", "/world/portal/images/weapons/bloodKnife.png");
    // this.load.image("weapon_light", "/world/portal/images/weapons/light.png");
    // this.load.image(
    //   "weapon_banished_jack_o_lantern",
    //   "/world/portal/images/weapons/pumpkin.png",
    // );
    // this.load.image(
    //   "weapon_sunflower",
    //   "/world/portal/images/weapons/sunflower.png",
    // );

    // Biomes
    this.load.image("galaxy_biome", SUNNYSIDE.seasons.winter.galaxyLevel42);
    this.load.image("crystal_biome", SUNNYSIDE.seasons.winter.crystalLevel42);
    this.load.image("spooky_biome", SUNNYSIDE.seasons.winter.spookyLevel42);
    this.load.image("marble_biome", SUNNYSIDE.seasons.spring.marbleLevel42);

    // Music
    // Background
    this.load.audio(
      "backgroundMusic",
      "/world/portal/music/Bumping_Pumpkins.mp3",
    );

    // SFX
    this.load.audio("hurt", "world/portal/sfx/hurt.wav");
    this.load.audio("bossDeath", "world/portal/sfx/bossDeath.wav");
    this.load.audio("collect_xp", "world/portal/sfx/xp.wav");

    // Weapon SFX
    this.load.audio("sfx_banana_swing", "world/portal/sfx/banana.wav");
    this.load.audio("sfx_slash_broom", "world/portal/sfx/broomScythe.wav");
    this.load.audio("sfx_tomato_throw", "world/portal/sfx/tomato.wav");
    this.load.audio("sfx_water_shot", "world/portal/sfx/wateringCan.wav");
    this.load.audio("sfx_explosion_pop", "world/portal/sfx/corn.wav");
    this.load.audio("sfx_light_shot", "world/portal/sfx/sunflower.wav");
    this.load.audio("sfx_oil_cast", "world/portal/sfx/oil.wav");
    this.load.audio("sfx_pumpkin_roll", "world/portal/sfx/pumpkin.wav");
    this.load.audio("sfx_bee_spawn", "world/portal/sfx/beehive.wav");

    // Critical hit
    this.load.audio("critical_hit", "world/portal/sfx/hurt.wav");

    //Chest opening
    this.load.audio("chest_open", "world/portal/sfx/xp.wav");
  }

  async create() {
    this.map = this.make.tilemap({
      key: PORTAL_NAME,
    });
    super.create();

    this.cameras.main.setRoundPixels(true);

    // Reset listeners
    EventBus.removeAllListeners();
    this.createWeaponAnimations();
    this.createChestAnimations();

    // Initialise
    this.initialiseProperties();
    this.initializeControls();
    this.initialiseEvents();
    this.initialiseFontFamily();

    // Config
    this.input.addPointer(3);

    this.groupPhysics();
    this.groupCollision();

    // this.handlePlayerInWater();
    this.createObstacles();
    this.initialiseCombat();
    this.initialiseWearables();

    this.createBlockade();
    this.createBlockadeGuide();
    // DEBUG
    const texture = this.textures.get("skeleton");

    // console.log("Debug spritesheet:", {
    //   width: texture.getSourceImage().width,
    //   height: texture.getSourceImage().height,
    //   frames: texture.getFrameNames(),
    // });

    if (!this.physics.world.debugGraphic) {
      this.physics.world.createDebugGraphic();
    }
    this.physics.world.drawDebug = false;
    if (this.physics.world.drawDebug) {
      const GRID_SIZE = 16;
      // Draw coordinates at each grid position
      for (let x = 0; x < this.map.widthInPixels; x += GRID_SIZE) {
        for (let y = 0; y < this.map.heightInPixels; y += GRID_SIZE) {
          const name = this.add.bitmapText(
            x,
            y,
            "Teeny Tiny Pixls",
            `${x / GRID_SIZE},${y / GRID_SIZE}`,
            7,
          );
          name.setScale(0.4);
          name.setDepth(10000000000000);
        }
      }
    }

    // Background music
    this.sound.getAll("backgroundMusic").forEach((sound) => sound.destroy());
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.2,
    });
    if (this.isGameReady || this.isGamePlaying) {
      this.backgroundMusic.play();
    }
  }

  private createChestAnimations() {
    (Object.keys(CHEST_VISUALS) as ChestRarity[]).forEach((rarity) => {
      const { textureKey, idleAnimationKey, openAnimationKey } =
        CHEST_VISUALS[rarity];

      if (!this.textures.exists(textureKey)) return;

      if (!this.anims.exists(idleAnimationKey)) {
        this.anims.create({
          key: idleAnimationKey,
          // TODO: adjust start/end to your idle frame range once the real
          // spritesheet is loaded.
          frames: this.anims.generateFrameNumbers(textureKey, {
            start: 0,
            end: 7,
          }),
          frameRate: 6,
          repeat: -1,
        });
      }

      if (!this.anims.exists(openAnimationKey)) {
        this.anims.create({
          key: openAnimationKey,
          // TODO: adjust start/end to your open frame range. repeat: 0 so
          // it plays once - Chest.ts listens for "animationcomplete" on
          // this exact key to know when to offer the upgrades.
          frames: this.anims.generateFrameNumbers(textureKey, {
            start: 8,
            end: 14,
          }),
          frameRate: 6,
          repeat: 0,
        });
      }
    });
  }

  private createWeaponAnimations() {
    if (!this.anims.exists(Scene.WEAPON_FROST_CHAIN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_FROST_CHAIN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_frost_chain", {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.anims.exists(Scene.FROST_HIT_EFFECT_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.FROST_HIT_EFFECT_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("frost_hit_effect", {
          start: 0,
          end: 4,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.anims.exists(Scene.POWER_FROST_GROUND_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.POWER_FROST_GROUND_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("power_frost_ground", {
          start: 0,
          end: 2,
        }),
        frameRate: 5,
        repeat: -1,
      });
    }

    if (!this.anims.exists("weapon_crimson_vial_active")) {
      this.anims.create({
        key: "weapon_crimson_vial_active",
        frames: this.anims.generateFrameNumbers("weapon_crimson_vial", {
          start: 0,
          end: 8,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.anims.exists("bloody_hit_effect_active")) {
      this.anims.create({
        key: "bloody_hit_effect_active",
        frames: this.anims.generateFrameNumbers("bloody_hit_effect", {
          start: 0,
          end: 4,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.anims.exists("bleed_effect_active")) {
      this.anims.create({
        key: "bleed_effect_active",
        frames: this.anims.generateFrameNumbers("bleed_effect", {
          start: 0,
          end: 6,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.anims.exists("crimson_vial_effect_active")) {
      this.anims.create({
        key: "crimson_vial_effect_active",
        frames: this.anims.generateFrameNumbers("crimson_vial_effect", {
          start: 0,
          end: 12,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("poison_effect_active")) {
      this.anims.create({
        key: "poison_effect_active",
        frames: this.anims.generateFrameNumbers("poison_effect", {
          start: 0,
          end: 5,
        }),
        frameRate: 9,
        repeat: -1,
      });
    }

    if (!this.anims.exists("weapon_cursed_coffin_active")) {
      this.anims.create({
        key: "weapon_cursed_coffin_active",
        frames: this.anims.generateFrameNumbers("weapon_cursed_coffin", {
          start: 0,
          end: 11,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (!this.anims.exists("weakness_effect_active")) {
      this.anims.create({
        key: "weakness_effect_active",
        frames: this.anims.generateFrameNumbers("weakness_effect", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_FROZEN_SKULL_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_FROZEN_SKULL_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_frozen_skull", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_SCYTHE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_SCYTHE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_blood_scythe", {
          start: 0,
          end: 3,
        }),
        frameRate: 36,
        repeat: -1,
      });
    }

    if (
      !this.anims.exists(Scene.WEAPON_DARKNESS_BOOK_PROJECTILE_ANIMATION_KEY)
    ) {
      this.anims.create({
        key: Scene.WEAPON_DARKNESS_BOOK_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers(
          "weapon_darkness_book_projectile",
          {
            start: 0,
            end: 4,
          },
        ),
        frameRate: 7,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_POISON_VIAL_PROJECTILE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_POISON_VIAL_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers(
          "weapon_poison_vial_projectile",
          {
            start: 0,
            end: 9,
          },
        ),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_POISON_VIAL_EXPLOSION_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_POISON_VIAL_EXPLOSION_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers(
          "weapon_poison_vial_explosion",
          {
            start: 0,
            end: 14,
          },
        ),
        frameRate: 24,
        repeat: 0,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_BLOOD_KNIFE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_BLOOD_KNIFE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_blood_knife", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_FROST_FLOWER_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_FROST_FLOWER_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_frost_flower", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_MOSS_GROUND_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_MOSS_GROUND_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_moss_ground", {
          start: 0,
          end: 9,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (
      !this.anims.exists(Scene.WEAPON_HORIZONTAL_JACK_O_LANTERN_ANIMATION_KEY)
    ) {
      this.anims.create({
        key: Scene.WEAPON_HORIZONTAL_JACK_O_LANTERN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers(
          "weapon_banished_jack_o_lantern_horizontal",
          {
            start: 0,
            end: 8,
          },
        ),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (
      !this.anims.exists(Scene.WEAPON_VERTICAL_JACK_O_LANTERN_ANIMATION_KEY)
    ) {
      this.anims.create({
        key: Scene.WEAPON_VERTICAL_JACK_O_LANTERN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers(
          "weapon_banished_jack_o_lantern_vertical",
          {
            start: 0,
            end: 8,
          },
        ),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (
      !this.anims.exists(Scene.WEAPON_DIAGONAL_JACK_O_LANTERN_ANIMATION_KEY)
    ) {
      this.anims.create({
        key: Scene.WEAPON_DIAGONAL_JACK_O_LANTERN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers(
          "weapon_banished_jack_o_lantern_diagonal",
          {
            start: 0,
            end: 8,
          },
        ),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (
      !this.anims.exists(
        Scene.WEAPON_DIAGONAL_JACK_O_LANTERN_REVERSE_ANIMATION_KEY,
      )
    ) {
      this.anims.create({
        key: Scene.WEAPON_DIAGONAL_JACK_O_LANTERN_REVERSE_ANIMATION_KEY,
        frames: Array.from({ length: 9 }, (_, index) => ({
          key: "weapon_banished_jack_o_lantern_diagonal",
          frame: 8 - index,
        })),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_FLY_STORM_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_FLY_STORM_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_fly_storm", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_FLY_STORM_SPAWN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_FLY_STORM_SPAWN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_fly_storm_spawn", {
          start: 0,
          end: 6,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  private disableColliders() {
    this.physics.world.colliders.getActive().forEach((collider) => {
      if (!collider.overlapOnly) {
        collider.active = false;
      }
    });
  }

  update(time = this.time.now, delta = this.game.loop.delta) {
    this.syncPhysicsPause();

    if (Scene.DISABLE_COLLIDERS) {
      this.disableColliders();
    }

    if (this.isGamePlaying && !this.isGameplayPaused) {
      // The game has started
      this.velocity = this.getPlayerMovementSpeed();
      this.loadBumpkinAnimations();
      // this.handlePlayerOutOfWater();
      this.syncSpecialPower();
      this.weaponManager?.update(time, delta);
      this.applyHealingTick(delta);
      this.updateEnteredArea();
      this.updateBlockadeGuide();
      this.areaBaseSpawn();
      this.phasingEnemies.forEach((mob) => {
        mob.setPhasingMove(true);
      });
      this.meleeEnemies.forEach((mob) => {
        mob.setMeleeMove(true);
      });
      this.bossEnemies.forEach((boss) => {
        boss.setMove(true);
      });
      this.miniBosses.forEach((miniBoss) => {
        miniBoss.setMiniBossMove(true);
      });
      this.enemyWeapons.forEach((weapon) => {
        weapon.update(delta);
      });
      this.staticRangeEnemies.forEach((mob) => {
        mob.updateMovement(delta);
      });
    } else if (this.isGamePlaying && this.isGameplayPaused) {
      this.velocity = 0;
      if (!this.currentPlayer?.isHurting) {
        this.currentPlayer?.idle?.();
      }
      this.phasingEnemies.forEach((mob) => {
        mob.setPhasingMove(false);
      });
      this.meleeEnemies.forEach((mob) => {
        mob.setMeleeMove(false);
      });
      this.bossEnemies.forEach((boss) => {
        boss.setMove(false);
      });
      this.miniBosses.forEach((miniBoss) => {
        miniBoss.setMiniBossMove(false);
      });
      this.staticRangeEnemies.forEach((mob) => {
        mob.updateMovement(delta);
      });
    } else if (this.isGameReady) {
      this.portalService?.send("START");
      this.velocity = WALKING_SPEED;
      if (!this.backgroundMusic.isPlaying) {
        this.backgroundMusic.play();
      }
    } else {
      this.velocity = 0;
    }
    this.updateEnemies(delta);
    super.update();
  }

  private updateEnemies(delta: number) {
    for (const mob of this.phasingEnemies) {
      mob.updateMovement(delta);
    }

    for (const melee of this.meleeEnemies) {
      melee.updateMovement(delta);
    }

    for (const boss of this.bossEnemies) {
      boss.updateMovement(delta);
    }

    for (const miniBoss of this.miniBosses) {
      miniBoss.updateMovement(delta);
    }
  }

  private syncPhysicsPause() {
    if (this.isGamePlaying && this.isGameplayPaused) {
      if (!this.physics.world.isPaused) {
        this.physics.world.pause();
      }
      if (!this.time.paused) {
        this.time.paused = true;
      }
      return;
    }

    if (this.physics.world.isPaused) {
      this.physics.world.resume();
    }
    if (this.time.paused) {
      this.time.paused = false;
    }
  }

  private initialiseProperties() {
    this.velocity = 0;
    this.obstacles = [];
    this.phasingEnemies = [];
    this.meleeEnemies = [];
    this.bossEnemies = [];
    this.miniBosses = [];
    this.staticRangeEnemies = [];
    this.enemyWeapons = [];
    this.seaBeastDefeated = false;
    this.unlockedBlockades = [];
    this.defeatedMiniBosses.clear();
    this.defeatedBosses.clear();
    this.enteredAreas.clear();
    this.enemyKillsByArea = Scene.createEnemyKillsByArea();
    this.currentWorld = "overworld";
    this.isCameraFading = false;
    this.finalHole = undefined;
    this.isHoleEntered = false;
    this.healingElapsedMs = 0;
    this.waveState.clear();

    if (this.physics.world.isPaused) {
      this.physics.world.resume();
    }

    if (this.time.paused) {
      this.time.paused = false;
    }
  }

  private applyHealingTick(delta: number) {
    const healingPerSecond = getPerkAmount(
      this.portalService?.state.context.perkLevels,
      "healing",
    );
    if (healingPerSecond <= 0) return;

    this.healingElapsedMs += delta;
    if (this.healingElapsedMs < Scene.HEALING_TICK_MS) return;

    this.healingElapsedMs %= Scene.HEALING_TICK_MS;
    this.portalService?.send("HEAL", { amount: healingPerSecond });
  }

  private getPlayerMovementSpeed() {
    const moveSpeedBonus = getPerkAmount(
      this.portalService?.state.context.perkLevels,
      "moveSpeed",
    );
    const speed = WALKING_SPEED * (1 + moveSpeedBonus);

    return this.currentPlayer?.isSwimming
      ? speed * PLAYER_WATER_SPEED_MULTIPLIER
      : speed;
  }

  private initializeControls() {
    if (isTouchDevice()) {
      // const baseX = this.cameras.main.width / 2;
      // const baseY = this.cameras.main.height / 2;
      // const offsetX = window.innerWidth / (2 * this.zoom) - TILE_SIZE;
      // const offsetY = window.innerHeight / (2 * this.zoom) - TILE_SIZE;

      // // Joystick
      // this.joystick = new VirtualJoyStick(this, {
      //   x: baseX - offsetX,
      //   y: baseY + offsetY,
      //   radius: 15,
      //   base: this.add.circle(0, 0, 20, 0x000000, 0.5).setDepth(1000000000),
      //   thumb: this.add.circle(0, 0, 8, 0xffffff, 0.5).setDepth(1000000000),
      //   forceMin: 2,
      // });

      // // Use tool button
      // const useToolButton = this.add
      //   .image(
      //     baseX + offsetX - TILE_SIZE / 6,
      //     baseY + offsetY,
      //     "use_tool_button",
      //   )
      //   .setInteractive()
      //   .setScrollFactor(0)
      //   .setScale(1.5)
      //   .setAlpha(0.8)
      //   .setDepth(1000000000000)
      //   .on("pointerdown", () => {
      //     if (this.isUseToolButtonPressed) return;
      //     this.isUseToolButtonPressed = true;
      //     this.mobileKeys.useTool = true;
      //     useToolButton.setTexture("use_tool_button_pressed");
      //   })
      //   .on("pointerup", () => {
      //     this.isUseToolButtonPressed = false;
      //     useToolButton.setTexture("use_tool_button");
      //   })
      //   .on("pointerout", () => {
      //     this.isUseToolButtonPressed = false;
      //     useToolButton.setTexture("use_tool_button");
      //   });

      // // Change tool button
      // const changeToolButton = this.add
      //   .image(
      //     baseX + offsetX + TILE_SIZE / 3,
      //     baseY + offsetY - TILE_SIZE + TILE_SIZE / 8,
      //     "change_tool_button",
      //   )
      //   .setInteractive()
      //   .setScrollFactor(0)
      //   .setScale(0.75)
      //   .setAlpha(0.8)
      //   .setDepth(1000000000000)
      //   .on("pointerdown", () => {
      //     if (this.isChangeToolButtonPressed) return;
      //     this.isChangeToolButtonPressed = true;
      //     this.mobileKeys.changeTool = true;
      //     changeToolButton.setTexture("change_tool_button_pressed");
      //   })
      //   .on("pointerup", () => {
      //     this.isChangeToolButtonPressed = false;
      //     changeToolButton.setTexture("change_tool_button");
      //   })
      //   .on("pointerout", () => {
      //     this.isChangeToolButtonPressed = false;
      //     changeToolButton.setTexture("change_tool_button");
      //   });

      this.portalService?.send("SET_JOYSTICK_ACTIVE", {
        isJoystickActive: true,
      });
    }
  }

  private initialiseEvents() {
    const portalService = this.portalService;

    // reload scene when player hit retry
    const onRetry = (event: EventObject) => {
      if (event.type === "RETRY") {
        this.scene.restart();
      }
    };
    portalService.onEvent(onRetry);

    // Restart scene when player hit start
    const onContinue = (event: EventObject) => {
      if (event.type === "CONTINUE") {
        this.scene.restart();
      }
    };
    portalService.onEvent(onContinue);

    // Restart scene when player hit start training
    const onContinueTraining = (event: EventObject) => {
      if (event.type === "CONTINUE_TRAINING") {
        this.scene.restart();
      }
    };
    portalService.onEvent(onContinueTraining);

    // Ensure the scene is fresh when the game starts
    const onStart = (event: EventObject) => {
      if (event.type === "START") {
        this.scene.restart();
      }
    };
    portalService.onEvent(onStart);

    const removeListeners = () => {
      portalService.off(onRetry);
      portalService.off(onContinue);
      portalService.off(onContinueTraining);
      portalService.off(onStart);
    };
    this.events.once("shutdown", removeListeners);
    this.events.once("destroy", removeListeners);
  }

  private initialiseFontFamily() {
    this.add
      .text(0, 0, ".", {
        fontFamily: "Teeny",
        fontSize: "1px",
        color: "#000000",
      })
      .setAlpha(0);
  }

  // Mirrors the XState Special Power window into the combat systems. Runs
  // every playing frame because expiry is time-based (no state change).
  private syncSpecialPower() {
    const context = this.portalService?.state.context;
    if (!context) return;

    const now = Date.now();
    const activeUntil = context.specialPowerActiveUntil;
    const power =
      now < activeUntil ? resolveSpecialPower(context.weaponLevels) : null;

    // Each category power lasts its own window (hybrid powers end apart).
    // activeUntil is the longest window, so it also gives the activation
    // time - and stays correct after pauses shift it forward.
    const activatedAt = power ? activeUntil - power.activeMs : 0;
    const activeCategories =
      power?.categories.filter(
        (category) =>
          now < activatedAt + (power.activeMsByCategory[category] ?? 0),
      ) ?? [];
    const key = activeCategories.join(",");

    if (key === this.appliedSpecialPowerKey) return;

    this.appliedSpecialPowerKey = key;
    this.weaponManager?.setSpecialPower(
      power && activeCategories.length > 0
        ? { ...power, categories: activeCategories }
        : null,
    );
  }

  private initialiseCombat() {
    if (!this.currentPlayer) return;

    this.appliedSpecialPowerKey = "";

    const portalService = this.portalService;
    const portalContext = portalService?.state.context;
    let weaponLoadout = this.createWeaponLoadout(portalContext?.weaponLevels);
    let activeWearables = portalContext?.activeWearables;
    let perkLevels = portalContext?.perkLevels;
    this.currentPlayer.setEquippedWeapon(
      this.getDisplayedWeapon(weaponLoadout),
    );

    this.weaponManager = new WeaponManager({
      scene: this,
      player: this.currentPlayer,
      enemyGroup: this.enemyGroup,
      blockerGroups: [this.colliders].filter(
        (group): group is Phaser.GameObjects.Group => !!group,
      ),
      portalService,
      loadout: weaponLoadout,
    });

    const subscription = portalService?.subscribe((state) => {
      const nextWeaponLoadout = this.createWeaponLoadout(
        state.context.weaponLevels,
      );
      const nextWearables = state.context.activeWearables;
      const nextPerkLevels = state.context.perkLevels;
      const hasSameWeaponLoadout =
        JSON.stringify(nextWeaponLoadout) === JSON.stringify(weaponLoadout);
      const hasSameWearables =
        JSON.stringify(nextWearables) === JSON.stringify(activeWearables);
      // Perks like Attack Speed / Cooldown Reduction / Projectile Speed
      // change weapon stats without changing the loadout itself, so a
      // perk-only pick still needs to trigger a weapon stats refresh.
      const hasSamePerkLevels =
        JSON.stringify(nextPerkLevels) === JSON.stringify(perkLevels);

      if (hasSameWeaponLoadout && hasSameWearables && hasSamePerkLevels) {
        return;
      }

      weaponLoadout = nextWeaponLoadout;
      activeWearables = nextWearables;
      perkLevels = nextPerkLevels;
      this.currentPlayer?.setEquippedWeapon(
        this.getDisplayedWeapon(nextWeaponLoadout),
      );
      this.weaponManager?.reset(nextWeaponLoadout);
    });
    this.createStationaryEnemies(["staticRange"]);

    this.events.once("shutdown", () => {
      subscription?.unsubscribe();
      this.weaponManager?.shutdown();
      this.weaponManager = undefined;
      this.enemyGroup?.destroy(false);
      this.phasingGroup?.destroy(false);
      this.meleeGroup?.destroy(false);
      this.staticRangeGroup?.destroy(false);
      this.bossGroup?.destroy(false);
      this.miniBossGroup?.destroy(false);
    });
  }

  private initialiseWearables() {
    const portalService = this.portalService;
    let activeWearables = portalService?.state.context.activeWearables;

    if (activeWearables && this.currentPlayer) {
      this.currentPlayer.changeClothing({
        ...activeWearables,
        updatedAt: Date.now(),
      });
    }

    const subscription = portalService?.subscribe((state) => {
      const nextWearables = state.context.activeWearables;
      if (!nextWearables || !this.currentPlayer) return;
      if (JSON.stringify(nextWearables) === JSON.stringify(activeWearables)) {
        return;
      }

      activeWearables = nextWearables;
      this.currentPlayer.changeClothing({
        ...nextWearables,
        updatedAt: Date.now(),
      });
    });

    this.events.once("shutdown", () => {
      subscription?.unsubscribe();
    });
  }

  private loadBumpkinAnimations() {
    if (!this.currentPlayer) return;
    if (!this.cursorKeys) return;
    if (this.currentPlayer.isHurting) return;

    if (this.currentPlayer.isSwimming) {
      this.currentPlayer.swim?.();
      return;
    }

    const animation = this.isMoving ? "walk" : "idle";

    this.currentPlayer[animation]?.();
  }

  private createWeaponLoadout(
    weaponLevels: Record<WeaponId, WeaponLevel> = {} as Record<
      WeaponId,
      WeaponLevel
    >,
  ): WeaponLoadoutItem[] {
    return Object.entries(weaponLevels)
      .filter((entry): entry is [WeaponId, WeaponLevel] => entry[1] > 0)
      .map(([id, level]) => ({
        id,
        level,
      }));
  }

  private getDisplayedWeapon(loadout: WeaponLoadoutItem[]) {
    return loadout.find(({ id }) => id === "darknessBook")?.id;
  }

  private groupPhysics() {
    this.obstacleGroup = this.physics.add.staticGroup();
    // this.waterGroup = this.physics.add.staticGroup();
    this.staticRangeGroup = this.physics.add.group();
    this.phasingGroup = this.physics.add.group();
    this.meleeGroup = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.bossGroup = this.physics.add.group();
    this.miniBossGroup = this.physics.add.group();
    this.weaponGroup = this.physics.add.group();
  }

  private groupCollision() {
    this.physics.add.collider(this.bossGroup, this.bossGroup);
    this.physics.add.collider(this.miniBossGroup, this.miniBossGroup);
    this.physics.add.collider(this.meleeGroup, this.meleeGroup);
    this.physics.add.collider(this.phasingGroup, this.phasingGroup);

    if (this.currentPlayer) {
      this.physics.add.overlap(
        this.currentPlayer,
        this.enemyGroup,
        (_player, enemyObj) => {
          const enemy = enemyObj as
            | StaticRangeEnemy
            | PhasingEnemy
            | MeleeEnemy
            | BossEnemy
            | MiniBoss;
          enemy.handlePlayerContact();
        },
      );
    }

    if (this.currentPlayer) {
      this.physics.add.overlap(
        this.currentPlayer,
        this.weaponGroup,
        (_player, weaponObj) => {
          const weapon = weaponObj as unknown as EnemyWeapon;
          weapon.handlePlayerContact();
        },
      );
    }
  }

  private createObstacles() {
    OBSTACLES_LAYOUT.obstacle1.forEach((o) =>
      addStaticObstacle({
        ...o,
        scene: this,
        obstacleGroup: this.obstacleGroup,
        waterGroup: this.waterGroup,
        currentPlayer: this.currentPlayer as Phaser.GameObjects.GameObject,
        obstacles: this.obstacles,
      }),
    );
  }

  private handlePlayerInWater() {
    this.physics.add.overlap(
      this.currentPlayer as Phaser.GameObjects.GameObject,
      this.waterGroup,
      () => {
        const player = this.currentPlayer;
        if (!player) return;

        if (!player.isSwimming) {
          player.isSwimming = true;
          player.swim?.();
          this.velocity = this.getPlayerMovementSpeed();
        }
      },
    );
  }

  private handlePlayerOutOfWater() {
    const player = this.currentPlayer;
    if (!player) return;

    const isInWater = this.physics.overlap(
      player as BumpkinContainer,
      this.waterGroup,
    );

    if (!isInWater && player.isSwimming) {
      player.isSwimming = false;
      player.walk?.();
      this.velocity = this.getPlayerMovementSpeed();
    }
  }

  // Enemy area base spawning
  private areaBaseSpawn() {
    this.spawnPhasingMob();
    this.spawnMeleeMob();
  }

  private handleEnemyKill(mobType: EnemyType) {
    const area = ENEMY_AREAS[mobType];

    this.enemyKillsByArea[area]++;

    this.checkMiniBossSpawn(area);
  }

  private checkMiniBossSpawn(area: SpawnArea) {
    const requiredKills =
      PHASING_WAVE_THRESHOLDS.filter((wave) => wave.area === area).reduce(
        (total, wave) => total + wave.totalEnemy,
        0,
      ) +
      MELEE_WAVE_THRESHOLDS.filter((wave) => wave.area === area).reduce(
        (total, wave) => total + wave.totalEnemy,
        0,
      );

    if (this.enemyKillsByArea[area] < requiredKills) {
      return;
    }

    const miniBosses = MINIBOSS_WAVE_THRESHOLDS.filter(
      (miniBoss) => miniBoss.area === area,
    );

    for (const miniBoss of miniBosses) {
      const flag = miniBoss.flag;

      if (this.waveState.get(flag)) {
        continue;
      }

      this.waveState.set(flag, true);

      this.spawnMiniBoss(miniBoss);
    }
  }

  // Check if the player is in a specific area
  private isPlayerInArea(area: number): boolean {
    if (!this.currentPlayer) return false;
    const spawnArea = ENEMY_SPAWN_AREAS[area as keyof typeof ENEMY_SPAWN_AREAS];

    if (!spawnArea) return false;
    // if (spawnArea.world !== this.currentWorld) return false;

    return (
      this.currentPlayer.x >= spawnArea.minX &&
      this.currentPlayer.x <= spawnArea.maxX &&
      this.currentPlayer.y >= spawnArea.minY &&
      this.currentPlayer.y <= spawnArea.maxY
    );
  }

  private updateEnteredArea() {
    for (const area of Object.keys(ENEMY_SPAWN_AREAS)) {
      const areaNumber = Number(area);

      if (this.isPlayerInArea(areaNumber)) {
        this.enteredAreas.add(areaNumber);
      }
    }
  }

  // spawning helper
  private getSpawnPositions(
    formation: EnemyFormation,
    count: number,
    enemyType: EnemyType,
  ): { x: number; y: number }[] {
    if (!this.currentPlayer) return [];

    const minSpawnDistance = 5 * SQUARE_WIDTH;

    const area = ENEMY_AREAS[enemyType];
    const spawnArea = ENEMY_SPAWN_AREAS[area];

    const positions = getFormationPositions(
      formation,
      count,
      this.currentPlayer.x,
      this.currentPlayer.y,
    );

    const px = this.currentPlayer.x;
    const py = this.currentPlayer.y;

    return positions.map(({ x, y }) => {
      let spawnX = x;
      let spawnY = y;

      const dx = spawnX - px;
      const dy = spawnY - py;
      const dist = Math.hypot(dx, dy);

      if (dist < minSpawnDistance) {
        const angle =
          dist > 0 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;

        spawnX = px + Math.cos(angle) * minSpawnDistance;
        spawnY = py + Math.sin(angle) * minSpawnDistance;
      }

      // Restrict enemy to its area
      spawnX = Phaser.Math.Clamp(spawnX, spawnArea.minX, spawnArea.maxX);
      spawnY = Phaser.Math.Clamp(spawnY, spawnArea.minY, spawnArea.maxY);

      return {
        x: spawnX,
        y: spawnY,
      };
    });
  }

  // Create Enemies
  private createStationaryEnemies(weaponTypes: WeaponType[]) {
    const enemies: StaticRangeEnemyTypes[] = [
      "scarecrow",
      "imp",
      "cultist",
      "red_stone",
    ];

    enemies.forEach((mobType, areaIndex) => {
      const startIndex = areaIndex * 7;
      const positions = STATIC_RANGE_POS.slice(startIndex, startIndex + 7);

      positions.forEach(({ x, y }) => {
        if (!this.currentPlayer) return;

        const mob = new StaticRangeEnemy({
          x: x * SQUARE_WIDTH,
          y: y * SQUARE_WIDTH,
          scene: this,
          player: this.currentPlayer,
          mobType,
          weaponTypes,
        });

        for (const weaponType of weaponTypes) {
          const weapon = createEnemyWeapon({
            scene: this,
            target: mob,
            player: this.currentPlayer,
            enemyType: mobType,
            weaponType,
          });

          this.enemyWeapons.push(weapon);
          this.weaponGroup.add(weapon);
        }

        this.staticRangeEnemies.push(mob);
        this.staticRangeGroup.add(mob);
        this.enemyGroup.add(mob);

        mob.once("destroy", () => {
          this.unregisterStaticRangeMob(mob);
        });
      });
    });
  }

  private createPhasingEnemy(
    mobType: PhasingEnemyTypes,
    formation: EnemyFormation,
    count: number,
  ): number {
    if (!this.currentPlayer) return 0;
    const positions = this.getSpawnPositions(formation, count, mobType);
    let spawned = 0;

    positions.forEach(({ x: spawnX, y: spawnY }) => {
      const mob = new PhasingEnemy({
        x: spawnX,
        y: spawnY,
        scene: this,
        player: this.currentPlayer!,
        mobType,
      });

      this.phasingEnemies.push(mob);
      this.phasingGroup.add(mob);
      this.enemyGroup.add(mob);

      mob.once("destroy", () => {
        this.unregisterPhasingMob(mob);
      });

      spawned++;
    });

    return spawned;
  }

  private createMeleeEnemy(
    mobType: MeleeEnemyTypes,
    formation: EnemyFormation,
    count: number,
  ): number {
    if (!this.currentPlayer) return 0;
    const positions = this.getSpawnPositions(formation, count, mobType);
    let spawned = 0;

    positions.forEach(({ x: spawnX, y: spawnY }) => {
      const mob = new MeleeEnemy({
        x: spawnX,
        y: spawnY,
        scene: this,
        player: this.currentPlayer!,
        mobType,
      });

      this.meleeEnemies.push(mob);
      this.meleeGroup.add(mob);
      this.enemyGroup.add(mob);

      mob.once("destroy", () => {
        this.unregisterMeleeMobs(mob);
      });

      spawned++;
    });

    return spawned;
  }

  private createMiniBossEnemy(
    miniBossType: MiniBossType,
    formation: EnemyFormation,
    weaponTypes: WeaponType[],
    count = 1,
  ) {
    if (!this.currentPlayer) return 0;
    const positions = this.getSpawnPositions(formation, count, miniBossType);

    positions.forEach(({ x: spawnX, y: spawnY }) => {
      if (!this.currentPlayer) return;

      const miniBoss = new MiniBoss({
        x: spawnX,
        y: spawnY,
        scene: this,
        player: this.currentPlayer,
        miniBossType,
        weaponTypes,
      });

      for (const weaponType of weaponTypes) {
        const weapon = createEnemyWeapon({
          scene: this,
          target: miniBoss,
          player: this.currentPlayer,
          enemyType: miniBossType,
          weaponType,
        });

        this.enemyWeapons.push(weapon);
        this.weaponGroup.add(weapon);
      }

      this.miniBosses.push(miniBoss);
      this.miniBossGroup.add(miniBoss);
      this.enemyGroup.add(miniBoss);

      miniBoss.once("destroy", () => {
        this.unregisterMiniBossEnemy(miniBoss);
      });
    });
  }

  private createBossEnemy(
    bossType: BossTypes,
    formation: EnemyFormation,
    weaponTypes: WeaponType[],
    spawnPosition?: { x: number; y: number },
  ) {
    if (!this.currentPlayer) return 0;
    const positions = spawnPosition
      ? [spawnPosition]
      : this.getSpawnPositions(formation, 1, bossType);

    positions.forEach(({ x: spawnX, y: spawnY }) => {
      if (!this.currentPlayer) return;

      const boss = new BossEnemy({
        x: spawnX,
        y: spawnY,
        scene: this,
        player: this.currentPlayer,
        bossType,
        weaponTypes,
      });

      for (const weaponType of weaponTypes) {
        const weapon = createEnemyWeapon({
          scene: this,
          target: boss,
          player: this.currentPlayer,
          enemyType: bossType,
          weaponType,
        });

        this.enemyWeapons.push(weapon);
        this.weaponGroup.add(weapon);
      }

      this.bossEnemies.push(boss);
      this.bossGroup.add(boss);
      this.enemyGroup.add(boss);

      boss.once("destroy", () => {
        this.unregisterBossEnemy(boss);
      });
    });
  }

  // Enemy batch spawn delays
  private mobWaveHelper(
    total: number,
    batchSize: number,
    delay: number,
    spawnBatch: (amount: number) => number,
  ) {
    let spawned = 0;

    const event = this.time.addEvent({
      delay,
      loop: true,

      callback: () => {
        if (spawned >= total) {
          event.remove();
          return;
        }

        const amount = Math.min(batchSize, total - spawned);
        spawned += spawnBatch(amount);
      },
    });
  }

  private phasingWave(
    mobType: PhasingEnemyTypes,
    total: number,
    batchSize: number,
    delay: number,
    formation: EnemyFormation,
  ) {
    this.mobWaveHelper(total, batchSize, delay, (amount) =>
      this.createPhasingEnemy(mobType, formation, amount),
    );
  }

  private meleeWave(
    mobType: MeleeEnemyTypes,
    total: number,
    batchSize: number,
    delay: number,
    formation: EnemyFormation,
  ) {
    this.mobWaveHelper(total, batchSize, delay, (amount) =>
      this.createMeleeEnemy(mobType, formation, amount),
    );
  }

  private miniBossWave(
    miniBossType: MiniBossType,
    total: number,
    weaponType: WeaponType[],
    formation: EnemyFormation,
  ) {
    for (let i = 0; i < total; i++) {
      this.createMiniBossEnemy(miniBossType, formation, weaponType);
    }
  }

  private bossWave(
    bossType: BossTypes,
    total: number,
    weaponType: WeaponType[],
    formation: EnemyFormation,
    spawnPosition?: { x: number; y: number },
  ) {
    for (let i = 0; i < total; i++) {
      // this.bossWarning(bossType);
      this.createBossEnemy(bossType, formation, weaponType, spawnPosition);
    }
  }

  // Enemy spawn triggers
  private spawnPhasingMob() {
    for (const wave of PHASING_WAVE_THRESHOLDS) {
      const key = wave.flag;

      if (!this.waveState.get(key) && this.isPlayerInArea(wave.area)) {
        this.waveState.set(key, true);

        this.phasingWave(
          wave.mobType,
          wave.totalEnemy,
          wave.batchSize,
          wave.delay,
          wave.formation,
        );
      }
    }
  }

  private spawnMeleeMob() {
    for (const wave of MELEE_WAVE_THRESHOLDS) {
      const key = wave.flag;

      if (!this.waveState.get(key) && this.isPlayerInArea(wave.area)) {
        this.waveState.set(key, true);

        this.meleeWave(
          wave.mobType,
          wave.totalEnemy,
          wave.batchSize,
          wave.delay,
          wave.formation,
        );
      }
    }
  }

  private spawnMiniBoss(config: MiniBossWaveConfig) {
    this.miniBossWave(
      config.miniBossType,
      config.totalEnemy,
      config.weaponType,
      config.formation,
    );
  }

  private spawnBoss(
    bossType: BossTypes,
    spawnPosition?: { x: number; y: number },
  ) {
    const bossWave = BOSS_WAVE_THRESHOLDS.find(
      (wave) => wave.bossType === bossType,
    );

    if (!bossWave) return;

    if (this.waveState.get(bossWave.flag)) return;

    this.waveState.set(bossWave.flag, true);

    this.bossWave(
      bossWave.bossType,
      bossWave.totalEnemy,
      bossWave.weaponType,
      bossWave.formation,
      spawnPosition ?? bossWave.spawnPosition,
    );
  }

  private checkMiniBossProgression() {
    const defeatedCount = this.defeatedMiniBosses.size;

    if (defeatedCount === 2) {
      this.spawnBoss("minotaur");
    } else if (defeatedCount === 4) {
      this.spawnBoss("witch");
    } else if (defeatedCount === 6) {
      this.spawnBoss("cerberus");
    } else if (defeatedCount === 12) {
      this.spawnBoss("sorcerer");
    }
  }

  private checkBossProgression() {
    const defeatedCount = this.defeatedBosses.size;

    if (defeatedCount === 4) {
      this.spawnBoss("dungeonboss");
    }
  }

  // For testing bosses only
  // private checkMiniBossProgression() {
  //   const defeatedCount = this.defeatedMiniBosses.size;

  //   console.log("Defeated mini-bosses:", defeatedCount);

  //   if (defeatedCount === 6) {
  //     this.spawnBoss("sorcerer");
  //   }
  // }

  // Create drop items when enemies are defeated
  public createDropItems({
    x,
    y,
    itemKey,
  }: {
    x: number;
    y: number;
    itemKey: DropItemHalloweenType;
  }) {
    new DropItem({
      x,
      y,
      scene: this,
      player: this.currentPlayer,
      itemKey,
    });
  }
  // Create blockade to restrict player movement until boss is defeated
  private createBlockade() {
    this.smokeExplosion = this.add
      .sprite(this.map.widthInPixels / 2, 147 * SQUARE_WIDTH, "smoke_explosion")
      .setScale(1.4)
      .setDepth(6)
      .setVisible(false);

    if (!this.anims.exists("smoke_explosion_anim")) {
      this.anims.create({
        key: "smoke_explosion_anim",
        frames: this.anims.generateFrameNumbers("smoke_explosion", {
          start: 0,
          end: 6,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    const area1Blockade = this.add
      .image(this.map.widthInPixels / 2, 147 * SQUARE_WIDTH, "bridge")
      .setDepth(5)
      .setVisible(false);

    this.cloud1Blockade = this.add
      .image(20 * SQUARE_WIDTH, 140 * SQUARE_WIDTH, "cloud_cover")
      .setDepth(10000);

    const area2Blockade = this.add
      .image(18 * SQUARE_WIDTH, 109 * SQUARE_WIDTH + 1, "castle_wall")
      .setOrigin(0)
      .setDepth(this.map.heightInPixels + 1);

    this.cloud2Blockade = this.add
      .image(20 * SQUARE_WIDTH, 107 * SQUARE_WIDTH, "cloud_cover")
      .setDepth(10000);

    const area3Blockade = this.add
      .image(this.map.widthInPixels / 2, 74 * SQUARE_WIDTH, "portal")
      .setDepth(5)
      .setVisible(false);

    for (const blockade of [area1Blockade, area2Blockade, area3Blockade]) {
      this.physics.add.existing(blockade, true);

      const body = blockade.body as Phaser.Physics.Arcade.StaticBody;
      const offsetYArea =
        blockade.texture.key === "portal"
          ? -15
          : blockade.texture.key === "castle_wall"
            ? -10
            : 0;
      body.setSize(
        blockade.width * blockade.scaleX,
        blockade.height * blockade.scaleY + offsetYArea,
      );

      if (this.currentPlayer && blockade.texture.key !== "portal") {
        this.physics.add.collider(this.currentPlayer, blockade);
      }
    }

    this.isEnteringUnderworld = false;
    (area3Blockade.body as Phaser.Physics.Arcade.StaticBody).enable = false;

    this.area1Blockade = area1Blockade;
    this.area2Blockade = area2Blockade;
    this.area3Blockade = area3Blockade;
  }

  private createBlockadeGuide() {
    this.blockadeArrowFloat = this.tweens.addCounter({
      from: 0,
      to: Scene.BLOCKADE_ARROW_FLOAT_PX,
      duration: Scene.BLOCKADE_ARROW_FLOAT_MS,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.events.once("shutdown", () => {
      this.blockadeArrowFloat?.remove();
      this.blockadeArrowFloat = undefined;
      this.currentPlayer?.destroyBlockadeArrow();
    });
  }

  private updateBlockadeGuide() {
    const arrow = this.currentPlayer?.blockadeArrow;
    const player = this.currentPlayer;
    if (!arrow || !player || !this.isGamePlaying) return;

    const target = this.unlockedBlockades
      .filter((blockade) => blockade.getCenter().y < player.y)
      .sort((a, b) => b.getCenter().y - a.getCenter().y)[0];

    const isFarBelow =
      !!target &&
      player.y - target.getCenter().y > BLOCKADE_GUIDE_MIN_TILES * SQUARE_WIDTH;

    arrow.setVisible(isFarBelow);
    if (!isFarBelow) return;

    arrow.setY(
      -Scene.BLOCKADE_ARROW_OFFSET_Y -
        (this.blockadeArrowFloat?.getValue() ?? 0),
    );
  }

  private playSmokeExplosion(target?: Phaser.GameObjects.Image) {
    if (!target || !this.smokeExplosion) return;

    const { x, y } = target.getCenter();
    const smoke = this.smokeExplosion;

    smoke.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    smoke
      .setPosition(x, y)
      .setDepth(target.depth + 1)
      .setVisible(true)
      .play("smoke_explosion_anim");
    smoke.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      smoke.setVisible(false);
    });
  }

  private enterUnderworld() {
    const player = this.currentPlayer;
    const portalBody = this.area3Blockade?.body as
      | Phaser.Physics.Arcade.StaticBody
      | undefined;
    if (this.isEnteringUnderworld || !player || !portalBody) return;

    this.isEnteringUnderworld = true;
    this.isCameraFading = true;
    portalBody.enable = false;
    (player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    const camera = this.cameras.main;
    const baseZoom = camera.zoom;
    const overlayDepth = 10000000000000;

    const overlay = this.add
      .rectangle(
        camera.centerX,
        camera.centerY,
        camera.width * 4,
        camera.height * 4,
        0x000000,
      )
      .setScrollFactor(0)
      .setDepth(overlayDepth)
      .setAlpha(0);

    const label = this.add
      .text(camera.centerX, camera.centerY, translate("minigame.underworld"), {
        fontSize: "16px",
        fontFamily: "Basic",
        resolution: 4,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(overlayDepth + 1)
      .setAlpha(0);

    this.tweens.add({
      targets: camera,
      zoom: baseZoom * 1.15,
      duration: 1200,
      ease: "Sine.easeIn",
    });
    this.tweens.add({
      targets: camera,
      rotation: 0.05,
      duration: 200,
      yoyo: true,
      repeat: 3,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 1200,
      ease: "Sine.easeIn",
      onComplete: () => {
        player.setPosition(319, 534);
        (player.body as Phaser.Physics.Arcade.Body).reset(319, 534);
        camera.setRotation(0);
        camera.setZoom(baseZoom);
        camera.centerOn(player.x, player.y);

        // this.currentWorld = "underworld";

        this.tweens.add({
          targets: label,
          alpha: 1,
          duration: 500,
          hold: 800,
          yoyo: true,
          onComplete: () => {
            this.tweens.add({
              targets: overlay,
              alpha: 0,
              duration: 1200,
              onComplete: () => {
                overlay.destroy();
                label.destroy();
                this.isCameraFading = false;
              },
            });
          },
        });
      },
    });
  }

  // Handle enemy defeat
  public handleStaticMobDefeat(mob: StaticRangeEnemy) {
    this.createDropItems({
      x: mob.x,
      y: mob.y - 15,
      itemKey: mob.config.dropItem,
    });

    this.unregisterStaticRangeMob(mob);
    // mob.destroy();
  }

  public handlePhasingMobDefeat(mob: PhasingEnemy) {
    this.createDropItems({ x: mob.x, y: mob.y, itemKey: mob.config.dropItem });

    if (rollForRareChest(this.portalService?.state.context.perkLevels)) {
      new Chest({
        x: mob.x,
        y: mob.y,
        scene: this,
        player: this.currentPlayer,
        rarity: "rare",
      });
    }

    this.unregisterPhasingMob(mob);
    mob.destroy();

    this.handleEnemyKill(mob.mobType);
  }

  public handleMeleeMobDefeat(mob: MeleeEnemy) {
    this.createDropItems({ x: mob.x, y: mob.y, itemKey: mob.config.dropItem });

    if (rollForRareChest(this.portalService?.state.context.perkLevels)) {
      new Chest({
        x: mob.x,
        y: mob.y,
        scene: this,
        player: this.currentPlayer,
        rarity: "rare",
      });
    }

    this.unregisterMeleeMobs(mob);
    mob.destroy();

    this.handleEnemyKill(mob.mobType);
  }

  public handleMiniBossDefeat(miniBoss: MiniBoss) {
    this.createDropItems({
      x: miniBoss.x,
      y: miniBoss.y,
      itemKey: miniBoss.config.dropItem,
    });

    new Chest({
      x: miniBoss.x,
      y: miniBoss.y,
      scene: this,
      player: this.currentPlayer,
      rarity: "epic",
    });

    this.unregisterMiniBossEnemy(miniBoss);
    miniBoss.destroy();

    this.defeatedMiniBosses.add(miniBoss.miniBossType);
    this.checkMiniBossProgression();
  }

  public handleBossDefeat(boss: BossEnemy) {
    this.createDropItems({
      x: boss.x,
      y: boss.y,
      itemKey: boss.config.dropItem,
    });

    new Chest({
      x: boss.x,
      y: boss.y,
      scene: this,
      player: this.currentPlayer,
      rarity: "legendary",
    });

    if (boss.bossType === "minotaur") {
      if (this.area1Blockade) {
        (this.area1Blockade.body as Phaser.Physics.Arcade.StaticBody).enable =
          false;
        this.area1Blockade.setVisible(true);
        this.cloud1Blockade?.setVisible(false);
        this.unlockedBlockades.push(this.area1Blockade);
        this.playSmokeExplosion(this.area1Blockade);
      }
    } else if (boss.bossType === "witch") {
      if (this.area2Blockade) {
        this.area2Blockade.setTexture("castle_door");
        (this.area2Blockade.body as Phaser.Physics.Arcade.StaticBody).enable =
          false;
        this.cloud2Blockade?.setVisible(false);
        this.unlockedBlockades.push(this.area2Blockade);
        this.playSmokeExplosion(this.area2Blockade);
      }
    } else if (boss.bossType === "cerberus") {
      if (this.area3Blockade) {
        this.area3Blockade.setVisible(true);
        (this.area3Blockade.body as Phaser.Physics.Arcade.StaticBody).enable =
          true;

        if (this.currentPlayer) {
          this.physics.add.overlap(this.currentPlayer, this.area3Blockade, () =>
            this.enterUnderworld(),
          );
        }
        this.unlockedBlockades.push(this.area3Blockade);
        this.playSmokeExplosion(this.area3Blockade);
      }
    }
    if (boss.bossType === "dungeonboss") {
      this.spawnFinalHole(boss.x, boss.y);
    }
    this.defeatedBosses.add(boss.bossType);
    this.checkBossProgression();

    this.unregisterBossEnemy(boss);
    boss.destroy();
  }
  private spawnFinalHole(x: number, y: number) {
    if (this.finalHole) return;

    if (!this.anims.exists("hole_anim")) {
      this.anims.create({
        key: "hole_anim",
        frames: this.anims.generateFrameNumbers("hole", { start: 0, end: 40 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    const hole = this.add
      .sprite(x, y, "hole")
      .setOrigin(0.5)
      .setDepth(5)
      .setInteractive({ cursor: "pointer" });
    hole.play("hole_anim");

    hole.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const player = this.currentPlayer;
      if (!player || this.isHoleEntered) return;
      if (pointer.downElement.nodeName !== "CANVAS") return;

      const distance = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        hole.x,
        hole.y,
      );
      if (distance > HOLE_INTERACT_TILES * SQUARE_WIDTH) return;

      this.isHoleEntered = true;
      this.portalService?.send("HOLE_ENTERED");
    });

    this.finalHole = hole;
  }

  // Unregister enemies from the scene
  private unregisterStaticRangeMob(mob: StaticRangeEnemy) {
    this.staticRangeEnemies = this.staticRangeEnemies.filter(
      (enemy) => enemy !== mob,
    );
    this.staticRangeGroup?.remove(mob, false, false);
    this.enemyGroup?.remove(mob, false, false);
  }

  private unregisterPhasingMob(mob: PhasingEnemy) {
    this.phasingEnemies = this.phasingEnemies.filter((enemy) => enemy !== mob);
    this.phasingGroup?.remove(mob, false, false);
    this.enemyGroup?.remove(mob, false, false);
  }

  private unregisterMeleeMobs(mob: MeleeEnemy) {
    this.meleeEnemies = this.meleeEnemies.filter((enemy) => enemy !== mob);
    this.meleeGroup?.remove(mob, false, false);
    this.enemyGroup?.remove(mob, false, false);
  }

  private unregisterMiniBossEnemy(miniBoss: MiniBoss) {
    this.miniBosses = this.miniBosses.filter((enemy) => enemy !== miniBoss);
    this.miniBossGroup?.remove(miniBoss, false, false);
    this.enemyGroup?.remove(miniBoss, false, false);
  }

  private unregisterBossEnemy(boss: BossEnemy) {
    this.bossEnemies = this.bossEnemies.filter((enemy) => enemy !== boss);
    this.bossGroup?.remove(boss, false, false);
    this.enemyGroup?.remove(boss, false, false);
  }
}
