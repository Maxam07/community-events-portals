import Phaser from "phaser";
import type { Scene } from "../../Scene";
import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { EnemyType } from "../../Types";

interface SlashWeaponProps {
  scene: Scene;
  /** The container this weapon follows, e.g. a MiniBoss instance. */
  target: Phaser.GameObjects.Container;
  /** Texture key for the scythe sprite (use the same one as the Bumpkin's). */
  texture: string;
  /** Reach of each swing in pixels. Same meaning as the Bumpkin's scythe range. */
  range: number;
  /** How far the scythe sweeps during one swing, in degrees. */
  arcDegrees: number;
  /** Time between the end of one full sequence and the start of the next. */
  cooldownMs: number;
  /** How long EACH swing lasts. */
  durationMs: number;
  /** Render depth of the scythe sprite. */
  depth?: number;
  /** Multiplies the scythe's visual size (and hit area). */
  scale?: number;
  /** Name of an animation that already exists in the scene (e.g. "weapon_scythe_active"). */
  animationKey?: string;
  /**
   * Alternatively: last frame of the spritesheet (frames 0..frameEnd). A new
   * animation is created and stretched to fit `durationMs`. Ignored if
   * `animationKey` is set.
   */
  frameEnd?: number;
  player?: BumpkinContainer;
  enemyType: EnemyType;
}

/** Clockwise order: right, down, left, up. */
const SLASH_DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
] as const;

// Same look as the Bumpkin's scythe (SlashHitbox).
const SCYTHE_ORIGIN_X = 0.14;
const SCYTHE_ORIGIN_Y = 0.82;
const SCYTHE_ASPECT = 25 / 38; // height / width
const SCYTHE_WIDTH_PER_RANGE = 1.25;
const SCYTHE_FOLLOW_OFFSET = 0.2; // fraction of range, toward the swing side
const SCYTHE_VISUAL_ROTATION_OFFSET = Phaser.Math.DegToRad(90);
// Sweep split matching the Bumpkin's -0.95 → +0.65 rad swing.
const SWEEP_START_RATIO = -0.59;
const SWEEP_END_RATIO = 0.41;

/**
 * An enemy scythe attack that swings four sides one after another
 * (right, down, left, up) like the Bumpkin's scythe. Each swing sweeps the
 * scythe through `arcDegrees`, lasts `durationMs`, follows the owner, and
 * can hurt the player once. The full sequence takes `durationMs * 4`.
 *
 * Call `weapon.update(delta)` every frame, like OrbitingWeapon.
 */
export class SlashWeapon extends Phaser.GameObjects.Sprite {
  private target: Phaser.GameObjects.Container;
  private range: number;
  private arcRadians: number;
  private cooldownMs: number;
  private durationMs: number;
  private visualScale: number;
  private animationKey?: string;
  private ownsAnimation = false;
  private player?: BumpkinContainer;
  private enemyType: EnemyType;

  private cooldownRemainingMs: number;
  private slashRemainingMs = 0;
  private slashIndex = 0;
  private swinging = false;
  private hasHitPlayer = false;
  public isDead = false;

  constructor({
    scene,
    target,
    texture,
    range,
    arcDegrees,
    cooldownMs,
    durationMs,
    depth = 1001,
    scale = 0.7,
    animationKey,
    frameEnd,
    player,
    enemyType,
  }: SlashWeaponProps) {
    super(scene, target.x, target.y, texture);

    this.target = target;
    this.range = range;
    this.arcRadians = Phaser.Math.DegToRad(arcDegrees);
    this.cooldownMs = cooldownMs;
    this.durationMs = durationMs;
    this.visualScale = scale;
    this.player = player;
    this.enemyType = enemyType;
    this.cooldownRemainingMs = cooldownMs;

    scene.add.existing(this);
    this.setDepth(depth);
    this.setOrigin(SCYTHE_ORIGIN_X, SCYTHE_ORIGIN_Y);
    this.setActive(true);
    this.setVisible(false);

    this.createAnimation();
  }

  private createAnimation() {
    const animationKey = `${this.texture.key}_slash`;

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

  /** Call every frame with the frame delta in ms. */
  public update(delta: number) {
    if (this.isDead) return;

    if (!this.target.active) {
      this.destroy();
      return;
    }

    if (!this.swinging) {
      this.cooldownRemainingMs -= delta;
      if (this.cooldownRemainingMs <= 0) this.startSequence();
      return;
    }

    this.slashRemainingMs -= delta;
    this.applySwingPose();

    if (!this.hasHitPlayer && this.isPlayerInsideScythe()) {
      this.hasHitPlayer = true;
      this.handlePlayerContact();
    }

    if (this.slashRemainingMs <= 0) this.advanceSlash();
  }

  public handlePlayerContact() {
    if (!this.active || this.isDead) return;
    this.player?.hurt(this.enemyType);
  }

  private startSequence() {
    this.swinging = true;
    this.slashIndex = 0;
    this.startSlash();
  }

  private startSlash() {
    const width = this.range * SCYTHE_WIDTH_PER_RANGE * this.visualScale;

    this.hasHitPlayer = false;
    this.slashRemainingMs = this.durationMs;

    this.setDisplaySize(width, width * SCYTHE_ASPECT);
    this.setAlpha(1);
    this.setVisible(true);
    this.applySwingPose();
    this.play(`${this.texture.key}_slash`);
  }

  private advanceSlash() {
    this.slashIndex += 1;

    if (this.slashIndex >= SLASH_DIRECTIONS.length) {
      this.endSequence();
      return;
    }

    this.startSlash();
  }

  private endSequence() {
    this.swinging = false;
    this.cooldownRemainingMs = this.cooldownMs;
    this.stop();
    this.setVisible(false);
  }

  /** Positions the scythe next to the owner and rotates it along the sweep. */
  private applySwingPose() {
    const dir = SLASH_DIRECTIONS[this.slashIndex];
    const progress = Phaser.Math.Clamp(
      1 - this.slashRemainingMs / this.durationMs,
      0,
      1,
    );
    const eased = Phaser.Math.Easing.Quadratic.Out(progress);
    const baseRotation = Math.atan2(dir.y, dir.x);
    const start = baseRotation + this.arcRadians * SWEEP_START_RATIO;
    const end = baseRotation + this.arcRadians * SWEEP_END_RATIO;

    this.setPosition(
      this.target.x + dir.x * this.range * SCYTHE_FOLLOW_OFFSET,
      this.target.y + dir.y * this.range * SCYTHE_FOLLOW_OFFSET,
    );
    this.setRotation(
      start + (end - start) * eased + SCYTHE_VISUAL_ROTATION_OFFSET,
    );
  }

  /** Rotated-rectangle test against the scythe's current pose. */
  private isPlayerInsideScythe() {
    if (!this.player) return false;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;
    const left = -this.originX * this.displayWidth;
    const right = (1 - this.originX) * this.displayWidth;
    const top = -this.originY * this.displayHeight;
    const bottom = (1 - this.originY) * this.displayHeight;

    return (
      localX >= left && localX <= right && localY >= top && localY <= bottom
    );
  }

  public destroy(fromScene?: boolean) {
    this.isDead = true;
    super.destroy(fromScene);
  }
}
