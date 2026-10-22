import type { EnemyLike, WeaponId } from "../../Types";

// Several hits from the same weapon on the same enemy inside a short window
// (e.g. the shards of a cursed coffin, knives that cross, frost flower shots)
// do not add up linearly: the damage of the burst grows like n^STACKED_HIT_EXPONENT
// (0.5 = square root, same idea as the bees), so every extra hit is worth less.
//
//   hits in the window | multiplier of the last hit | total damage vs one hit
//   1                  | 1.00                        | 1.00x
//   2                  | 0.41                        | 1.41x
//   3                  | 0.32                        | 1.73x
//   4                  | 0.27                        | 2.00x
//   9                  | 0.17                        | 3.00x
export const STACKED_HIT_WINDOW_MS = 100;
export const STACKED_HIT_EXPONENT = 0.5;

// Weapons that must always deal full damage per hit.
export const STACKED_HIT_EXEMPT_WEAPONS: ReadonlySet<WeaponId> =
  new Set<WeaponId>(["darknessBook", "poisonVial", "banishedJackOLantern"]);

const recentHits = new WeakMap<EnemyLike, Map<WeaponId, number[]>>();

// Registers one hit of `weaponId` on `enemy` at `now` (ms) and returns the
// multiplier that must be applied to that hit's damage. Call it once per hit
// that actually lands, in the order the hits are resolved.
export const getStackedHitMultiplier = (
  enemy: EnemyLike,
  weaponId: WeaponId,
  now: number,
): number => {
  if (STACKED_HIT_EXEMPT_WEAPONS.has(weaponId)) return 1;

  let byWeapon = recentHits.get(enemy);
  if (!byWeapon) {
    byWeapon = new Map();
    recentHits.set(enemy, byWeapon);
  }

  const hits = (byWeapon.get(weaponId) ?? []).filter(
    (time) => now - time < STACKED_HIT_WINDOW_MS,
  );
  hits.push(now);
  byWeapon.set(weaponId, hits);

  const count = hits.length;

  return count ** STACKED_HIT_EXPONENT - (count - 1) ** STACKED_HIT_EXPONENT;
};
