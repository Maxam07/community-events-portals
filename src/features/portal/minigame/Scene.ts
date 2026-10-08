import mapJson from "assets/map/empty_Map.json";
// import tilesetconfig from "assets/map/tileset.json";
import type { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "./Core/BaseScene";
import type { MachineInterpreter } from "./lib/Machine";
import type { EventObject } from "xstate";
import { isTouchDevice } from "features/world/lib/device";
import {
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
import { DropItem } from "./containers/DropItemsContainer";
import { Chest } from "./containers/ChestContainer";
import type {
  WeaponId,
  WeaponLoadoutItem,
  DropItemType,
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
  private static readonly WEAPON_BANANA_ANIMATION_KEY = "weapon_banana_active";
  private static readonly WEAPON_SCYTHE_ANIMATION_KEY = "weapon_scythe_active";
  private static readonly WEAPON_WATERING_CAN_PROJECTILE_ANIMATION_KEY =
    "weapon_watering_can_projectile_active";
  private static readonly WEAPON_CORN_PROJECTILE_ANIMATION_KEY =
    "weapon_corn_projectile_active";
  private static readonly WEAPON_CORN_EXPLOSION_ANIMATION_KEY =
    "weapon_corn_explosion_active";
  private static readonly WEAPON_TOMATO_PROJECTILE_ANIMATION_KEY =
    "weapon_tomato_projectile_active";
  private static readonly WEAPON_SUNFLOWER_ANIMATION_KEY =
    "weapon_sunflower_active";
  private static readonly WEAPON_SUNFLOWER_PROJECTILE_ANIMATION_KEY =
    "weapon_sunflower_projectile_active";
  private static readonly WEAPON_OIL_ANIMATION_KEY = "weapon_oil_active";
  private static readonly WEAPON_HORIZONTAL_PUMPKIN_ANIMATION_KEY =
    "weapon_horizontal_pumpkin_active";
  private static readonly WEAPON_VERTICAL_PUMPKIN_ANIMATION_KEY =
    "weapon_vertical_pumpkin_active";
  private static readonly WEAPON_DIAGONAL_PUMPKIN_ANIMATION_KEY =
    "weapon_diagonal_pumpkin_active";
  private static readonly WEAPON_DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY =
    "weapon_diagonal_pumpkin_active_reverse";
  private static readonly WEAPON_BEES_ANIMATION_KEY = "weapon_bees_active";
  private static readonly WEAPON_BEES_SPAWN_ANIMATION_KEY =
    "weapon_bees_spawn_active";
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
  area1Blockade?: Phaser.GameObjects.Image;
  area2Blockade?: Phaser.GameObjects.Image;
  area3Blockade?: Phaser.GameObjects.Image;
  defeatedMiniBosses = new Set<MiniBossType>();
  enteredAreas = new Set<number>();
  enemyKillsByArea: Record<SpawnArea, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  sceneId: SceneId = PORTAL_NAME;

  constructor() {
    super({
      name: PORTAL_NAME,
      map: {
        json: mapJson,
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
    this.load.spritesheet("medusa", "world/portal/halloween/medusa.webp", {
      frameWidth: 48,
      frameHeight: 48,
    });

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
    this.load.spritesheet("cerberus", "world/portal/halloween/cerberus.webp", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet(
      "sorcerer",
      "world/portal/halloween/sorcerer-Sheet.webp",
      {
        frameWidth: 48,
        frameHeight: 48,
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

    // Chests
    this.load.spritesheet(
      "chest_rare",
      "world/portal/images/placeholder1.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "chest_epic",
      "world/portal/images/placeholder1.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "chest_legendary",
      "world/portal/images/placeholder1.png",
      { frameWidth: 16, frameHeight: 16 },
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

    // Obstacles
    this.load.image("rock", "world/portal/images/TematicRock.webp");
    this.load.image("tree", "world/portal/images/TematicTree.webp");
    this.load.image("tree_stump", SUNNYSIDE.decorations.spookyTree);
    this.load.image("water1", SUNNYSIDE.decorations.ocean);
    this.load.image("water", "world/portal/halloween/ocean1.webp");
    this.load.image("deco_1", "world/portal/images/deco_1.webp");
    this.load.image("deco_2", "world/portal/images/deco_2.webp");
    this.load.image("deco_3", "world/portal/images/deco_3.webp");
    this.load.image("deco_4", "world/portal/images/deco_4.webp");
    this.load.image("blockade1", "world/goblin_exchange.png");

    // Boss icons
    this.load.image("icon_boss_1", "world/portal/images/icon_boss_1.webp");
    this.load.image("icon_boss_2", "world/portal/images/icon_boss_2.webp");
    this.load.image("icon_boss_3", "world/portal/images/icon_boss_3.webp");

    // Weapons
    this.load.spritesheet("weapon_banana", "world/portal/images/banana.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("weapon_scythe", "world/portal/images/scythe.png", {
      frameWidth: 38,
      frameHeight: 25,
    });
    this.load.image(
      "weapon_watering_can",
      "world/portal/images/watering_can.png",
    );
    this.load.spritesheet(
      "weapon_watering_can_projectile",
      "world/portal/images/watering_can_projectile.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "weapon_corn_projectile",
      "world/portal/images/corn_projectile.png",
      {
        frameWidth: 16,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_corn_explosion",
      "world/portal/images/corn_explosion.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.image(
      "weapon_tomato_ricochet",
      "world/portal/images/tomato_ricochet.png",
    );
    this.load.spritesheet(
      "weapon_tomato_projectile",
      "world/portal/images/tomato_projectile.png",
      {
        frameWidth: 17,
        frameHeight: 17,
      },
    );
    this.load.spritesheet(
      "weapon_sunflower",
      "world/portal/images/sunflower.png",
      {
        frameWidth: 18,
        frameHeight: 31,
      },
    );
    this.load.spritesheet(
      "weapon_sunflower_projectile",
      "world/portal/images/sunflower_projectile.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet("weapon_oil", "world/portal/images/oil.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "weapon_horizontal_pumpkin",
      "world/portal/images/horizontal_pumpkin.webp",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_vertical_pumpkin",
      "world/portal/images/vertical_pumpkin.webp",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_diagonal_pumpkin",
      "world/portal/images/diagonal_pumpkin.webp",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_bees_spawn",
      "world/portal/images/bees_spawn.png",
      {
        frameWidth: 16,
        frameHeight: 32,
      },
    );
    this.load.spritesheet("weapon_bees", "world/portal/images/bees.png", {
      frameWidth: 16,
      frameHeight: 32,
    });
    // this.load.image("weapon_slash", "/world/portal/images/weapons/slash.png");
    // this.load.image(
    //   "weapon_water_drop",
    //   "/world/portal/images/weapons/water_drop.png",
    // );
    // this.load.image("weapon_tomato", "/world/portal/images/weapons/tomato.png");
    // this.load.image("weapon_light", "/world/portal/images/weapons/light.png");
    // this.load.image(
    //   "weapon_pumpkin",
    //   "/world/portal/images/weapons/pumpkin.png",
    // );
    // this.load.image(
    //   "weapon_sunflower",
    //   "/world/portal/images/weapons/sunflower.png",
    // );
    // this.load.image("weapon_oil", "/world/portal/images/weapons/oil.png");
    // this.load.image("weapon_bee", "/world/portal/images/weapons/bee.png");

    // Biomes
    this.load.image("galaxy_biome", SUNNYSIDE.seasons.winter.galaxyLevel42);
    this.load.image("crystal_biome", SUNNYSIDE.seasons.winter.crystalLevel42);
    this.load.image("spooky_biome", SUNNYSIDE.seasons.winter.spookyLevel42);
    this.load.image("marble_biome", SUNNYSIDE.seasons.spring.marbleLevel42);

    // Music
    // Background
    this.load.audio("backgroundMusic", "/world/portal/music/bg_music.mp3");

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

    const centerX = 20.5 * SQUARE_WIDTH;
    // Area 1
    this.add.image(centerX, 131 * SQUARE_WIDTH, "galaxy_biome").setDepth(4);
    // Area 2
    this.add.image(centerX, 94 * SQUARE_WIDTH, "crystal_biome").setDepth(3);
    // Area 3
    this.add.image(centerX, 57 * SQUARE_WIDTH, "spooky_biome").setDepth(2);
    // Area 4
    this.add.image(centerX, 20 * SQUARE_WIDTH, "marble_biome").setDepth(1);

    // Background music
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.2,
    });
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
            end: 1,
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
            start: 2,
            end: 9,
          }),
          frameRate: 6,
          repeat: 0,
        });
      }
    });
  }

  private createWeaponAnimations() {
    if (!this.anims.exists(Scene.WEAPON_BANANA_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_BANANA_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_banana", {
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
        frames: this.anims.generateFrameNumbers("weapon_scythe", {
          start: 0,
          end: 9,
        }),
        frameRate: 36,
        repeat: 0,
      });
    }

    if (
      !this.anims.exists(Scene.WEAPON_WATERING_CAN_PROJECTILE_ANIMATION_KEY)
    ) {
      this.anims.create({
        key: Scene.WEAPON_WATERING_CAN_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers(
          "weapon_watering_can_projectile",
          {
            start: 0,
            end: 4,
          },
        ),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_CORN_PROJECTILE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_CORN_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_corn_projectile", {
          start: 0,
          end: 9,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_CORN_EXPLOSION_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_CORN_EXPLOSION_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_corn_explosion", {
          start: 0,
          end: 14,
        }),
        frameRate: 24,
        repeat: 0,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_TOMATO_PROJECTILE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_TOMATO_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_tomato_projectile", {
          start: 0,
          end: 3,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_SUNFLOWER_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_SUNFLOWER_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_sunflower", {
          start: 0,
          end: 4,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_SUNFLOWER_PROJECTILE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_SUNFLOWER_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_sunflower_projectile", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_OIL_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_OIL_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_oil", {
          start: 0,
          end: 9,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_HORIZONTAL_PUMPKIN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_HORIZONTAL_PUMPKIN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_horizontal_pumpkin", {
          start: 0,
          end: 8,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_VERTICAL_PUMPKIN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_VERTICAL_PUMPKIN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_vertical_pumpkin", {
          start: 0,
          end: 8,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_DIAGONAL_PUMPKIN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_DIAGONAL_PUMPKIN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_diagonal_pumpkin", {
          start: 0,
          end: 8,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (
      !this.anims.exists(Scene.WEAPON_DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY)
    ) {
      this.anims.create({
        key: Scene.WEAPON_DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY,
        frames: Array.from({ length: 9 }, (_, index) => ({
          key: "weapon_diagonal_pumpkin",
          frame: 8 - index,
        })),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_BEES_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_BEES_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_bees", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_BEES_SPAWN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_BEES_SPAWN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_bees_spawn", {
          start: 0,
          end: 6,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  update(time = this.time.now, delta = this.game.loop.delta) {
    this.syncPhysicsPause();

    if (this.isGamePlaying && !this.isGameplayPaused) {
      // The game has started
      this.velocity = this.getPlayerMovementSpeed();
      this.loadBumpkinAnimations();
      // this.handlePlayerOutOfWater();
      this.syncSpecialPower();
      this.weaponManager?.update(time, delta);
      this.applyHealingTick(delta);
      this.updateEnteredArea();
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
      this.backgroundMusic.play();
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
    this.seaBeastDefeated = false;
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

    this.events.once("shutdown", () => {
      portalService.off(onRetry);
      portalService.off(onContinue);
      portalService.off(onContinueTraining);
      portalService.off(onStart);
    });
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
    return loadout.find(({ id }) => id === "wateringCan")?.id;
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
      // "scarecrow",
      "red_stone", // temporary
      "imp",
      "cultist",
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
    count = 1,
  ) {
    if (!this.currentPlayer) return 0;
    const positions = this.getSpawnPositions(formation, count, bossType);

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
  ) {
    for (let i = 0; i < total; i++) {
      // this.bossWarning(bossType);
      this.createBossEnemy(bossType, formation, weaponType);
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

  private spawnBoss(bossType: BossTypes) {
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
    } else if (defeatedCount === 8) {
      this.spawnBoss("sorcerer");
    }
  }
  // Create drop items when enemies are defeated
  public createDropItems({
    x,
    y,
    itemKey,
  }: {
    x: number;
    y: number;
    itemKey: DropItemType;
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
    const area1Blockade = this.add
      .image(21.5 * SQUARE_WIDTH, 109 * SQUARE_WIDTH, "water1")
      .setDepth(5);

    const area2Blockade = this.add
      .image(21.5 * SQUARE_WIDTH, 73 * SQUARE_WIDTH, "water1")
      .setDepth(5);

    const area3Blockade = this.add
      .image(21.5 * SQUARE_WIDTH, 36 * SQUARE_WIDTH, "water1")
      .setDepth(5);

    for (const blockade of [area1Blockade, area2Blockade, area3Blockade]) {
      this.physics.add.existing(blockade, true);

      const body = blockade.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(4 * SQUARE_WIDTH, 4 * SQUARE_WIDTH);

      if (this.currentPlayer) {
        this.physics.add.collider(this.currentPlayer, blockade);
      }
    }

    this.area1Blockade = area1Blockade;
    this.area2Blockade = area2Blockade;
    this.area3Blockade = area3Blockade;
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
      this.area1Blockade?.destroy();
    } else if (boss.bossType === "witch") {
      this.area2Blockade?.destroy();
    } else if (boss.bossType === "cerberus") {
      this.area3Blockade?.destroy();
    }

    this.unregisterBossEnemy(boss);
    boss.destroy();
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
