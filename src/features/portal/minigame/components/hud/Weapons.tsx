import React from "react";
import { useSelector } from "@xstate/react";

import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalContext } from "../../lib/PortalProvider";
import type { PortalMachineState } from "../../lib/Machine";
import {
  PORTAL_NAME,
  resolveWeaponStats,
  WEAPON_ICONS,
  WEAPON_NAMES,
  WEAPON_STAT_LABELS,
  getUnlockedWeapons,
  PERK_IDS,
  PERK_ICONS,
  PERK_NAMES,
  getPerkValue,
} from "../../constants";
import type { PerkId, PerkLevel, WeaponId } from "../../Types";
import { formatStatValue } from "./weaponStats";

const PANEL_CONTENT_HEIGHT = "h-[442px]";

const SUMMARY_WEAPON_STATS = ["damage", "cooldownMs"] as const;

// healing/maxHealth are flat amounts ("+1 HP/s", "+20 HP"); every other
// perk in PERK_CONFIGS is a percentage multiplier.
const FLAT_VALUE_PERKS = new Set<PerkId>(["healing", "maxHealth"]);

const formatPerkValue = (perkId: PerkId, level: PerkLevel) => {
  const value = getPerkValue(perkId, level);

  if (FLAT_VALUE_PERKS.has(perkId)) return `+${value}`;

  return `+${Math.round(value * 100)}%`;
};

const _loadoutState = (state: PortalMachineState) => ({
  weaponLevels: state.context.weaponLevels,
  perkLevels: state.context.perkLevels,
  activeWearables: state.context.activeWearables,
});

export const WeaponsTab: React.FC = () => {
  const { t } = useAppTranslation();
  const { portalService } = React.useContext(PortalContext);
  const { weaponLevels, perkLevels, activeWearables } = useSelector(
    portalService,
    _loadoutState,
  );

  const unlockedWeapons = getUnlockedWeapons(weaponLevels);
  const unlockedPerks = PERK_IDS.filter((perkId) => perkLevels[perkId] > 0);

  return (
    <div className={`flex flex-col gap-1 sm:gap-2 ${PANEL_CONTENT_HEIGHT}`}>
      <InnerPanel className="flex h-1/2 flex-col gap-1 overflow-y-auto p-2 scrollable">
        <Label type="default">{t(`${PORTAL_NAME}.weapons`)}</Label>
        {unlockedWeapons.length === 0 ? (
          <span className="ml-1 text-xs">
            {t(`${PORTAL_NAME}.noWeaponsChosen`)}
          </span>
        ) : (
          unlockedWeapons.map((weaponId: WeaponId) => {
            const level = weaponLevels[weaponId];
            const stats = resolveWeaponStats(
              weaponId,
              level,
              activeWearables,
              perkLevels,
            );

            return (
              <div key={weaponId} className="flex items-center gap-2 text-xs">
                <img
                  src={WEAPON_ICONS[weaponId]}
                  className="h-8 w-8 object-contain pixelated"
                />
                <div className="flex flex-1 flex-col">
                  <span className="leading-none">
                    {t(WEAPON_NAMES[weaponId])}
                  </span>
                  <span className="leading-none text-[#645d57]">
                    {t(`${PORTAL_NAME}.weaponLevel`, { level })}
                    {" \u00b7 "}
                    {SUMMARY_WEAPON_STATS.map((stat) =>
                      stats[stat] === undefined
                        ? null
                        : `${t(WEAPON_STAT_LABELS[stat])}: ${formatStatValue(
                            stat,
                            stats[stat] as number,
                          )}`,
                    )
                      .filter(Boolean)
                      .join(" \u00b7 ")}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </InnerPanel>

      <InnerPanel className="flex h-1/2 flex-col gap-1 overflow-y-auto p-2 scrollable">
        <Label type="default">{t(`${PORTAL_NAME}.perks`)}</Label>
        {unlockedPerks.length === 0 ? (
          <span className="ml-1 text-xs">
            {t(`${PORTAL_NAME}.noPerksChosen`)}
          </span>
        ) : (
          unlockedPerks.map((perkId) => {
            const level = perkLevels[perkId];

            return (
              <div key={perkId} className="flex items-center gap-2 text-xs">
                <img
                  src={PERK_ICONS[perkId]}
                  className="h-8 w-8 object-contain pixelated"
                />
                <div className="flex flex-1 flex-col">
                  <span className="leading-none">{t(PERK_NAMES[perkId])}</span>
                  <span className="leading-none text-[#645d57]">
                    {t(`${PORTAL_NAME}.weaponLevel`, { level })}
                    {" \u00b7 "}
                    {formatPerkValue(perkId, level)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </InnerPanel>
    </div>
  );
};
