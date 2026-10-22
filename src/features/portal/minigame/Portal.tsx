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
import { authorisePortal, claimPrize, purchase } from "../lib/portalUtil";
import { RulesPanel } from "./components/panels/RulesPanel";
import { NoAttemptsPanel } from "./components/panels/NoAttemptsPanel";
import { Hud } from "./components/hud/Hud";
import { Phaser } from "./Phaser";
import { BumpkinProfile } from "./components/hud/BumpkinProfile";
import { StatCard } from "./components/hud/StatCard";
import {
  CATEGORY_CONFIGS,
  getSpecialPowerPreview,
  WEAPON_CATEGORIES,
  WEAPON_DESCRIPTIONS,
  WEAPON_ICONS,
  WEAPON_NAMES,
  REVIVE_FLOWER_COST,
  REVIVE_MAX_PER_RUN,
  REVIVE_SCORE_MULTIPLIER,
  PANEL_NPC_WEARABLES,
} from "./constants";
import { getRevivedScore } from "./lib/Machine";
import { PERK_ICONS, PERK_NAMES } from "./constants/PerkUIConstants";
import type { LevelUpOption } from "./Types";
import { ModalOverlay } from "components/ui/ModalOverlay";
import flowerIcon from "assets/icons/flower_token.webp";
import retryIcon from "public/world/portal/halloween/retry.png";
import Decimal from "decimal.js-light";

const _pendingRevive = (state: PortalMachineState) =>
  state.context.pendingRevive;
const _collected = (state: PortalMachineState) => state.context.collected;
const _revivesUsed = (state: PortalMachineState) => state.context.revivesUsed;
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
const _weaponLevels = (state: PortalMachineState) => state.context.weaponLevels;

// Level-up cards: weapons on the top row, perks below. Empty rows are skipped
// so a weapons-only (or perks-only) choice keeps a single row.
const getLevelUpRows = (options: LevelUpOption[] = []) =>
  [
    {
      key: "weapons",
      options: options.filter(
        (option) =>
          option.kind === "newWeapon" || option.kind === "upgradeWeapon",
      ),
    },
    {
      key: "perks",
      options: options.filter(
        (option) => option.kind === "newPerk" || option.kind === "upgradePerk",
      ),
    },
  ].filter((row) => row.options.length > 0);

/**
 * A Portal Example which demonstrates basic state management
 */
