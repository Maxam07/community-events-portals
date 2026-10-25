import type { MachineInterpreter } from "../Machine";
import type {
  DamagePayload,
  EnemyLike,
  SpecialPower,
  StatusEffectConfig,
  WeaponCategoryId,
} from "../../Types";
import { EventBus } from "../EventBus";
import { isEnemyAlive } from "./geometry";
import type { StatusEffectSystem } from "./StatusEffectSystem";
import {
  COMBAT_CONFIG,
  getCategoryPowerEffects,
  getPlaguePoisonStatus,
  WEAPON_CATEGORIES,
} from "../../constants";
import { getPerkAmount } from "../../constants/PerkConstants";
import { WeaponSfxLimiter } from "./WeaponSfxLimiter";
import type { Scene } from "../../Scene";

const CRITICAL_HIT_MULTIPLIER = 2;
// Placeholder SFX key for a critical hit - register a real sound under this
// key in the scene's audio loader whenever art/audio for it lands.
const CRITICAL_HIT_SFX_KEY = "critical_hit";
const CRITICAL_HIT_SFX_VOL = 0.35;

// Lifesteal heals are batched to avoid one XState event per kill.
const LIFESTEAL_FLUSH_MS = 250;

export class DamageSystem {
  private statusEffectSystem?: StatusEffectSystem;
  private specialPower: SpecialPower | null = null;
  private onLifesteal?: (enemy: EnemyLike) => void;
  private onHeal?: (amount: number) => void;
  private onCategoryHit?: (
    enemy: EnemyLike,
    category: WeaponCategoryId,
  ) => void;
  private pendingHeal = 0;
  private nextHealFlushAt = 0;

  constructor(
    private readonly portalService?: MachineInterpreter,
    private readonly scene?: Scene,
  ) {}

  public setStatusEffectSystem(statusEffectSystem: StatusEffectSystem) {
    this.statusEffectSystem = statusEffectSystem;
  }

  // Active Special Power (null when inactive). While set, every direct
  // weapon hit applies the effect of each category in the power.
  public setSpecialPower(power: SpecialPower | null) {
    this.specialPower = power && power.kind !== "none" ? power : null;
  }

  public setLifestealListener(onLifesteal?: (enemy: EnemyLike) => void) {
    this.onLifesteal = onLifesteal;
  }

  // Fired with the batched HP amount sent to XState (player feedback).
  public setHealListener(onHeal?: (amount: number) => void) {
    this.onHeal = onHeal;
  }

  // Fired once per direct weapon hit with the category of the weapon.
  public setCategoryHitListener(
    onCategoryHit?: (enemy: EnemyLike, category: WeaponCategoryId) => void,
  ) {
    this.onCategoryHit = onCategoryHit;
  }

  public update(time: number) {
    if (this.pendingHeal <= 0 || time < this.nextHealFlushAt) return;

    this.portalService?.send("HEAL", { amount: this.pendingHeal });
    this.onHeal?.(this.pendingHeal);
    this.pendingHeal = 0;
    this.nextHealFlushAt = time + LIFESTEAL_FLUSH_MS;
  }

  public reset() {
    this.specialPower = null;
    this.pendingHeal = 0;
    this.nextHealFlushAt = 0;
  }

  // Special Power effects scale with the player level (Machine context).
  private getPlayerLevel() {
    return this.portalService?.state.context.playerLevel ?? 1;
  }

  private getSpecialPowerStatuses(
    payload: DamagePayload,
    enemy: EnemyLike,
  ): StatusEffectConfig[] {
    if (!this.specialPower) return [];

    const level = this.getPlayerLevel();
    const effects = getCategoryPowerEffects(level);
    const statuses: StatusEffectConfig[] = [];

    this.specialPower.categories.forEach((category) => {
      switch (category) {
        case "plague":
          // Poison is a % of THIS enemy's max HP per second.
          statuses.push({
            ...getPlaguePoisonStatus(enemy.maxHp, level),
            sourceWeaponId: payload.sourceWeaponId,
          });
          break;
        case "frost":
          statuses.push({
            ...effects.frost,
            sourceWeaponId: payload.sourceWeaponId,
          });
          break;
        case "curse":
          statuses.push({
            ...effects.curse,
            sourceWeaponId: payload.sourceWeaponId,
          });
          break;
        default:
          // bloodyHarvest has no status effect (lifesteal, see applyLifesteal)
          break;
      }
    });

    return statuses;
  }

