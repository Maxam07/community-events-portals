import Phaser from "phaser";
import type { DamagePayload, EnemyLike, WeaponId } from "../../Types";
import {
  FROST_WEAPON_VISUAL_DEPTH,
  getWeaponVisualDepth,
} from "../../constants/DepthConstants";

type OrbitalWeaponSpawnProps = {
  ownerWeaponId: WeaponId;
  texture: string;
  slot: number;
  count: number;
  radius: number;
  angularSpeed: number;
  payload: DamagePayload;
  hitCooldownMs: number;
};

const WEAPON_FROZEN_SKULL_ANIMATION_KEY = "weapon_frozen_skull_active";
const WEAPON_FROST_FLOWER_ANIMATION_KEY = "weapon_frost_flower_active";

export class OrbitalWeapon extends Phaser.Physics.Arcade.Sprite {
  public ownerWeaponId!: WeaponId;
  public payload!: DamagePayload;
  public radius = 0;
  public angularSpeed = 0;
  public hitCooldownMs = 0;
  private baseAngle = 0;
  private readonly hitAt = new Map<EnemyLike, number>();

  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    texture = "weapon_frozen_skull",
  ) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.despawn();
  }

  public spawn({
    ownerWeaponId,
    texture,
    slot,
    count,
    radius,
    angularSpeed,
    payload,
    hitCooldownMs,
  }: OrbitalWeaponSpawnProps) {
    this.setTexture(texture);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(1);
    this.setRotation(0);
    this.ownerWeaponId = ownerWeaponId;
    this.radius = radius;
    this.angularSpeed = angularSpeed;
    this.payload = payload;
    this.hitCooldownMs = hitCooldownMs;
    this.baseAngle = (Math.PI * 2 * slot) / count;
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.width, this.height);
    body.setOffset(0, 0);
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = ownerWeaponId !== "frostFlower";

    if (
      ownerWeaponId === "frozenSkull" &&
      this.scene.anims.exists(WEAPON_FROZEN_SKULL_ANIMATION_KEY)
    ) {
      this.play(WEAPON_FROZEN_SKULL_ANIMATION_KEY, true);
    } else if (
      ownerWeaponId === "frostFlower" &&
      this.scene.anims.exists(WEAPON_FROST_FLOWER_ANIMATION_KEY)
    ) {
      this.play(WEAPON_FROST_FLOWER_ANIMATION_KEY, true);
    } else {
      this.stop();
    }
  }

  public updateOrbit(
    player: Phaser.GameObjects.GameObject & { x: number; y: number },
    time: number,
  ) {
    const angle = this.baseAngle + time * this.angularSpeed;
    const x = player.x + Math.cos(angle) * this.radius;
    const y = player.y + Math.sin(angle) * this.radius;

    this.setPosition(x, y);
    if (this.ownerWeaponId !== "frostFlower") {
      this.setRotation(0);
    } else {
      this.setRotation(this.angularSpeed >= 0 ? angle + Math.PI : angle);
    }
    this.setDepth(
      this.ownerWeaponId === "frozenSkull" ||
        this.ownerWeaponId === "frostFlower"
        ? FROST_WEAPON_VISUAL_DEPTH
        : getWeaponVisualDepth(y),
    );
  }

  public canHit(enemy: EnemyLike, time: number) {
    const lastHitAt = this.hitAt.get(enemy) ?? -Infinity;

    return time - lastHitAt >= this.hitCooldownMs;
  }

  public registerHit(enemy: EnemyLike, time: number) {
    this.hitAt.set(enemy, time);
  }

  public despawn() {
    this.setActive(false);
    this.setVisible(false);
    this.stop();
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }
}
