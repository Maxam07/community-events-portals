import type { PerkLevels, WeaponId, WeaponLevel } from "../Types";
import {
  buildLevelUpOptionPool,
  getAvailableWeaponChoices,
  getChestLevelUpChoice,
  getLevelUpChoice,
  getNextLevelXP,
  getUnlockedWeapons,
  isPlayerMaxLevel,
  LEVEL_UP_OPTION_COUNT,
  LEVEL_UP_PERK_SLOT_COUNT,
  LEVEL_UP_WEAPON_IDS,
  LEVEL_UP_WEAPON_SLOT_COUNT,
  MAX_PLAYER_WEAPONS,
  pickLevelUpOptions,
  PLAYER_INITIAL_LEVEL,
  PLAYER_LEVEL_XP_REQUIREMENTS,
  PLAYER_MAX_LEVEL,
} from "./PlayerLevelConstants";
import {
  CHEST_BONUS_LEVEL_CHANCES,
  DEFAULT_PERK_LEVELS,
  getBonusLevelChances,
  MAX_PLAYER_PERKS,
  PERK_MAX_LEVEL,
} from "./PerkConstants";
import { WEAPON_MAX_LEVEL } from "./WeaponConstants";

const getWeaponLevels = (
  unlocked: WeaponId[] = [],
): Record<WeaponId, WeaponLevel> =>
  LEVEL_UP_WEAPON_IDS.reduce(
    (levels, weapon) => ({
      ...levels,
      [weapon]: unlocked.includes(weapon) ? 1 : 0,
    }),
    {} as Record<WeaponId, WeaponLevel>,
  );

const getPerkLevels = (overrides: Partial<PerkLevels> = {}): PerkLevels => ({
  ...DEFAULT_PERK_LEVELS,
  ...overrides,
});

const isWeaponKind = (kind: string) =>
  kind === "newWeapon" || kind === "upgradeWeapon";
const isPerkKind = (kind: string) =>
  kind === "newPerk" || kind === "upgradePerk";

// Deterministic chances for tests that shouldn't be flaky.
const NO_BONUS_CHANCES = { chance2: 0, chance3: 0 };
const ALWAYS_BONUS_3_CHANCES = { chance2: 0, chance3: 1 };
const ALWAYS_BONUS_2_CHANCES = { chance2: 1, chance3: 0 };

