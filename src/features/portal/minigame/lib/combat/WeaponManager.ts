import type Phaser from "phaser";
import type { Scene } from "../../Scene";
import {
  COMBAT_CONFIG,
  resolveWeaponStats,
  WEAPON_CONFIGS,
} from "../../constants";
import type { MachineInterpreter } from "../Machine";
import type {
  DamagePayload,
  EnemyLike,
  ProjectileConfig,
  SpecialPower,
  WeaponConfig,
  WeaponId,
  WeaponLevel,
  WeaponLoadoutItem,
  WeaponRuntimeStats,
} from "../../Types";
import { Projectile } from "../../containers/weapons/Projectile";
import { RollingProjectile } from "../../containers/weapons/RollingProjectile";
import { SlashHitbox } from "../../containers/weapons/SlashHitbox";
import { AreaHitbox } from "../../containers/weapons/AreaHitbox";
import { OrbitalWeapon } from "../../containers/weapons/OrbitalWeapon";
import { HomingBee } from "../../containers/weapons/HomingBee";
import { EventBus } from "../EventBus";
import {
  MOSS_GROUND_VISUAL_DEPTH,
  CURSE_WEAPON_VISUAL_DEPTH,
  BLOODY_HARVEST_WEAPON_VISUAL_DEPTH,
  FROST_WEAPON_VISUAL_DEPTH,
} from "../../constants/DepthConstants";
import { CooldownTracker } from "./CooldownTracker";
import { DamageSystem } from "./DamageSystem";
import { StatusEffectSystem } from "./StatusEffectSystem";
import { TargetingSystem } from "./TargetingSystem";
import { SpecialPowerEffects } from "./SpecialPowerEffects";
import {
  FALLBACK_AIM_VECTOR,
  distanceBetween,
  enemyCenter,
  isEnemyAlive,
  normalizeVector,
  rotateVector,
  vectorFromAngleDegrees,
  type Vector,
} from "./geometry";

const WEAPON_POISON_VIAL_EXPLOSION_TEXTURE_KEY = "weapon_poison_vial_explosion";
const WEAPON_POISON_VIAL_EXPLOSION_ANIMATION_KEY =
  "weapon_poison_vial_explosion_active";
const WEAPON_MOSS_GROUND_ANIMATION_KEY = "weapon_moss_ground_active";
const WEAPON_POISON_VIAL_EXPLOSION_ANIMATION_MS = 625;

