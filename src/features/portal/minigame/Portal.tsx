import React, { useContext, useEffect, useState } from "react";

import { useSelector } from "@xstate/react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";

import { PortalContext } from "./lib/PortalProvider";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import type { PortalMachineState } from "./lib/Machine";
import { Loading } from "features/auth/components";
import { CONFIG } from "lib/config";
import { authorisePortal, claimPrize } from "../lib/portalUtil";
import { RulesPanel } from "./components/panels/RulesPanel";
import { NoAttemptsPanel } from "./components/panels/NoAttemptsPanel";
import { Hud } from "./components/hud/Hud";
import { Phaser } from "./Phaser";
import { BumpkinProfile } from "./components/hud/BumpkinProfile";
import { StatCard } from "./components/hud/StatCard";
import { PORTAL_NAME, WEAPON_ICONS, WEAPON_NAMES } from "./constants";
import { PERK_ICONS, PERK_NAMES } from "./constants/PerkUIConstants";
import type { LevelUpOption } from "./Types";

const _sflBalance = (state: PortalMachineState) => state.context.state?.balance;
const _isError = (state: PortalMachineState) => state.matches("error");
const _isUnauthorised = (state: PortalMachineState) =>
  state.matches("unauthorised");
const _isLoading = (state: PortalMachineState) => state.matches("loading");
const _isNoAttempts = (state: PortalMachineState) =>
  state.matches("noAttempts");
const _isIntroduction = (state: PortalMachineState) =>
  state.matches("introduction");
const _isLoser = (state: PortalMachineState) => state.matches("loser");
const _isWinner = (state: PortalMachineState) => state.matches("winner");
const _isComplete = (state: PortalMachineState) => state.matches("complete");
const _isTraining = (state: PortalMachineState) => state.context.isTraining;
const _pendingLevelUpChoice = (state: PortalMachineState) =>
  state.context.pendingLevelUpChoice;

/**
 * A Portal Example which demonstrates basic state management
 */
export const Portal: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const [showPreGameProfile, setShowPreGameProfile] = useState(false);

  const sflBalance = useSelector(portalService, _sflBalance);
  const isError = useSelector(portalService, _isError);
  const isUnauthorised = useSelector(portalService, _isUnauthorised);
  const isLoading = useSelector(portalService, _isLoading);
  const isNoAttempts = useSelector(portalService, _isNoAttempts);
  const isIntroduction = useSelector(portalService, _isIntroduction);
  const isWinner = useSelector(portalService, _isWinner);
  const isLoser = useSelector(portalService, _isLoser);
  const isComplete = useSelector(portalService, _isComplete);
  const isTraining = useSelector(portalService, _isTraining);
  const pendingLevelUpChoice = useSelector(
    portalService,
    _pendingLevelUpChoice,
  );

  useEffect(() => {
    // If a player tries to quit while playing, mark it as an attempt
    const handleBeforeUnload = () => {
      portalService.send("GAME_OVER");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const startGame = () => {
    setShowPreGameProfile(false);
    portalService.send("CONTINUE");
  };

  const startTraining = () => {
    setShowPreGameProfile(false);
    portalService.send("CONTINUE_TRAINING");
  };

  if (isError) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("error.wentWrong")}</span>
          </div>
          <Button onClick={() => portalService.send("RETRY")}>
            {t("retry")}
          </Button>
        </Panel>
      </Modal>
    );
  }

  if (isUnauthorised) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("session.expired")}</span>
          </div>
          <Button onClick={authorisePortal}>{t("welcome.login")}</Button>
        </Panel>
      </Modal>
    );
  }

  if (isLoading) {
    return (
      <Modal show>
        <Panel>
          <Loading />
          <span className="text-xs">
            {`${t("last.updated")}:${CONFIG.CLIENT_VERSION}`}
          </span>
        </Panel>
      </Modal>
    );
  }

  return (
    <div>
      {isNoAttempts && (
        <Modal show>
          <NoAttemptsPanel />
        </Modal>
      )}

      {isIntroduction && !showPreGameProfile && (
        <Modal show>
          <RulesPanel
            mode={"introduction"}
            showScore={isTraining}
            showOnlyScore={isTraining}
            showExitButton={true}
            confirmButtonText={t("continue")}
            onConfirm={() => setShowPreGameProfile(true)}
          />
        </Modal>
      )}

      {isIntroduction && (
        <BumpkinProfile
          mode="preGame"
          showAvatar={false}
          showModal={showPreGameProfile}
          onModalHide={() => setShowPreGameProfile(false)}
          onBack={() => setShowPreGameProfile(false)}
          onStart={startGame}
          onStartTraining={startTraining}
        />
      )}

      {isLoser && (
        <Modal show>
          <RulesPanel
            mode={"failed"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={""}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {isWinner && (
        <Modal show>
          <RulesPanel
            mode={"success"}
            showScore={true}
            showExitButton={false}
            confirmButtonText={t("claim")}
            onConfirm={claimPrize}
          />
        </Modal>
      )}

      {isComplete && (
        <Modal show>
          <RulesPanel
            mode={"introduction"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={""}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      <Modal
        show={!!pendingLevelUpChoice}
        backdrop="static"
        dialogClassName="max-w-[620px]"
      >
        <div className="flex items-center justify-center gap-3 p-2">
          {pendingLevelUpChoice?.options.map((option: LevelUpOption) => {
            const card = (() => {
              switch (option.kind) {
                case "newWeapon":
                  return {
                    key: `newWeapon-${option.weaponId}`,
                    title: t(WEAPON_NAMES[option.weaponId]),
                    level: option.toLevel,
                    icon: WEAPON_ICONS[option.weaponId],
                  };
                case "upgradeWeapon":
                  return {
                    key: `upgradeWeapon-${option.weaponId}`,
                    title: t(WEAPON_NAMES[option.weaponId]),
                    level: option.toLevel,
                    icon: WEAPON_ICONS[option.weaponId],
                  };
                case "newPerk":
                  return {
                    key: `newPerk-${option.perkId}`,
                    title: t(PERK_NAMES[option.perkId]),
                    level: option.toLevel,
                    icon: PERK_ICONS[option.perkId],
                  };
                case "upgradePerk":
                  return {
                    key: `upgradePerk-${option.perkId}`,
                    title: t(PERK_NAMES[option.perkId]),
                    level: option.toLevel,
                    icon: PERK_ICONS[option.perkId],
                  };
              }
            })();

            const labelType =
              option.bonusLevels === 2
                ? "vibrant"
                : option.bonusLevels === 3
                  ? "warning"
                  : "info";

            return (
              <StatCard
                key={card.key}
                title={card.title}
                label={{
                  value: t(`${PORTAL_NAME}.weaponLevel`, {
                    level: card.level,
                  }),
                  type: labelType,
                }}
                img={{ src: card.icon }}
                className="min-h-[96px] w-[150px]"
                onClick={() =>
                  portalService.send("SELECT_LEVEL_UP_OPTION", { option })
                }
              />
            );
          })}
        </div>
      </Modal>

      {sflBalance && (
        <>
          <Hud />
          <Phaser />
        </>
      )}
    </div>
  );
};
