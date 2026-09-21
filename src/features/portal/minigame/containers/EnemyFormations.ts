import { SQUARE_WIDTH } from "features/game/lib/constants";
import type { EnemyFormation } from "../Types";

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
  const ranX = Phaser.Math.Between(
    centerX - 10 * SQUARE_WIDTH,
    centerX + 10 * SQUARE_WIDTH,
  );

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

  const ranY = Phaser.Math.Between(
    centerY - 10 * SQUARE_WIDTH,
    centerY + 10 * SQUARE_WIDTH,
  );

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
  const radius = 8 * SQUARE_WIDTH;

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
  const radius = 5 * SQUARE_WIDTH;

  for (let i = 0; i < count; i++) {
    const angle =
      (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.15, 0.15);

    const distance = Phaser.Math.Between(4 * SQUARE_WIDTH, radius);

    positions.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    });
  }

  return positions;
};
