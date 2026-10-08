import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { WeaponEnemyType, WeaponStats } from "../../Types";

export const WEAPON_BALANCE_STATS: Record<WeaponEnemyType, WeaponStats> = {
  // Miniboss
  golem: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  ent: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  mummy: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  living_armor: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  headless_horseman: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  medusa: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
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
  imp: {
    staticRange: {
      TEXTURE: "imp_fireball",
      FRAME_END: 3,
      RANGE: SQUARE_WIDTH * 5,
      SPEED: 100,
      COOLDOWN_MS: 1000,
      DURATION_MS: 2000,
    },
  },
  cultist: {
    staticRange: {
      TEXTURE: "cultist_fireBall",
      FRAME_END: 4,
      RANGE: SQUARE_WIDTH * 6,
      SPEED: 100,
      COOLDOWN_MS: 1000,
      DURATION_MS: 2000,
    },
  },
  red_stone: {
    staticRange: {
      TEXTURE: "red_stone_fireball",
      FRAME_END: 4,
      RANGE: SQUARE_WIDTH * 6,
      SPEED: 100,
      COOLDOWN_MS: 1000,
      DURATION_MS: 2000,
    },
  },
  // Boss
  minotaur: {
    slash: {
      TEXTURE: "weapon_scythe",
      RANGE: 80,
      ARC_DEGREES: 90,
      COOLDOWN_MS: 2000,
      DURATION_MS: 500,
    },
  },
  witch: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 70,
      SPEED_DEG_PER_SEC: 120,
    },
  },
  cerberus: {
    summoning: {
      TEXTURE: "Fire",
      DELAY_MS: 500,
      WARNING_DURATION_MS: 300,
      DURATION_MS: 4000,
    },
  },
  sorcerer: {
    summoning: {
      TEXTURE: "Fire",
      DELAY_MS: 500,
      WARNING_DURATION_MS: 300,
      DURATION_MS: 4000,
    },
  },
};
