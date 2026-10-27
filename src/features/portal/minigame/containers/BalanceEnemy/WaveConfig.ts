import { SQUARE_WIDTH } from "features/game/lib/constants";
import type {
  MiniBossWaveConfig,
  BossWaveConfig,
  MeleeWaveConfig,
  PhasingeWaveConfig,
} from "../../Types";
import { ENEMY_BALANCE_STATS, TESTING } from "../../constants";

const stats = ENEMY_BALANCE_STATS;

// Phasing
export const PHASING_WAVE_THRESHOLDS: PhasingeWaveConfig[] = [
  // Area 1
  {
    mobType: "bat",
    totalEnemy: TESTING ? 5 : stats.bat.TOTAL,
    batchSize: stats.bat.BATCH_SIZE,
    delay: stats.bat.DELAY,
    formation: stats.bat.FORMATION,
    flag: "wave1",
    area: 1,
  },
  // Area 2
  {
    mobType: "crow",
    totalEnemy: TESTING ? 5 : stats.crow.TOTAL,
    batchSize: stats.crow.BATCH_SIZE,
    delay: stats.crow.DELAY,
    formation: stats.crow.FORMATION,
    flag: "wave2_1",
    area: 2,
  },
  {
    mobType: "ghost",
    totalEnemy: TESTING ? 5 : stats.ghost.TOTAL,
    batchSize: stats.ghost.BATCH_SIZE,
    delay: stats.ghost.DELAY,
    formation: stats.ghost.FORMATION,
    flag: "wave2_2",
    area: 2,
  },
  // Area 3
  {
    mobType: "gargoyle",
    totalEnemy: TESTING ? 5 : stats.gargoyle.TOTAL,
    batchSize: stats.gargoyle.BATCH_SIZE,
    delay: stats.gargoyle.DELAY,
    formation: stats.gargoyle.FORMATION,
    flag: "wave3_1",
    area: 3,
  },
  // Area 4
  {
    mobType: "shade",
    totalEnemy: TESTING ? 5 : stats.shade.TOTAL,
    batchSize: stats.shade.BATCH_SIZE,
    delay: stats.shade.DELAY,
    formation: stats.shade.FORMATION,
    flag: "wave4_1",
    area: 4,
  },
];

