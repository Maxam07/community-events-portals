import type { Obstacle } from "../Types";

export const STATIC_RANGE_POS = [
  // area 1
  { x: 10, y: 126 },
  { x: 15, y: 142 },
  { x: 3, y: 136 },
  { x: 34, y: 121 },
  { x: 35, y: 142 },
  { x: 25, y: 113 },
  { x: 3, y: 112 },
  // area 2
  { x: 10, y: 79 },
  { x: 15, y: 90 },
  { x: 3, y: 95 },
  { x: 34, y: 102 },
  { x: 35, y: 85 },
  { x: 25, y: 104 },
  { x: 3, y: 77 },
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
    { name: "tree_stump", x: 16, y: 115 },
    { name: "tree_stump", x: 8, y: 120 },
    { name: "tree_stump", x: 16, y: 125 },
    { name: "tree_stump", x: 8, y: 130 },
    { name: "tree_stump", x: 16, y: 135 },
    { name: "tree_stump", x: 8, y: 140 },
    { name: "tree_stump", x: 34, y: 115 },
    { name: "tree_stump", x: 26, y: 120 },
    { name: "tree_stump", x: 34, y: 125 },
    { name: "tree_stump", x: 26, y: 130 },
    { name: "tree_stump", x: 34, y: 135 },
    { name: "tree_stump", x: 26, y: 140 },
    // cultist
    { name: "cultist", x: enemy[0].x, y: enemy[0].y },
    { name: "cultist", x: enemy[1].x, y: enemy[1].y },
    { name: "cultist", x: enemy[2].x, y: enemy[2].y },
    { name: "cultist", x: enemy[3].x, y: enemy[3].y },
    { name: "cultist", x: enemy[4].x, y: enemy[4].y },
    { name: "cultist", x: enemy[5].x, y: enemy[5].y },
    { name: "cultist", x: enemy[6].x, y: enemy[6].y },
    // red_stone
    { name: "imp", x: enemy[7].x, y: enemy[7].y },
    { name: "imp", x: enemy[8].x, y: enemy[8].y },
    { name: "imp", x: enemy[9].x, y: enemy[9].y },
    { name: "imp", x: enemy[10].x, y: enemy[10].y },
    { name: "imp", x: enemy[11].x, y: enemy[11].y },
    { name: "imp", x: enemy[12].x, y: enemy[12].y },
    { name: "imp", x: enemy[13].x, y: enemy[13].y },
    // clouds
    // rocks
    // { name: "rock", x: 20, y: 5 },
    // { name: "rock", x: 29, y: 13 },
    // { name: "rock", x: 10, y: 9 },
    // { name: "rock", x: 38, y: 4 },
    // { name: "rock", x: 10, y: 2 },
    // { name: "rock", x: 35, y: 22 },
    // { name: "rock", x: 35, y: 10 },
    // { name: "rock", x: 40, y: 2 },
    // { name: "rock", x: 52, y: 4 },
    // { name: "rock", x: 52, y: 18 },
    // { name: "rock", x: 18, y: 20 },
    // { name: "rock", x: 3, y: 4 },
    // { name: "rock", x: 12, y: 40 },
    // { name: "rock", x: 45, y: 45 },
    // water
    { name: "water", x: 2, y: 109 },
    { name: "water", x: 6, y: 109 },
    { name: "water", x: 10, y: 109 },
    // add bridge
    { name: "water", x: 18, y: 109 },
    { name: "water", x: 22, y: 109 },
    { name: "water", x: 26, y: 109 },
    { name: "water", x: 30, y: 109 },
    { name: "water", x: 34, y: 109 },
    { name: "water", x: 38, y: 109 },
    { name: "water", x: 42, y: 109 },
  ] as Obstacle[],
};
