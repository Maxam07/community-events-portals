import type { TranslationKeys } from "lib/i18n/dictionaries/types";
import type { WeaponId, WeaponRuntimeStats } from "../Types";
import { WEAPON_CONFIGS } from "./WeaponConstants";

import banana_icon from "public/world/portal/images/banana_icon.webp";
import scythe_icon from "public/world/portal/images/scythe_icon.png";
import tomato_icon from "public/world/portal/images/tomato_icon.png";
import sunflower_icon from "public/world/portal/images/sunflower_icon.png";
import oil_icon from "public/world/portal/images/oil_icon.png";
import beehive_icon from "public/world/portal/images/beehive_icon.webp";
import corn_bomb_icon from "public/world/portal/images/corn_bomb_icon.webp";
import pumpkin_icon from "public/world/portal/images/pumpkin_icon.webp";
import watering_can_icon from "public/world/portal/images/watering_can_icon.webp";

export const WEAPON_ICONS: Record<WeaponId, string> = {
  banana: banana_icon,
  broomScythe: scythe_icon,
  wateringCan: watering_can_icon,
  corn: corn_bomb_icon,
  tomato: tomato_icon,
  sunflower: sunflower_icon,
  oil: oil_icon,
  pumpkin: pumpkin_icon,
  beehive: beehive_icon,
};

export const WEAPON_IDS = Object.keys(WEAPON_CONFIGS) as WeaponId[];

export const WEAPON_NAMES: Record<WeaponId, TranslationKeys> = {
  banana: "minigame.weapon.banana",
  broomScythe: "minigame.weapon.broomScythe",
  wateringCan: "minigame.weapon.wateringCan",
  corn: "minigame.weapon.corn",
  tomato: "minigame.weapon.tomato",
  sunflower: "minigame.weapon.sunflower",
  oil: "minigame.weapon.oil",
  pumpkin: "minigame.weapon.pumpkin",
  beehive: "minigame.weapon.beehive",
};

export const WEAPON_DESCRIPTIONS: Record<WeaponId, TranslationKeys> = {
  banana: "minigame.weapon.description.banana",
  broomScythe: "minigame.weapon.description.broomScythe",
  wateringCan: "minigame.weapon.description.wateringCan",
  corn: "minigame.weapon.description.corn",
  tomato: "minigame.weapon.description.tomato",
  sunflower: "minigame.weapon.description.sunflower",
  oil: "minigame.weapon.description.oil",
  pumpkin: "minigame.weapon.description.pumpkin",
  beehive: "minigame.weapon.description.beehive",
};

export const WEAPON_STAT_LABELS: Record<
  keyof WeaponRuntimeStats,
  TranslationKeys
> = {
  damage: "minigame.weapon.stat.damage",
  cooldownMs: "minigame.weapon.stat.cooldownMs",
  projectileSpeed: "minigame.weapon.stat.projectileSpeed",
  projectileCount: "minigame.weapon.stat.projectileCount",
  spreadDegrees: "minigame.weapon.stat.spreadDegrees",
  areaRadius: "minigame.weapon.stat.areaRadius",
  orbitRadius: "minigame.weapon.stat.orbitRadius",
  orbitalCount: "minigame.weapon.stat.orbitalCount",
  durationMs: "minigame.weapon.stat.durationMs",
  size: "minigame.weapon.stat.size",
  pierce: "minigame.weapon.stat.pierce",
  bounceCount: "minigame.weapon.stat.bounceCount",
  chainRadius: "minigame.weapon.stat.chainRadius",
  arcDegrees: "minigame.weapon.stat.arcDegrees",
  range: "minigame.weapon.stat.range",
  dotDamage: "minigame.weapon.stat.dotDamage",
  dotTickMs: "minigame.weapon.stat.dotTickMs",
  statusDurationMs: "minigame.weapon.stat.statusDurationMs",
  homingSpeed: "minigame.weapon.stat.homingSpeed",
  hitCooldownMs: "minigame.weapon.stat.hitCooldownMs",
  angularSpeed: "minigame.weapon.stat.angularSpeed",
};

export const WEAPON_STAT_DESCRIPTIONS: Record<
  keyof WeaponRuntimeStats,
  TranslationKeys
> = {
  damage: "minigame.weapon.statDescription.damage",
  cooldownMs: "minigame.weapon.statDescription.cooldownMs",
  projectileSpeed: "minigame.weapon.statDescription.projectileSpeed",
  projectileCount: "minigame.weapon.statDescription.projectileCount",
  spreadDegrees: "minigame.weapon.statDescription.spreadDegrees",
  areaRadius: "minigame.weapon.statDescription.areaRadius",
  orbitRadius: "minigame.weapon.statDescription.orbitRadius",
  orbitalCount: "minigame.weapon.statDescription.orbitalCount",
  durationMs: "minigame.weapon.statDescription.durationMs",
  size: "minigame.weapon.statDescription.size",
  pierce: "minigame.weapon.statDescription.pierce",
  bounceCount: "minigame.weapon.statDescription.bounceCount",
  chainRadius: "minigame.weapon.statDescription.chainRadius",
  arcDegrees: "minigame.weapon.statDescription.arcDegrees",
  range: "minigame.weapon.statDescription.range",
  dotDamage: "minigame.weapon.statDescription.dotDamage",
  dotTickMs: "minigame.weapon.statDescription.dotTickMs",
  statusDurationMs: "minigame.weapon.statDescription.statusDurationMs",
  homingSpeed: "minigame.weapon.statDescription.homingSpeed",
  hitCooldownMs: "minigame.weapon.statDescription.hitCooldownMs",
  angularSpeed: "minigame.weapon.statDescription.angularSpeed",
};
