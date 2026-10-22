import type {
  BumpkinAura,
  BumpkinWings,
  Equipped,
} from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { DROP_ITEM_XP_VALUES } from "./EnemyConstants";
import { WEAPON_CONFIGS, WEAPON_UPGRADES } from "./WeaponConstants";

import frozen_skull_icon from "public/world/portal/halloween/weapons/the_frost/frozen_skull_icon.png";
import blood_scythe_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/blood_scythe_icon.png";
import blood_knife_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/blood_knife_icon.png";
import frost_flower_icon from "public/world/portal/halloween/weapons/the_frost/frost_flower_icon.png";
import moss_ground_icon from "public/world/portal/halloween/weapons/the_plague/moss_ground_icon.png";
import fly_storm_icon from "public/world/portal/halloween/weapons/the_plague/fly_storm_icon.png";
import poison_vial_icon from "public/world/portal/halloween/weapons/the_plague/poison_vial_icon.png";
import banished_jack_o_lantern_icon from "public/world/portal/halloween/weapons/the_curse/banished_jack_o_lantern_icon.png";
import darkness_book_icon from "public/world/portal/halloween/weapons/the_curse/darkness_book_icon.png";
import cursed_coffin_icon from "public/world/portal/halloween/weapons/the_curse/cursed_coffin_icon.png";
import frost_chain_icon from "public/world/portal/halloween/weapons/the_frost/frost_chain_icon.png";
import crimson_vial_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/crimson_vial_icon.png";

import blueOrb from "public/world/portal/images/dropItem1.webp";
import greenOrb from "public/world/portal/images/dropItem2.webp";
import grayOrb from "public/world/portal/images/dropItem3.webp";
import yellowOrb from "public/world/portal/images/dropItem4.webp";
import purpleOrb from "public/world/portal/images/dropItem5.webp";

import icon_boss3 from "public/world/portal/images/icon_boss_3.webp";
import tooltip_icon from "public/world/portal/images/ExpOrb_combined.webp";
import swordIcon from "public/world/portal/images/sword_icon.png";
import speedIcon from "public/world/portal/images/lightning.png";
import type {
  // MobTypes,
  WeaponId,
  WeaponStatKey,
  PassiveAbilityType,
} from "../Types";
import { SUNNYSIDE } from "assets/sunnyside";

export { PORTAL_NAME } from "./PortalConstants";

// Game config
export const GAME_SECONDS = 300;
export const GAME_LIVES = 100;
export const WALKING_SPEED = 50;
export const PLAYER_WATER_SPEED_MULTIPLIER = 0.6;
export const REVIVE_FLOWER_COST = 4;
export const REVIVE_SCORE_MULTIPLIER = 0.85;
export const REVIVE_MAX_PER_RUN = 5;
export const BLOCKADE_GUIDE_MIN_TILES = 12;

// Attempts
export const INITIAL_DATE = "2026-10-22"; // YYYY-MM-DD
export const INITIAL_DATE_LEADERBOARD = "2026-10-26"; // YYYY-MM-DD
export const FINAL_DATE_LEADERBOARD = "2026-11 -02"; // YYYY-MM-DD
export const ATTEMPTS_BETA_TESTERS = 0;
export const UNLIMITED_ATTEMPTS_SFL = 200; // If this value is less than 0, the option disappears
export const UNLIMITED_ATTEMPTS_AURA_DISCOUNT_SFL = 150;
export const FREE_DAILY_ATTEMPTS = 1;
export const RESTOCK_ATTEMPTS = [
  { attempts: 1, sfl: 5 },
  { attempts: 3, sfl: 15 },
  { attempts: 7, sfl: 30 },
  { attempts: 20, sfl: 75 },
];

export const UNLIMITED_ATTEMPTS_DISCOUNT_AURAS: BumpkinAura[] = [
  "Slime Aura",
  "Butterfly Aura",
  "Wisp Aura",
  "Diamond Snow Aura",
  "Glitch Aura",
];

// Beta testers
// export const BETA_TESTERS: number[] = [
//   29, 9609, 49035, 155026, 1181, 151471, 49035, 86, 79871, 2299, 21303, 206876,
//   9239, 36214, 55626, 3249, 128122,
// ];
export const BETA_TESTERS: number[] = [3456169667100986];

export const ATTEMPTS_PURCHASED_BY_MISTAKE: {
  id: number;
  attempts: number | "unlimited";
}[] = [
  // { id: {FarmId}, attempts: 1 },
  // { id: {FarmId}, attempts: "unlimited" },
];

export const PASSIVE_ABILITY_ITEM: BumpkinWings = "Underworld Stimpack";

export const IMMUNITY_TOOLTIP: {
  id: PassiveAbilityType;
  image: string;
  description: string;
}[] = [
  {
    id: "wings",
    image: tooltip_icon,
    description: t("minigame.AbilityDescription"),
  },
];

