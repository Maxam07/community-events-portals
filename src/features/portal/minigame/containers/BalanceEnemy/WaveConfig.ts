import type {
  MiniBossWaveConfig,
  BossWaveConfig,
  MeleeWaveConfig,
  PhasingeWaveConfig,
} from "../../Types";

export const BOSS_WAVE_THRESHOLDS: BossWaveConfig[] = [
  { triggerAt: 30, bossType: "boss1", totalEnemy: 1, flag: "bossWave1" },
  { triggerAt: 60, bossType: "boss2", totalEnemy: 1, flag: "bossWave2" },
  { triggerAt: 90, bossType: "boss3", totalEnemy: 1, flag: "bossWave3" },
  { triggerAt: 120, bossType: "boss1", totalEnemy: 2, flag: "bossWave4" },
  { triggerAt: 150, bossType: "boss2", totalEnemy: 2, flag: "bossWave5" },
  { triggerAt: 180, bossType: "boss3", totalEnemy: 2, flag: "bossWave6" },

  { triggerAt: 210, bossType: "boss1", totalEnemy: 1, flag: "bossWave7_a" },
  { triggerAt: 210, bossType: "boss2", totalEnemy: 1, flag: "bossWave7_b" },

  { triggerAt: 240, bossType: "boss2", totalEnemy: 2, flag: "bossWave8_a" },
  { triggerAt: 240, bossType: "boss3", totalEnemy: 1, flag: "bossWave8_b" },

  { triggerAt: 270, bossType: "boss1", totalEnemy: 2, flag: "bossWave9_a" },
  { triggerAt: 270, bossType: "boss3", totalEnemy: 2, flag: "bossWave9_b" },

  { triggerAt: 275, bossType: "boss2", totalEnemy: 4, flag: "bossWave10_a" },
  { triggerAt: 275, bossType: "boss3", totalEnemy: 4, flag: "bossWave10_b" },

  { triggerAt: 280, bossType: "boss1", totalEnemy: 10, flag: "bossWave11_a" },
  { triggerAt: 280, bossType: "boss2", totalEnemy: 5, flag: "bossWave11_b" },
  { triggerAt: 280, bossType: "boss3", totalEnemy: 3, flag: "bossWave11_c" },

  { triggerAt: 285, bossType: "boss1", totalEnemy: 10, flag: "bossWave12_a" },
  { triggerAt: 285, bossType: "boss2", totalEnemy: 7, flag: "bossWave12_b" },
  { triggerAt: 285, bossType: "boss3", totalEnemy: 3, flag: "bossWave12_c" },

  { triggerAt: 290, bossType: "boss1", totalEnemy: 10, flag: "bossWave13_a" },
  { triggerAt: 290, bossType: "boss2", totalEnemy: 10, flag: "bossWave13_b" },
  { triggerAt: 290, bossType: "boss3", totalEnemy: 10, flag: "bossWave13_c" },
];

// Phasing
export const PHASING_WAVE_THRESHOLDS: PhasingeWaveConfig[] = [
  {
    triggerAt: 10,
    mobType: "mob1",
    totalEnemy: 50,
    batchSize: 5,
    delay: 5000,
    formation: "surround",
    flag: "miniBossWave1",
  },
  {
    triggerAt: 30,
    mobType: "mob2",
    totalEnemy: 50,
    batchSize: 5,
    delay: 6000,
    formation: "circle",
    flag: "wave2",
  },
];
// Melee
export const MELEE_WAVE_THRESHOLDS: MeleeWaveConfig[] = [
  {
    triggerAt: 0,
    mobType: "demon2",
    totalEnemy: 30,
    batchSize: 5,
    delay: 8000,
    formation: "horizontal line",
    flag: "meleeWave1",
  },
  {
    triggerAt: 20,
    mobType: "demon1",
    totalEnemy: 30,
    batchSize: 3,
    delay: 4000,
    formation: "vertical line",
    flag: "meleeWave2",
  },
];
// MiniBoss
export const MINIBOSS_WAVE_THRESHOLDS: MiniBossWaveConfig[] = [
  {
    triggerAt: 130,
    miniBossType: "mummy",
    totalEnemy: 1,
    weaponType: ["summoning"],
    formation: "vertical line",
    flag: "area1_1",
  },
  {
    triggerAt: 160,
    miniBossType: "golem",
    totalEnemy: 1,
    weaponType: ["orbiting", "chasing"],
    formation: "horizontal line",
    flag: "area1_2",
  },
];
