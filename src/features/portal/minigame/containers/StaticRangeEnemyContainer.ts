import type { Scene } from "../Scene";
import type { BumpkinContainer } from "../Core/BumpkinContainer";
import type { MachineInterpreter } from "../lib/Machine";
import type {
  DamagePayload,
  StaticRangeEnemyTypes,
  WeaponType,
} from "../Types";
import type { EnemyConfig } from "../Types";
import { STATIC_RANGE_CONFIG } from "../constants/EnemyConstants";
import { WEAPON_SFX, WEAPON_SFX_VOL } from "../constants";
import { WeaponSfxLimiter } from "../lib/combat/WeaponSfxLimiter";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { LifeBar } from "./LifeBar";

const MOVEMENT_UPDATE_INTERVAL_MS = 100;
// const FRAME_DURATION_MS = 1000 / 60;

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  mobType: StaticRangeEnemyTypes;
  weaponTypes: WeaponType[];
}

export class StaticRangeEnemy extends Phaser.GameObjects.Container {
  scene: Scene;
  private player?: BumpkinContainer;
  private sprite!: Phaser.GameObjects.Sprite;
  private enemyBody!: Phaser.Physics.Arcade.Body;
  miniBossMove: boolean = false;
  public hp: number;
  public maxHp: number;
  public isDead = false;
  public config: EnemyConfig;
  private isHurting = false;
  private hurtFlashRemainingMs = 0;
  public deSpawnState = false;
  private mobType: StaticRangeEnemyTypes;
  private lifeBar: LifeBar;

  private static readonly STOP_DISTANCE_SQ = 25;
  private static readonly AVOID_DIRECTION_WEIGHT = 2;
  private static readonly OBSTACLE_AVOID_WEIGHT = 3;
  private avoidX = 0;
  private avoidY = 0;
  private avoidTimer = 0;
  private deathHandled = false;
  private movementCheckElapsed = Phaser.Math.Between(
    0,
    MOVEMENT_UPDATE_INTERVAL_MS,
  );
  private readonly OBSTACLE_AVOID_RANGE = SQUARE_WIDTH * 2;

  constructor({ scene, x, y, player, mobType }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    scene.physics.add.existing(this);
    this.mobType = mobType;
    this.config = STATIC_RANGE_CONFIG[mobType];

    this.hp = this.config.hp;
    this.maxHp = this.config.maxHp;

    this.lifeBar = new LifeBar({
      x: 0,
      y: -20,
      scene,
      width: 30,
      maxHealth: this.maxHp,
    });

    this.lifeBar.setVisible(true);
    this.createEnemy();
  }

  public get portalService() {
    return this.scene.registry.get("portalService") as
      | MachineInterpreter
      | undefined;
  }

  createEnemy() {
    this.sprite = this.scene.add.sprite(0, 0, this.config.key);
    this.add([this.sprite, this.lifeBar]);
    this.scene.add.existing(this);
    this.setScale(this.config.scale);
    this.setDepth(this.config.depth);

    this.enemyBody = this.body as Phaser.Physics.Arcade.Body;
    this.enemyBody.setSize(this.config.bodyWidth, this.config.bodyHeight);
    this.enemyBody.setOffset(this.config.offsetX, this.config.offsetY);
    this.enemyBody.setImmovable(false);

    this.createAnim();
  }

  private createAnim() {
    const animKey = `${this.config.key}_anim`;

    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNumbers(this.config.key, {
          start: this.config.frameStart,
          end: this.config.frameEnd,
        }),
        frameRate: this.config.frameRate,
        repeat: -1,
      });
    }

    if (this.config.attackKey) {
      const attackAnimKey = `${this.config.attackKey}_anim`;

      if (!this.scene.anims.exists(attackAnimKey)) {
        this.scene.anims.create({
          key: attackAnimKey,
          frames: this.scene.anims.generateFrameNumbers(this.config.attackKey, {
            start: 0,
            end: 7,
          }),
          frameRate: 10,
          repeat: 0,
        });
      }
    }

    this.sprite.play(animKey);
  }

  public playAttackAnimation() {
    if (this.isDead || !this.active) return;
    this.sprite.play(`${this.config.attackKey}_anim`, true);
  }

  public playMovementAnimation() {
    if (this.isDead || !this.active) return;

    this.sprite.play(`${this.config.key}_anim`, true);
  }

  setMiniBossMove(value: boolean) {
    this.miniBossMove = value;
    if (!value) this.enemyBody.setVelocity(0, 0);
  }

  public handlePlayerContact() {
    if (!this.active || this.isDead) return;
    this.player?.hurt(this.mobType);
  }

  public updateMovement(delta: number) {
    this.updateHurtVisual(delta);

    if (!this.active || this.isDead) return;

    const dx = this.player ? this.player.x - this.x : 0;

    if (dx < 0) {
      this.sprite.setFlipX(false);
    } else if (dx > 0) {
      this.sprite.setFlipX(true);
    }
  }

  public updateHurtVisual(delta: number) {
    if (!this.isHurting) return;

    this.hurtFlashRemainingMs = Math.max(0, this.hurtFlashRemainingMs - delta);

    if (this.hurtFlashRemainingMs > 0) return;

    this.sprite.setAlpha(1);
    this.isHurting = false;
  }

  public isHurt() {
    if (this.isHurting || this.isDead) return;

    this.isHurting = true;
    this.hurtFlashRemainingMs = 120;
    this.sprite.setAlpha(0.3);
  }

  public takeDamage(damage: number, _payload: DamagePayload) {
    if (this.isDead) return;

    const sfx = WEAPON_SFX[_payload.sourceWeaponId];

    if (sfx?.activate) {
      WeaponSfxLimiter.play(this.scene, sfx.activate, WEAPON_SFX_VOL);
    }

    this.isHurt();
    this.hp = Math.max(0, this.hp - damage);
    this.isDead = this.hp <= 0;

    this.lifeBar.setHealth(this.hp);

    if (this.isDead) {
      this.setMiniBossMove(false);
      this.sprite.stop();
      this.sprite.postFX?.addColorMatrix().grayscale(1);
      this.sprite.setAlpha(1);
      this.enemyBody.enable = false;
      this.setActive(false);
      this.lifeBar.setVisible(false);
    }
  }

  public onDeath() {
    if (this.deathHandled) return;

    this.deathHandled = true;
    this.scene.handleStatciMobDefeat(this);
  }
}
