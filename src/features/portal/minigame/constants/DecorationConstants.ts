import type { Obstacle } from "../Types";

export const STATIC_RANGE_POS = [
  // area 1
  { x: 10, y: 165 },
  { x: 15, y: 181 },
  { x: 3, y: 175 },
  { x: 34, y: 160 },
  { x: 35, y: 181 },
  { x: 25, y: 152 },
  { x: 3, y: 151 },
  // area 2
  { x: 10, y: 118 },
  { x: 15, y: 129 },
  { x: 3, y: 134 },
  { x: 34, y: 141 },
  { x: 35, y: 124 },
  { x: 25, y: 143 },
  { x: 3, y: 116 },
  // area 3
  { x: 10, y: 80 },
  { x: 15, y: 97 },
  { x: 3, y: 91 },
  { x: 34, y: 82 },
  { x: 35, y: 104 },
  { x: 25, y: 109 },
  { x: 3, y: 107 },
];

const enemy = STATIC_RANGE_POS;

export const OBSTACLES_LAYOUT = {
  obstacle1: [
    // trees
    // { name: "tree", x: 39, y: 37 },
    // { name: "tree", x: 15, y: 35 },
    // { name: "tree", x: 5, y: 28 },
    // { name: "tree", x: 12, y: 15 },
    // { name: "tree", x: 18, y: 43 },
    // { name: "tree", x: 35, y: 30 },
    // { name: "tree", x: 30, y: 42 },
    // { name: "tree", x: 45, y: 12 },
    // { name: "tree", x: 50, y: 25 },
    // { name: "tree", x: 22, y: 50 },
    // { name: "tree", x: 48, y: 35 },
    // { name: "tree", x: 3, y: 52 },
    // tree stumps
    { name: "tree_stump", x: 16, y: 154 },
    { name: "tree_stump", x: 8, y: 159 },
    { name: "tree_stump", x: 16, y: 164 },
    { name: "tree_stump", x: 8, y: 169 },
    { name: "tree_stump", x: 16, y: 174 },
    { name: "tree_stump", x: 8, y: 179 },
    { name: "tree_stump", x: 34, y: 154 },
    { name: "tree_stump", x: 26, y: 159 },
    { name: "tree_stump", x: 34, y: 164 },
    { name: "tree_stump", x: 26, y: 169 },
    { name: "tree_stump", x: 34, y: 174 },
    { name: "tree_stump", x: 26, y: 179 },
    // area 1 temporary red_stone
    { name: "red_stone", x: enemy[0].x, y: enemy[0].y },
    { name: "red_stone", x: enemy[1].x, y: enemy[1].y },
    { name: "red_stone", x: enemy[2].x, y: enemy[2].y },
    { name: "red_stone", x: enemy[3].x, y: enemy[3].y },
    { name: "red_stone", x: enemy[4].x, y: enemy[4].y },
    { name: "red_stone", x: enemy[5].x, y: enemy[5].y },
    { name: "red_stone", x: enemy[6].x, y: enemy[6].y },
    // area 2
    { name: "imp", x: enemy[7].x, y: enemy[7].y },
    { name: "imp", x: enemy[8].x, y: enemy[8].y },
    { name: "imp", x: enemy[9].x, y: enemy[9].y },
    { name: "imp", x: enemy[10].x, y: enemy[10].y },
    { name: "imp", x: enemy[11].x, y: enemy[11].y },
    { name: "imp", x: enemy[12].x, y: enemy[12].y },
    { name: "imp", x: enemy[13].x, y: enemy[13].y },
    // area 3
    { name: "imp", x: enemy[14].x, y: enemy[14].y },
    { name: "imp", x: enemy[15].x, y: enemy[15].y },
    { name: "imp", x: enemy[16].x, y: enemy[16].y },
    { name: "imp", x: enemy[17].x, y: enemy[17].y },
    { name: "imp", x: enemy[18].x, y: enemy[18].y },
    { name: "imp", x: enemy[19].x, y: enemy[19].y },
    { name: "imp", x: enemy[20].x, y: enemy[20].y },
    // area 1
    {
      name: "empty",
      x: 0,
      y: 145,
      width: 18.9,
      height: 4.5,
      originX: 0,
      originY: 0,
    },
    {
      name: "empty",
      x: 21,
      y: 145,
      width: 19,
      height: 4.5,
      originX: 0,
      originY: 0,
    },
    // // area 2
    // { name: "water", x: 2, y: 73 },
    // { name: "water", x: 6, y: 73 },
    // { name: "water", x: 10, y: 73 },
    // { name: "water", x: 14, y: 73 },
    // { name: "water", x: 18, y: 73 },
    // // add blockade
    // { name: "water", x: 26, y: 73 },
    // { name: "water", x: 30, y: 73 },
    // { name: "water", x: 34, y: 73 },
    // { name: "water", x: 38, y: 73 },
    // { name: "water", x: 42, y: 73 },
    // // area 3
    // { name: "water", x: 2, y: 36 },
    // { name: "water", x: 6, y: 36 },
    // { name: "water", x: 10, y: 36 },
    // { name: "water", x: 14, y: 36 },
    // { name: "water", x: 18, y: 36 },
    // // add blockade
    // { name: "water", x: 26, y: 36 },
    // { name: "water", x: 30, y: 36 },
    // { name: "water", x: 34, y: 36 },
    // { name: "water", x: 38, y: 36 },
    // { name: "water", x: 42, y: 36 },
  ] as Obstacle[],
};
