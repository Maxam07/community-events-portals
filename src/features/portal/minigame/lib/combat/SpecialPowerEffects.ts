import type Phaser from "phaser";
import { getCategoryTint } from "../../constants";
import { CATEGORY_EFFECT_VISUAL_DEPTH } from "../../constants/DepthConstants";
import type {
  EnemyLike,
  SpecialPower,
  StatusEffectId,
  WeaponCategoryId,
} from "../../Types";

// Placeholder textures until the Special Power art lands. Register real
// assets under the same keys in Scene.preload() to replace them.
const POWER_PLAGUE_PARTICLE_KEY = "power_plague_particle";
const POWER_BLOOD_PARTICLE_KEY = "power_blood_particle";
const POWER_FROST_ICE_KEY = "power_frost_ground";
const POWER_ACTIVE_RING_KEY = "power_active_ring";

const PARTICLE_DEPTH = 9000;
const GROUND_MARK_OFFSET_Y = 6;
const HYBRID_RING_SWAP_MS = 300;
const FROST_GROUND_KEY = POWER_FROST_ICE_KEY;
const FROST_GROUND_ANIMATION_KEY = "power_frost_ground_active";
const FROST_GROUND_FRAME_WIDTH = 32;
const FROST_GROUND_ORIGIN_Y = 0.75;
const BLEED_KEY = "bleed_effect";
const BLEED_ANIMATION_KEY = "bleed_effect_active";
const BLEED_FRAME_WIDTH = 16;
const BLEED_FRAME_HEIGHT = 16;

type StatusOverlayConfig = {
  textureKey: string;
  animationKey: string;
  frameWidth: number;
  frameHeight: number;
  fitWidth: boolean;
  anchor: "center" | "head";
};

type StatusOverlayEffectId = Extract<
  StatusEffectId,
  "bleed" | "plaguePoison" | "curseWeakness"
>;

const STATUS_OVERLAYS: Record<StatusOverlayEffectId, StatusOverlayConfig> = {
  bleed: {
    textureKey: "crimson_vial_effect",
    animationKey: "crimson_vial_effect_active",
    frameWidth: 16,
    frameHeight: 32,
    fitWidth: false,
    anchor: "center",
  },
  plaguePoison: {
    textureKey: "poison_effect",
    animationKey: "poison_effect_active",
    frameWidth: 16,
    frameHeight: 16,
    fitWidth: true,
    anchor: "center",
  },
  curseWeakness: {
    textureKey: "weakness_effect",
    animationKey: "weakness_effect_active",
    frameWidth: 16,
    frameHeight: 16,
    fitWidth: true,
    anchor: "head",
  },
};

const isStatusOverlayEffect = (
  effectId: StatusEffectId,
): effectId is StatusOverlayEffectId => effectId in STATUS_OVERLAYS;

type HitEffectConfig = {
  textureKey: string;
  animationKey: string;
  depth?: number;
};

const CATEGORY_HIT_EFFECTS: Partial<Record<WeaponCategoryId, HitEffectConfig>> =
  {
    frost: {
      textureKey: "frost_hit_effect",
      animationKey: "frost_hit_effect_active",
    },
    bloodyHarvest: {
      textureKey: "bloody_hit_effect",
      animationKey: "bloody_hit_effect_active",
      depth: CATEGORY_EFFECT_VISUAL_DEPTH,
    },
  };

type GroundMarkEffectId = Extract<StatusEffectId, "frostSlow">;

const GROUND_MARK_TEXTURES: Record<GroundMarkEffectId, string> = {
  frostSlow: POWER_FROST_ICE_KEY,
};

const isGroundMarkEffect = (
  effectId: StatusEffectId,
): effectId is GroundMarkEffectId => effectId in GROUND_MARK_TEXTURES;

type SpecialPowerEffectsProps = {
  scene: Phaser.Scene;
  player: Phaser.GameObjects.GameObject & {
    x: number;
    y: number;
    depth?: number;
  };
};

