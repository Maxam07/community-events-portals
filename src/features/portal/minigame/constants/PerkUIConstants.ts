import type { TranslationKeys } from "lib/i18n/dictionaries/types";
import type { PerkId } from "../Types";
import { SUNNYSIDE } from "assets/sunnyside";

import swordIcon from "public/world/portal/images/sword_icon.png";
import speedIcon from "public/world/portal/images/lightning.png";

// Placeholder icon reuse until dedicated Halloween-themed perk art lands
// Swap these out per perk once assets exist.
export const PERK_ICONS: Record<PerkId, string> = {
  moveSpeed: speedIcon,
  attackSpeed: SUNNYSIDE.icons.lightning,
  criticalChance: swordIcon,
  projectileSpeed: SUNNYSIDE.icons.arrow_right,
  xpGain: SUNNYSIDE.icons.xpIcon,
  luck: SUNNYSIDE.icons.happy,
  pickupRadius: SUNNYSIDE.icons.search,
  cooldownReduction: SUNNYSIDE.icons.stopwatch,
  healing: SUNNYSIDE.icons.upgrade_disc,
  maxHealth: SUNNYSIDE.icons.heart,
};

export const PERK_NAMES: Record<PerkId, TranslationKeys> = {
  moveSpeed: "minigame.perk.moveSpeed",
  attackSpeed: "minigame.perk.attackSpeed",
  criticalChance: "minigame.perk.criticalChance",
  projectileSpeed: "minigame.perk.projectileSpeed",
  xpGain: "minigame.perk.xpGain",
  luck: "minigame.perk.luck",
  pickupRadius: "minigame.perk.pickupRadius",
  cooldownReduction: "minigame.perk.cooldownReduction",
  healing: "minigame.perk.healing",
  maxHealth: "minigame.perk.maxHealth",
};

export const PERK_DESCRIPTIONS: Record<PerkId, TranslationKeys> = {
  moveSpeed: "minigame.perk.description.moveSpeed",
  attackSpeed: "minigame.perk.description.attackSpeed",
  criticalChance: "minigame.perk.description.criticalChance",
  projectileSpeed: "minigame.perk.description.projectileSpeed",
  xpGain: "minigame.perk.description.xpGain",
  luck: "minigame.perk.description.luck",
  pickupRadius: "minigame.perk.description.pickupRadius",
  cooldownReduction: "minigame.perk.description.cooldownReduction",
  healing: "minigame.perk.description.healing",
  maxHealth: "minigame.perk.description.maxHealth",
};
