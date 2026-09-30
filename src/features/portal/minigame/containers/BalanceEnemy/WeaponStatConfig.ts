import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { WeaponEnemyType, WeaponStats } from "../../Types";

export const WEAPON_BALANCE_STATS: Record<WeaponEnemyType, WeaponStats> = {
  // Miniboss
  golem: {
    chasing: {
      TEXTURE: "hellHound",
      SPEED: 60,
      DURATION_MS: 4000,
    },
    orbiting: {
      TEXTURE: "weapon_sunflower",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  ent: {
    chasing: {
      TEXTURE: "FIRE",
      SPEED: 70,
      DURATION_MS: 4000,
    },
  },
  mummy: {
    orbiting: {
      TEXTURE: "weapon_sunflower",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
    summoning: {
      TEXTURE: "Fire",
      DELAY_MS: 1000,
      WARNING_DURATION_MS: 500,
      DURATION_MS: 2000,
    },
  },
  living_armor: {
    chasing: {
      TEXTURE: "FIRE",
      SPEED: 70,
      DURATION_MS: 4000,
    },
  },
  headless_horseman: {
    chasing: {
      TEXTURE: "FIRE",
      SPEED: 70,
      DURATION_MS: 4000,
    },
  },
  medusa: {
    chasing: {
      TEXTURE: "FIRE",
      SPEED: 70,
      DURATION_MS: 4000,
    },
  },
  // Static range
  scarecrow: {
    staticRange: {
      TEXTURE: "Fire",
      FRAME_END: 4,
      RANGE: SQUARE_WIDTH * 5,
      SPEED: 100,
      COOLDOWN_MS: 1000,
      DURATION_MS: 2000,
    },
  },
  skeleton: {
    staticRange: {
      TEXTURE: "Fire",
      FRAME_END: 4,
      RANGE: SQUARE_WIDTH * 5,
      SPEED: 400,
      COOLDOWN_MS: 1000,
      DURATION_MS: 4000,
    },
  },
  cultist: {
    staticRange: {
      TEXTURE: "fireBall",
      FRAME_END: 4,
      RANGE: SQUARE_WIDTH * 6,
      SPEED: 100,
      COOLDOWN_MS: 1000,
      DURATION_MS: 2000,
    },
  },
  // Boss
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
