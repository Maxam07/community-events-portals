import type {
  DamagePayload,
  EnemyLike,
  StatusEffectConfig,
  StatusEffectId,
} from "../../Types";

type ActiveStatusEffect = StatusEffectConfig & {
  expiresAt: number;
  nextTickAt: number;
};

type DamageApplier = (
  enemy: EnemyLike,
  payload: DamagePayload,
  time: number,
  options?: { skipStatusEffects?: boolean },
) => boolean;

type StatusEffectListener = (
  enemy: EnemyLike,
  effectId: StatusEffectId,
) => void;

export class StatusEffectSystem {
  private readonly effects = new Map<EnemyLike, ActiveStatusEffect[]>();
  private applyDamage?: DamageApplier;
  private onApply?: StatusEffectListener;
  private onTick?: StatusEffectListener;
  private onExpire?: StatusEffectListener;

  public setDamageApplier(applyDamage: DamageApplier) {
    this.applyDamage = applyDamage;
  }

  // Visual hooks: fired when an effect is applied, on every damage tick and
  // when an effect ends.
  public setListeners({
    onApply,
    onTick,
    onExpire,
  }: {
    onApply?: StatusEffectListener;
    onTick?: StatusEffectListener;
    onExpire?: StatusEffectListener;
  }) {
    this.onApply = onApply;
    this.onTick = onTick;
    this.onExpire = onExpire;
  }

  public apply(enemy: EnemyLike, statuses: StatusEffectConfig[], time: number) {
    const current = this.effects.get(enemy) ?? [];

    statuses.forEach((status) => {
      const existing = current.find((effect) => effect.id === status.id);
      const activeEffect: ActiveStatusEffect = {
        ...status,
        expiresAt: time + status.durationMs,
        nextTickAt: time + (status.tickMs ?? status.durationMs),
      };

      if (existing && status.refreshMode === "refresh") {
        existing.expiresAt = activeEffect.expiresAt;
        existing.nextTickAt = Math.min(
          existing.nextTickAt,
          activeEffect.nextTickAt,
        );
      } else {
        current.push(activeEffect);
      }

      this.onApply?.(enemy, status.id);
    });

    enemy.statusEffects = {
      ...(enemy.statusEffects ?? {}),
      ...Object.fromEntries(statuses.map((status) => [status.id, time])),
    };

    this.effects.set(enemy, current);
    this.syncMovementMultiplier(enemy, current);
  }

  public hasEffect(enemy: EnemyLike, effectId: StatusEffectId) {
    return !!this.effects.get(enemy)?.some((effect) => effect.id === effectId);
  }

  public update(time: number) {
    this.effects.forEach((effects, enemy) => {
      // Dead or destroyed enemies: drop their effects without touching them.
      if (!enemy.active || enemy.isDead || !enemy.scene) {
        effects.forEach((effect) => this.onExpire?.(enemy, effect.id));
        this.effects.delete(enemy);
        return;
      }

      const activeEffects = effects.filter((effect) => {
        if (time >= effect.expiresAt) {
          this.onExpire?.(enemy, effect.id);
          return false;
        }

        if (
          effect.damagePerTick !== undefined &&
          effect.tickMs !== undefined &&
          time >= effect.nextTickAt
        ) {
          effect.nextTickAt = time + effect.tickMs;
          this.applyDamage?.(
            enemy,
            {
              sourceWeaponId: effect.sourceWeaponId ?? "oil",
              amount: effect.damagePerTick,
              damageType: "dot",
            },
            time,
            { skipStatusEffects: true },
          );
          this.onTick?.(enemy, effect.id);
        }

        return true;
      });

      if (activeEffects.length === 0) {
        enemy.setMovementMultiplier?.(1);
        this.effects.delete(enemy);
        return;
      }

      if (activeEffects.length !== effects.length) {
        this.syncMovementMultiplier(enemy, activeEffects);
      }

      this.effects.set(enemy, activeEffects);
    });
  }

  public reset() {
    this.effects.forEach((effects, enemy) => {
      enemy.setMovementMultiplier?.(1);
      effects.forEach((effect) => this.onExpire?.(enemy, effect.id));
    });
    this.effects.clear();
  }

  public shutdown() {
    this.reset();
    this.applyDamage = undefined;
    this.onApply = undefined;
    this.onTick = undefined;
    this.onExpire = undefined;
  }

  // The strongest movement effect wins (e.g. a stun overrides a slow).
  private syncMovementMultiplier(
    enemy: EnemyLike,
    effects: ActiveStatusEffect[],
  ) {
    let multiplier = 1;

    for (let index = 0; index < effects.length; index++) {
      const speedMultiplier = effects[index].speedMultiplier;
      if (speedMultiplier !== undefined) {
        multiplier = Math.min(multiplier, speedMultiplier);
      }
    }

    enemy.setMovementMultiplier?.(multiplier);
  }
}