// Guide
export const INSTRUCTIONS: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: icon_boss3,
    description: t("minigame.instructions1"),
  },
  {
    image: purpleOrb,
    description: t("minigame.instructions2"),
  },
  {
    image: darkness_book_icon,
    description: t("minigame.instructions3"),
  },
  // {
  //   image: getWearableImage(`${PASSIVE_ABILITY_ITEM}`),
  //   description: t("minigame.instructions8"),
  // },
  {
    image: SUNNYSIDE.icons.xpIcon,
    description: t("minigame.instructions7"),
  },
  {
    image: SUNNYSIDE.icons.upgrade_disc,
    description: t("minigame.instructions4"),
  },
];

export const RESOURCES_TABLE: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: SUNNYSIDE.icons.heart,
    description: t("minigame.resource1"),
  },
  {
    image: speedIcon,
    description: t("minigame.resource2"),
  },
  {
    image: swordIcon,
    description: t("minigame.resource3"),
  },
  // {
  //   image: getWearableImage(`${PASSIVE_ABILITY_ITEM}`),
  //   description: t("minigame.AbilityDescription"),
  // },
];

// const mob_config = MOB_CONFIGS;
// const boss_config = BOSS_CONFIGS;
const skill_config = WEAPON_CONFIGS;

export const DROP_ITEM_ASSETS: Record<string, string> = {
  blueOrb,
  greenOrb,
  grayOrb,
  yellowOrb,
  purpleOrb,
};

// const MOB_NAMES: Record<MobTypes, string> = {
//   mob1: "Potted Slime",
//   mob2: "Flappy",
//   mob3: "Slime",
//   mob4: "Blobert",
//   mob5: "Balloon slime",
// };

// const BOSS_NAMES: Record<BossTypes, string> = {
//   boss1: "Daisy",
//   boss2: "Pierrot",
//   boss3: "Sharky",
// };

export const ENEMIES_TABLE: {
  image: string;
  type: string;
  hp: number;
  damage: number;
  itemIcon: string;
}[] = [
  // {
  //   image: icon_boss1,
  //   type: BOSS_NAMES.boss1,
  //   hp: boss_config.boss1.hp,
  //   damage: ENEMY_BALANCE_STATS.boss1.DAMAGE,
  //   itemIcon: DROP_ITEM_ASSETS[boss_config.boss1.dropItem],
  // },
  // {
  //   image: icon_boss2,
  //   type: BOSS_NAMES.boss2,
  //   hp: boss_config.boss2.hp,
  //   damage: ENEMY_BALANCE_STATS.boss2.DAMAGE,
  //   itemIcon: DROP_ITEM_ASSETS[boss_config.boss2.dropItem],
  // },
  // {
  //   image: icon_boss3,
  //   type: BOSS_NAMES.boss3,
  //   hp: boss_config.boss3.hp,
  //   damage: ENEMY_BALANCE_STATS.boss3.DAMAGE,
  //   itemIcon: DROP_ITEM_ASSETS[boss_config.boss3.dropItem],
  // },
  // {
  //   image: icon_mob1,
  //   type: MOB_NAMES.mob1,
  //   hp: mob_config.mob1.hp,
  //   damage: ENEMY_BALANCE_STATS.mob1.DAMAGE,
  //   itemIcon: DROP_ITEM_ASSETS[mob_config.mob1.dropItem],
  // },
  // {
  //   image: icon_mob2,
  //   type: MOB_NAMES.mob2,
  //   hp: mob_config.mob2.hp,
  //   damage: ENEMY_BALANCE_STATS.mob2.DAMAGE,
  //   itemIcon: DROP_ITEM_ASSETS[mob_config.mob2.dropItem],
  // },
  // {
  //   image: icon_mob3,
  //   type: MOB_NAMES.mob3,
  //   hp: mob_config.mob3.hp,
  //   damage: ENEMY_BALANCE_STATS.mob3.DAMAGE,
  //   itemIcon: DROP_ITEM_ASSETS[mob_config.mob3.dropItem],
  // },
  // {
  //   image: icon_mob4,
  //   type: MOB_NAMES.mob4,
  //   hp: mob_config.mob4.hp,
  //   damage: ENEMY_BALANCE_STATS.mob4.DAMAGE,
  //   itemIcon: DROP_ITEM_ASSETS[mob_config.mob4.dropItem],
  // },
  // {
  //   image: icon_mob5,
  //   type: MOB_NAMES.mob5,
  //   hp: mob_config.mob5.hp,
  //   damage: ENEMY_BALANCE_STATS.mob5.DAMAGE,
  //   itemIcon: DROP_ITEM_ASSETS[mob_config.mob5.dropItem],
  // },
];

function getWeaponMaxStat(weaponId: WeaponId, stat: WeaponStatKey) {
  return WEAPON_UPGRADES[weaponId]
    .flatMap((upgrade) => upgrade.modifiers)
    .filter((modifier) => modifier.stat === stat)
    .reduce((total, modifier) => {
      if (modifier.operation === "add") return total + modifier.value;
      if (modifier.operation === "set") return modifier.value;

      return total;
    }, WEAPON_CONFIGS[weaponId].baseStats[stat]);
}

