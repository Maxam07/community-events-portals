import type { Scene } from "../../Scene";
import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { EnemyType } from "../../Types";
import { StaticRangeEnemy } from "../StaticRangeEnemyContainer";

interface StaticRangeWeaponProps {
  scene: Scene;
  target: Phaser.GameObjects.Container;
  texture: string;
  frame_end: number;
  range: number;
  speed: number;
  cooldownMs: number;
  durationMs: number;
  player: BumpkinContainer;
  enemyType: EnemyType;
}

export class StaticRangeWeapon extends Phaser.GameObjects.Sprite {
  private target: Phaser.GameObjects.Container;
  private player: BumpkinContainer;
  private enemyType: EnemyType;

  private range: number;
  private speed: number;
  private cooldownMs: number;
  private durationMs: number;
  private directionX = 0;
  private directionY = 0;

  private cooldownElapsedMs = 0;
  private elapsedMs = 0;

  private isWaiting = true;

  public isDead = false;

  constructor({
    scene,
    target,
    texture,
    range,
    speed,
    cooldownMs,
    durationMs,
    player,
    enemyType,
  }: StaticRangeWeaponProps) {
    super(scene, target.x, target.y, texture);

    this.target = target;
    this.player = player;
    this.enemyType = enemyType;

    this.range = range;
    this.speed = speed;
    this.cooldownMs = cooldownMs;
    this.durationMs = durationMs;

    scene.add.existing(this);

    this.setOrigin(0.5);
    this.setDepth(1001);

    this.createAnimation();
    this.setVisible(false);
  }

  private createAnimation() {
    const animationKey = `${this.texture.key}_static_range`;

    if (this.scene.anims.exists(animationKey)) return;

    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
        start: 0,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  public update(delta: number) {
    if (this.isDead) return;

    if (!this.player.active || !this.target.active) {
      this.destroySelf();
      return;
    }

    if (this.isWaiting) {
      this.cooldownElapsedMs += delta;

      if (this.cooldownElapsedMs < this.cooldownMs) {
        return;
      }

      if (!this.isPlayerInRange()) {
        return;
      }

      this.shoot();

      return;
    }

    this.elapsedMs += delta;

    if (this.elapsedMs >= this.durationMs) {
      this.resetToTarget();
      return;
    }

    const moveDistance = this.speed * (delta / 1000);

    this.x += this.directionX * moveDistance;
    this.y += this.directionY * moveDistance;
  }

  private isPlayerInRange() {
    const dx = this.player.x - this.target.x;
    const dy = this.player.y - this.target.y;

    return dx * dx + dy * dy <= this.range * this.range;
  }

  private shoot() {
    if (this.target instanceof StaticRangeEnemy) {
      this.target.playAttackAnimation();
    }
    const dx = this.player.x - this.target.x;
    const dy = this.player.y - this.target.y;

    if (dx < 0) {
      this.setFlipX(false);
    } else if (dx > 0) {
      this.setFlipX(true);
    }

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    this.x = this.target.x;
    this.y = this.target.y;

    this.directionX = dx / distance;
    this.directionY = dy / distance;

    this.elapsedMs = 0;
    this.isWaiting = false;

    this.setVisible(true);
    this.play(`${this.texture.key}_static_range`);
  }

  public handlePlayerContact() {
    if (!this.active || this.isDead) return;

    this.player.hurt(this.enemyType);

    this.resetToTarget();
  }

  private resetToTarget() {
    if (!this.target.active) {
      this.destroySelf();
      return;
    }
    if (this.target instanceof StaticRangeEnemy) {
      this.target.playMovementAnimation();
    }

    this.x = this.target.x;
    this.y = this.target.y;

    this.elapsedMs = 0;
    this.cooldownElapsedMs = 0;

    this.isWaiting = true;

    this.setVisible(false);
    this.stop();
  }

  private destroySelf() {
    if (this.isDead) return;

    this.isDead = true;
    this.destroy();
  }
}
