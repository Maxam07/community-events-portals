import type { Scene } from "../Scene";
import type { ObstacleName } from "../Types";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { BoundingBox } from "../lib/collisionDetection";

interface Props {
  name: ObstacleName;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  originX?: number;
  originY?: number;
  scene: Scene;
  obstacleGroup: Phaser.Physics.Arcade.StaticGroup;
  waterGroup: Phaser.GameObjects.Group;
  currentPlayer: Phaser.GameObjects.GameObject;
  obstacles: BoundingBox[];
}

const obstacleConfig: Record<
  ObstacleName,
  {
    width: number;
    height: number;
    destructible: boolean;
    hp: number;
    hasHitbox: boolean;
    setVisible: boolean;
    setScale: number;
  }
> = {
  rock: {
    width: 1,
    height: 1,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: true,
    setScale: 1,
  },
  water: {
    width: 4,
    height: 4,
    destructible: false,
    hp: Infinity,
    hasHitbox: true,
    setVisible: true,
    setScale: 1,
  },
  empty: {
    width: 1,
    height: 1,
    destructible: false,
    hp: Infinity,
    hasHitbox: true,
    setVisible: false,
    setScale: 1,
  },
  tree: {
    width: 2,
    height: 2,
    destructible: true,
    hp: 3,
    hasHitbox: true,
    setVisible: true,
    setScale: 1,
  },
  cloud: {
    width: 4,
    height: 3,
    destructible: true,
    hp: Infinity,
    hasHitbox: false,
    setVisible: true,
    setScale: 1,
  },
  cloud1: {
    width: 2,
    height: 2,
    destructible: true,
    hp: Infinity,
    hasHitbox: false,
    setVisible: true,
    setScale: 1,
  },
  tree_stump: {
    width: 1,
    height: 1,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: true,
    setScale: 1,
  },
  deco_1: {
    width: 5,
    height: 3,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: true,
    setScale: 1,
  },
  deco_2: {
    width: 4,
    height: 3,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: true,
    setScale: 1,
  },
  deco_3: {
    width: 7,
    height: 3,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: true,
    setScale: 1,
  },
  deco_4: {
    width: 7,
    height: 6,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: true,
    setScale: 1,
  },
  scarecrow: {
    width: 1,
    height: 1.5,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: false,
    setScale: 0.6,
  },
  imp: {
    width: 1,
    height: 1.5,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: false,
    setScale: 0.6,
  },
  cultist: {
    width: 1,
    height: 1.5,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: false,
    setScale: 0.6,
  },
  red_stone: {
    width: 1,
    height: 1.5,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
    setVisible: false,
    setScale: 0.6,
  },
};

export function addStaticObstacle({
  name,
  x,
  y,
  width: customWidth,
  height: customHeight,
  originX,
  originY,
  scene,
  obstacleGroup,
  waterGroup,
  currentPlayer,
  obstacles,
}: Props) {
  const config = obstacleConfig[name];
  const { destructible, hp, hasHitbox, setVisible, setScale } = config;
  const width = customWidth ?? config.width;
  const height = customHeight ?? config.height;

  const WATER_DEPTH = 5;
  const OBSTACLES_DEPTH = 60;
  const CLOUDS_DEPTH = 1000;

  const coordinates = {
    x: x ?? 0,
    y: y ?? 0,
  };

  const hasCustomOrigin = originX !== undefined || originY !== undefined;

  // Adjust for even-sized objects
  if (width === 2 && !hasCustomOrigin) {
    coordinates.x += 1;
  }

  let worldX = coordinates.x * SQUARE_WIDTH;
  let worldY = coordinates.y * SQUARE_WIDTH;

  // Centering logic
  if (!hasCustomOrigin) {
    if (width % 2 === 1) {
      worldX += SQUARE_WIDTH / 2;
    }

    if (height % 2 === 1) {
      worldY += SQUARE_WIDTH / 2;
    }

    worldX -= 8;
  }

  const textureKey = name === "empty" ? "__WHITE" : name;
  const obstacle = scene.add.sprite(worldX, worldY, textureKey);

  obstacle.setOrigin(originX ?? 0.5, originY ?? 0.5);
  obstacle.setDepth(OBSTACLES_DEPTH);
  obstacle.setVisible(setVisible);
  obstacle.setScale(setScale);

  if (name === "empty") {
    obstacle.setDisplaySize(width * SQUARE_WIDTH, height * SQUARE_WIDTH);
  }

  if (hasHitbox) {
    scene.physics.add.existing(obstacle, true);
    obstacleGroup.add(obstacle);
    const body = obstacle.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width * SQUARE_WIDTH, height * SQUARE_WIDTH);
    scene.physics.add.collider(currentPlayer, obstacle);
  }

  const noHitbox: ObstacleName[] = ["cloud", "cloud1"];

  if (noHitbox.includes(name)) {
    obstacle.setDepth(CLOUDS_DEPTH);
    obstacle.alpha = 0.8;
  }

  // if (name === "water") {
  //   waterGroup.add(obstacle);
  //   waterGroup.setDepth(WATER_DEPTH);
  // }

  obstacles.push({
    x: coordinates.x,
    y: coordinates.y,
    width,
    height,
    sprite: obstacle,
    destructible,
    hp,
    name,
    hasHitbox,
  });
}