export class SpecialPowerEffects {
  private readonly plagueEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly bloodEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly ring: Phaser.GameObjects.Image;
  private readonly groundMarks = new Map<
    GroundMarkEffectId,
    Map<EnemyLike, Phaser.GameObjects.Sprite>
  >([["frostSlow", new Map()]]);
  private readonly groundMarkPool = new Map<
    GroundMarkEffectId,
    Phaser.GameObjects.Sprite[]
  >([["frostSlow", []]]);
  private readonly effectSpritePool = new Map<
    string,
    Phaser.GameObjects.Sprite[]
  >();
  private readonly statusOverlays = new Map<
    StatusOverlayEffectId,
    Map<EnemyLike, Phaser.GameObjects.Sprite>
  >([
    ["bleed", new Map()],
    ["plaguePoison", new Map()],
    ["curseWeakness", new Map()],
  ]);
  private readonly statusOverlayPool = new Map<
    StatusOverlayEffectId,
    Phaser.GameObjects.Sprite[]
  >([
    ["bleed", []],
    ["plaguePoison", []],
    ["curseWeakness", []],
  ]);
  private ringCategories: WeaponCategoryId[] = [];
  private isShutDown = false;

  constructor(private readonly props: SpecialPowerEffectsProps) {
    this.createFallbackTextures();

    const { scene } = props;

    this.plagueEmitter = scene.add
      .particles(0, 0, POWER_PLAGUE_PARTICLE_KEY, {
        lifespan: 450,
        speed: { min: 12, max: 30 },
        angle: { min: 200, max: 340 },
        scale: { start: 1, end: 0.3 },
        alpha: { start: 1, end: 0 },
        gravityY: -20,
        emitting: false,
      })
      .setDepth(PARTICLE_DEPTH);

    this.bloodEmitter = scene.add
      .particles(0, 0, POWER_BLOOD_PARTICLE_KEY, {
        lifespan: 500,
        speed: { min: 18, max: 40 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0.2 },
        alpha: { start: 1, end: 0 },
        gravityY: 60,
        emitting: false,
      })
      .setDepth(PARTICLE_DEPTH);

    this.ring = scene.add
      .image(props.player.x, props.player.y, POWER_ACTIVE_RING_KEY)
      .setAlpha(0.85)
      .setVisible(false);
  }

  public setActivePower(power: SpecialPower | null) {
    if (this.isShutDown) return;

    this.ringCategories = power?.categories ?? [];
    this.ring.setVisible(this.ringCategories.length > 0);

    if (this.ringCategories.length > 0) {
      this.ring.setTint(getCategoryTint(this.ringCategories[0]));
    }
  }

  // Green poison sparks on every damage-over-time tick.
  public playPoisonTick(enemy: EnemyLike) {
    if (this.isShutDown) return;

    this.plagueEmitter.explode(4, enemy.x, enemy.y - 4);
  }

  // Red blood particles on every lifesteal hit.
  public playLifesteal(enemy: EnemyLike) {
    if (this.isShutDown) return;

    this.bloodEmitter.explode(5, enemy.x, enemy.y - 4);
    this.playBleedEffect(enemy);
  }

  // Single play of the bleed animation over the middle of a killed enemy,
  // scaled to fit its sprite. Read synchronously: the enemy is destroyed next.
  private playBleedEffect(enemy: EnemyLike) {
    const { width, height, bottom } = this.getEnemyFootprint(enemy);
    const scale = Math.min(
      width / BLEED_FRAME_WIDTH,
      height / BLEED_FRAME_HEIGHT,
    );

    this.playEffectSprite(
      BLEED_KEY,
      BLEED_ANIMATION_KEY,
      enemy.x,
      bottom - height / 2,
      CATEGORY_EFFECT_VISUAL_DEPTH,
      scale,
    );
  }

  // Single play of the category hit animation at the middle of the enemy.
  public playHitEffect(enemy: EnemyLike, category: WeaponCategoryId) {
    const config = CATEGORY_HIT_EFFECTS[category];
    if (!config) return;

    const enemyDepth = (enemy as unknown as { depth?: number }).depth ?? 0;

    this.playEffectSprite(
      config.textureKey,
      config.animationKey,
      enemy.x,
      enemy.y,
      config.depth ?? enemyDepth + 1,
    );
  }

