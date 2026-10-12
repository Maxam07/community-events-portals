import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { WeaponEnemyType, WeaponStats } from "../../Types";

export const WEAPON_BALANCE_STATS: Record<WeaponEnemyType, WeaponStats> = {
  // Miniboss
  golem: {
    orbiting: {
      TEXTURE: "golem_stone",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  ent: {
    summoning: {
      TEXTURE: "ent_tree",
      WARNING: "ent_stump",
      DELAY_MS: 500,
      WARNING_DURATION_MS: 500,
      DURATION_MS: 800,
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
    summoning: {
      TEXTURE: "headless-magmaPuddle",
      WARNING: "headless-magmaPuddle",
      DELAY_MS: 500,
      WARNING_DURATION_MS: 500,
      DURATION_MS: 800,
    },
  },
  medusa: {
    orbiting: {
      TEXTURE: "medusa_head",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
    chasing: {
      TEXTURE: ["medusa_head"],
      NEXT_CHASE: 2000,
      SPEED: 50,
      DURATION_MS: 5000,
    },
  },
  // area 4
  golem_area4: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  ent_area4: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  mummy_area4: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  living_armor_area4: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  headless_horseman_area4: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 50,
      SPEED_DEG_PER_SEC: 100,
    },
  },
  medusa_area4: {
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
      TEXTURE: "minotaur-hammer",
      RANGE: 80,
      ARC_DEGREES: 120,
      COOLDOWN_MS: 1000,
      DURATION_MS: 500,
    },
  },
  witch: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: 70,
      SPEED_DEG_PER_SEC: 120,
    },
    chasing: {
      TEXTURE: [
        "skeleton",
        "ghost",
        "slime_red",
        "crow",
        "slime_blue",
        "slime_green",
      ],
      NEXT_CHASE: 1000,
      SPEED: 55,
      DURATION_MS: 5000,
    },
  },
  cerberus: {
    summoning: {
      TEXTURE: "Fire",
      WARNING: "tree_stump",
      DELAY_MS: 500,
      WARNING_DURATION_MS: 300,
      DURATION_MS: 4000,
    },
    chasing: {
      TEXTURE: ["fang-the-curse", "fang-the-frost", "fang-the-plague"],
      NEXT_CHASE: 1000,
      SPEED: 55,
      DURATION_MS: 5000,
    },
  },
  sorcerer: {
    summoning: {
      TEXTURE: "Fire",
      WARNING: "tree_stump",
      DELAY_MS: 500,
      WARNING_DURATION_MS: 300,
      DURATION_MS: 4000,
    },
    arena: {
      RADIUS: 120,
    },
  },
};
