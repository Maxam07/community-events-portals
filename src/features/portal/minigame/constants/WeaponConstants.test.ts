import { resolveWeaponStats } from "./WeaponConstants";

describe("WeaponConstants", () => {
  it("resolves weapon stats without wearables", () => {
    expect(resolveWeaponStats("poisonVial", 1).projectileSpeed).toBe(95);
    expect(resolveWeaponStats("mossGround", 1).durationMs).toBe(2000);
  });

  it("applies active wearable buffs to weapon stats", () => {
    const activeWearables = {
      tool: "Carrot Pitchfork",
      background: "Slime Wall Background",
    } as never;

    expect(
      resolveWeaponStats("poisonVial", 1, activeWearables).projectileSpeed,
    ).toBe(103);
    expect(
      resolveWeaponStats("mossGround", 1, activeWearables).durationMs,
    ).toBe(2100);
  });

  it("resolves Cursed Coffin from level 1 to level 8", () => {
    const level1 = resolveWeaponStats("cursedCoffin", 1);
    const level8 = resolveWeaponStats("cursedCoffin", 8);

    expect([
      level1.projectileCount,
      level1.damage,
      level1.areaRadius,
      level1.cooldownMs,
    ]).toEqual([3, 3, 60, 2200]);
    expect([
      level8.projectileCount,
      level8.damage,
      level8.areaRadius,
      level8.cooldownMs,
    ]).toEqual([8, 9, 120, 1100]);
  });

  it("resolves Frost Chain from level 1 to level 8", () => {
    const level1 = resolveWeaponStats("frostChain", 1);
    const level8 = resolveWeaponStats("frostChain", 8);

    expect([
      level1.damage,
      level1.knockback,
      level1.range,
      level1.cooldownMs,
    ]).toEqual([4, 30, 55, 1600]);
    expect([
      level8.damage,
      level8.knockback,
      level8.range,
      level8.cooldownMs,
    ]).toEqual([12, 70, 90, 800]);
  });

  it("resolves Crimson Vial from level 1 to level 8", () => {
    const level1 = resolveWeaponStats("crimsonVial", 1);
    const level8 = resolveWeaponStats("crimsonVial", 8);

    expect([
      level1.dotDamage,
      level1.statusDurationMs,
      level1.projectileCount,
      level1.cooldownMs,
    ]).toEqual([2, 1500, 1, 2000]);
    expect([
      level8.dotDamage,
      level8.statusDurationMs,
      level8.projectileCount,
      level8.cooldownMs,
    ]).toEqual([7, 3000, 2, 1000]);
  });
});
