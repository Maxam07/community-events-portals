import React, { useContext } from "react";
import { Box } from "components/ui/Box";
import type { PortalMachineState } from "../../lib/Machine";
import item from "public/world/portal/images/ExpOrb_combined.webp";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";
import retryIcon from "public/world/portal/halloween/retry.png";
import { REVIVE_MAX_PER_RUN } from "../../constants";

const _item = (state: PortalMachineState) => state.context.collected;
const _revivesUsed = (state: PortalMachineState) => state.context.revivesUsed;
const _isTraining = (state: PortalMachineState) => state.context.isTraining;

export const ColletedItems: React.FC = () => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);

  const itemCount = useSelector(portalService, _item);
  const revivesUsed = useSelector(portalService, _revivesUsed);
  const isTraining = useSelector(portalService, _isTraining);
  return (
    <>
      <Label type="default">{t("minigame.scoreTitle")}</Label>
      <div className="relative flex-shrink-0 mt-3">
        <Box image={item} count={new Decimal(itemCount)} />
        {!isTraining && revivesUsed > 0 && (
          <Label
            type={revivesUsed >= REVIVE_MAX_PER_RUN ? "warning" : "default"}
            icon={retryIcon}
            className="absolute -bottom-2 left-6"
          >
            {revivesUsed}
          </Label>
        )}
      </div>
    </>
  );
};
