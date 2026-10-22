import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { WeaponEnemyType, WeaponStats } from "../../Types";
import { ENEMY_BALANCE_STATS } from "../../constants";

const stats = ENEMY_BALANCE_STATS;

export const WEAPON_BALANCE_STATS: Record<WeaponEnemyType, WeaponStats> = {
  // Miniboss
  golem: {
    orbiting: {
      TEXTURE: "golem_stone",
      RADIUS: stats.golem.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.golem.WEAPONS.orbiting.SPEED_DEG_PER_SEC,
    },
  },
  ent: {
    summoning: {
      TEXTURE: "ent_tree",
      WARNING: "shadow_warning",
      DELAY_MS: stats.ent.WEAPONS.summoning.DELAY_MS,
      WARNING_DURATION_MS: stats.ent.WEAPONS.summoning.WARNING_DURATION_MS,
      DURATION_MS: stats.ent.WEAPONS.summoning.DURATION_MS,
    },
  },
  mummy: {
    orbiting: {
      TEXTURE: "sand_vortex",
      RADIUS: stats.mummy.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.mummy.WEAPONS.orbiting.SPEED_DEG_PER_SEC,
    },
  },
  living_armor: {
    orbiting: {
      TEXTURE: "armor_weapon",
      RADIUS: stats.living_armor.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.living_armor.WEAPONS.orbiting.SPEED_DEG_PER_SEC,
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
      WARNING: "shadow_warning",
      DELAY_MS: stats.headless_horseman.WEAPONS.summoning.DELAY_MS,
      WARNING_DURATION_MS:
        stats.headless_horseman.WEAPONS.summoning.WARNING_DURATION_MS,
      DURATION_MS: stats.headless_horseman.WEAPONS.summoning.DELAY_MS,
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
      NEXT_CHASE: stats.medusa.WEAPONS.chasing.NEXT_CHASE,
      SPEED: stats.medusa.WEAPONS.chasing.SPEED,
      DURATION_MS: stats.medusa.WEAPONS.chasing.DURATION_MS,
    },
  },
  // area 4
  golem_area4: {
    orbiting: {
      TEXTURE: "golem_stone",
      RADIUS: stats.golem_area4.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.golem_area4.WEAPONS.orbiting.SPEED_DEG_PER_SEC,
    },
  },
  ent_area4: {
    summoning: {
      TEXTURE: "ent_tree",
      WARNING: "shadow_warning",
      DELAY_MS: stats.ent_area4.WEAPONS.summoning.DELAY_MS,
      WARNING_DURATION_MS:
        stats.ent_area4.WEAPONS.summoning.WARNING_DURATION_MS,
      DURATION_MS: stats.ent_area4.WEAPONS.summoning.DURATION_MS,
    },
  },
  mummy_area4: {
    orbiting: {
      TEXTURE: "sand_vortex",
      RADIUS: stats.mummy_area4.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.mummy_area4.WEAPONS.orbiting.SPEED_DEG_PER_SEC,
    },
  },
  living_armor_area4: {
    orbiting: {
      TEXTURE: "armor_weapon",
      RADIUS: stats.living_armor_area4.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.living_armor_area4.WEAPONS.orbiting.RADIUS,
    },
  },
  headless_horseman_area4: {
    summoning: {
      TEXTURE: "headless-magmaPuddle",
      WARNING: "shadow_warning",
      DELAY_MS: stats.headless_horseman_area4.WEAPONS.summoning.DELAY_MS,
      WARNING_DURATION_MS:
        stats.headless_horseman_area4.WEAPONS.summoning.WARNING_DURATION_MS,
      DURATION_MS: stats.headless_horseman_area4.WEAPONS.summoning.DURATION_MS,
    },
  },
  medusa_area4: {
    chasing: {
      TEXTURE: ["medusa_head"],
      NEXT_CHASE: stats.medusa_area4.WEAPONS.chasing.NEXT_CHASE,
      SPEED: stats.medusa_area4.WEAPONS.chasing.SPEED,
      DURATION_MS: stats.medusa_area4.WEAPONS.chasing.DURATION_MS,
    },
  },
  // Static range
  scarecrow: {
    staticRange: {
      TEXTURE: "scarecrow_pumpkin",
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
      RANGE: stats.minotaur.WEAPONS.slash.RANGE,
      ARC_DEGREES: stats.minotaur.WEAPONS.slash.ARC_DEGREES,
      COOLDOWN_MS: stats.minotaur.WEAPONS.slash.COOLDOWN_MS,
      DURATION_MS: stats.minotaur.WEAPONS.slash.DURATION_MS,
    },
  },
  witch: {
    orbiting: {
      TEXTURE: "Fire",
      RADIUS: stats.witch.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.witch.WEAPONS.orbiting.SPEED_DEG_PER_SEC,
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
      NEXT_CHASE: stats.witch.WEAPONS.chasing.NEXT_CHASE,
      SPEED: stats.witch.WEAPONS.chasing.SPEED,
      DURATION_MS: stats.witch.WEAPONS.chasing.DURATION_MS,
    },
  },
  cerberus: {
    summoning: {
      TEXTURE: "fang-the-frost",
      WARNING: "shadow_warning",
      DELAY_MS: stats.cerberus.WEAPONS.summoning.DELAY_MS,
      WARNING_DURATION_MS: stats.cerberus.WEAPONS.summoning.WARNING_DURATION_MS,
      DURATION_MS: stats.cerberus.WEAPONS.summoning.DURATION_MS,
    },
    chasing: {
      TEXTURE: ["fang-the-curse", "fang-the-plague"],
      NEXT_CHASE: stats.cerberus.WEAPONS.chasing.NEXT_CHASE,
      SPEED: stats.cerberus.WEAPONS.chasing.SPEED,
      DURATION_MS: stats.cerberus.WEAPONS.chasing.DURATION_MS,
    },
  },
  sorcerer: {
    summoning: {
      TEXTURE: "sorcerer_clone",
      WARNING: "shadow_warning",
      DELAY_MS: stats.sorcerer.WEAPONS.summoning.DELAY_MS,
      WARNING_DURATION_MS: stats.sorcerer.WEAPONS.summoning.WARNING_DURATION_MS,
      DURATION_MS: stats.sorcerer.WEAPONS.summoning.DELAY_MS,
    },
    chasing: {
      TEXTURE: ["eyeball"],
      NEXT_CHASE: stats.sorcerer.WEAPONS.chasing.NEXT_CHASE,
      SPEED: stats.sorcerer.WEAPONS.chasing.SPEED,
      DURATION_MS: stats.sorcerer.WEAPONS.chasing.DURATION_MS,
    },
    orbiting: {
      TEXTURE: "eyeball",
      RADIUS: stats.sorcerer.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.sorcerer.WEAPONS.orbiting.SPEED_DEG_PER_SEC,
    },
    arena: {
      RADIUS: stats.sorcerer.WEAPONS.arena.RADIUS,
    },
  },
  dungeonboss: {
    summoning: {
      TEXTURE: "sorcerer",
      WARNING: "shadow_warning",
      DELAY_MS: stats.dungeonboss.WEAPONS.summoning.DELAY_MS,
      WARNING_DURATION_MS:
        stats.dungeonboss.WEAPONS.summoning.WARNING_DURATION_MS,
      DURATION_MS: stats.dungeonboss.WEAPONS.summoning.DURATION_MS,
    },
    chasing: {
      TEXTURE: ["cerberus", "minotaur"],
      NEXT_CHASE: stats.dungeonboss.WEAPONS.chasing.NEXT_CHASE,
      SPEED: stats.dungeonboss.WEAPONS.chasing.SPEED,
      DURATION_MS: stats.dungeonboss.WEAPONS.chasing.DURATION_MS,
    },
    orbiting: {
      TEXTURE: "witch",
      RADIUS: stats.dungeonboss.WEAPONS.orbiting.RADIUS,
      SPEED_DEG_PER_SEC: stats.dungeonboss.WEAPONS.orbiting.SPEED_DEG_PER_SEC,
    },
    staticRange: {
      TEXTURE: "Fire",
      FRAME_END: 7,
      RANGE: SQUARE_WIDTH * 20,
      SPEED: 150,
      COOLDOWN_MS: 200,
      DURATION_MS: 2000,
    },
  },
};
