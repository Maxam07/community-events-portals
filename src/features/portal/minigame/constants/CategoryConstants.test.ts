import {
  getCategoryCounts,
  getSpecialPowerPreview,
  resolveSpecialPower,
  CATEGORY_CONFIGS,
} from "./CategoryConstants";

describe("CategoryConstants", () => {
  it("counts categories of unlocked weapons only", () => {
    expect(
      getCategoryCounts({ oil: 1, corn: 3, beehive: 0, banana: 2 }),
    ).toEqual({ plague: 2, frost: 0, curse: 1, bloodyHarvest: 0 });
  });

  it("returns no power without weapons or with a single weapon", () => {
    expect(resolveSpecialPower({}).kind).toBe("none");
    expect(resolveSpecialPower({ oil: 1 }).kind).toBe("none");
  });

  it("returns a pure power for 3 + 1", () => {
    const power = resolveSpecialPower({
      oil: 1,
      corn: 1,
      beehive: 1,
      banana: 1,
    });

    expect(power.kind).toBe("pure");
    expect(power.categories).toEqual(["plague"]);
    expect(power.activeMs).toBe(CATEGORY_CONFIGS.plague.baseActiveMs);
    expect(power.activeMsByCategory).toEqual({ plague: 5000 });
  });

  it("returns a hybrid power for 2 + 2", () => {
    const power = resolveSpecialPower({
      wateringCan: 1,
      pumpkin: 1,
      tomato: 1,
      broomScythe: 1,
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
      banana: 1,
      sunflower: 1,
      oil: 1,
      tomato: 1,
    });

    expect(power.kind).toBe("partial");
    expect(power.categories).toEqual(["curse"]);
    expect(power.activeMs).toBe(4900);
    expect(power.activeMsByCategory).toEqual({ curse: 4900 });
    expect(resolveSpecialPower({ banana: 1, sunflower: 2 }).kind).toBe(
      "partial",
    );
  });

  it("returns no power for 1 + 1 + 1 + 1", () => {
    expect(
      resolveSpecialPower({ oil: 1, pumpkin: 1, banana: 1, tomato: 1 }).kind,
    ).toBe("none");
  });

  it("previews the power a new weapon would unlock", () => {
    const preview = getSpecialPowerPreview(
      { oil: 1 },
      { kind: "newWeapon", weaponId: "corn", toLevel: 1 },
    );

    expect(preview.changed).toBe(true);
    expect(preview.current.kind).toBe("none");
    expect(preview.next.kind).toBe("partial");

    expect(
      getSpecialPowerPreview(
        { oil: 1, corn: 1 },
        { kind: "upgradeWeapon", weaponId: "corn", toLevel: 2 },
      ).changed,
    ).toBe(false);
  });
});
