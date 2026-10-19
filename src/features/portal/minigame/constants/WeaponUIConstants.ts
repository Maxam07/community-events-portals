import type { TranslationKeys } from "lib/i18n/dictionaries/types";
import type { WeaponId, WeaponRuntimeStats } from "../Types";
import { WEAPON_CONFIGS } from "./WeaponConstants";

import frozen_skull_icon from "public/world/portal/halloween/weapons/the_frost/frozen_skull_icon.png";
import blood_scythe_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/blood_scythe_icon.png";
import blood_knife_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/blood_knife_icon.png";
import crimson_vial_icon from "public/world/portal/halloween/weapons/the_bloody_harvest/crimson_vial_icon.png";
import frost_flower_icon from "public/world/portal/halloween/weapons/the_frost/frost_flower_icon.png";
import moss_ground_icon from "public/world/portal/halloween/weapons/the_plague/moss_ground_icon.png";
import fly_storm_icon from "public/world/portal/halloween/weapons/the_plague/fly_storm_icon.png";
import poison_vial_icon from "public/world/portal/halloween/weapons/the_plague/poison_vial_icon.png";
import banished_jack_o_lantern_icon from "public/world/portal/halloween/weapons/the_curse/banished_jack_o_lantern_icon.png";
import darkness_book_icon from "public/world/portal/halloween/weapons/the_curse/darkness_book_icon.png";
import cursed_coffin_icon from "public/world/portal/halloween/weapons/the_curse/cursed_coffin_icon.png";
import frost_chain_icon from "public/world/portal/halloween/weapons/the_frost/frost_chain_icon.png";

export const WEAPON_ICONS: Record<WeaponId, string> = {
  frozenSkull: frozen_skull_icon,
  bloodScythe: blood_scythe_icon,
  darknessBook: darkness_book_icon,
  poisonVial: poison_vial_icon,
  bloodKnife: blood_knife_icon,
  frostFlower: frost_flower_icon,
  mossGround: moss_ground_icon,
  banishedJackOLantern: banished_jack_o_lantern_icon,
  flyStorm: fly_storm_icon,
  cursedCoffin: cursed_coffin_icon,
  frostChain: frost_chain_icon,
  crimsonVial: crimson_vial_icon,
};

export const WEAPON_IDS = Object.keys(WEAPON_CONFIGS) as WeaponId[];

export const WEAPON_NAMES: Record<WeaponId, TranslationKeys> = {
  frozenSkull: "minigame.weapon.frozenSkull",
  bloodScythe: "minigame.weapon.bloodScythe",
  darknessBook: "minigame.weapon.darknessBook",
  poisonVial: "minigame.weapon.poisonVial",
  bloodKnife: "minigame.weapon.bloodKnife",
  frostFlower: "minigame.weapon.frostFlower",
  mossGround: "minigame.weapon.mossGround",
  banishedJackOLantern: "minigame.weapon.banishedJackOLantern",
  flyStorm: "minigame.weapon.flyStorm",
  cursedCoffin: "minigame.weapon.cursedCoffin",
  frostChain: "minigame.weapon.frostChain",
  crimsonVial: "minigame.weapon.crimsonVial",
};

export const WEAPON_DESCRIPTIONS: Record<WeaponId, TranslationKeys> = {
  frozenSkull: "minigame.weapon.description.frozenSkull",
  bloodScythe: "minigame.weapon.description.bloodScythe",
  darknessBook: "minigame.weapon.description.darknessBook",
  poisonVial: "minigame.weapon.description.poisonVial",
  bloodKnife: "minigame.weapon.description.bloodKnife",
  frostFlower: "minigame.weapon.description.frostFlower",
  mossGround: "minigame.weapon.description.mossGround",
  banishedJackOLantern: "minigame.weapon.description.banishedJackOLantern",
  flyStorm: "minigame.weapon.description.flyStorm",
  cursedCoffin: "minigame.weapon.description.cursedCoffin",
  frostChain: "minigame.weapon.description.frostChain",
  crimsonVial: "minigame.weapon.description.crimsonVial",
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
  knockback: "minigame.weapon.stat.knockback",
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
  knockback: "minigame.weapon.statDescription.knockback",
};
