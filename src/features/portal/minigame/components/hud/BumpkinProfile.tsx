import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "@xstate/react";
import { SpringValue } from "@react-spring/web";

import { SUNNYSIDE } from "assets/sunnyside";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import Spritesheet, {
  SpriteSheetInstance,
} from "components/animation/SpriteAnimator";
import { DynamicNFT } from "features/bumpkins/components/DynamicNFT";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { Profile } from "./Profile";
import { WeaponsPanel } from "./Weapons";

const DIMENSIONS = {
  original: 80,
  scaled: 160,
  bumpkinContainer: {
    width: 130,
    height: 125,
    radiusBottomLeft: 85,
    radiusBottomRight: 45,
  },
  bumpkin: {
    width: 200,
    marginLeft: -10,
  },
  level: {
    width: 24,
    height: 12,
    marginLeft: 109,
    marginTop: 82.5,
  },
};

const SPRITE_STEPS = 51;

const _profileState = (state: PortalMachineState) => ({
  bumpkin: state.context.state?.bumpkin,
  activeWearables: state.context.activeWearables,
  lives: state.context.lives,
  maxLives: state.context.maxLives,
});

const BumpkinAvatar: React.FC<{
  bumpkinParts?: BumpkinParts;
  healthPercent: number;
  lives: number;
  maxLives: number;
  onClick: () => void;
}> = ({ bumpkinParts, healthPercent, lives, maxLives, onClick }) => {
  const progressBarEl = useRef<SpriteSheetInstance>(undefined);

  const goToProgress = () => {
    if (progressBarEl.current) {
      const percent = Math.max(0, Math.min(healthPercent, 100)) / 100;
      const scaledToProgress = percent * (SPRITE_STEPS - 1);
      progressBarEl.current.goToAndPause(Math.floor(scaledToProgress));
    }
  };

  useEffect(() => {
    goToProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthPercent]);

  if (!bumpkinParts) return null;

  return (
    <div
      className="grid absolute z-40 top-0 cursor-pointer hover:img-highlight"
      onClick={onClick}
    >
      <img
        src={SUNNYSIDE.ui.whiteBg}
        className="col-start-1 row-start-1 opacity-40"
        style={{
          width: `${DIMENSIONS.scaled}px`,
          height: `${DIMENSIONS.scaled}px`,
        }}
      />
      <div
        className="col-start-1 row-start-1 overflow-hidden z-0"
        style={{
          width: `${DIMENSIONS.bumpkinContainer.width}px`,
          height: `${DIMENSIONS.bumpkinContainer.height}px`,
          borderBottomLeftRadius: `${DIMENSIONS.bumpkinContainer.radiusBottomLeft}px`,
          borderBottomRightRadius: `${DIMENSIONS.bumpkinContainer.radiusBottomRight}px`,
        }}
      >
        <div
          style={{
            width: `${DIMENSIONS.bumpkin.width}px`,
            marginLeft: `${DIMENSIONS.bumpkin.marginLeft}px`,
          }}
        >
          <DynamicNFT
            key={JSON.stringify(bumpkinParts)}
            bumpkinParts={bumpkinParts}
            showTools={false}
          />
        </div>
      </div>
      <Spritesheet
        className="col-start-1 row-start-1 z-10"
        style={{
          width: `${DIMENSIONS.scaled}px`,
          imageRendering: "pixelated",
          filter: "hue-rotate(-20deg)",
        }}
        image={SUNNYSIDE.ui.progressBarSprite}
        widthFrame={DIMENSIONS.original}
        heightFrame={DIMENSIONS.original}
        zoomScale={new SpringValue(0.7)}
        fps={10}
        steps={SPRITE_STEPS}
        autoplay={false}
        getInstance={(spritesheet) => {
          progressBarEl.current = spritesheet;
          goToProgress();
        }}
      />
      <div
        id="progress-bar"
        className="col-start-1 row-start-1 flex justify-center z-20 text-xs"
        style={{
          width: `${DIMENSIONS.level.width}px`,
          height: `${DIMENSIONS.level.height}px`,
          marginLeft: `${DIMENSIONS.level.marginLeft}px`,
          marginTop: `${DIMENSIONS.level.marginTop}px`,
        }}
      >
        {`${lives}/${maxLives}`}
      </div>
    </div>
  );
};

export const BumpkinProfile: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [showModal, setShowModal] = useState(false);

  const { bumpkin, activeWearables, lives, maxLives } = useSelector(
    portalService,
    _profileState,
  );

  const healthPercent = maxLives > 0 ? (lives / maxLives) * 100 : 0;
  const bumpkinParts = activeWearables ?? bumpkin?.equipped;

  return (
    <>
      <div
        className="relative"
        style={{
          width: "100px",
          height: "95px",
        }}
      >
        <div className="scale-[0.7] absolute left-0 top-0 width-100">
          <BumpkinAvatar
            bumpkinParts={bumpkinParts}
            healthPercent={healthPercent}
            lives={lives}
            maxLives={maxLives}
            onClick={() => setShowModal(true)}
          />
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <div className="flex max-h-[90vh]">
          <Profile onClose={() => setShowModal(false)} />
          <Panel className="h-full min-h-[520px] p-2">
            <WeaponsPanel />
          </Panel>
        </div>
      </Modal>
    </>
  );
};
