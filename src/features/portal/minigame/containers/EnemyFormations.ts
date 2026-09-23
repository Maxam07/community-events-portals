import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { EnemyFormation } from "../Types";

// Minimum distance any spawned enemy can be from the player.
const MIN_SPAWN_DISTANCE = 4 * SQUARE_WIDTH;

export function getFormationPositions(
  formation: EnemyFormation,
  count: number,
  centerX: number,
  centerY: number,
) {
  switch (formation) {
    case "vertical line":
      return getVerticalFormation(count, centerX, centerY);

    case "horizontal line":
      return getHorizontalFormation(count, centerX, centerY);

    case "circle":
      return getCircleFormation(count, centerX, centerY);

    case "surround":
      return getSurroundFormation(count, centerX, centerY);

    default:
      return [];
  }
}

const getVerticalFormation = (
  count: number,
  centerX: number,
  centerY: number,
) => {
  const positions = [];
  const spacing = 3 * SQUARE_WIDTH;

  const startY = centerY - ((count - 1) * spacing) / 2;

  // Pick ranX from one of two bands so the line is always at least
  // MIN_SPAWN_DISTANCE away from centerX on the x-axis (closest point
  // on the line to the player is (ranX, centerY), distance = |ranX - centerX|).
  const maxOffset = 10 * SQUARE_WIDTH;
  const side = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
  const ranX =
    centerX + side * Phaser.Math.Between(MIN_SPAWN_DISTANCE, maxOffset);

  for (let i = 0; i < count; i++) {
    positions.push({
      x: ranX,
      y: startY + i * spacing,
    });
  }

  return positions;
};

const getHorizontalFormation = (
  count: number,
  centerX: number,
  centerY: number,
) => {
  const positions = [];
  const spacing = 3 * SQUARE_WIDTH;

  const startX = centerX - ((count - 1) * spacing) / 2;

  const maxOffset = 10 * SQUARE_WIDTH;
  const side = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
  const ranY =
    centerY + side * Phaser.Math.Between(MIN_SPAWN_DISTANCE, maxOffset);

  for (let i = 0; i < count; i++) {
    positions.push({
      x: startX + i * spacing,
      y: ranY,
    });
  }

  return positions;
};

const getCircleFormation = (
  count: number,
  centerX: number,
  centerY: number,
) => {
  const positions = [];
  const radius = Math.max(4 * SQUARE_WIDTH, MIN_SPAWN_DISTANCE);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;

    positions.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  return positions;
};

const getSurroundFormation = (
  count: number,
  centerX: number,
  centerY: number,
) => {
  const positions = [];
  const maxRadius = 10 * SQUARE_WIDTH;
  const minRadius = Math.min(MIN_SPAWN_DISTANCE, maxRadius);

  for (let i = 0; i < count; i++) {
    const angle =
      (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.15, 0.15);

    const distance = Phaser.Math.Between(minRadius, maxRadius);

    positions.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    });
  }

  return positions;
};
