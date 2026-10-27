interface Props {
  x: number;
  y: number;
  scene: Phaser.Scene;
  size?: number;
}

export class HitIndicator extends Phaser.GameObjects.Container {
  private image?: Phaser.GameObjects.Image;
  private tween?: Phaser.Tweens.Tween;
  private timer?: Phaser.Time.TimerEvent;
  private size: number;

  constructor({ x, y, scene, size = 14 }: Props) {
    super(scene, x, y);
    this.size = size;
    this.setVisible(false);
  }

  show(textureKey: string, frame?: string | number) {
    if (!this.scene || !this.scene.textures.exists(textureKey)) return;

    const RISE_PX = 8;
    const HOLD_MS = 300;
    const FADE_MS = 400;
    const DESTROY_MS = 4000;

    if (!this.image) {
      this.image = this.scene.add.image(0, 0, textureKey, frame);
      this.add(this.image);
    } else {
      this.image.setTexture(textureKey, frame);
    }

    // Restart cleanly if hit again mid-animation
    this.tween?.remove();
    this.timer?.remove(false);

    this.setVisible(true);
    this.image
      .setDisplaySize(this.size, this.size)
      .setPosition(0, 0)
      .setAlpha(1);

    this.tween = this.scene.tweens.add({
      targets: this.image,
      y: -RISE_PX,
      alpha: 0,
      delay: HOLD_MS,
      duration: FADE_MS,
      ease: "Sine.easeOut",
      onComplete: () => this.setVisible(false),
    });

    // Destroy 2 seconds after the most recent hit
    this.timer = this.scene.time.delayedCall(DESTROY_MS, () => this.destroy());
  }

  destroy(fromScene?: boolean) {
    this.tween?.remove();
    this.tween = undefined;
    this.timer?.remove(false);
    this.timer = undefined;
    super.destroy(fromScene);
  }
}
