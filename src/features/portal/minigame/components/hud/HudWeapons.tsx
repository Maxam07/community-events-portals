import React, { useContext } from "react";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";

import { Box } from "components/ui/Box";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import type { PortalMachineState } from "../../lib/Machine";
import { PIXEL_SCALE } from "features/game/lib/constants";
import {
  CATEGORY_CONFIGS,
  WEAPON_CATEGORIES,
  WEAPON_ICONS,
} from "../../constants";

const _weaponsState = (state: PortalMachineState) => ({
  hudWeapons: state.context.hudWeapons,
  weaponLevels: state.context.weaponLevels,
});

export const HudWeapons: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const { hudWeapons, weaponLevels } = useSelector(
    portalService,
    _weaponsState,
  );

  return (
    <div className="flex flex-col items-end">
      {hudWeapons.map((weapon) => {
        const level = weaponLevels[weapon];
        const isLocked = level === 0;

        const category = CATEGORY_CONFIGS[WEAPON_CATEGORIES[weapon]];

        return (
          <div
            key={weapon}
            className="flex flex-row items-center gap-0.5"
            title={t(category.name)}
          >
            <Box
              image={WEAPON_ICONS[weapon]}
              count={new Decimal(level)}
              countLabelType={category.labelType}
              locked={isLocked}
            />
          </div>
        );
      })}
    </div>
  );
};
