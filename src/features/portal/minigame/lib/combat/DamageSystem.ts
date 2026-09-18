import type { MachineInterpreter } from "../Machine";
import type { DamagePayload, EnemyLike } from "../../Types";
import { EventBus } from "../EventBus";
import { isEnemyAlive } from "./geometry";
import type { StatusEffectSystem } from "./StatusEffectSystem";
import { COMBAT_CONFIG } from "../../constants";
import { getPerkAmount } from "../../constants/PerkConstants";
import { WeaponSfxLimiter } from "./WeaponSfxLimiter";
import type { Scene } from "../../Scene";

const CRITICAL_HIT_MULTIPLIER = 2;
// Placeholder SFX key for a critical hit - register a real sound under this
// key in the scene's audio loader whenever art/audio for it lands.
const CRITICAL_HIT_SFX_KEY = "critical_hit";
const CRITICAL_HIT_SFX_VOL = 0.35;

export class DamageSystem {
  private statusEffectSystem?: StatusEffectSystem;

  constructor(
    private readonly portalService?: MachineInterpreter,
    private readonly scene?: Scene,
  ) {}

  public setStatusEffectSystem(statusEffectSystem: StatusEffectSystem) {
    this.statusEffectSystem = statusEffectSystem;
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

    if (!options.skipStatusEffects && payload.statusEffects?.length) {
      this.statusEffectSystem?.apply(enemy, payload.statusEffects, time);
    }

    EventBus.emit("weapon:hit", {
      enemy,
      sourceWeaponId: payload.sourceWeaponId,
      amount: resolvedPayload.amount,
      damageType: payload.damageType,
      isCriticalHit,
    });

    if (enemy.isDead || enemy.hp === 0) {
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
