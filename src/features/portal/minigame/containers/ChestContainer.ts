import type { Scene } from "../Scene";
import type { BumpkinContainer } from "../Core/BumpkinContainer";
import type { ChestRarity } from "../Types";
import { CHEST_VISUALS, CHEST_OPEN_SFX_KEY } from "../constants";
import { WeaponSfxLimiter } from "../lib/combat/WeaponSfxLimiter";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  rarity: ChestRarity;
}

// Placeholder timing used when the real open animation hasn't been loaded
// yet (see CHEST_VISUALS in ChestConstants.ts) - keeps the "wait for the
// animation, then offer the upgrades" flow working end-to-end even before
// final art/animation lands.
const PLACEHOLDER_OPEN_ANIMATION_MS = 600;
const TOUCH_RANGE = 24;
const TOUCH_CHECK_INTERVAL_MS = 100;

export class Chest extends Phaser.GameObjects.Sprite {
  scene: Scene;
  private player?: BumpkinContainer;
  private readonly rarity: ChestRarity;

  private readonly touchRangeSq = TOUCH_RANGE * TOUCH_RANGE;
  private touchCheckElapsed = Phaser.Math.Between(0, TOUCH_CHECK_INTERVAL_MS);
  private isOpening = false;

  constructor({ scene, x, y, player, rarity }: Props) {
    const { textureKey } = CHEST_VISUALS[rarity];
    super(scene, x, y, textureKey);

    this.scene = scene;
    this.player = player;
    this.rarity = rarity;

    scene.add.existing(this);
    this.setDepth(100000);
    this.playIdleAnimation();
  }

  private playIdleAnimation() {
    const { idleAnimationKey } = CHEST_VISUALS[this.rarity];

    // Guarded: the placeholder animation key may not have any frames
    // registered yet. Once real art/animation is loaded under this key,
    // this starts playing it automatically - no other code needs to change.
    if (this.scene.anims.exists(idleAnimationKey)) {
      this.play(idleAnimationKey);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (!this.active || this.isOpening) return;
    if (this.scene.portalService?.state.context.isGameplayPaused) return;

    this.touchCheckElapsed += delta;
    if (this.touchCheckElapsed < TOUCH_CHECK_INTERVAL_MS) return;

    this.touchCheckElapsed %= TOUCH_CHECK_INTERVAL_MS;
    this.checkPlayerTouch();
  }

  private checkPlayerTouch() {
    if (!this.player || !this.active || this.isOpening) return;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= this.touchRangeSq) {
      this.open();
    }
  }

  private open() {
    if (this.isOpening) return;

    this.isOpening = true;

    const { openAnimationKey } = CHEST_VISUALS[this.rarity];

    if (this.scene.anims.exists(openAnimationKey)) {
      this.play(openAnimationKey);
      this.once(
        `animationcomplete-${openAnimationKey}`,
        this.onOpenAnimationComplete,
        this,
      );
      return;
    }

    // No animation loaded yet - fall back to a fixed placeholder delay so
    // the "touch it, watch it open, then get the upgrade offer" flow still
    // works before real art/animation exists.
    this.scene.time.delayedCall(
      PLACEHOLDER_OPEN_ANIMATION_MS,
      this.onOpenAnimationComplete,
      undefined,
      this,
    );
  }

  private onOpenAnimationComplete() {
    if (!this.active) return;

    WeaponSfxLimiter.play(this.scene, CHEST_OPEN_SFX_KEY, 0.5);
    this.scene.portalService?.send("CHEST_OPENED", { rarity: this.rarity });
    this.destroy();
  }
}
