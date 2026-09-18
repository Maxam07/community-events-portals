import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { DynamicNFT } from "features/bumpkins/components/DynamicNFT";
import { BumpkinPartGroup } from "features/bumpkins/components/BumpkinPartGroup";
import type { BumpkinItem, BumpkinPart } from "features/game/types/bumpkin";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { BETA_TESTERS, INITIAL_DATE, PORTAL_NAME } from "../../constants";
import { NPCIcon } from "features/island/bumpkin/components/NPC";
import { InnerPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";

import { Label } from "components/ui/Label";
import { WEARABLE_BUFFS } from "../../constants";
import { LOADOUT_SLOTS, type WearableLoadoutSlot } from "./loadoutStorage";
export {
  getStorageKey,
  loadStoredLoadouts,
  LOADOUT_SLOTS,
  resolveStoredLoadouts,
  saveStoredLoadouts,
} from "./loadoutStorage";
export type {
  LoadedWearableLoadouts,
  StoredWearableLoadouts,
  WearableLoadouts,
  WearableLoadoutSlot,
} from "./loadoutStorage";

const isMinigameBuffWearable = (wearable: BumpkinItem) =>
  !!WEARABLE_BUFFS[wearable];

// const REQUIRED_BUT_INCOMPATIBLE: BumpkinPart[][] = [
//   ["shirt", "pants"],
//   ["dress"],
// ];

const LEFT_EQUIPMENT: BumpkinPart[] = [
  "background",
  "body",
  "hair",
  "shoes",
  "tool",
  "hat",
  "secondaryTool",
  "aura",
];

const RIGHT_EQUIPMENT: BumpkinPart[] = [
  // "beard",
  "necklace",
  "coat",
  "wings",
  "suit",
  "onesie",
  "shirt",
  "pants",
];

// const BOTTOM_EQUIPMENT: BumpkinPart[] = ["secondaryTool", "aura"];

const isStartDateReached = () =>
  new Date().toISOString().slice(0, 10) >= INITIAL_DATE;

const canFarmStart = (farmId: number) =>
  isStartDateReached() || BETA_TESTERS.includes(farmId);

export const Profile: React.FC<{
  onClose?: () => void;
  currentTab: WearableLoadoutSlot;
  setCurrentTab: React.Dispatch<React.SetStateAction<WearableLoadoutSlot>>;
  username?: string;
  equipped: BumpkinParts;
  selectedBumpkinPart: BumpkinPart;
  onSelectBumpkinPart: (part: BumpkinPart) => void;
  lives: number;
  maxLives: number;
  farmId: number;
  onStart?: () => void;
  onStartTraining?: () => void;
  onBack?: () => void;
}> = ({
  onClose,
  currentTab,
  setCurrentTab,
  username,
  equipped,
  selectedBumpkinPart,
  onSelectBumpkinPart,
  farmId,
  onStart,
  onStartTraining,
  onBack,
}) => {
  const { t } = useAppTranslation();
  const canStart = canFarmStart(farmId);

  const footer = onStart && onStartTraining && onBack && (
    <InnerPanel className="flex flex-col mt-2 gap-1 w-full">
      <div className="flex gap-1">
        <Button
          className="whitespace-nowrap capitalize"
          onClick={onStartTraining}
        >
          {t(`${PORTAL_NAME}.start.training`)}
        </Button>
        <Button
          className="whitespace-nowrap capitalize"
          disabled={!canStart}
          onClick={onStart}
        >
          {t("start")}
        </Button>
      </div>
      <Button className="whitespace-nowrap capitalize" onClick={onBack}>
        <div className="flex items-center justify-center gap-1">
          <img src={SUNNYSIDE.icons.arrow_left} className="h-5" />
          {t("back")}
        </div>
      </Button>
    </InnerPanel>
  );

  return (
    <div className="sm:min-w-[429px]">
      <CloseButtonPanel
        tabs={LOADOUT_SLOTS.map((slot) => ({
          id: slot,
          icon: SUNNYSIDE.icons.player,
          name: slot,
        }))}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        innerPanelFooter={footer}
        onClose={onClose}
      >
        <div className="p-1">
          <div className="flex items-center gap-2">
            <BumpkinPartGroup
              bumpkinParts={LEFT_EQUIPMENT}
              equipped={equipped}
              selected={selectedBumpkinPart}
              onSelect={onSelectBumpkinPart}
              isBuffWearable={isMinigameBuffWearable}
              gridStyling="grid grid-cols-2 gap-1 sm:gap-1 max-w-[110px] h-fit"
            />
            <div className="flex flex-col items-center gap-1">
              <div className="relative h-[125px] w-[125px] overflow-hidden sm:h-[165px] sm:w-[165px]">
                <InnerPanel style={{ padding: "0px" }}>
                  <DynamicNFT
                    showBackground
                    bumpkinParts={equipped}
                    key={JSON.stringify(equipped)}
                  />
                </InnerPanel>
                <div className="absolute bottom-4 right-4 h-8 w-8">
                  <NPCIcon parts={equipped} key={JSON.stringify(equipped)} />
                </div>
                {username && (
                  <div className="absolute left-2 top-2">
                    <Label>
                      <span
                        className="block max-w-[96px] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-[136px]"
                        title={username}
                      >
                        {username}
                      </span>
                    </Label>
                  </div>
                )}
              </div>
            </div>
            <BumpkinPartGroup
              bumpkinParts={RIGHT_EQUIPMENT}
              equipped={equipped}
              selected={selectedBumpkinPart}
              onSelect={onSelectBumpkinPart}
              isBuffWearable={isMinigameBuffWearable}
              gridStyling="grid grid-cols-2 gap-1 max-w-[110px] h-fit"
            />
          </div>
        </div>
      </CloseButtonPanel>
    </div>
  );
};
