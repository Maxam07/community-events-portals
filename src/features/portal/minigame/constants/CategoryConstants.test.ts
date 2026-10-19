import {
  getCategoryCounts,
  getSpecialPowerPreview,
  resolveSpecialPower,
  CATEGORY_CONFIGS,
  WEAPON_CATEGORIES,
} from "./CategoryConstants";

describe("CategoryConstants", () => {
  it("counts categories of unlocked weapons only", () => {
    expect(
      getCategoryCounts({
        mossGround: 1,
        poisonVial: 3,
        flyStorm: 0,
        frozenSkull: 2,
      }),
    ).toEqual({ plague: 2, frost: 1, curse: 0, bloodyHarvest: 0 });
  });

  it("returns no power without weapons or with a single weapon", () => {
    expect(resolveSpecialPower({}).kind).toBe("none");
    expect(resolveSpecialPower({ mossGround: 1 }).kind).toBe("none");
  });

  it("returns a pure power for 3 + 1", () => {
    const power = resolveSpecialPower({
      mossGround: 1,
      poisonVial: 1,
      flyStorm: 1,
      frozenSkull: 1,
    });

    expect(power.kind).toBe("pure");
    expect(power.categories).toEqual(["plague"]);
    expect(power.activeMs).toBe(CATEGORY_CONFIGS.plague.baseActiveMs);
    expect(power.activeMsByCategory).toEqual({ plague: 5000 });
  });

  it("returns a hybrid power for 2 + 2", () => {
    const power = resolveSpecialPower({
      frozenSkull: 1,
      frostFlower: 1,
      bloodKnife: 1,
      bloodScythe: 1,
    });

    expect(power.kind).toBe("hybrid");
    expect(power.categories).toEqual(["frost", "bloodyHarvest"]);
    // Each power at 50% of its own duration; activeMs is the longest one
    expect(power.activeMsByCategory).toEqual({
      frost: 5000,
      bloodyHarvest: 3500,
    });
    expect(power.activeMs).toBe(5000);
  });

  it("returns a partial power for 2 + 1 + 1 and for 2 weapons", () => {
    const power = resolveSpecialPower({
      frozenSkull: 1,
      frostFlower: 1,
      mossGround: 1,
      bloodKnife: 1,
    });

    expect(power.kind).toBe("partial");
    expect(power.categories).toEqual(["frost"]);
    expect(power.activeMs).toBe(7000);
    expect(power.activeMsByCategory).toEqual({ frost: 7000 });
    expect(resolveSpecialPower({ frozenSkull: 1, frostFlower: 2 }).kind).toBe(
      "partial",
    );
  });

  it("returns no power for 1 + 1 + 1 + 1", () => {
    expect(
      resolveSpecialPower({
        mossGround: 1,
        frozenSkull: 1,
        cursedCoffin: 1,
        bloodKnife: 1,
      }).kind,
    ).toBe("none");
  });

  it("previews the power a new weapon would unlock", () => {
    const preview = getSpecialPowerPreview(
      { mossGround: 1 },
      { kind: "newWeapon", weaponId: "poisonVial", toLevel: 1 },
    );

    expect(preview.changed).toBe(true);
    expect(preview.current.kind).toBe("none");
    expect(preview.next.kind).toBe("partial");

    expect(
      getSpecialPowerPreview(
        { mossGround: 1, poisonVial: 1 },
        { kind: "upgradeWeapon", weaponId: "poisonVial", toLevel: 2 },
      ).changed,
    ).toBe(false);
  });

  it("assigns the new weapons to their categories", () => {
    expect(WEAPON_CATEGORIES.cursedCoffin).toBe("curse");
    expect(WEAPON_CATEGORIES.frostChain).toBe("frost");
    expect(WEAPON_CATEGORIES.crimsonVial).toBe("bloodyHarvest");
  });
});