function getWeaponMaxDamage(weaponId: WeaponId) {
  return getWeaponMaxStat(weaponId, "damage");
}

export const SKILLS_TABLE: {
  image: string;
  skillName: string;
  description: string;
  minDamage: number;
  maxDamage: number;
}[] = [
  {
    image: frozen_skull_icon,
    skillName: t("minigame.weapon.frozenSkull"),
    description: t("minigame.enemy2"),
    minDamage: skill_config.frozenSkull.baseStats.damage,
    maxDamage: getWeaponMaxDamage("frozenSkull"),
  },
  {
    image: blood_scythe_icon,
    skillName: t("minigame.weapon.bloodScythe"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.bloodScythe.baseStats.damage,
    maxDamage: getWeaponMaxDamage("bloodScythe"),
  },
  {
    image: darkness_book_icon,
    skillName: t("minigame.weapon.darknessBook"),
    description: t("minigame.enemy1"),
    minDamage: skill_config.darknessBook.baseStats.damage,
    maxDamage: getWeaponMaxDamage("darknessBook"),
  },
  {
    image: poison_vial_icon,
    skillName: t("minigame.weapon.poisonVial"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.poisonVial.baseStats.damage,
    maxDamage: getWeaponMaxDamage("poisonVial"),
  },
  {
    image: blood_knife_icon,
    skillName: t("minigame.weapon.bloodKnife"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.bloodKnife.baseStats.damage,
    maxDamage: getWeaponMaxDamage("bloodKnife"),
  },
  {
    image: frost_flower_icon,
    skillName: t("minigame.weapon.frostFlower"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.frostFlower.baseStats.damage,
    maxDamage: getWeaponMaxDamage("frostFlower"),
  },
  {
    image: moss_ground_icon,
    skillName: t("minigame.weapon.mossGround"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.mossGround.baseStats.damage,
    maxDamage: getWeaponMaxDamage("mossGround"),
  },
  {
    image: banished_jack_o_lantern_icon,
    skillName: t("minigame.weapon.banishedJackOLantern"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.banishedJackOLantern.baseStats.damage,
    maxDamage: getWeaponMaxDamage("banishedJackOLantern"),
  },
  {
    image: fly_storm_icon,
    skillName: t("minigame.weapon.flyStorm"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.flyStorm.baseStats.damage,
    maxDamage: getWeaponMaxDamage("flyStorm"),
  },
  {
    image: frost_chain_icon,
    skillName: t("minigame.weapon.frostChain"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.frostChain.baseStats.damage,
    maxDamage: getWeaponMaxDamage("frostChain"),
  },
  {
    image: crimson_vial_icon,
    skillName: t("minigame.weapon.crimsonVial"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.crimsonVial.baseStats.dotDamage,
    maxDamage: getWeaponMaxStat("crimsonVial", "dotDamage"),
  },
  {
    image: cursed_coffin_icon,
    skillName: t("minigame.weapon.cursedCoffin"),
    description: t("minigame.enemy3"),
    minDamage: skill_config.cursedCoffin.baseStats.damage,
    maxDamage: getWeaponMaxDamage("cursedCoffin"),
  },
];

export const DROP_ITEMS_XP_TABLE: {
  image: string;
  description: string;
  xp: number;
}[] = [
  {
    image: blueOrb,
    description: t("minigame.enemy1"),
    xp: DROP_ITEM_XP_VALUES.blueOrb,
  },
  {
    image: greenOrb,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.greenOrb,
  },
  {
    image: grayOrb,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.grayOrb,
  },
  {
    image: yellowOrb,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.yellowOrb,
  },
  {
    image: purpleOrb,
    description: t("minigame.enemy2"),
    xp: DROP_ITEM_XP_VALUES.purpleOrb,
  },
];

// Panel
export const PANEL_NPC_WEARABLES: Equipped = {
  body: "Beige Farmer Potion",
  background: "Slime Wall Background",
  hair: "Green Slime Hair",
  shirt: "Blue Slime Shirt",
  pants: "Sad Slime Pants",
  shoes: "Blue Jelly Shoes",
  tool: "Yellow Slime Puppet",
  wings: "Rainbow Wings",
  hat: "Sad Slime Hat",
};

// SFX
export const WEAPON_SFX_VOL = 0.1;
export const WEAPON_SFX: Record<WeaponId, { activate: string }> = {
  frozenSkull: { activate: "sfx_banana_swing" },
  bloodScythe: { activate: "sfx_slash_broom" },
  darknessBook: { activate: "sfx_water_shot" },
  poisonVial: { activate: "sfx_explosion_pop" },
  bloodKnife: { activate: "sfx_tomato_throw" },
  frostFlower: { activate: "sfx_light_shot" },
  mossGround: { activate: "sfx_oil_cast" },
  banishedJackOLantern: { activate: "sfx_pumpkin_roll" },
  flyStorm: { activate: "sfx_bee_spawn" },
  cursedCoffin: { activate: "sfx_explosion_pop" },
  frostChain: { activate: "sfx_slash_broom" },
  crimsonVial: { activate: "sfx_oil_cast" },
};