  private playEffectSprite(
    textureKey: string,
    animationKey: string,
    x: number,
    y: number,
    depth: number,
    scale = 1,
  ) {
    const { scene } = this.props;
    if (
      this.isShutDown ||
      !scene.textures.exists(textureKey) ||
      !scene.anims.exists(animationKey)
    ) {
      return;
    }

    let pool = this.effectSpritePool.get(textureKey);
    if (!pool) {
      pool = [];
      this.effectSpritePool.set(textureKey, pool);
    }

    const effect = pool.pop() ?? scene.add.sprite(0, 0, textureKey);
    const spritePool = pool;

    effect
      .setActive(true)
      .setVisible(true)
      .setScale(scale)
      .setPosition(x, y)
      .setDepth(depth);
    effect.once("animationcomplete", () => {
      effect.setActive(false).setVisible(false);
      spritePool.push(effect);
    });
    effect.play(animationKey);
  }

  // "+N ❤" rising over the player when stolen HP is applied. Mirrors
  // BumpkinContainer.playHeartFall (damage taken).
  public playHeartGain(amount: number) {
    const { scene, player } = this.props;
    if (this.isShutDown || !scene.textures.exists("heart")) return;

    const container = scene.add
      .container(player.x, player.y - 18)
      .setDepth((player.depth ?? player.y) + 1);
    const healText = scene.add
      .text(0, 0, `+${Math.round(amount * 10) / 10}`, {
        fontSize: "5px",
        fontFamily: "Teeny",
        color: "#FFFFFF",
        resolution: 10,
        padding: { x: 2, y: 2 },
      })
      .setOrigin(0, 0.5);
    healText.setShadow(4, 4, "#161424", 0, true, true);
    const heart = scene.add.sprite(0, 0, "heart").setScale(0.8);

    const totalWidth = healText.displayWidth + heart.displayWidth;
    const textX = -totalWidth / 2;

    healText.setPosition(textX, 0);
    heart.setPosition(
      textX + healText.displayWidth + heart.displayWidth / 2,
      0,
    );
    container.add([healText, heart]);

    scene.tweens.add({
      targets: container,
      y: container.y - 14,
      alpha: 0,
      duration: 700,
      ease: "Sine.easeOut",
      onComplete: () => {
        if (container.active) container.destroy(true);
      },
    });
  }

  private showStatusOverlay(enemy: EnemyLike, effectId: StatusOverlayEffectId) {
    const { scene } = this.props;
    const config = STATUS_OVERLAYS[effectId];
    const overlays = this.statusOverlays.get(effectId);
    if (
      !overlays ||
      overlays.has(enemy) ||
      !scene.textures.exists(config.textureKey)
    ) {
      return;
    }

    const overlay =
      this.statusOverlayPool.get(effectId)?.pop() ??
      scene.add.sprite(0, 0, config.textureKey);

    overlay.setActive(true).setVisible(true);
    if (scene.anims.exists(config.animationKey)) {
      overlay.play(config.animationKey, true);
    }
    overlays.set(enemy, overlay);
    this.positionStatusOverlay(enemy, overlay, config);
  }

  private hideStatusOverlay(enemy: EnemyLike, effectId: StatusOverlayEffectId) {
    const overlays = this.statusOverlays.get(effectId);
    const overlay = overlays?.get(enemy);
    if (!overlays || !overlay) return;

    overlays.delete(enemy);
    this.releaseStatusOverlay(effectId, overlay);
  }

  private releaseStatusOverlay(
    effectId: StatusOverlayEffectId,
    overlay: Phaser.GameObjects.Sprite,
  ) {
    overlay.setActive(false).setVisible(false);
    this.statusOverlayPool.get(effectId)?.push(overlay);
  }

