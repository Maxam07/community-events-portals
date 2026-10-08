import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { AreaEnemyType, SpawnArea } from "features/portal/minigame/Types";

export const ENEMY_AREAS: Record<AreaEnemyType, SpawnArea> = {
  // Static range
  scarecrow: 1,
  imp: 2,
  cultist: 3,
  red_stone: 4,

  // Phasing
  bat: 1,
  crow: 2,
  ghost: 2,
  gargoyle: 3,
  shade: 4,

  // Melee
  carnivore_plant: 1,
  rat: 1,
  zombie: 1,
  skeleton: 2,
  slime_red: 2,
  slime_green: 2,
  slime_blue: 2,
  vampire: 3,
  frankenstein: 3,
  werewolf: 3,
  hellHound: 4,
  demon1: 4,
  demon2: 4,

  // Mini bosses
  golem: 1,
  ent: 1,
  mummy: 2,
  living_armor: 2,
  headless_horseman: 3,
  medusa: 3,

  // Bosses
  minotaur: 1,
  witch: 2,
  cerberus: 4,
  sorcerer: 3,
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
    minY: 36 * SQUARE_WIDTH,
    maxY: 72 * SQUARE_WIDTH,
  },
  4: {
    minX: minX,
    maxX: maxX,
    minY: 1 * SQUARE_WIDTH,
    maxY: 34 * SQUARE_WIDTH,
  },
};
