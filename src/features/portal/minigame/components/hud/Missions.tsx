import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { SUNNYSIDE } from "assets/sunnyside";
import { Label } from "components/ui/Label";
import { ITEM_DETAILS } from "features/game/types/images";
import type { PortalMachineState } from "../../lib/Machine";
import { PortalContext } from "../../lib/PortalProvider";
import { PORTAL_NAME, PORTAL_TOKEN } from "../../constants";

const _tiers = (state: PortalMachineState) =>
  state.context.state?.minigames.prizes[PORTAL_NAME]?.tiers;
const _collected = (state: PortalMachineState) => state.context.collected;
const _pendingRevive = (state: PortalMachineState) =>
  state.context.pendingRevive;

export const Missions: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const tiers = useSelector(
    portalService,
    _tiers,
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
  );
  const collected = useSelector(portalService, _collected);
  const pendingRevive = useSelector(portalService, _pendingRevive);

  if (!tiers?.length || pendingRevive) return null;

  return (
    <div className="flex flex-col items-start gap-1 mt-3">
      {tiers.map((tier) => {
        const reached = collected >= tier.score;

        return (
          <Label
            key={tier.score}
            icon={
              reached
                ? SUNNYSIDE.icons.confirm
                : ITEM_DETAILS[PORTAL_TOKEN].image
            }
            type={reached ? "success" : "default"}
          >
            {`${tier.score}+`}
          </Label>
        );
      })}
    </div>
  );
};