  private positionStatusOverlay(
    enemy: EnemyLike,
    overlay: Phaser.GameObjects.Sprite,
    config: StatusOverlayConfig,
  ) {
    const enemyDepth = (enemy as unknown as { depth?: number }).depth ?? 0;
    const { width, height, bottom } = this.getEnemyFootprint(enemy);
    const heightScale = height / config.frameHeight;
    const scale = config.fitWidth
      ? Math.min(heightScale, width / config.frameWidth)
      : heightScale;

    const isHead = config.anchor === "head";

    overlay
      .setOrigin(0.5, isHead ? 1 : 0.5)
      .setScale(scale)
      .setPosition(enemy.x, isHead ? bottom - height : bottom - height / 2)
      .setDepth(enemyDepth + 1);
  }

  public showStatus(enemy: EnemyLike, effectId: StatusEffectId) {
    if (this.isShutDown) return;

    if (isStatusOverlayEffect(effectId)) {
      this.showStatusOverlay(enemy, effectId);
      return;
    }

    if (!isGroundMarkEffect(effectId)) return;

    const marks = this.groundMarks.get(effectId);
    if (!marks || marks.has(enemy)) return;

    const pooled = this.groundMarkPool.get(effectId)?.pop();
    const mark =
      pooled ??
      this.props.scene.add.sprite(0, 0, GROUND_MARK_TEXTURES[effectId]);

    mark.setActive(true).setVisible(true).setAlpha(0.9);
    if (
      effectId === "frostSlow" &&
      this.props.scene.anims.exists(FROST_GROUND_ANIMATION_KEY)
    ) {
      mark.play(FROST_GROUND_ANIMATION_KEY, true);
    }
    marks.set(enemy, mark);
    this.positionGroundMark(enemy, mark);
  }

  public hideStatus(enemy: EnemyLike, effectId: StatusEffectId) {
    if (isStatusOverlayEffect(effectId)) {
      this.hideStatusOverlay(enemy, effectId);
      return;
    }

    if (!isGroundMarkEffect(effectId)) return;

    const marks = this.groundMarks.get(effectId);
    const mark = marks?.get(enemy);
    if (!marks || !mark) return;

    marks.delete(enemy);
    this.releaseGroundMark(effectId, mark);
  }

  public update(time: number) {
    if (this.isShutDown) return;

    this.groundMarks.forEach((marks, effectId) => {
      marks.forEach((mark, enemy) => {
        if (!enemy.active || enemy.isDead) {
          marks.delete(enemy);
          this.releaseGroundMark(effectId, mark);
          return;
        }

        this.positionGroundMark(enemy, mark);
      });
    });

    this.statusOverlays.forEach((overlays, effectId) => {
      overlays.forEach((overlay, enemy) => {
        if (!enemy.active || enemy.isDead) {
          overlays.delete(enemy);
          this.releaseStatusOverlay(effectId, overlay);
          return;
        }

        this.positionStatusOverlay(enemy, overlay, STATUS_OVERLAYS[effectId]);
      });
    });

    if (!this.ring.visible) return;

    const { player } = this.props;
    this.ring.setPosition(player.x, player.y + GROUND_MARK_OFFSET_Y);
    this.ring.setDepth((player.depth ?? player.y) - 0.5);

    if (this.ringCategories.length > 1) {
      const index =
        Math.floor(time / HYBRID_RING_SWAP_MS) % this.ringCategories.length;
      this.ring.setTint(getCategoryTint(this.ringCategories[index]));
    }
  }

  public clear() {
    this.groundMarks.forEach((marks, effectId) => {
      marks.forEach((mark) => this.releaseGroundMark(effectId, mark));
      marks.clear();
    });
    this.statusOverlays.forEach((overlays, effectId) => {
      overlays.forEach((overlay) =>
        this.releaseStatusOverlay(effectId, overlay),
      );
      overlays.clear();
    });
    this.setActivePower(null);
  }