// Melee
export const MELEE_WAVE_THRESHOLDS: MeleeWaveConfig[] = [
  // Area 1
  {
    mobType: "carnivore_plant",
    totalEnemy: TESTING ? 5 : stats.carnivore_plant.TOTAL,
    batchSize: stats.carnivore_plant.BATCH_SIZE,
    delay: stats.carnivore_plant.DELAY,
    formation: stats.carnivore_plant.FORMATION,
    flag: "meleeWave1_1",
    area: 1,
  },
  {
    mobType: "rat",
    totalEnemy: TESTING ? 5 : stats.rat.TOTAL,
    batchSize: stats.rat.BATCH_SIZE,
    delay: stats.rat.DELAY,
    formation: stats.rat.FORMATION,
    flag: "meleeWave1_2",
    area: 1,
  },
  {
    mobType: "zombie",
    totalEnemy: TESTING ? 5 : stats.zombie.TOTAL,
    batchSize: stats.zombie.BATCH_SIZE,
    delay: stats.zombie.DELAY,
    formation: stats.zombie.FORMATION,
    flag: "meleeWave1_3",
    area: 1,
  },

  // Area 2
  {
    mobType: "skeleton",
    totalEnemy: TESTING ? 5 : stats.skeleton.TOTAL,
    batchSize: stats.skeleton.BATCH_SIZE,
    delay: stats.skeleton.DELAY,
    formation: stats.skeleton.FORMATION,
    flag: "meleeWave2_1",
    area: 2,
  },
  {
    mobType: "slime_red",
    totalEnemy: TESTING ? 5 : stats.slime_red.TOTAL,
    batchSize: stats.slime_red.BATCH_SIZE,
    delay: stats.slime_red.DELAY,
    formation: stats.slime_red.FORMATION,
    flag: "meleeWave2_2",
    area: 2,
  },
  {
    mobType: "slime_green",
    totalEnemy: TESTING ? 5 : stats.slime_green.TOTAL,
    batchSize: stats.slime_green.BATCH_SIZE,
    delay: stats.slime_green.DELAY,
    formation: stats.slime_green.FORMATION,
    flag: "meleeWave2_3",
    area: 2,
  },
  {
    mobType: "slime_blue",
    totalEnemy: TESTING ? 5 : stats.slime_blue.TOTAL,
    batchSize: stats.slime_blue.BATCH_SIZE,
    delay: stats.slime_blue.DELAY,
    formation: stats.slime_blue.FORMATION,
    flag: "meleeWave2_4",
    area: 2,
  },

  // Area 3
  {
    mobType: "vampire",
    totalEnemy: TESTING ? 5 : stats.vampire.TOTAL,
    batchSize: stats.vampire.BATCH_SIZE,
    delay: stats.vampire.DELAY,
    formation: stats.vampire.FORMATION,
    flag: "meleeWave3_1",
    area: 3,
  },
  {
    mobType: "frankenstein",
    totalEnemy: TESTING ? 5 : stats.frankenstein.TOTAL,
    batchSize: stats.frankenstein.BATCH_SIZE,
    delay: stats.frankenstein.DELAY,
    formation: stats.frankenstein.FORMATION,
    flag: "meleeWave3_2",
    area: 3,
  },
  {
    mobType: "werewolf",
    totalEnemy: TESTING ? 5 : stats.werewolf.TOTAL,
    batchSize: stats.werewolf.BATCH_SIZE,
    delay: stats.werewolf.DELAY,
    formation: stats.werewolf.FORMATION,
    flag: "meleeWave3_3",
    area: 3,
  },

  // Area 4
  {
    mobType: "hellHound",
    totalEnemy: TESTING ? 5 : stats.hellHound.TOTAL,
    batchSize: stats.hellHound.BATCH_SIZE,
    delay: stats.hellHound.DELAY,
    formation: stats.hellHound.FORMATION,
    flag: "meleeWave4_1",
    area: 4,
  },
  {
    mobType: "demon1",
    totalEnemy: TESTING ? 5 : stats.demon1.TOTAL,
    batchSize: stats.demon1.BATCH_SIZE,
    delay: stats.demon1.DELAY,
    formation: stats.demon1.FORMATION,
    flag: "meleeWave4_2",
    area: 4,
  },
  {
    mobType: "demon2",
    totalEnemy: TESTING ? 5 : stats.demon2.TOTAL,
    batchSize: stats.demon2.BATCH_SIZE,
    delay: stats.demon2.DELAY,
    formation: stats.demon2.FORMATION,
    flag: "meleeWave4_3",
    area: 4,
  },
];

