import type { Scene } from "../../Scene";
import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { EnemyType } from "../../Types";

interface ArenaWeaponProps {
  scene: Scene;
  /** The enemy that owns the arena. The circle lasts until it dies. */
  target: Phaser.GameObjects.Container;
  player: BumpkinContainer;
  enemyType: EnemyType;
  radius?: number;
  playerRadius?: number;
  depth?: number;
  color?: number;
}

export class ArenaWeapon extends Phaser.GameObjects.Sprite {
  private target: Phaser.GameObjects.Container;
  private player: BumpkinContainer;
  private enemyType: EnemyType;
  private ring: Phaser.GameObjects.Graphics;
  private centerX: number;
  private centerY: number;
  private radius: number;
  private playerRadius: number;
  private color: number;
  private ending = false;
  public isDead = false;

  constructor({
    scene,
    target,
    player,
    enemyType,
    radius = 120,
    playerRadius = 8,
    depth = 1000,
    color = 0xff4444,
  }: ArenaWeaponProps) {
    // "__WHITE" is a built-in Phaser texture; the sprite itself is never shown.
    super(scene, target.x, target.y, "__WHITE");

    this.target = target;
    this.player = player;
    this.enemyType = enemyType;
    this.centerX = target.x;
    this.centerY = target.y;
    this.radius = radius;
    this.playerRadius = playerRadius;
    this.color = color;

    scene.add.existing(this);
    this.setVisible(false);

    this.ring = scene.add.graphics();
    this.ring.setDepth(depth);
    this.drawRing();

    // Pull the player to the center as soon as the weapon is created.
    this.player.setPosition(this.centerX, this.centerY);
    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    body?.reset(this.centerX, this.centerY);
  }

  private drawRing() {
    this.ring.clear();
    this.ring.fillStyle(this.color, 0.08);
    this.ring.fillCircle(this.centerX, this.centerY, this.radius);
    this.ring.lineStyle(3, this.color, 1);
    this.ring.strokeCircle(this.centerX, this.centerY, this.radius);
  }

  public update(_delta: number) {
    if (this.ending || this.isDead) return;

    if (!this.target.active) {
      this.end();
      return;
    }

    this.constrainPlayer();
  }

  private constrainPlayer() {
    const maxDist = this.radius - this.playerRadius;
    const dx = this.player.x - this.centerX;
    const dy = this.player.y - this.centerY;
    const dist = Math.hypot(dx, dy);
    if (dist <= maxDist) return;

    const nx = dx / dist;
    const ny = dy / dist;
    this.player.setPosition(
      this.centerX + nx * maxDist,
      this.centerY + ny * maxDist,
    );

    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    if (body) {
      const outward = body.velocity.x * nx + body.velocity.y * ny;
      if (outward > 0) {
        body.velocity.x -= outward * nx;
        body.velocity.y -= outward * ny;
      }
    }
  }

  private end() {
    this.ending = true;
    this.scene.tweens.add({
      targets: this.ring,
      alpha: 0,
      duration: 250,
      onComplete: () => {
        this.isDead = true;
        this.destroy();
      },
    });
  }

  public destroy(fromScene?: boolean) {
    this.ring?.destroy();
    super.destroy(fromScene);
  }

  public handlePlayerContact() {}
}
