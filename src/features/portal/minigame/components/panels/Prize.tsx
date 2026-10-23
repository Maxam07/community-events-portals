import React, { useContext, useState, useEffect } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { OuterPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import type { PortalMachineState } from "../../lib/Machine";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { secondsToString } from "lib/utils/time";
import { PORTAL_NAME, PORTAL_TOKEN } from "../../constants";
import { ITEM_DETAILS } from "features/game/types/images";
import type { InventoryItemName } from "features/game/types/game";

const _prize = (state: PortalMachineState) => {
  return state.context.state?.minigames.prizes[PORTAL_NAME];
};

export const Prize: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const [secondsLeft, setSecondsLeft] = useState(0);

  const prize = useSelector(
    portalService,
    _prize,
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
  );

  useEffect(() => {
    if (!prize) return;

    const updateSeconds = () => {
      setSecondsLeft((prize.endAt - Date.now()) / 1000);
    };

    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);

    return () => clearInterval(interval);
  }, [prize]);

  if (!prize) {
    return (
      <OuterPanel>
        <div className="px-1">
          <Label type="danger" icon={SUNNYSIDE.icons.sad}>
            {t("minigame.noPrizesAvailable")}
          </Label>
        </div>
      </OuterPanel>
    );
  }

  return (
    <OuterPanel>
      <div className="px-1">
        <span className="text-xs mb-2">
          {t("minigame.portal.missionObjectives", {
            targetScore: prize.score,
          })}
        </span>
        <div className="flex justify-between mt-2 gap-1">
          <Label className="h-fit" type="info" icon={SUNNYSIDE.icons.stopwatch}>
            {secondsToString(secondsLeft, { length: "medium" })}
          </Label>
          <div className="flex flex-wrap items-center gap-1 w-60">
            {prize.tiers?.length
              ? prize.tiers.flatMap((tier) =>
                  Object.entries(tier.items).map(([itemName, amount]) => (
                    <Label
                      key={`${tier.score}-${itemName}`}
                      icon={ITEM_DETAILS[itemName as InventoryItemName]?.image}
                      type="warning"
                    >
                      {t("minigame.prizeTier", {
                        score: tier.score,
                        amount,
                        itemName,
                      })}
                    </Label>
                  )),
                )
              : !!prize.items[PORTAL_TOKEN as keyof typeof prize.items] && (
                  <Label icon={ITEM_DETAILS[PORTAL_TOKEN].image} type="warning">
                    {t("minigame.eventToken", {
                      token:
                        prize.items[PORTAL_TOKEN as keyof typeof prize.items] ??
                        0,
                      tokenName: PORTAL_TOKEN,
                    })}
                  </Label>
                )}
          </div>
        </div>
      </div>
    </OuterPanel>
  );
};
