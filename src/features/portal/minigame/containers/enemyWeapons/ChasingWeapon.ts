import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { EnemyType } from "../../Types";
import type { Scene } from "../../Scene";

interface ChasingWeaponProps {
  scene: Scene;
  /** The container this weapon spawns from, e.g. a MiniBoss instance. */
  target: Phaser.GameObjects.Container;
  /** Texture key for the weapon sprite. */
  texture: string;
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
    super(scene, target.x + offsetX, target.y + offsetY, texture);

    this.target = target;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
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
    const animationKey = `${this.texture.key}_chase`;

    if (this.scene.anims.exists(animationKey)) return;

    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });
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

      if (this.delayElapsedMs >= this.chaseDelayMs) {
        this.isWaitingForNextChase = false;
        this.elapsedMs = 0;
        this.setVisible(true);
        this.play(`${this.texture.key}_chase`);
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

    this.player?.hurt(this.enemyType);

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

    this.x = this.target.x;
    this.y = this.target.y;

    this.elapsedMs = 0;
    this.delayElapsedMs = 0;
    this.setVisible(false);

    this.isWaitingForNextChase = true;

    // this.setRotation(0);
  }

  private destroySelf() {
    if (this.isDead) return;

    this.isDead = true;
    this.destroy();
  }
}
