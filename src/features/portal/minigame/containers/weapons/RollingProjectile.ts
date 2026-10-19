import Phaser from "phaser";
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
  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    texture = HORIZONTAL_JACK_O_LANTERN_TEXTURE_KEY,
  ) {
    super(scene, x, y, texture);
  }

  public spawn(props: ProjectileSpawnProps) {
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