export const Portal: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const [showPreGameProfile, setShowPreGameProfile] = useState(false);
  const [showReviveConfirm, setShowReviveConfirm] = useState(false);

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
  const weaponLevels = useSelector(portalService, _weaponLevels);
  const pendingRevive = useSelector(portalService, _pendingRevive);
  const collected = useSelector(portalService, _collected);
  const revivesUsed = useSelector(portalService, _revivesUsed);
  const isLastRevive = revivesUsed + 1 >= REVIVE_MAX_PER_RUN;

  useEffect(() => {
    if (!pendingRevive) setShowReviveConfirm(false);
  }, [pendingRevive]);

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

      <Modal show={pendingRevive} backdrop="static">
        <Panel bumpkinParts={PANEL_NPC_WEARABLES}>
          <div className="relative">
            <div className="p-2 flex flex-col gap-2">
              <div className="flex justify-between items-center gap-1">
                <div className="flex items-center gap-3">
                  <Label type="danger">{t("minigame.reviveTitle")}</Label>
                  <Label
                    type={
                      revivesUsed >= REVIVE_MAX_PER_RUN ? "warning" : "default"
                    }
                    icon={retryIcon}
                  >
                    {`${revivesUsed}/${REVIVE_MAX_PER_RUN}`}
                  </Label>
                </div>
                <Label type="default" icon={flowerIcon}>
                  {(sflBalance ?? new Decimal(0))
                    .toDecimalPlaces(4, Decimal.ROUND_DOWN)
                    .toFixed()}
                </Label>
              </div>
              <span className="text-sm">{t("minigame.reviveDescription")}</span>
              <Label type="warning">
                <span>
                  {t("minigame.reviveScoreWarning", {
                    percent: Math.round(REVIVE_SCORE_MULTIPLIER * 100),
                  })}
                  {" ("}
                  <span className="line-through">{collected}</span>{" "}
                  {getRevivedScore(collected)}
                  {")"}
                </span>
              </Label>
              {isLastRevive && (
                <Label type="warning">{t("minigame.reviveLastRetry")}</Label>
              )}
            </div>
            <div className="flex gap-1">
              <Button onClick={() => portalService.send("GAME_OVER")}>
                {`${t("exit")} ${t("minigame.reviveExitScore", { score: collected })}`}
              </Button>
              <Button
                disabled={sflBalance?.lt(REVIVE_FLOWER_COST)}
                onClick={() => setShowReviveConfirm(true)}
              >
                {t("minigame.reviveRetry", { cost: REVIVE_FLOWER_COST })}
              </Button>
            </div>
            <ModalOverlay
              show={showReviveConfirm}
              onBackdropClick={() => setShowReviveConfirm(false)}
            >
              <Panel>
                <p className="text-sm p-2">
                  {t("minigame.reviveConfirmation", {
                    cost: REVIVE_FLOWER_COST,
                  })}
                </p>
                <div className="flex gap-1">
                  <Button onClick={() => setShowReviveConfirm(false)}>
                    {t("no")}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowReviveConfirm(false);
                      purchase({ sfl: REVIVE_FLOWER_COST, items: {} });
                    }}
                  >
                    {t("yes")}
                  </Button>
                </div>
              </Panel>
            </ModalOverlay>
          </div>
        </Panel>
      </Modal>

      <Modal
        show={!!pendingLevelUpChoice}
        backdrop="static"
        dialogClassName="max-w-[960px]"
      >
        <div className="flex flex-col items-center gap-8 p-2 pb-4">
          {/* Weapons on the top row, perks on the bottom row */}
          {getLevelUpRows(pendingLevelUpChoice?.options).map((row) => (
            <div
              key={row.key}
              className="flex flex-wrap items-stretch justify-center gap-3"
            >
              {row.options.map((option: LevelUpOption) => {
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

                // Weapon cards: description, category label (always) and the
                // Special Power(s) the pick unlocks/changes, with their duration.
                const isWeaponOption =
                  option.kind === "newWeapon" ||
                  option.kind === "upgradeWeapon";
                const category = isWeaponOption
                  ? CATEGORY_CONFIGS[WEAPON_CATEGORIES[option.weaponId]]
                  : undefined;
                const powerPreview = getSpecialPowerPreview(
                  weaponLevels,
                  option,
                );
                const showPowerTags =
                  powerPreview.changed && powerPreview.next.kind !== "none";

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
                      value: t("minigame.weaponLevel", {
                        level: card.level,
                      }),
                      type: labelType,
                    }}
                    img={{ src: card.icon }}
                    description={
                      isWeaponOption
                        ? t(WEAPON_DESCRIPTIONS[option.weaponId])
                        : undefined
                    }
                    tags={
                      showPowerTags
                        ? powerPreview.next.categories.map((powerCategory) => {
                            const config = CATEGORY_CONFIGS[powerCategory];

                            return (
                              <Label
                                key={powerCategory}
                                type={config.labelType}
                              >
                                {t("minigame.specialPower.effectDuration", {
                                  effect: t(config.effectName),
                                  // Each power has its own duration
                                  seconds: Number(
                                    (
                                      (powerPreview.next.activeMsByCategory[
                                        powerCategory
                                      ] ?? 0) / 1000
                                    ).toFixed(1),
                                  ),
                                })}
                              </Label>
                            );
                          })
                        : undefined
                    }
                    glowColors={
                      showPowerTags
                        ? powerPreview.next.categories.map(
                            (powerCategory) =>
                              CATEGORY_CONFIGS[powerCategory].glowColor,
                          )
                        : undefined
                    }
                    bottomLabel={
                      category
                        ? { text: t(category.name), type: category.labelType }
                        : undefined
                    }
                    className={
                      isWeaponOption
                        ? "min-h-[160px] w-[170px]"
                        : "min-h-[96px] w-[150px]"
                    }
                    onClick={() =>
                      portalService.send("SELECT_LEVEL_UP_OPTION", { option })
                    }
                  />
                );
              })}
            </div>
          ))}
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
