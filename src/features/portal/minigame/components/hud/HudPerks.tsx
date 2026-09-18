import React, { useContext } from "react";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";

import { Box } from "components/ui/Box";
import { PortalContext } from "../../lib/PortalProvider";
import type { PortalMachineState } from "../../lib/Machine";
import { PERK_ICONS, PERK_IDS } from "../../constants";

const _perkLevels = (state: PortalMachineState) => state.context.perkLevels;

export const HudPerks: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const perkLevels = useSelector(portalService, _perkLevels);

  const unlockedPerks = PERK_IDS.filter((perkId) => perkLevels[perkId] > 0);

  if (unlockedPerks.length === 0) return null;

  return (
    <div className="flex flex-col items-end">
      {unlockedPerks.map((perkId) => (
        <Box
          key={perkId}
          image={PERK_ICONS[perkId]}
          count={new Decimal(perkLevels[perkId])}
          countLabelType="success"
        />
      ))}
    </div>
  );
};