describe("PlayerLevelConstants", () => {
  it("starts the player at level one and uses editable XP requirements", () => {
    expect(PLAYER_INITIAL_LEVEL).toBe(1);
    expect(getNextLevelXP(1)).toBe(PLAYER_LEVEL_XP_REQUIREMENTS[1]);
    expect(getNextLevelXP(2)).toBe(PLAYER_LEVEL_XP_REQUIREMENTS[2]);
    expect(getNextLevelXP(5)).toBe(PLAYER_LEVEL_XP_REQUIREMENTS[5]);
  });

  it("uses the last configured XP requirement as the player max level", () => {
    const configuredMaxLevel = Math.max(
      ...Object.keys(PLAYER_LEVEL_XP_REQUIREMENTS).map(Number),
    );

    expect(PLAYER_MAX_LEVEL).toBe(configuredMaxLevel);
    expect(isPlayerMaxLevel(PLAYER_MAX_LEVEL - 1)).toBe(false);
    expect(isPlayerMaxLevel(PLAYER_MAX_LEVEL)).toBe(true);
    expect(isPlayerMaxLevel(PLAYER_MAX_LEVEL + 1)).toBe(true);
    expect(getNextLevelXP(PLAYER_MAX_LEVEL - 1)).toBe(
      PLAYER_LEVEL_XP_REQUIREMENTS[PLAYER_MAX_LEVEL - 1],
    );
    expect(getNextLevelXP(PLAYER_MAX_LEVEL)).toBeUndefined();
    expect(getNextLevelXP(PLAYER_MAX_LEVEL + 1)).toBeUndefined();
  });

  it("offers the same unified levelUp choice on every level - no hardcoded level 1 or 2 behavior", () => {
    const weaponLevels = getWeaponLevels(["banana"]);
    const perkLevels = getPerkLevels();

    [1, 2, 3, 10].forEach((level) => {
      const choice = getLevelUpChoice({ level, weaponLevels, perkLevels });

      expect(choice?.type).toBe("levelUp");
      expect(choice?.level).toBe(level);
      expect(choice?.source).toBe("levelUp");
    });
  });

  it("offers only weapons (all 5 slots) before the player has picked a first weapon", () => {
    const weaponLevels = getWeaponLevels(); // nothing unlocked yet - level 1
    const perkLevels = getPerkLevels();

    const options = pickLevelUpOptions({
      weaponLevels,
      perkLevels,
      bonusLevelChances: NO_BONUS_CHANCES,
    });

    expect(options).toHaveLength(LEVEL_UP_OPTION_COUNT);
    expect(options.every((option) => isWeaponKind(option.kind))).toBe(true);

    // No duplicate options within a single offer.
    const seen = new Set(options.map((option) => JSON.stringify(option)));
    expect(seen.size).toBe(options.length);
  });

  it("goes back to the normal 3 weapon / 2 perk split as soon as a first weapon is owned", () => {
    const weaponLevels = getWeaponLevels(["banana"]);
    const perkLevels = getPerkLevels();

    const options = pickLevelUpOptions({
      weaponLevels,
      perkLevels,
      bonusLevelChances: NO_BONUS_CHANCES,
    });

    expect(options.some((option) => isPerkKind(option.kind))).toBe(true);
  });

  it("always offers 3 center weapon slots and 2 corner perk slots when both are available", () => {
    const weaponLevels = getWeaponLevels(["banana"]);
    const perkLevels = getPerkLevels();

    const options = pickLevelUpOptions({
      weaponLevels,
      perkLevels,
      bonusLevelChances: NO_BONUS_CHANCES,
    });

    expect(options).toHaveLength(LEVEL_UP_OPTION_COUNT);
    // Corners (index 0 and 4) are perks, center (index 1-3) are weapons.
    expect(isPerkKind(options[0].kind)).toBe(true);
    expect(isWeaponKind(options[1].kind)).toBe(true);
    expect(isWeaponKind(options[2].kind)).toBe(true);
    expect(isWeaponKind(options[3].kind)).toBe(true);
    expect(isPerkKind(options[4].kind)).toBe(true);

    // No duplicate options within a single offer.
    const seen = new Set(options.map((option) => JSON.stringify(option)));
    expect(seen.size).toBe(options.length);
  });

  it("backfills perk corners with weapons once every perk slot is full and maxed", () => {
    const weaponLevels = getWeaponLevels(["banana"]);
    const perkLevels = Object.keys(DEFAULT_PERK_LEVELS)
      .slice(0, MAX_PLAYER_PERKS)
      .reduce(
        (levels, perkId) => ({ ...levels, [perkId]: 5 }),
        getPerkLevels(),
      ) as PerkLevels;

    const options = pickLevelUpOptions({
      weaponLevels,
      perkLevels,
      bonusLevelChances: NO_BONUS_CHANCES,
    });

    // No perks left to offer, so all 5 slots should be weapon-kind instead
    // of the offer shrinking below 5.
    expect(options.every((option) => isWeaponKind(option.kind))).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it("backfills weapon centers with perks once every weapon is maxed (weapon cap is configurable)", () => {
    const weaponLevels = LEVEL_UP_WEAPON_IDS.slice(
      0,
      MAX_PLAYER_WEAPONS,
    ).reduce(
      (levels, weapon) => ({ ...levels, [weapon]: 8 }),
      getWeaponLevels(),
    ) as Record<WeaponId, WeaponLevel>;
    const perkLevels = getPerkLevels();

    const options = pickLevelUpOptions({
      weaponLevels,
      perkLevels,
      bonusLevelChances: NO_BONUS_CHANCES,
    });

    // No weapons left to offer, so all slots fall back to perks.
    expect(options.every((option) => isPerkKind(option.kind))).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it("returns undefined once every weapon and perk slot is full and maxed", () => {
    const weaponLevels = LEVEL_UP_WEAPON_IDS.slice(
      0,
      MAX_PLAYER_WEAPONS,
    ).reduce(
      (levels, weapon) => ({ ...levels, [weapon]: 8 }),
      getWeaponLevels(),
    ) as Record<WeaponId, WeaponLevel>;

    const perkLevels = Object.keys(DEFAULT_PERK_LEVELS)
      .slice(0, MAX_PLAYER_PERKS)
      .reduce(
        (levels, perkId) => ({ ...levels, [perkId]: 5 }),
        getPerkLevels(),
      ) as PerkLevels;

    expect(
      getLevelUpChoice({ level: 3, weaponLevels, perkLevels }),
    ).toBeUndefined();
  });

  it("excludes already unlocked weapons from future choices", () => {
    const weaponLevels = getWeaponLevels(["banana", "corn"]);
    const options = getAvailableWeaponChoices(weaponLevels);

    expect(options).not.toContain("banana");
    expect(options).not.toContain("corn");
    expect(getUnlockedWeapons(weaponLevels)).toEqual(["banana", "corn"]);
  });

  it("stops offering new weapons/perks once slots are full but still offers upgrades", () => {
    const weaponLevels = LEVEL_UP_WEAPON_IDS.slice(
      0,
      MAX_PLAYER_WEAPONS,
    ).reduce(
      (levels, weapon) => ({ ...levels, [weapon]: 1 }),
      getWeaponLevels(),
    ) as Record<WeaponId, WeaponLevel>;
    const perkLevels = getPerkLevels();

    const pool = buildLevelUpOptionPool({ weaponLevels, perkLevels });

    expect(pool.some((entry) => entry.item.kind === "newWeapon")).toBe(false);
    expect(pool.some((entry) => entry.item.kind === "upgradeWeapon")).toBe(
      true,
    );
  });

  it("keeps the 3/2 center/corner slot split configurable via named constants", () => {
    expect(LEVEL_UP_WEAPON_SLOT_COUNT).toBe(3);
    expect(LEVEL_UP_PERK_SLOT_COUNT).toBe(2);
    expect(LEVEL_UP_OPTION_COUNT).toBe(
      LEVEL_UP_WEAPON_SLOT_COUNT + LEVEL_UP_PERK_SLOT_COUNT,
    );
  });

  describe("bonus levels (backlog 1.1 + Luck)", () => {
    it("grants exactly 1 level when neither bonus chance hits", () => {
      const weaponLevels = getWeaponLevels(["banana"]);
      const perkLevels = getPerkLevels();

      const options = pickLevelUpOptions({
        weaponLevels,
        perkLevels,
        bonusLevelChances: NO_BONUS_CHANCES,
      });

      options.forEach((option) => {
        expect(option.bonusLevels).toBeUndefined();
      });
    });

    it("advances an upgrade by 3 levels at once when the 3-level roll hits", () => {
      const weaponLevels = getWeaponLevels(["banana"]);
      const perkLevels = getPerkLevels();

      const options = pickLevelUpOptions({
        weaponLevels,
        perkLevels,
        bonusLevelChances: ALWAYS_BONUS_3_CHANCES,
      });

      const bananaUpgrade = options.find(
        (option) =>
          option.kind === "upgradeWeapon" && option.weaponId === "banana",
      );

      expect(bananaUpgrade?.bonusLevels).toBe(3);
      // banana was at level 1, +3 should land it on level 4.
      expect(bananaUpgrade?.kind).toBe("upgradeWeapon");
      if (bananaUpgrade?.kind === "upgradeWeapon") {
        expect(bananaUpgrade.toLevel).toBe(4);
      }
    });

    it("starts a brand new weapon/perk at the bonus level instead of 1", () => {
      const weaponLevels = getWeaponLevels();
      const perkLevels = getPerkLevels();

      const options = pickLevelUpOptions({
        weaponLevels,
        perkLevels,
        bonusLevelChances: ALWAYS_BONUS_2_CHANCES,
      });

      const newWeapon = options.find((option) => option.kind === "newWeapon");
      expect(newWeapon?.bonusLevels).toBe(2);
      if (newWeapon?.kind === "newWeapon") {
        expect(newWeapon.toLevel).toBe(2);
      }
    });

    it("never grants a bonus past the weapon/perk's max level", () => {
      const weaponLevels = LEVEL_UP_WEAPON_IDS.slice(0, 1).reduce(
        (levels, weapon) => ({ ...levels, [weapon]: WEAPON_MAX_LEVEL - 1 }),
        getWeaponLevels(),
      ) as Record<WeaponId, WeaponLevel>;
      const perkLevels = getPerkLevels();

      const options = pickLevelUpOptions({
        weaponLevels,
        perkLevels,
        bonusLevelChances: ALWAYS_BONUS_3_CHANCES,
      });

      const upgrade = options.find(
        (option) =>
          option.kind === "upgradeWeapon" &&
          option.weaponId === LEVEL_UP_WEAPON_IDS[0],
      );

      if (upgrade?.kind === "upgradeWeapon") {
        expect(upgrade.toLevel).toBe(WEAPON_MAX_LEVEL);
      }
    });

    it("scales the 2/3-level chances from 20%/5% at no Luck up to 30%/10% at max Luck", () => {
      expect(getBonusLevelChances(getPerkLevels({ luck: 0 }))).toEqual({
        chance2: 0.2,
        chance3: 0.05,
      });
      expect(
        getBonusLevelChances(getPerkLevels({ luck: PERK_MAX_LEVEL })),
      ).toEqual({
        chance2: 0.3,
        chance3: 0.1,
      });
    });
  });

  describe("chests (backlog 1.5)", () => {
    it("always rolls chest contents at the fixed, Luck-independent chances", () => {
      // Sanity check the constant itself matches the base (no-Luck) odds -
      // Machine.ts always passes CHEST_BONUS_LEVEL_CHANCES for chests,
      // regardless of the player's actual Luck level.
      expect(CHEST_BONUS_LEVEL_CHANCES).toEqual({
        chance2: 0.2,
        chance3: 0.05,
      });
    });

    it("tags a chest choice with source \"chest\" and never touches player level bookkeeping fields", () => {
      const weaponLevels = getWeaponLevels(["banana"]);
      const perkLevels = getPerkLevels();

      const choice = getChestLevelUpChoice({
        level: 7,
        weaponLevels,
        perkLevels,
        bonusLevelChances: CHEST_BONUS_LEVEL_CHANCES,
      });

      expect(choice?.type).toBe("levelUp");
      expect(choice?.source).toBe("chest");
      expect(choice?.options.length).toBeGreaterThan(0);
    });
  });
});