const JACK_O_LANTERN_DIRECTIONS: readonly Vector[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
  { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
  { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
];

const FROST_CHAIN_FADE_MS = 220;
const FROST_CHAIN_FRAME_WIDTH = 128;
const FROST_CHAIN_THICKNESS_FACTOR = 1.1;
const FROST_CHAIN_ANIMATION_KEY = "weapon_frost_chain_active";
// The strike also hits every enemy inside weapon.stats.areaRadius around the
// first enemy it hits. 1 = full damage for everyone in the area; lower it to
// make the area weaker than the main hit.
const FROST_CHAIN_AREA_DAMAGE_MULTIPLIER = 0.5;
const FROST_CHAIN_AREA_COLOR = 0x8bcef7;
const FROST_CHAIN_AREA_ALPHA = 0.1;
const CURSED_COFFIN_ANIMATION_KEY = "weapon_cursed_coffin_active";
const CRIMSON_VIAL_FRAME_WIDTH = 139;
const CRIMSON_VIAL_THICKNESS_FACTOR = 0.5;
const CRIMSON_VIAL_ANIMATION_KEY = "weapon_crimson_vial_active";

type BloodTether = {
  enemy: EnemyLike;
  link: Phaser.GameObjects.Sprite;
  thicknessScale: number;
  expiresAt: number;
};

type RuntimeWeapon = {
  id: WeaponId;
  level: WeaponLevel;
  stats: WeaponRuntimeStats;
  config: WeaponConfig;
};

type WeaponManagerProps = {
  scene: Phaser.Scene & {
    movementAngle?: number;
    isFacingLeft?: boolean;
  };
  player: Phaser.GameObjects.GameObject & {
    x: number;
    y: number;
    body?: unknown;
  };
  enemyGroup: Phaser.Physics.Arcade.Group;
  blockerGroups?: Phaser.GameObjects.Group[];
  portalService?: MachineInterpreter;
  loadout?: WeaponLoadoutItem[];
};

export class WeaponManager {
  public readonly weaponCollisionGroup: Phaser.Physics.Arcade.Group;
  public readonly projectileGroup: Phaser.Physics.Arcade.Group;
  public readonly rollingProjectileGroup: Phaser.Physics.Arcade.Group;
  public readonly hitboxGroup: Phaser.GameObjects.Group;
  public readonly slashHitboxGroup: Phaser.Physics.Arcade.Group;
  public readonly orbitalGroup: Phaser.Physics.Arcade.Group;
  public readonly beeGroup: Phaser.Physics.Arcade.Group;

  private readonly cooldowns = new CooldownTracker();
  private readonly damageSystem: DamageSystem;
  private readonly statusEffectSystem = new StatusEffectSystem();
  private readonly targetingSystem: TargetingSystem;
  private readonly specialPowerEffects: SpecialPowerEffects;
  private readonly activeWeapons = new Map<WeaponId, RuntimeWeapon>();
  private readonly darknessBookSelectedTargets = new Set<EnemyLike>();
  private readonly claimedBeeTargets = new Set<EnemyLike>();
  private readonly bloodTethers: BloodTether[] = [];
  private lastAimVector: Vector = { ...FALLBACK_AIM_VECTOR };
  private nextAreaCollisionCheckAt = 0;
  private isShutDown = false;

  constructor(private readonly props: WeaponManagerProps) {
    this.createFallbackTextures();

    this.weaponCollisionGroup = props.scene.physics.add.group({
      runChildUpdate: false,
    });

    this.projectileGroup = props.scene.physics.add.group({
      classType: Projectile,
      maxSize: COMBAT_CONFIG.projectilePoolSize,
      runChildUpdate: false,
    });
    this.rollingProjectileGroup = props.scene.physics.add.group({
      classType: RollingProjectile,
      maxSize: Math.ceil(COMBAT_CONFIG.projectilePoolSize / 3),
      runChildUpdate: false,
    });
    this.hitboxGroup = props.scene.add.group({
      classType: AreaHitbox,
      maxSize: COMBAT_CONFIG.hitboxPoolSize,
      runChildUpdate: false,
    });
    this.slashHitboxGroup = props.scene.physics.add.group({
      classType: SlashHitbox,
      maxSize: COMBAT_CONFIG.hitboxPoolSize,
      runChildUpdate: false,
    });
    this.orbitalGroup = props.scene.physics.add.group({
      classType: OrbitalWeapon,
      maxSize: COMBAT_CONFIG.orbitalPoolSize,
      runChildUpdate: false,
    });
    this.beeGroup = props.scene.physics.add.group({
      classType: HomingBee,
      maxSize: COMBAT_CONFIG.beePoolSize,
      runChildUpdate: false,
    });

    this.damageSystem = new DamageSystem(
      props.portalService,
      props.scene as Scene,
    );
    this.damageSystem.setStatusEffectSystem(this.statusEffectSystem);
    this.statusEffectSystem.setDamageApplier(
      this.damageSystem.applyDamage.bind(this.damageSystem),
    );
    this.targetingSystem = new TargetingSystem(
      props.enemyGroup,
      COMBAT_CONFIG.targetScanMs,
    );

    this.specialPowerEffects = new SpecialPowerEffects({
      scene: props.scene,
      player: props.player,
    });
    this.statusEffectSystem.setListeners({
      onApply: (enemy, effectId) =>
        this.specialPowerEffects.showStatus(enemy, effectId),
      onTick: (enemy, effectId) => {
        if (effectId === "plaguePoison") {
          this.specialPowerEffects.playPoisonTick(enemy);
        }
      },
      onExpire: (enemy, effectId) =>
        this.specialPowerEffects.hideStatus(enemy, effectId),
    });
    this.damageSystem.setLifestealListener((enemy) =>
      this.specialPowerEffects.playLifesteal(enemy),
    );
    this.damageSystem.setHealListener((amount) =>
      this.specialPowerEffects.playHeartGain(amount),
    );
    this.damageSystem.setCategoryHitListener((enemy, category) =>
      this.specialPowerEffects.playHitEffect(enemy, category),
    );

    this.setupOverlaps(props.enemyGroup);
    this.reset(props.loadout ?? COMBAT_CONFIG.defaultWeaponLoadout);
  }

  public update(time: number, _delta: number) {
    if (this.isShutDown) return;

    this.targetingSystem.update(time);
    this.statusEffectSystem.update(time);
    this.damageSystem.update(time);
    this.specialPowerEffects.update(time);
    this.updateAimVector();
    this.updatePooledObjects(time);
    this.updateBloodTethers(time);

    this.activeWeapons.forEach((weapon) => {
      if (
        weapon.config.behavior === "orbital" ||
        weapon.config.behavior === "orbitalShooter"
      ) {
        this.ensureOrbitals(weapon);
      }

      if (weapon.config.behavior === "homingSummon") {
        this.ensureBees(weapon);
        return;
      }

      if (weapon.config.behavior === "orbital") return;
      if (!this.cooldowns.isReady(weapon.id, time)) return;
      if (!this.fireWeapon(weapon, time)) return;

      this.cooldowns.use(weapon.id, time, weapon.stats.cooldownMs);
    });
  }

  public setWeaponLevel(id: WeaponId, level: WeaponLevel) {
    if (this.isShutDown) return;

    const config = WEAPON_CONFIGS[id];
    this.activeWeapons.set(id, {
      id,
      level,
      config,
      stats: resolveWeaponStats(
        id,
        level,
        this.props.portalService?.state.context.activeWearables,
        this.props.portalService?.state.context.perkLevels,
      ),
    });
  }

  // Active Special Power (null when inactive). Kept across loadout resets;
  // Scene drives it from the XState special power timestamps.
  public setSpecialPower(power: SpecialPower | null) {
    if (this.isShutDown) return;

    this.damageSystem.setSpecialPower(power);
    this.specialPowerEffects.setActivePower(power);
  }

  public reset(loadout = COMBAT_CONFIG.defaultWeaponLoadout) {
    if (this.isShutDown) return;

    this.cooldowns.reset();
    this.statusEffectSystem.reset();
    this.activeWeapons.clear();
    this.clearGroup(this.projectileGroup);
    this.clearGroup(this.rollingProjectileGroup);
    this.clearGroup(this.hitboxGroup);
    this.clearGroup(this.slashHitboxGroup);
    this.clearGroup(this.orbitalGroup);
    this.clearGroup(this.beeGroup);
    this.claimedBeeTargets.clear();
    this.clearBloodTethers();

    loadout.forEach(({ id, level }) => this.setWeaponLevel(id, level));
  }

  public shutdown() {
    if (this.isShutDown) return;

    this.reset([]);
    this.isShutDown = true;
    this.targetingSystem.shutdown();
    this.statusEffectSystem.shutdown();
    this.damageSystem.reset();
    this.damageSystem.setLifestealListener(undefined);
    this.damageSystem.setHealListener(undefined);
    this.damageSystem.setCategoryHitListener(undefined);
    this.specialPowerEffects.shutdown();
    this.destroyGroup(this.weaponCollisionGroup, false);
    this.destroyGroup(this.projectileGroup);
    this.destroyGroup(this.rollingProjectileGroup);
    this.destroyGroup(this.hitboxGroup);
    this.destroyGroup(this.slashHitboxGroup);
    this.destroyGroup(this.orbitalGroup);
    this.destroyGroup(this.beeGroup);
  }

  private setupOverlaps(enemyGroup: Phaser.Physics.Arcade.Group) {
    this.props.scene.physics.add.overlap(
      this.weaponCollisionGroup,
      enemyGroup,
      (weaponObject, enemy) =>
        this.handleWeaponCollision(
          weaponObject as Phaser.GameObjects.GameObject,
          enemy as EnemyLike,
        ),
    );

    const { physics } = this.props.scene;
    (this.props.blockerGroups ?? []).forEach((blockerGroup) => {
      physics.add.overlap(this.projectileGroup, blockerGroup, (a, b) =>
        this.handleProjectileObstacleHit(a, b),
      );
      physics.add.overlap(this.rollingProjectileGroup, blockerGroup, (a, b) =>
        this.handleProjectileObstacleHit(a, b),
      );
    });
  }

  private handleProjectileObstacleHit(a: unknown, b: unknown) {
    const projectile = [a, b].find((object) => object instanceof Projectile);
    if (!projectile?.active) return;

    if (projectile.behavior === "exploding") {
      this.spawnExplosion(projectile, this.props.scene.time.now);
    }
    projectile.despawn();
  }

  private fireWeapon(weapon: RuntimeWeapon, time: number) {
    switch (weapon.config.behavior) {
      case "slash":
        return this.fireSlash(weapon, time);
      case "linearProjectile":
        return this.fireDarknessBook(weapon, time);
      case "explodingProjectile":
        return this.firePoisonVial(weapon, time);
      case "chainProjectile":
        return this.fireBloodKnife(weapon, time);
      case "orbitalShooter":
        return this.fireFrostFlower(weapon, time);
      case "snareArea":
        return this.fireMossGround(weapon, time);
      case "rollingProjectile":
        return this.fireBanishedJackOLantern(weapon, time);
      case "coffinBurst":
        return this.fireCursedCoffin(weapon);
      case "chainAnchor":
        return this.fireFrostChain(weapon);
      case "bloodTether":
        return this.fireCrimsonVial(weapon, time);
      default:
        return false;
    }
  }

  private fireSlash(weapon: RuntimeWeapon, time: number) {
    const target = this.nearestInRange();
    if (!target) return false;

    const targetCenter = enemyCenter(target);
    const aimVector = normalizeVector({
      x: targetCenter.x - this.props.player.x,
      y: targetCenter.y - this.props.player.y,
    });
    const directions =
      weapon.stats.projectileCount >= 2
        ? [aimVector, rotateVector(aimVector, 180)]
        : [aimVector];

    directions.forEach((direction) => {
      const hitbox = this.slashHitboxGroup.get(
        this.props.player.x,
        this.props.player.y,
        weapon.config.texture,
      ) as SlashHitbox | null;

      if (!hitbox) return;

      this.registerCollisionBody(hitbox);
      hitbox.spawn({
        x: this.props.player.x,
        y: this.props.player.y,
        texture: weapon.config.texture,
        direction,
        range: weapon.stats.range,
        arcDegrees: weapon.stats.arcDegrees,
        expiresAt: time + weapon.stats.durationMs,
        payload: this.createPayload(weapon),
        followTarget: this.props.player,
      });
      EventBus.emit("weapon:fired", {
        id: weapon.id,
        x: hitbox.x,
        y: hitbox.y,
      });
    });

    return directions.length > 0;
  }

  private fireDarknessBook(weapon: RuntimeWeapon, time: number) {
    const projectileCount = Math.max(
      1,
      Math.round(weapon.stats.projectileCount),
    );
    const selectedTargets = this.darknessBookSelectedTargets;
    selectedTargets.clear();

    let fired = false;

    for (let index = 0; index < projectileCount; index++) {
      const target = this.nearestInRange(selectedTargets);

      const direction = target
        ? normalizeVector({
            x: target.x - this.props.player.x,
            y: target.y - this.props.player.y,
          })
        : this.lastAimVector;

      if (target) {
        selectedTargets.add(target);
      }

      this.fireProjectile({
        weapon,
        time,
        projectile: weapon.config.projectile,
        behavior: "linear",
        x: this.props.player.x,
        y: this.props.player.y,
        direction,
      });
      fired = true;
    }

    return fired;
  }

  private firePoisonVial(weapon: RuntimeWeapon, time: number) {
    const target = this.nearestInRange();
    if (!target) return false;

    this.fireProjectile({
      weapon,
      time,
      projectile: weapon.config.projectile,
      behavior: "exploding",
      x: this.props.player.x,
      y: this.props.player.y,
      direction: normalizeVector({
        x: target.x - this.props.player.x,
        y: target.y - this.props.player.y,
      }),
    });

    return true;
  }

  private fireBloodKnife(weapon: RuntimeWeapon, time: number) {
    const target = this.targetingSystem.random(
      this.targetingSystem.inRadius(
        this.props.player,
        COMBAT_CONFIG.maxWeaponRange,
      ),
    );
    if (!target) return false;

    this.fireProjectilesFromPlayer({
      weapon,
      time,
      projectile: weapon.config.projectile,
      behavior: "bouncing",
      direction: normalizeVector({
        x: target.x - this.props.player.x,
        y: target.y - this.props.player.y,
      }),
    });

    return true;
  }

  private fireFrostFlower(weapon: RuntimeWeapon, time: number) {
    const target = this.nearestInRange();
    if (!target) return false;

    const children = this.orbitalGroup.getChildren();
    let fired = false;

    for (let index = 0; index < children.length; index++) {
      const orbital = children[index];
      if (
        !(orbital instanceof OrbitalWeapon) ||
        !orbital.active ||
        orbital.ownerWeaponId !== weapon.id
      ) {
        continue;
      }

      fired = true;
      this.fireProjectile({
        weapon,
        time,
        projectile: weapon.config.projectile,
        behavior: "light",
        x: orbital.x,
        y: orbital.y,
        direction: normalizeVector({
          x: target.x - orbital.x,
          y: target.y - orbital.y,
        }),
      });
    }

    return fired;
  }

  private fireMossGround(weapon: RuntimeWeapon, time: number) {
    const target = this.nearestInRange();
    if (!target) return false;

    this.spawnArea({
      x: target.x,
      y: target.y,
      texture: weapon.config.texture,
      radius: weapon.stats.areaRadius,
      expiresAt: time + weapon.stats.durationMs,
      payload: this.createPayload(weapon),
      hitCooldownMs: weapon.stats.hitCooldownMs,
      persistent: true,
      animationKey: WEAPON_MOSS_GROUND_ANIMATION_KEY,
      hitboxShape: "spriteBounds",
      hitboxSize: {
        width: weapon.stats.areaRadius * 1,
        height: Math.round(weapon.stats.areaRadius * 0.5),
      },
      depth: MOSS_GROUND_VISUAL_DEPTH,
    });

    return true;
  }

  private fireBanishedJackOLantern(weapon: RuntimeWeapon, time: number) {
    const direction =
      JACK_O_LANTERN_DIRECTIONS[
        Math.floor(Math.random() * JACK_O_LANTERN_DIRECTIONS.length)
      ];

    this.fireProjectile({
      weapon,
      time,
      projectile: weapon.config.projectile,
      behavior: "rolling",
      x: this.props.player.x,
      y: this.props.player.y,
      direction,
      rolling: true,
    });

    return true;
  }

  private fireCursedCoffin(weapon: RuntimeWeapon) {
    const target = this.nearestInRange();
    if (!target) return false;

    const origin = enemyCenter(target);
    if (distanceBetween(this.props.player, origin) > weapon.stats.areaRadius) {
      return false;
    }

    const shardCount = Math.max(1, Math.round(weapon.stats.projectileCount));
    const startAngle = Math.random() * 360;

    const releaseShards = () => {
      if (this.isShutDown) return;

      for (let index = 0; index < shardCount; index++) {
        this.fireProjectile({
          weapon,
          time: this.props.scene.time.now,
          projectile: weapon.config.projectile,
          behavior: "linear",
          x: origin.x,
          y: origin.y,
          direction: rotateVector(
            { x: 1, y: 0 },
            startAngle + (360 / shardCount) * index,
          ),
        });
      }
    };

    const marker = this.props.scene.add
      .sprite(origin.x, origin.y, weapon.config.texture)
      .setDepth(CURSE_WEAPON_VISUAL_DEPTH);

    if (this.props.scene.anims.exists(CURSED_COFFIN_ANIMATION_KEY)) {
      marker.once("animationcomplete", () => {
        marker.destroy();
        releaseShards();
      });
      marker.play(CURSED_COFFIN_ANIMATION_KEY);
    } else {
      marker.destroy();
      releaseShards();
    }

    return true;
  }

  private fireFrostChain(weapon: RuntimeWeapon) {
    const { player } = this.props;
    const target = this.nearestInRange();
    if (!target) return false;

    const targetCenter = enemyCenter(target);
    if (
      distanceBetween(player, targetCenter) > this.getEffectiveRange(weapon)
    ) {
      return false;
    }

    const strike = () => {
      const now = this.props.scene.time.now;
      // Impact point = where the first enemy is when the chain lands.
      const impact = isEnemyAlive(target) ? enemyCenter(target) : targetCenter;
      const payload = {
        ...this.createPayload(weapon),
        knockback: weapon.stats.knockback,
        knockbackOrigin: { x: player.x, y: player.y },
      };

      this.damageSystem.applyDamage(target, payload, now);

      const radius = weapon.stats.areaRadius;
      if (radius <= 0) return;

      this.targetingSystem.inRadius(impact, radius).forEach((enemy) => {
        if (enemy === target) return;

        this.damageSystem.applyDamage(
          enemy,
          {
            ...payload,
            amount: payload.amount * FROST_CHAIN_AREA_DAMAGE_MULTIPLIER,
          },
          now,
        );
      });

      const burst = this.props.scene.add
        .circle(
          impact.x,
          impact.y,
          radius,
          FROST_CHAIN_AREA_COLOR,
          FROST_CHAIN_AREA_ALPHA,
        )
        .setDepth(FROST_WEAPON_VISUAL_DEPTH);
      this.props.scene.tweens.add({
        targets: burst,
        alpha: 0,
        duration: FROST_CHAIN_FADE_MS,
        onComplete: () => burst.destroy(),
      });
    };

    const thicknessScale =
      (weapon.stats.range / FROST_CHAIN_FRAME_WIDTH) *
      FROST_CHAIN_THICKNESS_FACTOR;
    const aim = (to: Vector) => {
      link
        .setPosition(player.x, player.y)
        .setRotation(Math.atan2(to.y - player.y, to.x - player.x))
        .setScale(
          Math.max(1, distanceBetween(player, to)) / FROST_CHAIN_FRAME_WIDTH,
          thicknessScale,
        )
        .setDepth(FROST_WEAPON_VISUAL_DEPTH);
    };

    const link = this.props.scene.add
      .sprite(player.x, player.y, weapon.config.texture)
      .setOrigin(0, 0.5);
    aim(targetCenter);
    if (this.props.scene.anims.exists(FROST_CHAIN_ANIMATION_KEY)) {
      link.on("animationupdate", () => {
        if (isEnemyAlive(target)) aim(enemyCenter(target));
      });
      link.once("animationcomplete", () => {
        link.destroy();
        strike();
      });
      link.play(FROST_CHAIN_ANIMATION_KEY);
    } else {
      strike();
      this.props.scene.tweens.add({
        targets: link,
        alpha: 0,
        duration: FROST_CHAIN_FADE_MS,
        onComplete: () => link.destroy(),
      });
    }

    EventBus.emit("weapon:fired", {
      id: weapon.id,
      x: targetCenter.x,
      y: targetCenter.y,
    });

    return true;
  }

  private fireCrimsonVial(weapon: RuntimeWeapon, time: number) {
    const { player } = this.props;
    const freeSlots =
      Math.max(1, Math.round(weapon.stats.projectileCount)) -
      this.bloodTethers.length;
    if (freeSlots <= 0) return false;

    const tetheredEnemies = new Set<EnemyLike>(
      this.bloodTethers.map((tether) => tether.enemy),
    );
    const statusEffects = this.createPayload(weapon).statusEffects;
    let fired = false;

    for (let slot = 0; slot < freeSlots; slot++) {
      const target = this.nearestInRange(tetheredEnemies);
      if (!target) break;

      const targetCenter = enemyCenter(target);
      if (
        distanceBetween(player, targetCenter) > this.getEffectiveRange(weapon)
      )
        break;

      tetheredEnemies.add(target);
      if (statusEffects)
        this.statusEffectSystem.apply(target, statusEffects, time);

      const thicknessScale =
        (weapon.stats.range / CRIMSON_VIAL_FRAME_WIDTH) *
        CRIMSON_VIAL_THICKNESS_FACTOR;
      const link = this.props.scene.add
        .sprite(player.x, player.y, weapon.config.texture)
        .setDepth(BLOODY_HARVEST_WEAPON_VISUAL_DEPTH);
      this.placeLink(link, player, targetCenter, thicknessScale);
      if (this.props.scene.anims.exists(CRIMSON_VIAL_ANIMATION_KEY)) {
        link.play(CRIMSON_VIAL_ANIMATION_KEY);
      }
      this.bloodTethers.push({
        enemy: target,
        link,
        thicknessScale,
        expiresAt: time + weapon.stats.statusDurationMs,
      });
      fired = true;
    }

    if (fired) {
      EventBus.emit("weapon:fired", {
        id: weapon.id,
        x: player.x,
        y: player.y,
      });
    }

    return fired;
  }

  private updateBloodTethers(time: number) {
    const { player } = this.props;

    for (let index = this.bloodTethers.length - 1; index >= 0; index--) {
      const tether = this.bloodTethers[index];
      const { enemy } = tether;

      if (
        time >= tether.expiresAt ||
        !enemy.active ||
        enemy.isDead ||
        !enemy.scene
      ) {
        tether.link.destroy();
        this.bloodTethers.splice(index, 1);
        continue;
      }

      this.placeLink(
        tether.link,
        player,
        enemyCenter(enemy),
        tether.thicknessScale,
      );
    }
  }

  private clearBloodTethers() {
    this.bloodTethers.forEach((tether) => tether.link.destroy());
    this.bloodTethers.length = 0;
  }

  private placeLink(
    link: Phaser.GameObjects.Sprite,
    from: Vector,
    to: Vector,
    thicknessScale: number,
  ) {
    link
      .setOrigin(0, 0.5)
      .setPosition(from.x, from.y)
      .setRotation(Math.atan2(to.y - from.y, to.x - from.x))
      .setScale(
        Math.max(1, distanceBetween(from, to)) / CRIMSON_VIAL_FRAME_WIDTH,
        thicknessScale,
      );
  }

  private ensureBees(weapon: RuntimeWeapon) {
    const expectedCount = Math.max(1, Math.round(weapon.stats.projectileCount));
    const children = this.beeGroup.getChildren();
    const activeBees: HomingBee[] = [];

    for (let index = 0; index < children.length; index++) {
      const bee = children[index];
      if (bee instanceof HomingBee && bee.active) activeBees.push(bee);
    }

    for (let index = expectedCount; index < activeBees.length; index++) {
      activeBees[index].despawn();
    }

    let spawned = 0;
    for (let index = activeBees.length; index < expectedCount; index++) {
      const bee = this.beeGroup.get(
        this.props.player.x,
        this.props.player.y,
        weapon.config.texture,
      ) as HomingBee | null;

      if (!bee) break;

      bee.spawn({
        x: this.props.player.x + (index - expectedCount / 2) * 4,
        y: this.props.player.y,
        texture: weapon.config.texture,
        speed: weapon.stats.homingSpeed,
        payload: this.createPayload(weapon),
        hitCooldownMs: weapon.stats.hitCooldownMs,
        range: this.getEffectiveRange(weapon),
        claimedTargets: this.claimedBeeTargets,
      });
      spawned++;
    }

    if (spawned > 0) {
      EventBus.emit("weapon:fired", {
        id: weapon.id,
        x: this.props.player.x,
        y: this.props.player.y,
      });
    }
  }

  private fireProjectilesFromPlayer({
    weapon,
    time,
    projectile,
    behavior,
    direction,
  }: {
    weapon: RuntimeWeapon;
    time: number;
    projectile?: ProjectileConfig;
    behavior: Projectile["behavior"];
    direction: Vector;
  }) {
    const directions = this.getSpreadDirections(
      direction,
      weapon.stats.projectileCount,
      weapon.stats.spreadDegrees,
    );

    directions.forEach((spreadDirection) =>
      this.fireProjectile({
        weapon,
        time,
        projectile,
        behavior,
        x: this.props.player.x,
        y: this.props.player.y,
        direction: spreadDirection,
      }),
    );
  }

  private fireProjectile({
    weapon,
    time,
    projectile,
    behavior,
    x,
    y,
    direction,
    rolling = false,
  }: {
    weapon: RuntimeWeapon;
    time: number;
    projectile?: ProjectileConfig;
    behavior: Projectile["behavior"];
    x: number;
    y: number;
    direction: Vector;
    rolling?: boolean;
  }) {
    if (!projectile) return;

    const group = rolling ? this.rollingProjectileGroup : this.projectileGroup;
    const projectileObject = group.get(
      x,
      y,
      projectile.texture,
    ) as Projectile | null;

    if (!projectileObject) return;

    this.registerCollisionBody(projectileObject);
    const normalized = normalizeVector(direction);
    projectileObject.spawn({
      x,
      y,
      texture: projectile.texture,
      velocity: {
        x: normalized.x * weapon.stats.projectileSpeed,
        y: normalized.y * weapon.stats.projectileSpeed,
      },
      bodySize: projectile.bodySize,
      bodySizeMode: projectile.bodySizeMode,
      bodySizeScale: projectile.bodySizeScale,
      expiresAt: time + weapon.stats.durationMs,
      payload: this.createPayload(weapon),
      ownerWeaponId: weapon.id,
      behavior,
      pierce: weapon.stats.pierce,
      bounceCount: weapon.stats.bounceCount,
      chainRadius: weapon.stats.chainRadius,
      scale: weapon.stats.size * (projectile.scale ?? 1),
      rotateToVelocity: projectile.rotateToVelocity,
      rotationOffsetDegrees: projectile.rotationOffsetDegrees,
      orientedHitbox: projectile.orientedHitbox,
      ricochetTexture: projectile.ricochetTexture,
    });
    EventBus.emit("weapon:fired", {
      id: weapon.id,
      x: projectileObject.x,
      y: projectileObject.y,
    });
  }

  private ensureOrbitals(weapon: RuntimeWeapon) {
    const expectedCount = Math.max(1, Math.round(weapon.stats.orbitalCount));
    const children = this.orbitalGroup.getChildren();
    let activeCount = 0;

    for (let index = 0; index < children.length; index++) {
      const orbital = children[index];
      if (
        orbital instanceof OrbitalWeapon &&
        orbital.active &&
        orbital.ownerWeaponId === weapon.id
      ) {
        activeCount++;
      }
    }

    if (activeCount === expectedCount) {
      const time = this.props.scene.time.now;
      for (let index = 0; index < children.length; index++) {
        const orbital = children[index];
        if (
          orbital instanceof OrbitalWeapon &&
          orbital.active &&
          orbital.ownerWeaponId === weapon.id
        ) {
          orbital.updateOrbit(this.props.player, time);
        }
      }
      return;
    }

    for (let index = 0; index < children.length; index++) {
      const orbital = children[index];
      if (
        orbital instanceof OrbitalWeapon &&
        orbital.active &&
        orbital.ownerWeaponId === weapon.id
      ) {
        orbital.despawn();
      }
    }

    for (let slot = 0; slot < expectedCount; slot++) {
      const orbital = this.orbitalGroup.get(
        this.props.player.x,
        this.props.player.y,
        weapon.config.texture,
      ) as OrbitalWeapon | null;

      if (!orbital) continue;

      this.registerCollisionBody(orbital);
      orbital.spawn({
        ownerWeaponId: weapon.id,
        texture: weapon.config.texture,
        slot,
        count: expectedCount,
        radius: weapon.stats.orbitRadius,
        angularSpeed: weapon.stats.angularSpeed,
        payload: this.createPayload(weapon),
        hitCooldownMs: weapon.stats.hitCooldownMs,
      });
      orbital.updateOrbit(this.props.player, this.props.scene.time.now);
    }
  }

  private updatePooledObjects(time: number) {
    const projectiles = this.projectileGroup.getChildren();
    for (let index = 0; index < projectiles.length; index++) {
      const projectile = projectiles[index];
      if (!(projectile instanceof Projectile) || !projectile.active) continue;
      if (!projectile.hasExpired(time) && !this.isBeyondMaxRange(projectile)) {
        continue;
      }

      if (projectile.behavior === "exploding") {
        this.spawnExplosion(projectile, time);
      }
      projectile.despawn();
    }

    const rollingProjectiles = this.rollingProjectileGroup.getChildren();
    for (let index = 0; index < rollingProjectiles.length; index++) {
      const projectile = rollingProjectiles[index];
      if (!(projectile instanceof Projectile) || !projectile.active) continue;

      if (projectile.hasExpired(time) || this.isBeyondMaxRange(projectile)) {
        projectile.despawn();
      }
    }

    const shouldCheckAreas = time >= this.nextAreaCollisionCheckAt;
    const hitboxes = this.hitboxGroup.getChildren();
    for (let index = 0; index < hitboxes.length; index++) {
      const hitbox = hitboxes[index];
      if (!(hitbox instanceof AreaHitbox) || !hitbox.active) continue;

      if (hitbox.hasExpired(time)) {
        hitbox.despawn();
        continue;
      }

      if (!shouldCheckAreas) continue;

      const { halfWidth, halfHeight } = hitbox.getQueryBounds();
      const nearbyEnemies = this.targetingSystem.inBounds(
        hitbox,
        halfWidth,
        halfHeight,
      );

      for (
        let enemyIndex = 0;
        enemyIndex < nearbyEnemies.length;
        enemyIndex++
      ) {
        const enemy = nearbyEnemies[enemyIndex];
        if (!enemy.active || !hitbox.canHit(enemy, time)) continue;

        hitbox.registerHit(enemy, time);
        this.damageSystem.applyDamage(enemy, hitbox.payload, time);
      }
    }

    if (shouldCheckAreas) {
      this.nextAreaCollisionCheckAt = time + 50;
    }

    const slashHitboxes = this.slashHitboxGroup.getChildren();
    for (let index = 0; index < slashHitboxes.length; index++) {
      const hitbox = slashHitboxes[index];
      if (
        hitbox instanceof SlashHitbox &&
        hitbox.active &&
        hitbox.hasExpired(time)
      ) {
        hitbox.despawn();
      }
    }

    const orbitals = this.orbitalGroup.getChildren();
    for (let index = 0; index < orbitals.length; index++) {
      const orbital = orbitals[index];
      if (!(orbital instanceof OrbitalWeapon) || !orbital.active) continue;

      orbital.updateOrbit(this.props.player, time);
    }

    const bees = this.beeGroup.getChildren();
    for (let index = 0; index < bees.length; index++) {
      const bee = bees[index];
      if (!(bee instanceof HomingBee) || !bee.active) continue;

      const stingTarget = bee.update(time, {
        targeting: this.targetingSystem,
        anchor: this.props.player,
      });

      if (stingTarget) {
        this.damageSystem.applyDamage(stingTarget, bee.payload, time);
      }
    }
  }

  private handleWeaponCollision(
    weaponObject: Phaser.GameObjects.GameObject,
    enemy: EnemyLike,
  ) {
    if (weaponObject instanceof Projectile) {
      this.handleProjectileHit(weaponObject, enemy);
      return;
    }

    if (weaponObject instanceof SlashHitbox) {
      this.handleHitboxHit(weaponObject, enemy);
      return;
    }

    if (weaponObject instanceof OrbitalWeapon) {
      this.handleOrbitalHit(weaponObject, enemy);
    }
  }

  private registerCollisionBody(weaponObject: Phaser.GameObjects.GameObject) {
    if (!this.weaponCollisionGroup.contains(weaponObject)) {
      this.weaponCollisionGroup.add(weaponObject);
    }
  }

  private handleProjectileHit(projectile: Projectile, enemy: EnemyLike) {
    if (!projectile.active || projectile.shouldIgnoreOverlap(enemy)) return;
    if (!projectile.canHit(enemy)) return;

    const time = this.props.scene.time.now;

    projectile.registerHit(enemy, time);

    if (projectile.behavior === "exploding") {
      this.spawnExplosion(projectile, time);
      projectile.despawn();
      return;
    }

    const payload = projectile.getHitPayload(enemy, time);
    this.damageSystem.applyDamage(enemy, payload, time);

    if (projectile.behavior === "bouncing") {
      projectile.bounceRemaining -= 1;

      const activeEnemies = this.targetingSystem.inRadius(
        this.props.player,
        COMBAT_CONFIG.maxWeaponRange,
      );
      const nextTarget = projectile.pickBounceTarget(activeEnemies);

      if (projectile.bounceRemaining >= 0 && nextTarget) {
        projectile.activateRicochet();
        projectile.redirectTo(nextTarget, this.getProjectileSpeed(projectile));
        return;
      }

      projectile.despawn();
      return;
    }

    if (projectile.pierceRemaining <= 0) {
      projectile.despawn();
      return;
    }

    projectile.pierceRemaining -= 1;
  }

  private handleHitboxHit(
    hitbox: Phaser.GameObjects.GameObject,
    enemy: EnemyLike,
  ) {
    const time = this.props.scene.time.now;

    if (hitbox instanceof SlashHitbox) {
      if (!hitbox.canHit(enemy)) return;
      hitbox.registerHit(enemy);
      this.damageSystem.applyDamage(enemy, hitbox.payload, time);
    }
  }

  private handleOrbitalHit(orbital: OrbitalWeapon, enemy: EnemyLike) {
    const time = this.props.scene.time.now;
    if (!orbital.active || !orbital.canHit(enemy, time)) return;

    orbital.registerHit(enemy, time);
    this.damageSystem.applyDamage(enemy, orbital.payload, time);
  }

  private spawnExplosion(projectile: Projectile, time: number) {
    const weapon = this.activeWeapons.get(projectile.ownerWeaponId);
    if (!weapon) return;

    this.spawnArea({
      x: projectile.x,
      y: projectile.y,
      texture: WEAPON_POISON_VIAL_EXPLOSION_TEXTURE_KEY,
      radius: weapon.stats.areaRadius,
      expiresAt: time + WEAPON_POISON_VIAL_EXPLOSION_ANIMATION_MS,
      payload: {
        ...projectile.payload,
        damageType: "explosion",
      },
      hitCooldownMs: weapon.stats.hitCooldownMs,
      persistent: false,
      animationKey: WEAPON_POISON_VIAL_EXPLOSION_ANIMATION_KEY,
      despawnOnAnimationComplete: true,
      hitboxShape: "spriteBounds",
    });
  }

  private spawnArea({
    x,
    y,
    texture,
    radius,
    expiresAt,
    payload,
    hitCooldownMs,
    persistent,
    animationKey,
    despawnOnAnimationComplete,
    hitboxShape,
    hitboxSize,
    depth,
  }: {
    x: number;
    y: number;
    texture: string;
    radius: number;
    expiresAt: number;
    payload: DamagePayload;
    hitCooldownMs: number;
    persistent: boolean;
    animationKey?: string;
    despawnOnAnimationComplete?: boolean;
    hitboxShape?: "circle" | "spriteBounds";
    hitboxSize?: { width: number; height: number };
    depth?: number;
  }) {
    const hitbox = this.hitboxGroup.get(x, y, texture) as AreaHitbox | null;

    if (!hitbox) return;

    hitbox.spawn({
      x,
      y,
      texture,
      radius,
      expiresAt,
      payload,
      hitCooldownMs,
      persistent,
      animationKey,
      despawnOnAnimationComplete,
      hitboxShape,
      hitboxSize,
      depth,
    });
    EventBus.emit("weapon:aoe", {
      sourceWeaponId: payload.sourceWeaponId,
      x,
      y,
      radius,
    });
  }

  private createPayload(weapon: RuntimeWeapon): DamagePayload {
    const statusEffects = weapon.config.statusEffects?.map((status) => ({
      ...status,
      durationMs: weapon.stats.statusDurationMs || status.durationMs,
      tickMs: weapon.stats.dotTickMs || status.tickMs,
      damagePerTick:
        status.damagePerTick !== undefined
          ? weapon.stats.dotDamage || status.damagePerTick
          : undefined,
    }));

    return {
      sourceWeaponId: weapon.id,
      amount: weapon.stats.damage,
      damageType: weapon.config.damageType,
      statusEffects,
      damage: 0,
    };
  }

  private getEffectiveRange(weapon: RuntimeWeapon) {
    return Math.min(weapon.stats.range, COMBAT_CONFIG.maxWeaponRange);
  }

  private nearestInRange(excluded?: ReadonlySet<EnemyLike>) {
    const { player } = this.props;
    const target = this.targetingSystem.nearest(player, undefined, excluded);

    if (
      !target ||
      distanceBetween(player, enemyCenter(target)) >
        COMBAT_CONFIG.maxWeaponRange
    ) {
      return undefined;
    }

    return target;
  }

  private isBeyondMaxRange(object: { x: number; y: number }) {
    return (
      distanceBetween(this.props.player, object) > COMBAT_CONFIG.maxWeaponRange
    );
  }

  private updateAimVector() {
    if (this.props.scene.movementAngle !== undefined) {
      this.lastAimVector = vectorFromAngleDegrees(
        this.props.scene.movementAngle,
      );
      return;
    }

    const body = this.props.player.body as
      Phaser.Physics.Arcade.Body | null | undefined;

    if (body && (body.velocity.x !== 0 || body.velocity.y !== 0)) {
      this.lastAimVector = normalizeVector(body.velocity);
      return;
    }

    if (!this.lastAimVector) {
      this.lastAimVector = this.props.scene.isFacingLeft
        ? { x: -1, y: 0 }
        : { ...FALLBACK_AIM_VECTOR };
    }
  }

  private getSpreadDirections(
    direction: Vector,
    projectileCount: number,
    spreadDegrees: number,
  ) {
    if (projectileCount <= 1) return [normalizeVector(direction)];

    const start = -(spreadDegrees * (projectileCount - 1)) / 2;

    return Array.from({ length: projectileCount }).map((_, index) =>
      rotateVector(direction, start + spreadDegrees * index),
    );
  }

  private getProjectileSpeed(projectile: Projectile) {
    const weapon = this.activeWeapons.get(projectile.ownerWeaponId);

    return weapon?.stats.projectileSpeed ?? 0;
  }

  private clearGroup(group: Phaser.GameObjects.Group) {
    const children = this.getSafeGroupChildren(group);
    if (!children.length) return;

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if ("despawn" in child && typeof child.despawn === "function") {
        child.despawn();
      } else {
        (child as Phaser.GameObjects.Sprite).setActive(false).setVisible(false);
      }
    }
  }

  private getSafeGroupChildren(group?: Phaser.GameObjects.Group) {
    if (!group || !(group as any).scene)
      return [] as Phaser.GameObjects.GameObject[];

    try {
      return group.getChildren();
    } catch {
      return [];
    }
  }

  private destroyGroup(
    group?: Phaser.GameObjects.Group,
    destroyChildren = true,
  ) {
    if (!group) return;

    try {
      group.destroy(destroyChildren);
    } catch {
      // Scene shutdown can partially tear down Arcade groups before this runs.
    }
  }

  private createFallbackTextures() {
    const { scene } = this.props;
    const graphics = scene.add.graphics();

    const circleTexture = (key: string, color: number, size = 16) => {
      if (scene.textures.exists(key)) return;
      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillCircle(size / 2, size / 2, size / 2);
      graphics.generateTexture(key, size, size);
    };

    const rectTexture = (
      key: string,
      color: number,
      width = 18,
      height = 8,
    ) => {
      if (scene.textures.exists(key)) return;
      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, width, height);
      graphics.generateTexture(key, width, height);
    };

    circleTexture("weapon_projectile", 0xffffff, 8); // Basic projectile
    circleTexture("weapon_darkness_book_projectile", 0x5bbcff, 8); // Darkness Book projectile
    circleTexture("weapon_poison_vial_projectile", 0xffd447, 10); // Poison Vial projectile
    circleTexture("weapon_blood_knife", 0xe14242, 10); // Blood Knife projectile
    circleTexture("weapon_banished_jack_o_lantern", 0xf28c28, 14); // Pumpkin
    circleTexture("weapon_banished_jack_o_lantern_horizontal", 0xf28c28, 14);
    circleTexture("weapon_banished_jack_o_lantern_vertical", 0xf28c28, 14);
    circleTexture("weapon_banished_jack_o_lantern_diagonal", 0xf28c28, 14);
    circleTexture("weapon_frost_flower", 0xbfe9ff, 14); // Frost Flower
    circleTexture("weapon_moss_ground", 0xd8b35a, 20); // Moss Ground
    circleTexture("weapon_fly_storm", 0xf4c430, 10);
    circleTexture("weapon_fly_storm_spawn", 0xfff6a3, 12);
    circleTexture("weapon_poison_vial_explosion", 0xff8f3a, 48);
    circleTexture("weapon_hitbox", 0xffffff, 32); // Moss Ground area
    circleTexture("weapon_cursed_coffin", 0x290264, 20); // Cursed Coffin
    circleTexture("weapon_cursed_coffin_shard", 0x7b4bd6, 8); // Coffin shard
    rectTexture("weapon_frost_chain", 0x8bcef7, 16, 4); // Frost Chain
    rectTexture("weapon_crimson_vial", 0xe43b44, 16, 4); // Crimson Vial tether
    rectTexture("weapon_frozen_skull", 0xcfd7e6, 18, 6); // Frozen Skull
    rectTexture("weapon_slash", 0xe8f2ff, 42, 14); // Scythe slash
    rectTexture("weapon_blood_scythe", 0xe8f2ff, 45, 44); // Blood Scythe

    graphics.destroy();
  }
}
