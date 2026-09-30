import type { Scene } from "../../Scene";
import type { BumpkinContainer } from "../../Core/BumpkinContainer";
import type { WeaponType, WeaponEnemyType } from "../../Types";
import { ChasingWeapon } from "./ChasingWeapon";
import { OrbitingWeapon } from "./OrbitingWeapon";
import type { MiniBoss } from "../MiniBossContainer";
import { SummoningWeapon } from "./SummoningWeapon";
import type { EnemyWeapon } from "./EnemyWeapons";
import { WEAPON_BALANCE_STATS } from "../BalanceEnemy/WeaponStatConfig";
import { StaticRangeWeapon } from "./StaticRangeWeapon";
import type { StaticRangeEnemy } from "../StaticRangeEnemyContainer";

interface WeaponProps {
  scene: Scene;
  target: MiniBoss | StaticRangeEnemy;
  player: BumpkinContainer;
  enemyType: WeaponEnemyType;
  weaponType: WeaponType;
}

export const createEnemyWeapon = ({
  scene,
  target,
  player,
  enemyType,
  weaponType,
}: WeaponProps): EnemyWeapon => {
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

    case "staticRange": {
      const weaponStats = stats.staticRange;
      if (!weaponStats) {
        throw new Error(
          `${enemyType} does not have a static range weapon configured`,
        );
      }

      return new StaticRangeWeapon({
        scene,
        target,
        texture: weaponStats.TEXTURE,
        frame_end: weaponStats.FRAME_END,
        range: weaponStats.RANGE,
        speed: weaponStats.SPEED,
        cooldownMs: weaponStats.COOLDOWN_MS,
        durationMs: weaponStats.DURATION_MS,
        player,
        enemyType,
      });
    }

    default:
      throw new Error(`Unknown mini-boss weapon type: ${weaponType}`);
  }
};
