import type { Scene } from "../Scene";
import type { BumpkinContainer } from "../Core/BumpkinContainer";
import type { MachineInterpreter } from "../lib/Machine";
import type { BossTypes, DamagePayload, WeaponType } from "../Types";
import type { EnemyConfig } from "../Types";
import { BOSS_CONFIGS } from "../constants/EnemyConstants";
import {
  KNOCKBACK_DURATION_MS,
  WEAPON_SFX,
  WEAPON_SFX_VOL,
} from "../constants";
import { WeaponSfxLimiter } from "../lib/combat/WeaponSfxLimiter";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { BoundingBox } from "../lib/collisionDetection";
import { LifeBar } from "./LifeBar";

const MOVEMENT_UPDATE_INTERVAL_MS = 100;
// const FRAME_DURATION_MS = 1000 / 60;

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  bossType: BossTypes;
  weaponTypes: WeaponType[];
}

export class BossEnemy extends Phaser.GameObjects.Container {
  scene: Scene;
  private player?: BumpkinContainer;
  private sprite!: Phaser.GameObjects.Sprite;
  private enemyBody!: Phaser.Physics.Arcade.Body;
  miniBossMove: boolean = false;
  public hp: number;
  public maxHp: number;
  public isDead = false;
  public damageMultiplier = 1;
  public config: EnemyConfig;
  private isHurting = false;
  // Status effects (slow/stun) scale movement speed; 1 = normal speed.
  private movementMultiplier = 1;
  private knockbackRemainingMs = 0;
  private hurtFlashRemainingMs = 0;
  public deSpawnState = false;
  public bossType: BossTypes;
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

  constructor({ scene, x, y, player, bossType }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    scene.physics.add.existing(this);
    this.bossType = bossType;
    this.config = BOSS_CONFIGS[bossType];

    this.hp = this.config.hp;
    this.maxHp = this.config.maxHp;

    this.lifeBar = new LifeBar({
      x: 0,
      y: -40,
      scene,
      width: 50,
      maxHealth: this.maxHp,
    });

    this.lifeBar.setVisible(true);
    this.createEnemy();
  }

  public get portalService() {
    return this.scene.registry.get("portalService") as
      MachineInterpreter | undefined;
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

    if (this.config.deathKey) {
      const deathAnimKey = `${this.config.deathKey}_anim`;

      if (!this.scene.anims.exists(deathAnimKey)) {
        const endFrame = this.config.deathKey === "dungeonboss_death" ? 12 : 7;

        this.scene.anims.create({
          key: deathAnimKey,
          frames: this.scene.anims.generateFrameNumbers(this.config.deathKey, {
            start: 0,
            end: endFrame,
          }),
          frameRate: 10,
          repeat: 0,
        });
      }
    }

    this.sprite.play(animKey);
  }

