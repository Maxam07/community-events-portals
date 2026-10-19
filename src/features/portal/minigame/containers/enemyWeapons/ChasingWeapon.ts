import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { EnemyType } from "../../Types";
import type { Scene } from "../../Scene";
import { MiniBoss } from "../MiniBossContainer";
import { getOwnerDamageMultiplier } from "../../lib/combat/damageMultiplier";

interface ChasingWeaponProps {
  scene: Scene;
  /** The container this weapon spawns from, e.g. a MiniBoss instance. */
  target: Phaser.GameObjects.Container;
  /** Texture key for the weapon sprite. */
  texture: string[];
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  depth?: number;
  chaseDelayMs?: number;
  /** Pixels per second while homing in on the player. */
  chaseSpeed?: number;
  /** How long (ms) the weapon chases before self-destructing if it never hits the player. */
  chaseDurationMs?: number;
  player?: BumpkinContainer;
  enemyType: EnemyType;
}

/**
 * A single-use weapon sprite that spawns at its target's position and
 * homes in on the player. It destroys itself as soon as either:
 *   - it hits the player, or
 *   - `chaseDurationMs` elapses without a hit
 * whichever comes first.
 *
 * Usage:
 *   const weapon = new ChasingWeapon({
 *     scene: this,
 *     target: miniBoss,
 *     texture: "blueOrb",
 *     chaseSpeed: 20,
 *     chaseDurationMs: 5_000,
 *     player: this.currentPlayer,
 *     enemyType: miniBossType,
 *   });
 *
 *   // In your scene's update loop:
 *   weapon.update(delta);
 */
export class ChasingWeapon extends Phaser.GameObjects.Sprite {
  private target: Phaser.GameObjects.Container;
  private offsetX: number;
  private offsetY: number;
  private chaseSpeed: number;
  private chaseDurationMs: number;
  private elapsedMs = 0;
  public isDead = false;
  private player?: BumpkinContainer;
  private enemyType: EnemyType;
  private chaseDelayMs: number;
  private delayElapsedMs = 0;
  private isWaitingForNextChase = true;
  private texturePool: string[];

  constructor({
    scene,
    target,
    texture,
    offsetX = 20,
    offsetY = 20,
    scale = 1,
    depth = 1001,
    chaseDelayMs = 2000,
    chaseSpeed = 400,
    chaseDurationMs = 5000,
    player,
    enemyType,
  }: ChasingWeaponProps) {
    const randomTexture = Phaser.Utils.Array.GetRandom(texture);

    super(scene, target.x + offsetX, target.y + offsetY, randomTexture);

    this.texturePool = texture;
    this.target = target;
    this.offsetX = -offsetX / 2;
    this.offsetY = -offsetY / 2;
    this.chaseDelayMs = chaseDelayMs;
    this.chaseSpeed = chaseSpeed;
    this.chaseDurationMs = chaseDurationMs;
    this.player = player;
    this.enemyType = enemyType;

    scene.add.existing(this);
    this.setScale(scale);
    this.setDepth(depth);
    this.setOrigin(0.5);
    this.createAnimation();
    this.setVisible(false);
  }

  private createAnimation() {
    const key = this.texture.key;
    const animationKey = `${key}_chase`;

    // Regular image: no animation needed
    if (this.texture.frameTotal <= 1) return;
    if (this.scene.anims.exists(animationKey)) return;

    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNumbers(key, {}), // all frames
      frameRate: 10,
      repeat: -1,
    });
  }

  private randomizeTexture() {
    if (this.texturePool.length < 2) return;

    const options = this.texturePool.filter((t) => t !== this.texture.key);
    const next = Phaser.Utils.Array.GetRandom(options);

    this.anims.stop();
    this.setTexture(next);
    this.createAnimation();
  }

  public update(delta: number) {
    if (this.isDead) return;

    if (!this.player?.active || !this.target.active) {
      this.destroySelf();
      return;
    }

    // Wait before starting the next chase
    if (this.isWaitingForNextChase) {
      this.delayElapsedMs += delta;

      this.x = this.target.x + this.offsetX;
      this.y = this.target.y + this.offsetY;

      if (this.delayElapsedMs >= this.chaseDelayMs) {
        this.isWaitingForNextChase = false;
        this.elapsedMs = 0;
        this.setVisible(true);

        if (this.target instanceof MiniBoss) {
          this.target.playAttackAnimation();
        }

        const animationKey = `${this.texture.key}_chase`;

        if (this.scene.anims.exists(animationKey)) {
          this.play(animationKey);
        }
      }

      return;
    }

    this.elapsedMs += delta;

    // Time expired -> restart from enemy
    if (this.elapsedMs >= this.chaseDurationMs) {
      this.resetToTarget();
      return;
    }

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const flipAssets = ["skeleton"];
    if (flipAssets.includes(this.texture.key)) {
      this.setFlipX(false);
    } else if (dx < 0) {
      this.setFlipX(true);
    } else if (dx > 0) {
      this.setFlipX(false);
    }

    if (dist > 1) {
      const moveDist = this.chaseSpeed * (delta / 1000);
      const step = Math.min(moveDist, dist);

      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;

      // this.setRotation(Math.atan2(dy, dx));
    }
  }

  /**
   * Call this from your overlap/collision callback.
   * Hurts the player, then restarts the projectile
   * from the enemy's position.
   */
  public handlePlayerContact() {
    if (!this.active || this.isDead) return;

    this.player?.hurt(this.enemyType, getOwnerDamageMultiplier(this.target));

    this.resetToTarget();
  }

  /**
   * Reset the projectile back to the enemy and
   * start the chase timer again.
   */
  private resetToTarget() {
    if (!this.target.active) {
      this.destroySelf();
      return;
    }

    if (this.target instanceof MiniBoss) {
      this.target.playMovementAnimation();
    }

    this.x = this.target.x + this.offsetX;
    this.y = this.target.y + this.offsetY;

    this.elapsedMs = 0;
    this.delayElapsedMs = 0;
    this.setVisible(false);
    this.randomizeTexture();

    this.isWaitingForNextChase = true;

    // this.setRotation(0);
  }

  private destroySelf() {
    if (this.isDead) return;

    this.isDead = true;
    this.destroy();
  }
}
