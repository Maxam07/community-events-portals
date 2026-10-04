import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "@xstate/react";
import classNames from "classnames";

import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { Label } from "components/ui/Label";
import { useSound } from "lib/utils/hooks/useSound";
import { isTouchDevice } from "features/world/lib/device";
import { PortalContext } from "../../lib/PortalProvider";
import type { PortalMachineState } from "../../lib/Machine";
import {
  CATEGORY_CONFIGS,
  getCategoryCounts,
  getSpecialPowerLabel,
  resolveSpecialPower,
  SPECIAL_POWER_CONFIG,
  WEAPON_CATEGORY_IDS,
} from "../../constants";
import type { SpecialPower } from "../../Types";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import type { TranslationKeys } from "lib/i18n/dictionaries/types";

const BUTTON_WIDTH = PIXEL_SCALE * 22;
const BUTTON_HEIGHT = PIXEL_SCALE * 23;
const ORB_SIZE = PIXEL_SCALE * 14;

const _specialPowerState = (state: PortalMachineState) => ({
  weaponLevels: state.context.weaponLevels,
  cooldownUntil: state.context.specialPowerCooldownUntil,
  isPaused: state.context.isGameplayPaused,
  isJoystickActive: state.context.isJoystickActive,
});

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
};

// Placeholder orb until the Special Power art lands: one color per
// category, split in half for hybrid (2 + 2) powers.
const getOrbBackground = (power: SpecialPower) => {
  if (power.categories.length === 0) return "#6b6b6b";

  const [first, second] = power.categories.map(
    (category) => CATEGORY_CONFIGS[category].color,
  );

  return second
    ? `linear-gradient(90deg, ${first} 0 50%, ${second} 50% 100%)`
    : first;
};

const getCategoryCountsLabel = (
  weaponLevels: PortalMachineState["context"]["weaponLevels"],
  t: (key: TranslationKeys) => string,
) => {
  const counts = getCategoryCounts(weaponLevels);

  return WEAPON_CATEGORY_IDS.map((category) => {
    const { name, effectName } = CATEGORY_CONFIGS[category];

    return `${t(name)} (${t(effectName)}): ${counts[category]}`;
  }).join("\n");
};

const UI_REFRESH_MS = 100;

export const SpecialPowerButton: React.FC = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(
      () => setNow(Date.now()),
      UI_REFRESH_MS,
    );

    return () => window.clearInterval(interval);
  }, []);

  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const { weaponLevels, cooldownUntil, isPaused, isJoystickActive } =
    useSelector(portalService, _specialPowerState);
  const button = useSound("button");

  const power = useMemo(
    () => resolveSpecialPower(weaponLevels),
    [weaponLevels],
  );
  const hasPower = power.kind !== "none";

  // The cooldown starts right on activation, so the button never shows the
  // active power window: it goes straight to the cooldown countdown.
  const cooldownLeftMs = Math.max(cooldownUntil - now, 0);
  const isCoolingDown = cooldownLeftMs > 0;
  const isReady = hasPower && !isCoolingDown && !isPaused;

  const activate = () => {
    if (!isReady) return;

    button.play();
    portalService.send("ACTIVATE_SPECIAL_POWER");
  };

  useEffect(() => {
    if (isTouchDevice()) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== SPECIAL_POWER_CONFIG.hotkey ||
        event.repeat ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      portalService.send("ACTIVATE_SPECIAL_POWER");
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [portalService]);

  const cooldownProgress = isCoolingDown
    ? cooldownLeftMs / SPECIAL_POWER_CONFIG.cooldownMs
    : 0;
  const cooldownLabel = isCoolingDown
    ? `${Math.ceil(cooldownLeftMs / 1000)}s`
    : undefined;

  return (
    <div
      className="fixed z-50 flex flex-col items-center"
      style={{
        right: `${PIXEL_SCALE * 3}px`,
        bottom: `${PIXEL_SCALE * 3 + BUTTON_HEIGHT + PIXEL_SCALE * 4}px`,
      }}
      title={
        hasPower
          ? getSpecialPowerLabel(power, t)
          : `${getSpecialPowerLabel(power, t)}\n${getCategoryCountsLabel(weaponLevels, t)}`
      }
    >
      <div
        onClick={activate}
        className={classNames("relative", {
          "cursor-pointer": isReady,
          "hover:img-highlight":
            isReady && !isJoystickActive && !isTouchDevice(),
          "opacity-50 grayscale": !hasPower,
        })}
        style={{ width: `${BUTTON_WIDTH}px`, height: `${BUTTON_HEIGHT}px` }}
      >
        {/* Dimmed while cooling down; the countdown stays fully opaque */}
        <img
          src={SUNNYSIDE.ui.round_button}
          className={classNames("absolute", { "opacity-40": isCoolingDown })}
          style={{ width: `${BUTTON_WIDTH}px` }}
        />
        <div
          className={classNames("absolute overflow-hidden rounded-full", {
            "opacity-40": isCoolingDown,
          })}
          style={{
            width: `${ORB_SIZE}px`,
            height: `${ORB_SIZE}px`,
            top: `${PIXEL_SCALE * 4}px`,
            left: `${PIXEL_SCALE * 4}px`,
            background: getOrbBackground(power),
            border: `${PIXEL_SCALE}px solid rgba(255, 255, 255, 0.35)`,
          }}
        >
          {isCoolingDown && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-black/60"
              style={{ height: `${cooldownProgress * 100}%` }}
            />
          )}
        </div>
        {cooldownLabel && (
          <span
            className="absolute inset-0 flex items-center justify-center text-sm text-white"
            style={{
              paddingBottom: `${PIXEL_SCALE}px`,
              textShadow:
                "1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000",
            }}
          >
            {cooldownLabel}
          </span>
        )}
      </div>
      {hasPower && !isTouchDevice() && (
        <Label type={isReady ? "vibrant" : "default"} className="-mt-1">
          {SPECIAL_POWER_CONFIG.hotkey.toUpperCase()}
        </Label>
      )}
    </div>
  );
};
