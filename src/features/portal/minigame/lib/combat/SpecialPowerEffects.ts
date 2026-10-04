import type Phaser from "phaser";
import { getCategoryTint } from "../../constants";
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
const POWER_FROST_ICE_KEY = "power_frost_ice";
const POWER_CURSE_ROOTS_KEY = "power_curse_roots";
const POWER_ACTIVE_RING_KEY = "power_active_ring";

const PARTICLE_DEPTH = 9000;
const GROUND_MARK_OFFSET_Y = 6;
const HYBRID_RING_SWAP_MS = 300;

type GroundMarkEffectId = Extract<StatusEffectId, "frostSlow" | "curseStun">;

const GROUND_MARK_TEXTURES: Record<GroundMarkEffectId, string> = {
  frostSlow: POWER_FROST_ICE_KEY,
  curseStun: POWER_CURSE_ROOTS_KEY,
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
    Map<EnemyLike, Phaser.GameObjects.Image>
  >([
    ["frostSlow", new Map()],
    ["curseStun", new Map()],
  ]);
  private readonly groundMarkPool = new Map<
    GroundMarkEffectId,
    Phaser.GameObjects.Image[]
  >([
    ["frostSlow", []],
    ["curseStun", []],
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

  public showStatus(enemy: EnemyLike, effectId: StatusEffectId) {
    if (this.isShutDown || !isGroundMarkEffect(effectId)) return;

    const marks = this.groundMarks.get(effectId);
    if (!marks || marks.has(enemy)) return;

    const pooled = this.groundMarkPool.get(effectId)?.pop();
    const mark =
      pooled ??
      this.props.scene.add.image(0, 0, GROUND_MARK_TEXTURES[effectId]);

    mark.setActive(true).setVisible(true).setAlpha(0.9);
    marks.set(enemy, mark);
    this.positionGroundMark(enemy, mark);
  }

  public hideStatus(enemy: EnemyLike, effectId: StatusEffectId) {
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
      this.plagueEmitter.destroy();
      this.bloodEmitter.destroy();
      this.ring.destroy();
    } catch {
      // Scene shutdown can tear down display objects before this runs.
    }
  }

  private positionGroundMark(enemy: EnemyLike, mark: Phaser.GameObjects.Image) {
    const enemyDepth = (enemy as unknown as { depth?: number }).depth ?? 0;

    mark.setPosition(enemy.x, enemy.y + GROUND_MARK_OFFSET_Y);
    mark.setDepth(enemyDepth - 0.5);
  }

  private releaseGroundMark(
    effectId: GroundMarkEffectId,
    mark: Phaser.GameObjects.Image,
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

    // The Curse: dark roots grabbing the enemy
    generate(POWER_CURSE_ROOTS_KEY, 24, 12, () => {
      graphics.fillStyle(getCategoryTint("curse"), 0.6);
      graphics.fillEllipse(12, 8, 24, 8);
      graphics.lineStyle(2, getCategoryTint("curse"), 1);
      graphics.lineBetween(4, 10, 2, 1);
      graphics.lineBetween(9, 10, 8, 0);
      graphics.lineBetween(15, 10, 16, 0);
      graphics.lineBetween(20, 10, 22, 1);
    });

    // Player ring while the power is active (tinted per category)
    generate(POWER_ACTIVE_RING_KEY, 28, 12, () => {
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeEllipse(14, 6, 26, 10);
    });

    graphics.destroy();
  }
}
