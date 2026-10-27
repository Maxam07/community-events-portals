import Phaser from "phaser";
import type { DamagePayload, EnemyLike } from "../../Types";
import type { TargetingSystem } from "../../lib/combat/TargetingSystem";
import { enemyCenter, isEnemyAlive } from "../../lib/combat/geometry";
import { BEE_VISUAL_DEPTH } from "../../constants/DepthConstants";

const WEAPON_FLY_STORM_TEXTURE_KEY = "weapon_fly_storm";
const WEAPON_FLY_STORM_ANIMATION_KEY = "weapon_fly_storm_active";
const WEAPON_FLY_STORM_SPAWN_TEXTURE_KEY = "weapon_fly_storm_spawn";
const WEAPON_FLY_STORM_SPAWN_ANIMATION_KEY = "weapon_fly_storm_spawn_active";

const ATTACH_DISTANCE = 6;
const IDLE_FOLLOW_DISTANCE = 28;
const RETARGET_INTERVAL_MS = 250;
const ROTATION_SPEED_RAD_PER_SEC = 6;

type HomingBeeSpawnProps = {
  x: number;
  y: number;
  texture: string;
  speed: number;
  payload: DamagePayload;
  hitCooldownMs: number;
  range: number;
  claimedTargets: Set<EnemyLike>;
  allActiveBees?: HomingBee[];
};

type HomingBeeUpdateProps = {
  targeting: TargetingSystem;
  anchor: { x: number; y: number };
};

