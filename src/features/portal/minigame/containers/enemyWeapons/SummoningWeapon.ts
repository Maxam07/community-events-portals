import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { EnemyType } from "../../Types";
import type { Scene } from "../../Scene";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { MiniBoss } from "../MiniBossContainer";

interface SummonigWeaponProps {
  scene: Scene;
  target: Phaser.GameObjects.Container;
  texture: string;
  warningTexture?: string;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  depth?: number;
  delayMs?: number;
  warningDurationMs?: number;
  durationMs?: number;
  player?: BumpkinContainer;
  enemyType: EnemyType;
}

export class SummoningWeapon extends Phaser.GameObjects.Sprite {
  private target: Phaser.GameObjects.Container;
  private offsetX: number;
  private offsetY: number;

  private delayMs: number;
  private warningDurationMs: number;
  private durationMs: number;

  private elapsedMs = 0;
  private delayElapsedMs = 0;

  public isDead = false;

  private player?: BumpkinContainer;
  private enemyType: EnemyType;

  private isWaitingForNextSpawn = true;
  private phase: "warning" | "summon" | "waiting" = "waiting";
  private weapontexture: string;
  private warningTexture: string;

  constructor({
    scene,
    target,
    texture,
    warningTexture = "tree_stump",
    offsetX = 0,
    offsetY = 0,
    scale,
    depth = 1001,
    delayMs = 3000,
    warningDurationMs = 1000,
    durationMs = 5000,
    player,
    enemyType,
  }: SummonigWeaponProps) {
    super(scene, target.x + offsetX, target.y + offsetY, texture);

    this.target = target;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.delayMs = delayMs;
    this.warningDurationMs = warningDurationMs;
    this.durationMs = durationMs;

    this.player = player;
    this.enemyType = enemyType;
    this.weapontexture = texture;
    this.warningTexture = warningTexture;

    scene.add.existing(this);

    this.setScale(scale);
    this.setDepth(depth);
    this.setOrigin(0.5);

    this.createAnimation();

    this.setVisible(false);
  }

  private createAnimation() {
    const animationKey = `Fire_summon`;

    if (this.scene.anims.exists(animationKey)) return;

    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNumbers(this.weapontexture, {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  public update(delta: number) {
    if (this.isDead) return;

    if (!this.player?.active || !this.target.active) {
      this.destroySelf();
      return;
    }

    // Wait before spawning the warnin
    if (this.isWaitingForNextSpawn) {
      this.delayElapsedMs += delta;

      if (this.delayElapsedMs >= this.delayMs) {
        this.spawnWarning();
      }

      return;
    }

    this.elapsedMs += delta;

    // Warning finished -> turn into fire
    if (this.phase === "warning" && this.elapsedMs >= this.warningDurationMs) {
      this.spawnFire();
      return;
    }

    // Fire duration finished
    if (this.phase === "summon" && this.elapsedMs >= this.durationMs) {
      this.resetToWait();
    }
  }

  /**
   * Spawn the harmless warning at the player's current position.
   */
  private spawnWarning() {
    if (!this.player?.active) {
      this.destroySelf();
      return;
    }
    const gap = 2 * SQUARE_WIDTH;
    this.x = this.player.x;
    this.y = this.player.y + gap;

    this.elapsedMs = 0;
    this.phase = "warning";
    this.isWaitingForNextSpawn = false;

    this.stop();
    this.setTexture(this.warningTexture);
    this.setVisible(true);

    if (this.target instanceof MiniBoss) {
      this.target.playSummonAnimation();
    }
  }

  /**
   * Replace the warning with the damaging fire.
   */
  private spawnFire() {
    this.elapsedMs = 0;
    this.phase = "summon";

    this.setTexture(this.weapontexture);
    this.play("Fire_summon");

    if (this.target instanceof MiniBoss) {
      this.target.playMovementAnimation();
    }
  }

  /**
   * Only Fire can damage the player.
   * Warning does nothing.
   */
  public handlePlayerContact() {
    if (!this.active || this.isDead) return;

    if (this.phase !== "summon") {
      return;
    }

    this.player?.hurt(this.enemyType);
  }

  /**
   * Hide and wait for the next summon.
   */
  private resetToWait() {
    this.elapsedMs = 0;
    this.delayElapsedMs = 0;

    this.phase = "waiting";
    this.isWaitingForNextSpawn = true;

    this.stop();
    this.setVisible(false);
  }

  private destroySelf() {
    if (this.isDead) return;

    this.isDead = true;
    this.destroy();
  }
}
