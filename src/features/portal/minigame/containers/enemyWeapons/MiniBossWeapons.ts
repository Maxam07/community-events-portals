import type { Scene } from "../../Scene";
import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { MiniBossWeaponType, WeaponEnemyType } from "../../Types";
import { ChasingWeapon } from "./ChasingWeapon";
import { OrbitingWeapon } from "./OrbitingWeapon";
import type { MiniBoss } from "../MiniBossContainer";
import { SummoningWeapon } from "./SummoningWeapon";
import type { EnemyWeapon } from "./EnemyWeapons";
import { WEAPON_BALANCE_STATS } from "../BalanceEnemy/WeaponStatConfig";

interface MiniBossWeaponProps {
  scene: Scene;
  target: MiniBoss;
  player: BumpkinContainer;
  enemyType: WeaponEnemyType;
  weaponType: MiniBossWeaponType;
}

export const createMiniBossWeapon = ({
  scene,
  target,
  player,
  enemyType,
  weaponType,
}: MiniBossWeaponProps): EnemyWeapon => {
  const stats = WEAPON_BALANCE_STATS[enemyType];

  switch (weaponType) {
    case "chasing": {
      const weaponStats = stats.chasing;

      if (!weaponStats) {
        throw new Error(
          `${enemyType} does not have a chasing weapon configured`,
        );
      }

      return new ChasingWeapon({
        scene,
        target,
        texture: weaponStats.TEXTURE,
        chaseSpeed: weaponStats.SPEED,
        chaseDurationMs: weaponStats.DURATION_MS,
        player,
        enemyType,
      });
    }

    case "orbiting": {
      const weaponStats = stats.orbiting;

      if (!weaponStats) {
        throw new Error(
          `${enemyType} does not have an orbiting weapon configured`,
        );
      }

      return new OrbitingWeapon({
        scene,
        target,
        texture: weaponStats.TEXTURE,
        orbit: true,
        orbitRadius: weaponStats.RADIUS,
        orbitSpeedDegPerSec: weaponStats.SPEED_DEG_PER_SEC,
        startAngleDeg: Phaser.Math.FloatBetween(0, 360),
        player,
        enemyType,
      });
    }

    case "summoning": {
      const weaponStats = stats.summoning;

      if (!weaponStats) {
        throw new Error(
          `${enemyType} does not have a summoning weapon configured`,
        );
      }

      return new SummoningWeapon({
        scene,
        target,
        texture: weaponStats.TEXTURE,
        warningTexture: "tree_stump",
        delayMs: weaponStats.DELAY_MS,
        warningDurationMs: weaponStats.WARNING_DURATION_MS,
        durationMs: weaponStats.DURATION_MS,
        player,
        enemyType,
      });
    }

    default:
      throw new Error(`Unknown mini-boss weapon type: ${weaponType}`);
  }
};
