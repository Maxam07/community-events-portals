import type { WeaponEnemyType, WeaponStats } from "../../Types";

export const WEAPON_BALANCE_STATS: Record<WeaponEnemyType, WeaponStats> = {
  miniBoss1: {
    orbiting: {
      TEXTURE: "weapon_sunflower",
      RADIUS: 30,
      SPEED_DEG_PER_SEC: 100,
    },
    summoning: {
      TEXTURE: "Fire",
      DELAY_MS: 1000,
      WARNING_DURATION_MS: 500,
      DURATION_MS: 2000,
    },
  },

  miniBoss2: {
    chasing: {
      TEXTURE: "Fire",
      SPEED: 60,
      DURATION_MS: 4000,
    },
    orbiting: {
      TEXTURE: "weapon_sunflower",
      RADIUS: 30,
      SPEED_DEG_PER_SEC: 100,
    },
  },

  miniBoss3: {
    chasing: {
      TEXTURE: "FIRE",
      SPEED: 70,
      DURATION_MS: 4000,
    },
  },

  boss1: {
    chasing: {
      TEXTURE: "FIRE",
      SPEED: 80,
      DURATION_MS: 4000,
    },
  },

  boss2: {
    orbiting: {
      TEXTURE: "FIRE",
      RADIUS: 70,
      SPEED_DEG_PER_SEC: 120,
    },
  },

  boss3: {
    summoning: {
      TEXTURE: "FIRE",
      DELAY_MS: 500,
      WARNING_DURATION_MS: 300,
      DURATION_MS: 4000,
    },
  },
};
