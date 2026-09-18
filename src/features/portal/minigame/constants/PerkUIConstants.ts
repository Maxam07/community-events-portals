import type { TranslationKeys } from "lib/i18n/dictionaries/types";
import type { PerkId } from "../Types";
import { PORTAL_NAME } from "./PortalConstants";
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
  moveSpeed: `${PORTAL_NAME}.perk.moveSpeed`,
  attackSpeed: `${PORTAL_NAME}.perk.attackSpeed`,
  criticalChance: `${PORTAL_NAME}.perk.criticalChance`,
  projectileSpeed: `${PORTAL_NAME}.perk.projectileSpeed`,
  xpGain: `${PORTAL_NAME}.perk.xpGain`,
  luck: `${PORTAL_NAME}.perk.luck`,
  pickupRadius: `${PORTAL_NAME}.perk.pickupRadius`,
  cooldownReduction: `${PORTAL_NAME}.perk.cooldownReduction`,
  healing: `${PORTAL_NAME}.perk.healing`,
  maxHealth: `${PORTAL_NAME}.perk.maxHealth`,
};

export const PERK_DESCRIPTIONS: Record<PerkId, TranslationKeys> = {
  moveSpeed: `${PORTAL_NAME}.perk.description.moveSpeed`,
  attackSpeed: `${PORTAL_NAME}.perk.description.attackSpeed`,
  criticalChance: `${PORTAL_NAME}.perk.description.criticalChance`,
  projectileSpeed: `${PORTAL_NAME}.perk.description.projectileSpeed`,
  xpGain: `${PORTAL_NAME}.perk.description.xpGain`,
  luck: `${PORTAL_NAME}.perk.description.luck`,
  pickupRadius: `${PORTAL_NAME}.perk.description.pickupRadius`,
  cooldownReduction: `${PORTAL_NAME}.perk.description.cooldownReduction`,
  healing: `${PORTAL_NAME}.perk.description.healing`,
  maxHealth: `${PORTAL_NAME}.perk.description.maxHealth`,
};
