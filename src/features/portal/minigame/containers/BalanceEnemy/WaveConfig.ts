import type {
  MiniBossWaveConfig,
  BossWaveConfig,
  MeleeWaveConfig,
  PhasingeWaveConfig,
} from "../../Types";

// Phasing
export const PHASING_WAVE_THRESHOLDS: PhasingeWaveConfig[] = [
  // Area 1
  {
    mobType: "bat",
    totalEnemy: 10,
    batchSize: 5,
    delay: 4000,
    formation: "surround",
    flag: "wave1",
    area: 1,
  },
  // Area 2
  {
    mobType: "crow",
    totalEnemy: 10,
    batchSize: 5,
    delay: 5000,
    formation: "horizontal line",
    flag: "wave2_1",
    area: 2,
  },
  {
    mobType: "ghost",
    totalEnemy: 10,
    batchSize: 5,
    delay: 2000,
    formation: "surround",
    flag: "wave2_2",
    area: 2,
  },
  // Area 3
  {
    mobType: "gargoyle",
    totalEnemy: 10,
    batchSize: 5,
    delay: 6000,
    formation: "surround",
    flag: "wave3_1",
    area: 3,
  },
  // Area 4
];

// Melee
export const MELEE_WAVE_THRESHOLDS: MeleeWaveConfig[] = [
  // Area 1
  {
    mobType: "carnivore_plant",
    totalEnemy: 10,
    batchSize: 5,
    delay: 5000,
    formation: "horizontal line",
    flag: "meleeWave1_1",
    area: 1,
  },
  {
    mobType: "rat",
    totalEnemy: 10,
    batchSize: 5,
    delay: 6000,
    formation: "surround",
    flag: "meleeWave1_2",
    area: 1,
  },
  {
    mobType: "zombie",
    totalEnemy: 10,
    batchSize: 5,
    delay: 8000,
    formation: "circle",
    flag: "meleeWave1_3",
    area: 1,
  },
  // Area 2
  {
    mobType: "skeleton",
    totalEnemy: 10,
    batchSize: 5,
    delay: 3000,
    formation: "vertical line",
    flag: "meleeWave2_1",
    area: 2,
  },
  {
    mobType: "slime_red",
    totalEnemy: 10,
    batchSize: 5,
    delay: 3000,
    formation: "surround",
    flag: "meleeWave2_2",
    area: 2,
  },
  {
    mobType: "slime_green",
    totalEnemy: 10,
    batchSize: 5,
    delay: 8000,
    formation: "surround",
    flag: "meleeWave2_3",
    area: 2,
  },
  {
    mobType: "slime_blue",
    totalEnemy: 10,
    batchSize: 5,
    delay: 5000,
    formation: "surround",
    flag: "meleeWave2_4",
    area: 2,
  },
  // Area 3
  {
    mobType: "vampire",
    totalEnemy: 30,
    batchSize: 3,
    delay: 4000,
    formation: "vertical line",
    flag: "meleeWave3_1",
    area: 3,
  },
  {
    mobType: "frankenstein",
    totalEnemy: 30,
    batchSize: 3,
    delay: 4000,
    formation: "horizontal line",
    flag: "meleeWave3_2",
    area: 3,
  },
  {
    mobType: "werewolf",
    totalEnemy: 15,
    batchSize: 3,
    delay: 4000,
    formation: "surround",
    flag: "meleeWave3_3",
    area: 3,
  },
  // Area 4
  {
    mobType: "hellHound",
    totalEnemy: 15,
    batchSize: 3,
    delay: 2000,
    formation: "surround",
    flag: "meleeWave2_1",
    area: 4,
  },
  {
    mobType: "demon1",
    totalEnemy: 15,
    batchSize: 3,
    delay: 4000,
    formation: "vertical line",
    flag: "meleeWave2_2",
    area: 4,
  },
  {
    mobType: "demon2",
    totalEnemy: 15,
    batchSize: 3,
    delay: 6000,
    formation: "horizontal line",
    flag: "meleeWave2_3",
    area: 4,
  },
];

// MiniBoss
export const MINIBOSS_WAVE_THRESHOLDS: MiniBossWaveConfig[] = [
  // Area 1
  {
    miniBossType: "golem",
    totalEnemy: 1,
    weaponType: ["orbiting"],
    formation: "vertical line",
    flag: "area1_1",
    area: 1,
  },
  {
    miniBossType: "ent",
    totalEnemy: 1,
    weaponType: ["orbiting"],
    formation: "horizontal line",
    flag: "area1_2",
    area: 1,
  },
  // Area 2
  {
    miniBossType: "mummy",
    totalEnemy: 1,
    weaponType: ["orbiting"],
    formation: "vertical line",
    flag: "area2_1",
    area: 2,
  },
  {
    miniBossType: "living_armor",
    totalEnemy: 1,
    weaponType: ["orbiting"],
    formation: "horizontal line",
    flag: "area2_2",
    area: 2,
  },
  // Area 3
  {
    miniBossType: "headless_horseman",
    totalEnemy: 1,
    weaponType: ["orbiting"],
    formation: "vertical line",
    flag: "area3_1",
    area: 3,
  },
  // {
  //   miniBossType: "medusa",
  //   totalEnemy: 1,
  //   weaponType: ["orbiting"],
  //   formation: "horizontal line",
  //   flag: "area3_2",
  //   area: 3,
  // },
];

export const BOSS_WAVE_THRESHOLDS: BossWaveConfig[] = [
  // Area 1
  {
    bossType: "minotaur",
    totalEnemy: 1,
    weaponType: ["slash"],
    formation: "vertical line",
    flag: "bossWave1",
  },
  // Area 2
  {
    bossType: "witch",
    totalEnemy: 1,
    weaponType: ["orbiting"],
    formation: "vertical line",
    flag: "bossWave2",
  },
  // Area 3
  // {
  //   bossType: "cerberus",
  //   totalEnemy: 1,
  //   weaponType: ["summoning"],
  //   formation: "vertical line",
  //   flag: "bossWave3",
  // },
  // Area 4
  {
    bossType: "sorcerer",
    totalEnemy: 1,
    weaponType: ["summoning"],
    formation: "vertical line",
    flag: "bossWave3",
  },
];