  // The Bloody Harvest: every enemy killed while the power is active (direct
  // hit or damage-over-time tick) steals HP for the player.
  private applyLifesteal(enemy: EnemyLike) {
    if (!this.specialPower?.categories.includes("bloodyHarvest")) return;

    this.pendingHeal += getCategoryPowerEffects(
      this.getPlayerLevel(),
    ).bloodyHarvest.healPerKill;
    this.onLifesteal?.(enemy);
  }

  public applyDamage(
    enemy: EnemyLike,
    payload: DamagePayload,
    time: number,
    options: { skipStatusEffects?: boolean } = {},
  ) {
    if (!isEnemyAlive(enemy)) return false;

    const criticalChance = getPerkAmount(
      this.portalService?.state.context.perkLevels,
      "criticalChance",
    );
    const isCriticalHit = criticalChance > 0 && Math.random() < criticalChance;

    // Damage is fully resolved upstream by resolveWeaponStats (base stats +
    // upgrades + wearable weaponStat buffs + perks), so this layer only
    // needs to apply the Critical Chance perk on top of the payload amount.
    const resolvedPayload = {
      ...payload,
      amount: payload.amount * (isCriticalHit ? CRITICAL_HIT_MULTIPLIER : 1),
    };

    if (enemy.takeDamage) {
      enemy.takeDamage(resolvedPayload.amount, resolvedPayload);
    } else if (enemy.hp !== undefined) {
      enemy.hp = Math.max(0, enemy.hp - resolvedPayload.amount);
      enemy.isDead = enemy.hp <= 0;
    }

    if (!options.skipStatusEffects) {
      this.onCategoryHit?.(enemy, WEAPON_CATEGORIES[payload.sourceWeaponId]);
    }

    if (
      payload.knockback &&
      payload.knockbackOrigin &&
      !enemy.isDead &&
      (enemy.maxHp ?? 0) <= 30000
    ) {
      enemy.applyKnockback?.(
        enemy.x - payload.knockbackOrigin.x,
        enemy.y - payload.knockbackOrigin.y,
        payload.knockback,
      );
    }

    if (isCriticalHit) {
      // Visual (tint flash on the enemy sprite) + placeholder SFX. See
      // SwarmMobContainer/BossEnemyContainer#onCriticalHit for the flash.
      enemy.onCriticalHit?.();

      if (this.scene) {
        WeaponSfxLimiter.play(
          this.scene,
          CRITICAL_HIT_SFX_KEY,
          CRITICAL_HIT_SFX_VOL,
        );
      }
    }

    if (!options.skipStatusEffects) {
      const statuses = [
        ...(payload.statusEffects ?? []),
        ...this.getSpecialPowerStatuses(payload, enemy),
      ];

      if (statuses.length) {
        this.statusEffectSystem?.apply(enemy, statuses, time);
      }
    }

    EventBus.emit("weapon:hit", {
      enemy,
      sourceWeaponId: payload.sourceWeaponId,
      amount: resolvedPayload.amount,
      damageType: payload.damageType,
      isCriticalHit,
    });

    if (enemy.isDead || enemy.hp === 0) {
      this.applyLifesteal(enemy);
      enemy.setActive(false);
      enemy.onDeath?.();
      EventBus.emit("enemy:killed", {
        enemy,
        sourceWeaponId: payload.sourceWeaponId,
      });
      EventBus.emit("score:gained", {
        points: COMBAT_CONFIG.defaultEnemyScore,
      });
      this.portalService?.send("GAIN_POINTS", {
        points: COMBAT_CONFIG.defaultEnemyScore,
      });

      return true;
    }

    return false;
  }
}
