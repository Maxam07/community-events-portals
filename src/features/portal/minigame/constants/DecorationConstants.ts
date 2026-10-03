import type { Obstacle } from "../Types";

export const STATIC_RANGE_POS = [
  { x: 10, y: 126 },
  { x: 15, y: 142 },
  { x: 3, y: 136 },
  { x: 34, y: 121 },
  { x: 35, y: 142 },
  { x: 25, y: 113 },
  { x: 3, y: 112 },
];

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
    { name: "cultist", x: 10, y: 126 },
    { name: "cultist", x: 15, y: 142 },
    { name: "cultist", x: 3, y: 136 },
    { name: "cultist", x: 34, y: 121 },
    { name: "cultist", x: 35, y: 142 },
    { name: "cultist", x: 25, y: 113 },
    { name: "cultist", x: 3, y: 112 },
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