export class HomingBee extends Phaser.Physics.Arcade.Sprite {
  public payload!: DamagePayload;
  public speed = 0;
  public hitCooldownMs = 0;
  public range = 0;
  private baseDamage = 0;
  private target?: EnemyLike;
  private claimedTargets?: Set<EnemyLike>;
  private allActiveBees?: HomingBee[];
  private isAttached = false;
  private nextRetargetAt = 0;
  private nextSteerAt = 0;
  private nextStingAt = 0;
  private movementRotation = 0;
  private targetRotation = 0;
  private readonly spawnSprite: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    texture = WEAPON_FLY_STORM_TEXTURE_KEY,
  ) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.spawnSprite = scene.add.sprite(
      x,
      y,
      WEAPON_FLY_STORM_SPAWN_TEXTURE_KEY,
    );
    this.spawnSprite.setActive(false);
    this.spawnSprite.setVisible(false);
    this.despawn();
  }

  public spawn({
    x,
    y,
    texture,
    speed,
    payload,
    hitCooldownMs,
    range,
    claimedTargets,
    allActiveBees,
  }: HomingBeeSpawnProps) {
    this.setTexture(texture);
    this.setPosition(x, y);
    this.movementRotation = 0;
    this.applyBeePresentation(this.movementRotation, true);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(BEE_VISUAL_DEPTH);
    if (this.scene.anims.exists(WEAPON_FLY_STORM_ANIMATION_KEY)) {
      this.play(WEAPON_FLY_STORM_ANIMATION_KEY, true);
    } else {
      this.anims.stop();
    }
    this.payload = { ...payload };
    this.baseDamage = payload.amount;
    this.speed = speed;
    this.hitCooldownMs = hitCooldownMs;
    this.range = range;
    this.claimedTargets = claimedTargets;
    this.allActiveBees = allActiveBees;
    this.releaseTarget();
    const now = this.scene.time.now;
    this.nextRetargetAt = now + Phaser.Math.Between(0, RETARGET_INTERVAL_MS);
    this.nextSteerAt = now + Phaser.Math.Between(0, 35);
    this.syncSpawnSprite();
    this.spawnSprite.setActive(true);
    this.spawnSprite.setVisible(true);
    this.spawnSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    if (this.scene.anims.exists(WEAPON_FLY_STORM_SPAWN_ANIMATION_KEY)) {
      this.spawnSprite.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        (animation: Phaser.Animations.Animation) => {
          if (animation.key === WEAPON_FLY_STORM_SPAWN_ANIMATION_KEY) {
            this.hideSpawnSprite();
          }
        },
      );
      this.spawnSprite.play(WEAPON_FLY_STORM_SPAWN_ANIMATION_KEY, true);
    } else {
      this.hideSpawnSprite();
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.width, this.height);
    body.setOffset(0, 0);
    body.setAllowGravity(false);
  }

  /**
   * Advances the bee and returns the enemy to sting this frame, if any.
   */
  public update(
    time: number,
    { targeting, anchor }: HomingBeeUpdateProps,
  ): EnemyLike | undefined {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.target && !isEnemyAlive(this.target)) {
      this.releaseTarget();
    }

    if (!this.target && time >= this.nextRetargetAt) {
      this.acquireTarget(targeting);
      this.nextRetargetAt = time + RETARGET_INTERVAL_MS;
    }

    this.setDepth(BEE_VISUAL_DEPTH);

    if (!this.target) {
      this.followAnchor(time, body, anchor);
      this.syncSpawnSprite();
      return undefined;
    }

    const targetCenter = enemyCenter(this.target);
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      targetCenter.x,
      targetCenter.y,
    );

    if (this.isAttached || distance <= ATTACH_DISTANCE) {
      if (!this.isAttached) {
        this.isAttached = true;
        this.nextStingAt = time;
      }

      this.targetRotation = 0;

      body.setVelocity(0, 0);
      this.setPosition(targetCenter.x, targetCenter.y);
      this.syncSpawnSprite();

      if (time < this.nextStingAt) return undefined;

      this.nextStingAt = time + this.hitCooldownMs;

      if (this.allActiveBees && this.target) {
        // Only bees already stinging this target count; bees still flying
        // toward it don't deal damage yet.
        const fliesOnTarget = this.allActiveBees.filter(
          (bee) => bee.active && bee.isAttached && bee.target === this.target,
        ).length;

        // Total damage on one target per sting cycle is base * sqrt(n),
        // split evenly across the n bees. The damage system reads `amount`.
        if (fliesOnTarget > 1) {
          this.payload.amount =
            (this.baseDamage * Math.sqrt(fliesOnTarget)) / fliesOnTarget;
        } else {
          this.payload.amount = this.baseDamage;
        }
      }

      return this.target;
    }

    this.steerTowards(time, body, targetCenter);
    this.syncSpawnSprite();
    return undefined;
  }

  public preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.active) {
      this.setRotation(
        Phaser.Math.Angle.RotateTo(
          this.rotation,
          this.targetRotation,
          (ROTATION_SPEED_RAD_PER_SEC * delta) / 1000,
        ),
      );
      this.syncSpawnSprite();
    }
  }

  public despawn() {
    this.anims.stop();
    this.spawnSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    this.hideSpawnSprite();
    this.movementRotation = 0;
    this.applyBeePresentation(this.movementRotation, true);
    this.setActive(false);
    this.setVisible(false);
    this.releaseTarget();
    this.claimedTargets = undefined;
    this.allActiveBees = undefined;
    this.nextRetargetAt = 0;
    this.nextSteerAt = 0;
    this.nextStingAt = 0;

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }

  public destroy(fromScene?: boolean) {
    this.releaseTarget();
    this.spawnSprite.destroy(fromScene);
    super.destroy(fromScene);
  }

  private acquireTarget(targeting: TargetingSystem) {
    if (!this.claimedTargets) return;

    const candidates = targeting.inRadius(this, this.range);

    let target = targeting.nearest(this, candidates, this.claimedTargets);

    if (!target && candidates.length > 0) {
      target = targeting.nearest(this, candidates, new Set());
    }

    if (!target) return;

    this.target = target;
    this.isAttached = false;
    this.claimedTargets.add(target);
  }

  private releaseTarget() {
    if (this.target) {
      this.claimedTargets?.delete(this.target);
    }
    this.target = undefined;
    this.isAttached = false;
  }

  private followAnchor(
    time: number,
    body: Phaser.Physics.Arcade.Body,
    anchor: { x: number; y: number },
  ) {
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      anchor.x,
      anchor.y,
    );

    if (distance <= IDLE_FOLLOW_DISTANCE) {
      body.setVelocity(0, 0);
      this.targetRotation = 0;
      return;
    }

    this.steerTowards(time, body, anchor, true);
  }

  private steerTowards(
    time: number,
    body: Phaser.Physics.Arcade.Body,
    destination: { x: number; y: number },
    upright = false,
  ) {
    if (time < this.nextSteerAt) return;

    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      destination.x,
      destination.y,
    );
    this.movementRotation = Phaser.Math.Angle.RotateTo(
      this.movementRotation,
      angle,
      0.24,
    );

    this.applyBeePresentation(this.movementRotation);
    if (upright) this.targetRotation = 0;
    body.setVelocity(
      Math.cos(this.movementRotation) * this.speed,
      Math.sin(this.movementRotation) * this.speed,
    );
    this.nextSteerAt = time + 50;
  }

  private syncSpawnSprite() {
    this.spawnSprite.setPosition(this.x, this.y);
    this.spawnSprite.setRotation(this.rotation);
    this.spawnSprite.setFlip(this.flipX, this.flipY);
    this.spawnSprite.setDepth(this.depth);
  }

  private applyBeePresentation(rotation: number, immediate = false) {
    const isFacingLeft = Math.cos(rotation) < 0;

    this.setFlip(isFacingLeft, false);
    this.targetRotation = Math.atan2(
      isFacingLeft ? -Math.sin(rotation) : Math.sin(rotation),
      isFacingLeft ? -Math.cos(rotation) : Math.cos(rotation),
    );

    if (immediate) {
      this.setRotation(this.targetRotation);
    }
  }

  private hideSpawnSprite() {
    this.spawnSprite.anims.stop();
    this.spawnSprite.setActive(false);
    this.spawnSprite.setVisible(false);
  }
}