  public playDeathAnimation(onComplete?: () => void) {
    if (!this.sprite?.anims) return;

    const deathAnimKey = `${this.config.deathKey}_anim`;

    if (!this.config.deathKey || !this.scene.anims.exists(deathAnimKey)) {
      onComplete?.();
      return;
    }

    this.enemyBody?.setVelocity(0, 0);
    this.lifeBar.setVisible(false);
    this.sprite.setAlpha(1);
    this.sprite.anims.resume(); // in case slow/stun paused it

    if (onComplete) {
      this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, onComplete);
    }
    this.sprite.play(deathAnimKey, true);
  }

  private avoidObstacles(): { x: number; y: number } {
    const obstacles = (this.scene as any).obstacles as
      BoundingBox[] | undefined;
    if (!obstacles || obstacles.length === 0) return { x: 0, y: 0 };

    let pushX = 0;
    let pushY = 0;
    let contributingCount = 0;

    const rangeSq = this.OBSTACLE_AVOID_RANGE * this.OBSTACLE_AVOID_RANGE;

    for (const obstacle of obstacles) {
      if (!obstacle.hasHitbox || !obstacle.sprite) continue;

      const obstacleX = obstacle.sprite.x;
      const obstacleY = obstacle.sprite.y;
      const halfWidth = (obstacle.width * SQUARE_WIDTH) / 2;
      const halfHeight = (obstacle.height * SQUARE_WIDTH) / 2;

      const closestX = Phaser.Math.Clamp(
        this.x,
        obstacleX - halfWidth,
        obstacleX + halfWidth,
      );
      const closestY = Phaser.Math.Clamp(
        this.y,
        obstacleY - halfHeight,
        obstacleY + halfHeight,
      );

      let dx = this.x - closestX;
      let dy = this.y - closestY;
      let distSq = dx * dx + dy * dy;

      if (distSq === 0) {
        dx = this.x - obstacleX;
        dy = this.y - obstacleY;
        distSq = dx * dx + dy * dy;
        if (distSq === 0) {
          dx = 1;
          dy = 0;
          distSq = 1;
        }
        const dist = Math.sqrt(distSq);
        pushX += dx / dist;
        pushY += dy / dist;
        contributingCount++;
        continue;
      }

      if (distSq >= rangeSq) continue;

      const dist = Math.sqrt(distSq);
      const t = 1 - dist / this.OBSTACLE_AVOID_RANGE;
      const strength = t * t;

      pushX += (dx / dist) * strength;
      pushY += (dy / dist) * strength;
      contributingCount++;
    }

    if (contributingCount > 0) {
      pushX /= contributingCount;
      pushY /= contributingCount;
    }

    return { x: pushX, y: pushY };
  }

  public updateMovement(delta: number) {
    this.updateHurtVisual(delta);

    if (!this.player || !this.active || this.isDead) return;

    if (this.knockbackRemainingMs > 0) {
      this.knockbackRemainingMs -= delta;

      if (this.knockbackRemainingMs <= 0) {
        this.knockbackRemainingMs = 0;
        this.enemyBody.setVelocity(0, 0);
      }

      return;
    }

    if (this.deSpawnState) {
      const camera = this.scene.cameras.main;

      if (!camera.worldView.contains(this.x, this.y)) {
        this.destroy();
        return;
      }
    }

    if (!this.miniBossMove) {
      this.enemyBody.setVelocity(0, 0);
      return;
    }

    this.movementCheckElapsed += delta;
    this.avoidTimer = Math.max(0, this.avoidTimer - delta);

    if (this.movementCheckElapsed < MOVEMENT_UPDATE_INTERVAL_MS) return;

    this.movementCheckElapsed %= MOVEMENT_UPDATE_INTERVAL_MS;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq < 25) {
      this.enemyBody.setVelocity(0, 0);
      return;
    }

    const inverseDistance = 1 / Math.sqrt(distanceSq);
    let moveX = dx * inverseDistance;
    let moveY = dy * inverseDistance;

    if (this.avoidTimer > 0) {
      moveX += this.avoidX * 2;
      moveY += this.avoidY * 2;
    }

    const obstacleAvoid = this.avoidObstacles();
    moveX += obstacleAvoid.x * 3;
    moveY += obstacleAvoid.y * 3;

    const moveDistanceSq = moveX * moveX + moveY * moveY;
    const MIN_MOVE_THRESHOLD_SQ = 0.2;

    if (moveDistanceSq > MIN_MOVE_THRESHOLD_SQ) {
      const inverseMoveDistance = 1 / Math.sqrt(moveDistanceSq);
      moveX *= inverseMoveDistance;
      moveY *= inverseMoveDistance;
    } else {
      moveX = -dy * inverseDistance;
      moveY = dx * inverseDistance;
    }

    const velocityX = moveX * this.config.speed * this.movementMultiplier;
    const velocityY = moveY * this.config.speed * this.movementMultiplier;

    this.enemyBody.setVelocity(velocityX, velocityY);

    if (velocityX < 0) {
      this.sprite.setFlipX(false);
    } else if (velocityX > 0) {
      this.sprite.setFlipX(true);
    }
  }

  setMove(value: boolean) {
    this.miniBossMove = value;
    if (!value) this.enemyBody.setVelocity(0, 0);
  }

  public setMovementMultiplier(multiplier: number) {
    if (multiplier === this.movementMultiplier) return;

    const previous = this.movementMultiplier;
    this.movementMultiplier = multiplier;

    // Destroyed/dead enemies keep the value but have no body/anims to touch.
    if (!this.scene || this.isDead || !this.sprite?.anims) return;

    // Apply right away instead of waiting for the next movement update.
    if (previous > 0) this.enemyBody?.velocity.scale(multiplier / previous);

    if (multiplier === 0) {
      this.sprite.anims.pause();
    } else if (previous === 0) {
      this.sprite.anims.resume();
    }
  }

  public applyKnockback(dx: number, dy: number, distance: number) {
    if (!this.scene || this.isDead || !this.enemyBody) return;

    const length = Math.hypot(dx, dy) || 1;
    const speed = distance / (KNOCKBACK_DURATION_MS / 1000);

    this.enemyBody.setVelocity((dx / length) * speed, (dy / length) * speed);
    this.knockbackRemainingMs = KNOCKBACK_DURATION_MS;
  }

  public setDamageMultiplier(multiplier: number) {
    this.damageMultiplier = multiplier;
  }

  public handlePlayerContact() {
    if (!this.active || this.isDead) return;
    this.player?.hurt(this.bossType, this.damageMultiplier);
  }

  private updateHurtVisual(delta: number) {
    if (!this.isHurting) return;

    this.hurtFlashRemainingMs = Math.max(0, this.hurtFlashRemainingMs - delta);

    if (this.hurtFlashRemainingMs > 0) return;

    this.sprite.setAlpha(1);
    this.isHurting = false;
  }

  public isHurt() {
    if (this.isHurting || this.isDead) return;

    this.isHurting = true;
    // this.hurtFlashRemainingMs = 120;
    // this.sprite.setAlpha(0.3);
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
      this.setMove(false);
    }
  }

  public onDeath() {
    if (this.deathHandled) return;

    this.deathHandled = true;
    this.playDeathAnimation(() => this.scene.handleBossDefeat(this));
  }
}