  public shutdown() {
    if (this.isShutDown) return;

    this.clear();
    this.isShutDown = true;

    try {
      this.groundMarkPool.forEach((pool) =>
        pool.forEach((mark) => mark.destroy()),
      );
      this.groundMarkPool.clear();
      this.effectSpritePool.forEach((pool) =>
        pool.forEach((effect) => effect.destroy()),
      );
      this.effectSpritePool.clear();
      this.statusOverlayPool.forEach((pool) =>
        pool.forEach((overlay) => overlay.destroy()),
      );
      this.statusOverlayPool.clear();
      this.plagueEmitter.destroy();
      this.bloodEmitter.destroy();
      this.ring.destroy();
    } catch {
      // Scene shutdown can tear down display objects before this runs.
    }
  }

  private positionGroundMark(
    enemy: EnemyLike,
    mark: Phaser.GameObjects.Sprite,
  ) {
    const enemyDepth = (enemy as unknown as { depth?: number }).depth ?? 0;

    if (mark.texture.key === FROST_GROUND_KEY) {
      const { width, bottom } = this.getEnemyFootprint(enemy);

      mark
        .setOrigin(0.5, FROST_GROUND_ORIGIN_Y)
        .setScale(width / FROST_GROUND_FRAME_WIDTH)
        .setPosition(enemy.x, bottom)
        .setDepth(enemyDepth + 0.5);
      return;
    }

    mark.setPosition(enemy.x, enemy.y + GROUND_MARK_OFFSET_Y);
    mark.setDepth(enemyDepth - 0.5);
  }

  // Visible width and feet Y of the enemy, read from its main sprite when the
  // enemy is a Container and from the physics body otherwise.
  private getEnemyFootprint(enemy: EnemyLike) {
    const container = enemy as unknown as Partial<Phaser.GameObjects.Container>;
    const sprite = container.list?.[0] as Phaser.GameObjects.Sprite | undefined;

    if (sprite && sprite.height) {
      const scaleX = Math.abs(container.scaleX ?? 1);
      const scaleY = Math.abs(container.scaleY ?? 1);

      return {
        width: sprite.displayWidth * scaleX,
        height: sprite.displayHeight * scaleY,
        bottom: enemy.y + (sprite.y + sprite.displayHeight / 2) * scaleY,
      };
    }

    const body = enemy.body as Phaser.Physics.Arcade.Body | undefined;

    return {
      width: body?.width ?? FROST_GROUND_FRAME_WIDTH,
      height: body?.height ?? FROST_GROUND_FRAME_WIDTH,
      bottom: body?.bottom ?? enemy.y + GROUND_MARK_OFFSET_Y,
    };
  }

  private releaseGroundMark(
    effectId: GroundMarkEffectId,
    mark: Phaser.GameObjects.Sprite,
  ) {
    mark.setActive(false).setVisible(false);
    this.groundMarkPool.get(effectId)?.push(mark);
  }

  private createFallbackTextures() {
    const { scene } = this.props;
    const graphics = scene.add.graphics();

    const generate = (
      key: string,
      width: number,
      height: number,
      draw: () => void,
    ) => {
      if (scene.textures.exists(key)) return;
      graphics.clear();
      draw();
      graphics.generateTexture(key, width, height);
    };

    // The Plague: small green spark
    generate(POWER_PLAGUE_PARTICLE_KEY, 4, 4, () => {
      graphics.fillStyle(getCategoryTint("plague"), 1);
      graphics.fillCircle(2, 2, 2);
    });

    // The Bloody Harvest: small red drop
    generate(POWER_BLOOD_PARTICLE_KEY, 4, 4, () => {
      graphics.fillStyle(getCategoryTint("bloodyHarvest"), 1);
      graphics.fillCircle(2, 2, 2);
    });

    // The Frost: blue ice patch on the ground
    generate(POWER_FROST_ICE_KEY, 24, 10, () => {
      graphics.fillStyle(getCategoryTint("frost"), 0.75);
      graphics.fillEllipse(12, 5, 24, 10);
      graphics.fillStyle(0xd6ecff, 0.9);
      graphics.fillEllipse(9, 4, 8, 3);
    });

    // Player ring while the power is active (tinted per category)
    generate(POWER_ACTIVE_RING_KEY, 28, 12, () => {
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeEllipse(14, 6, 26, 10);
    });

    graphics.destroy();
  }
}
