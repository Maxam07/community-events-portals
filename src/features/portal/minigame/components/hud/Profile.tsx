import React, { useContext, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { useSelector } from "@xstate/react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { DynamicNFT } from "features/bumpkins/components/DynamicNFT";
import { BumpkinPartGroup } from "features/bumpkins/components/BumpkinPartGroup";
import {
  BUMPKIN_ITEM_PART,
  BumpkinItem,
  BumpkinPart,
} from "features/game/types/bumpkin";
import { availableWardrobe } from "features/game/events/landExpansion/equip";
import { GameState } from "features/game/types/game";
import { getKeys } from "lib/object";
import { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { PORTAL_NAME } from "../../constants";
import { PortalMachineState } from "../../lib/Machine";
import { PortalContext } from "../../lib/PortalProvider";
import { NPCIcon } from "features/island/bumpkin/components/NPC";
import { InnerPanel } from "components/ui/Panel";
import { StatCard } from "./StatCard";

import swordIcon from "public/world/portal/images/sword_icon.png";
import speedIcon from "public/world/portal/images/lightning.png";

export type WearableLoadoutSlot = "I" | "II" | "III";
export type WearableLoadouts = Record<WearableLoadoutSlot, BumpkinParts>;

const LOADOUT_SLOTS: WearableLoadoutSlot[] = ["I", "II", "III"];

const REQUIRED: BumpkinPart[] = ["background", "body", "hair", "shoes", "tool"];

const REQUIRED_BUT_INCOMPATIBLE: BumpkinPart[][] = [
  ["shirt", "pants"],
  ["dress"],
];

const NOT_REQUIRED: BumpkinPart[] = [
  "hat",
  "beard",
  "necklace",
  "coat",
  "wings",
  "suit",
  "onesie",
  "secondaryTool",
  "aura",
];

const LEFT_EQUIPMENT: BumpkinPart[] = [
  "background",
  "body",
  "hair",
  "shoes",
  "tool",
  "hat",
];

const RIGHT_EQUIPMENT: BumpkinPart[] = [
  "beard",
  "necklace",
  "coat",
  "wings",
  "suit",
  "onesie",
];

const BOTTOM_EQUIPMENT: BumpkinPart[] = ["secondaryTool", "aura"];

const _profileState = (state: PortalMachineState) => ({
  farmId: state.context.id,
  gameState: state.context.state,
  lives: state.context.lives,
  maxLives: state.context.maxLives,
});

const getStorageKey = (farmId: number) =>
  `portal:${PORTAL_NAME}:wearableLoadouts:${farmId}`;

const getDefaultLoadouts = (equipment: BumpkinParts): WearableLoadouts => ({
  I: { ...equipment },
  II: { ...equipment },
  III: { ...equipment },
});

const isValidEquipment = (value: unknown): value is BumpkinParts => {
  if (!value || typeof value !== "object") return false;

  const equipment = value as BumpkinParts;
  return REQUIRED.every((part) => !!equipment[part]);
};

const loadStoredLoadouts = ({
  farmId,
  fallback,
}: {
  farmId: number;
  fallback: BumpkinParts;
}): WearableLoadouts => {
  const defaults = getDefaultLoadouts(fallback);

  try {
    const raw = localStorage.getItem(getStorageKey(farmId));
    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<WearableLoadouts>;

    return LOADOUT_SLOTS.reduce((loadouts, slot) => {
      const stored = parsed[slot];

      return {
        ...loadouts,
        [slot]: isValidEquipment(stored) ? stored : defaults[slot],
      };
    }, defaults);
  } catch {
    return defaults;
  }
};

const saveStoredLoadouts = ({
  farmId,
  loadouts,
}: {
  farmId: number;
  loadouts: WearableLoadouts;
}) => {
  localStorage.setItem(getStorageKey(farmId), JSON.stringify(loadouts));
};

export const Profile: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);
  const { farmId, gameState, lives, maxLives } = useSelector(
    portalService,
    _profileState,
  );

  const [currentTab, setCurrentTab] = useState<WearableLoadoutSlot>("I");
  const [loadouts, setLoadouts] = useState<WearableLoadouts>();
  const [equipped, setEquipped] = useState<BumpkinParts>();
  const [baseEquipment, setBaseEquipment] = useState<BumpkinParts>();
  const [selectedBumpkinPart, setSelectedBumpkinPart] =
    useState<BumpkinPart>("background");

  const bumpkinEquipment = gameState?.bumpkin?.equipped as
    | BumpkinParts
    | undefined;

  useEffect(() => {
    if (!bumpkinEquipment) return;

    const storedLoadouts = loadStoredLoadouts({
      farmId,
      fallback: bumpkinEquipment,
    });

    setLoadouts(storedLoadouts);
    setEquipped(storedLoadouts[currentTab]);
    setBaseEquipment(storedLoadouts[currentTab]);
    portalService.send("SET_ACTIVE_WEARABLES", {
      wearables: storedLoadouts[currentTab],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, !!bumpkinEquipment]);

  useEffect(() => {
    if (!loadouts) return;

    const nextEquipment = loadouts[currentTab];
    setEquipped(nextEquipment);
    setBaseEquipment(nextEquipment);
    portalService.send("SET_ACTIVE_WEARABLES", { wearables: nextEquipment });
  }, [currentTab, loadouts, portalService]);

  const wardrobe = useMemo(() => {
    if (!gameState) return {};

    const available = availableWardrobe(gameState as GameState);

    return Object.values(equipped ?? {}).reduce(
      (acc, name) => ({
        ...acc,
        [name]: acc[name] ?? 0,
      }),
      available,
    );
  }, [equipped, gameState]);

  if (!gameState || !bumpkinEquipment || !loadouts || !equipped) {
    return null;
  }

  const equipPart = (name: BumpkinItem) => {
    const part = BUMPKIN_ITEM_PART[name];
    const outfit = {
      ...equipped,
      [part]: name,
    };

    if (part === "dress") {
      delete outfit.shirt;
      delete outfit.pants;
    }

    if (part === "shirt" || part === "pants") {
      delete outfit.dress;
    }

    setEquipped(outfit);
  };

  const unequipPart = (name: BumpkinItem) => {
    const part = BUMPKIN_ITEM_PART[name];

    if (REQUIRED.includes(part as BumpkinPart)) return;

    const outfit = { ...equipped };
    delete outfit[part];

    setEquipped(outfit);
  };

  const handleSave = () => {
    const nextLoadouts = {
      ...loadouts,
      [currentTab]: equipped,
    };

    setLoadouts(nextLoadouts);
    setBaseEquipment(equipped);
    saveStoredLoadouts({ farmId, loadouts: nextLoadouts });
    portalService.send("SET_ACTIVE_WEARABLES", { wearables: equipped });
  };

  const isDirty = JSON.stringify(equipped) !== JSON.stringify(baseEquipment);
  const equippedItems = Object.values(equipped);
  const selectedBumpkinItem = equipped[selectedBumpkinPart];

  const sortedWardrobeNames = getKeys(wardrobe).sort((a, b) =>
    a.localeCompare(b),
  );

  const filteredWardrobeNames = sortedWardrobeNames.filter(
    (name) => BUMPKIN_ITEM_PART[name] === selectedBumpkinPart,
  );

  const incompatibleWearables = (
    <InnerPanel className="flex mt-2 gap-2 w-full">
      <StatCard
        title={t(`${PORTAL_NAME}.lives`)}
        label={{ value: `${lives}/${maxLives}`, type: "danger" }}
        img={{ src: SUNNYSIDE.icons.heart }}
        progress={{ percentage: 100, type: "error" }}
        className="w-full"
      />
      <StatCard
        title={t(`${PORTAL_NAME}.speed`)}
        label={{ value: 40, type: "warning" }}
        img={{ src: speedIcon, width: 14 }}
        progress={{ percentage: 0.5, type: "error" }}
        className="w-full"
      />
      <StatCard
        title={t(`${PORTAL_NAME}.damage`)}
        label={{ value: 0, type: "info" }}
        img={{ src: swordIcon }}
        progress={{ percentage: 0.5, type: "error" }}
        className="w-full"
      />
    </InnerPanel>
  );

  return (
    <CloseButtonPanel
      tabs={LOADOUT_SLOTS.map((slot) => ({
        id: slot,
        icon: SUNNYSIDE.icons.player,
        name: slot,
      }))}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      innerPanelFooter={incompatibleWearables}
    >
      <div className="p-2">
        <div className="flex items-start gap-2">
          <BumpkinPartGroup
            bumpkinParts={LEFT_EQUIPMENT}
            equipped={equipped}
            selected={selectedBumpkinPart}
            onSelect={setSelectedBumpkinPart}
            gridStyling="grid grid-cols-2 gap-2 max-w-[110px] h-fit"
          />
          <div className="flex h-[165px] w-[165px] shrink-0">
            <div className="relative h-full w-full overflow-hidden">
              <InnerPanel style={{ padding: "0px" }}>
                <DynamicNFT
                  showBackground
                  bumpkinParts={equipped}
                  key={JSON.stringify(equipped)}
                />
              </InnerPanel>
              <div className="absolute w-8 h-8 bottom-4 right-4">
                <NPCIcon parts={equipped} key={JSON.stringify(equipped)} />
              </div>
            </div>
          </div>
          <BumpkinPartGroup
            bumpkinParts={RIGHT_EQUIPMENT}
            equipped={equipped}
            selected={selectedBumpkinPart}
            onSelect={setSelectedBumpkinPart}
            gridStyling="grid grid-cols-2 gap-2 max-w-[110px] h-fit"
          />
        </div>
        <div className="flex w-full mt-2 gap-2">
          <BumpkinPartGroup
            bumpkinParts={BOTTOM_EQUIPMENT}
            equipped={equipped}
            selected={selectedBumpkinPart}
            onSelect={setSelectedBumpkinPart}
            gridStyling="grid grid-cols-2 gap-2 max-w-[110px]"
          />
          <div className="flex justify-end divide-x-2 divide-white ml-auto">
            {REQUIRED_BUT_INCOMPATIBLE.map((parts, index) => (
              <div
                key={parts.join(",")}
                className={classNames({
                  "pr-1": index === 0,
                  "pl-1": index > 0,
                })}
              >
                <BumpkinPartGroup
                  bumpkinParts={parts}
                  equipped={equipped}
                  selected={selectedBumpkinPart}
                  onSelect={setSelectedBumpkinPart}
                  gridStyling={`grid ${index === 0 ? "grid-cols-2" : "grid-cols-1"} gap-2`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CloseButtonPanel>
  );
};