// MiniBoss
export const MINIBOSS_WAVE_THRESHOLDS: MiniBossWaveConfig[] = [
  // Area 1
  {
    miniBossType: "golem",
    totalEnemy: stats.golem.TOTAL,
    weaponType: stats.golem.WEAPON,
    formation: stats.golem.FORMATION,
    flag: "area1_1",
    area: 1,
  },
  {
    miniBossType: "ent",
    totalEnemy: stats.ent.TOTAL,
    weaponType: stats.ent.WEAPON,
    formation: stats.ent.FORMATION,
    flag: "area1_2",
    area: 1,
  },

  // Area 2
  {
    miniBossType: "mummy",
    totalEnemy: stats.mummy.TOTAL,
    weaponType: stats.mummy.WEAPON,
    formation: stats.mummy.FORMATION,
    flag: "area2_1",
    area: 2,
  },
  {
    miniBossType: "living_armor",
    totalEnemy: stats.living_armor.TOTAL,
    weaponType: stats.living_armor.WEAPON,
    formation: stats.living_armor.FORMATION,
    flag: "area2_2",
    area: 2,
  },

  // Area 3
  {
    miniBossType: "headless_horseman",
    totalEnemy: stats.headless_horseman.TOTAL,
    weaponType: stats.headless_horseman.WEAPON,
    formation: stats.headless_horseman.FORMATION,
    flag: "area3_1",
    area: 3,
  },
  {
    miniBossType: "medusa",
    totalEnemy: stats.medusa.TOTAL,
    weaponType: stats.medusa.WEAPON,
    formation: stats.medusa.FORMATION,
    flag: "area3_2",
    area: 3,
  },

  // Area 4
  {
    miniBossType: "golem_area4",
    totalEnemy: stats.golem_area4.TOTAL,
    weaponType: stats.golem_area4.WEAPON,
    formation: stats.golem_area4.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 3 * SQUARE_WIDTH },
    flag: "area4_1",
    area: 4,
  },
  {
    miniBossType: "ent_area4",
    totalEnemy: stats.ent_area4.TOTAL,
    weaponType: stats.ent_area4.WEAPON,
    formation: stats.ent_area4.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 6 * SQUARE_WIDTH },
    flag: "area4_2",
    area: 4,
  },
  {
    miniBossType: "mummy_area4",
    totalEnemy: stats.mummy_area4.TOTAL,
    weaponType: stats.mummy_area4.WEAPON,
    formation: stats.mummy_area4.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 9 * SQUARE_WIDTH },
    flag: "area4_3",
    area: 4,
  },
  {
    miniBossType: "living_armor_area4",
    totalEnemy: stats.living_armor_area4.TOTAL,
    weaponType: stats.living_armor_area4.WEAPON,
    formation: stats.living_armor_area4.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 12 * SQUARE_WIDTH },
    flag: "area4_4",
    area: 4,
  },
  {
    miniBossType: "headless_horseman_area4",
    totalEnemy: stats.headless_horseman_area4.TOTAL,
    weaponType: stats.headless_horseman_area4.WEAPON,
    formation: stats.headless_horseman_area4.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 15 * SQUARE_WIDTH },
    flag: "area4_5",
    area: 4,
  },
  {
    miniBossType: "medusa_area4",
    totalEnemy: stats.medusa_area4.TOTAL,
    weaponType: stats.medusa_area4.WEAPON,
    formation: stats.medusa_area4.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 18 * SQUARE_WIDTH },
    flag: "area4_6",
    area: 4,
  },
];

// Final bosses
export const BOSS_WAVE_THRESHOLDS: BossWaveConfig[] = [
  // Area 1
  {
    bossType: "minotaur",
    totalEnemy: stats.minotaur.TOTAL,
    weaponType: stats.minotaur.WEAPON,
    formation: stats.minotaur.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 0 },
    flag: "bossWave1",
  },

  // Area 2
  {
    bossType: "witch",
    totalEnemy: stats.witch.TOTAL,
    weaponType: stats.witch.WEAPON,
    formation: stats.witch.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 0 },
    flag: "bossWave2",
  },

  // Area 3
  {
    bossType: "cerberus",
    totalEnemy: stats.cerberus.TOTAL,
    weaponType: stats.cerberus.WEAPON,
    formation: stats.cerberus.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 0 },
    flag: "bossWave3",
  },

  // Area 4
  {
    bossType: "sorcerer",
    totalEnemy: stats.sorcerer.TOTAL,
    weaponType: stats.sorcerer.WEAPON,
    formation: stats.sorcerer.FORMATION,
    spawnPosition: { x: 10 * SQUARE_WIDTH, y: 0 },
    flag: "bossWave4",
  },
  {
    bossType: "dungeonboss",
    totalEnemy: stats.dungeonboss.TOTAL,
    weaponType: stats.dungeonboss.WEAPON,
    formation: stats.dungeonboss.FORMATION,
    spawnPosition: { x: 20 * SQUARE_WIDTH, y: 8 * SQUARE_WIDTH },
    flag: "bossWave4_1",
  },
];
