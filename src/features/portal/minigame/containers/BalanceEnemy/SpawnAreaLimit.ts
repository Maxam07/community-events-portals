import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { AreaEnemyType, SpawnArea } from "features/portal/minigame/Types";

export const ENEMY_AREAS: Record<AreaEnemyType, SpawnArea> = {
  // Phasing
  bat: 2,
  crow: 2,
  ghost: 2,
  gargoyle: 3,
  shade: 4,

  // Melee
  carnivore_plant: 3,
  rat: 2,
  zombie: 2,
  imp: 2,
  slime: 2,
  vampire: 3,
  frankenstein: 3,
  werewolf: 3,
  hellHound: 4,
  demon1: 1,
  demon2: 1,

  // Static range
  scarecrow: 1,
  skeleton: 2,
  cultist: 3,

  // Mini bosses
  golem: 1,
  ent: 2,
  mummy: 1,
  living_armor: 2,
  headless_horseman: 3,
  medusa: 3,

  // Bosses
  boss1: 2,
  boss2: 2,
  boss3: 3,

  // Other mobs
  mob1: 1,
  mob2: 1,
  mob3: 2,
  mob4: 2,
  mob5: 3,
};

const minX = 1 * SQUARE_WIDTH;
const maxX = 39 * SQUARE_WIDTH;
export const ENEMY_SPAWN_AREAS = {
  1: {
    minX: minX,
    maxX: maxX,
    minY: 112 * SQUARE_WIDTH,
    maxY: 145 * SQUARE_WIDTH,
  },
  2: {
    minX: minX,
    maxX: maxX,
    minY: 74 * SQUARE_WIDTH,
    maxY: 106 * SQUARE_WIDTH,
  },
  3: {
    minX: minX,
    maxX: maxX,
    minY: 49 * SQUARE_WIDTH,
    maxY: 72 * SQUARE_WIDTH,
  },
  4: {
    minX: minX,
    maxX: maxX,
    minY: 73 * SQUARE_WIDTH,
    maxY: 96 * SQUARE_WIDTH,
  },
};
