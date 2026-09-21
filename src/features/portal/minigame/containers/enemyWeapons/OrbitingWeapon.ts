import type { Scene } from "../../Scene";
import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { EnemyType } from "../../Types";

interface OrbitingWeaponProps {
  scene: Scene;
  /** The container this weapon follows, e.g. a MiniBoss instance. */
  target: Phaser.GameObjects.Container;
  /** Texture key for the weapon sprite. */
  texture: string;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  depth?: number;
  /** If true, the weapon continuously circles the target instead of holding a fixed offset. */
  orbit?: boolean;
  /** Distance from the target's center while orbiting. */
  orbitRadius?: number;
  /** Degrees per second the weapon travels around the target. */
  orbitSpeedDegPerSec?: number;
  startAngleDeg?: number;
  player?: BumpkinContainer;
  enemyType: EnemyType;
}

/**
 * A weapon sprite that follows a target container, either at a fixed
 * offset or continuously orbiting around it.
 *
 * Usage:
 *   const weapon = new OrbitingWeapon({
 *     scene: this,
 *     target: miniBoss,
 *     texture: "miniboss_weapon",
 *     orbit: true,
 *     orbitRadius: 32,
 *     orbitSpeedDegPerSec: 180,
 *   });
 *
 *   // In your scene's update loop:
 *   weapon.update(delta);
 */
export class OrbitingWeapon extends Phaser.GameObjects.Sprite {
  private target: Phaser.GameObjects.Container;
  private offsetX: number;
  private offsetY: number;
  private facingLeft = false;
  private orbit: boolean;
  private orbitRadius: number;
  private orbitSpeedDegPerSec: number;
  private orbitAngleDeg = 0;
  public isDead = false;
  private player?: BumpkinContainer;
  private enemyType: EnemyType;

  constructor({
    scene,
    target,
    texture,
    offsetX = 12,
    offsetY = 0,
    scale = 1,
    depth = 1001,
    orbit = false,
    orbitRadius = 32,
    orbitSpeedDegPerSec = 180,
    startAngleDeg = 0,
    player,
    enemyType,
  }: OrbitingWeaponProps) {
    super(scene, target.x + offsetX, target.y + offsetY, texture);

    this.target = target;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.orbit = orbit;
    this.orbitRadius = orbitRadius;
    this.orbitSpeedDegPerSec = orbitSpeedDegPerSec;
    this.orbitAngleDeg = startAngleDeg;
    this.player = player;
    this.enemyType = enemyType;

    scene.add.existing(this);
    this.setScale(scale);
    this.setDepth(depth);
    // Orbit mode positions by the sprite's center; fixed-offset mode pivots
    // near the handle end so it reads naturally as a held item.
    this.setOrigin(this.orbit ? 0.5 : 0, 0.5);

    this.createAnimation();
  }

  private createAnimation() {
    const animationKey = `${this.texture.key}_orbit`;

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

    this.play(`${this.texture.key}_orbit`);
  }

  /**
   * Call every frame (e.g. from the scene's update method) to keep the
   * weapon locked to the target, either at a fixed offset or, in orbit
   * mode, travelling in a circle around it. Pass the frame's delta (ms)
   * so orbit speed stays consistent regardless of frame rate.
   */
  public update(delta: number) {
    if (!this.target.active) {
      this.destroy();
      return;
    }

    if (this.orbit) {
      this.orbitAngleDeg =
        (this.orbitAngleDeg + this.orbitSpeedDegPerSec * (delta / 1000)) % 360;
      const rad = Phaser.Math.DegToRad(this.orbitAngleDeg);
      this.setPosition(
        this.target.x + Math.cos(rad) * this.orbitRadius,
        this.target.y + Math.sin(rad) * this.orbitRadius,
      );
      // Face outward along the orbit path; drop this line if the sprite should stay upright.
      // this.setRotation(rad + Math.PI / 2);
      return;
    }

    const facingLeft = (this.target as any).flipX ?? this.facingLeft;
    if (facingLeft !== this.facingLeft) {
      this.facingLeft = facingLeft;
      this.setFlipX(facingLeft);
    }

    const dirX = this.facingLeft ? -1 : 1;
    this.setPosition(
      this.target.x + this.offsetX * dirX,
      this.target.y + this.offsetY,
    );
  }

  public handlePlayerContact() {
    if (!this.active || this.isDead) return;
    this.player?.hurt(this.enemyType);
  }
}
