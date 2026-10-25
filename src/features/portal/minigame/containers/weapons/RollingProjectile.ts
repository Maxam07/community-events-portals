import Phaser from "phaser";
import type { EnemyLike } from "../../Types";
import { Projectile, type ProjectileSpawnProps } from "./Projectile";

const HORIZONTAL_JACK_O_LANTERN_TEXTURE_KEY =
  "weapon_banished_jack_o_lantern_horizontal";
const VERTICAL_JACK_O_LANTERN_TEXTURE_KEY =
  "weapon_banished_jack_o_lantern_vertical";
const DIAGONAL_JACK_O_LANTERN_TEXTURE_KEY =
  "weapon_banished_jack_o_lantern_diagonal";
const HORIZONTAL_JACK_O_LANTERN_ANIMATION_KEY =
  "weapon_banished_jack_o_lantern_horizontal_active";
const VERTICAL_JACK_O_LANTERN_ANIMATION_KEY =
  "weapon_banished_jack_o_lantern_vertical_active";
const DIAGONAL_JACK_O_LANTERN_ANIMATION_KEY =
  "weapon_banished_jack_o_lantern_diagonal_active";
const DIAGONAL_JACK_O_LANTERN_REVERSE_ANIMATION_KEY =
  "weapon_banished_jack_o_lantern_diagonal_active_reverse";

type JackOLanternPresentation = {
  texture: string;
  animationKey: string;
  flipX: boolean;
  flipY: boolean;
};

export class RollingProjectile extends Projectile {
  // Unlike other projectiles, a rolling one can hit the same enemy again after
  // `repeatHitCooldownMs`. The cooldown is a fixed base value (the time the
  // smallest pumpkin takes to cross a regular enemy), so how many extra hits an
  // enemy takes depends on how long the pumpkin overlaps it: big enemies and
  // big pumpkins (weapon size) overlap for longer and get hit more times.
  private readonly lastHitAt = new Map<EnemyLike, number>();
  private repeatHitCooldownMs = 0;

  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    texture = HORIZONTAL_JACK_O_LANTERN_TEXTURE_KEY,
  ) {
    super(scene, x, y, texture);
  }

  public setRepeatHitCooldown(cooldownMs: number) {
    this.repeatHitCooldownMs = Math.max(0, cooldownMs);
  }

  // True when this pumpkin already hit `enemy` at least once.
  public hasHit(enemy: EnemyLike) {
    return this.lastHitAt.has(enemy);
  }

  public canHit(enemy: EnemyLike) {
    const lastHitAt = this.lastHitAt.get(enemy);
    if (lastHitAt === undefined) return true;

    return this.scene.time.now - lastHitAt >= this.repeatHitCooldownMs;
  }

  public registerHit(enemy: EnemyLike, time: number) {
    this.lastHitAt.set(enemy, time);
  }

  public spawn(props: ProjectileSpawnProps) {
    this.lastHitAt?.clear();
    const presentation = this.getJackOLanternPresentation(props.velocity);

    super.spawn({
      ...props,
      texture: presentation.texture,
      animationKey: presentation.animationKey,
      flipX: presentation.flipX,
      flipY: presentation.flipY,
    });
    this.setAngularVelocity(0);
  }

  public despawn() {
    this.lastHitAt?.clear();
    this.setAngularVelocity(0);
    super.despawn();
  }

  private getJackOLanternPresentation({
    x,
    y,
  }: ProjectileSpawnProps["velocity"]): JackOLanternPresentation {
    const angle = Phaser.Math.Angle.Wrap(Math.atan2(y, x));
    const octant = Phaser.Math.Wrap(Math.round(angle / (Math.PI / 4)), 0, 8);

    switch (octant) {
      case 0:
        return {
          texture: HORIZONTAL_JACK_O_LANTERN_TEXTURE_KEY,
          animationKey: HORIZONTAL_JACK_O_LANTERN_ANIMATION_KEY,
          flipX: true,
          flipY: false,
        };
      case 1:
        return {
          texture: DIAGONAL_JACK_O_LANTERN_TEXTURE_KEY,
          animationKey: DIAGONAL_JACK_O_LANTERN_ANIMATION_KEY,
          flipX: true,
          flipY: false,
        };
      case 2:
        return {
          texture: VERTICAL_JACK_O_LANTERN_TEXTURE_KEY,
          animationKey: VERTICAL_JACK_O_LANTERN_ANIMATION_KEY,
          flipX: false,
          flipY: false,
        };
      case 3:
        return {
          texture: DIAGONAL_JACK_O_LANTERN_TEXTURE_KEY,
          animationKey: DIAGONAL_JACK_O_LANTERN_ANIMATION_KEY,
          flipX: false,
          flipY: false,
        };
      case 4:
        return {
          texture: HORIZONTAL_JACK_O_LANTERN_TEXTURE_KEY,
          animationKey: HORIZONTAL_JACK_O_LANTERN_ANIMATION_KEY,
          flipX: false,
          flipY: false,
        };
      case 5:
        return {
          texture: DIAGONAL_JACK_O_LANTERN_TEXTURE_KEY,
          animationKey: DIAGONAL_JACK_O_LANTERN_REVERSE_ANIMATION_KEY,
          flipX: true,
          flipY: false,
        };
      case 6:
        return {
          texture: VERTICAL_JACK_O_LANTERN_TEXTURE_KEY,
          animationKey: VERTICAL_JACK_O_LANTERN_ANIMATION_KEY,
          flipX: false,
          flipY: true,
        };
      case 7:
      default:
        return {
          texture: DIAGONAL_JACK_O_LANTERN_TEXTURE_KEY,
          animationKey: DIAGONAL_JACK_O_LANTERN_REVERSE_ANIMATION_KEY,
          flipX: false,
          flipY: false,
        };
    }
  }
}
