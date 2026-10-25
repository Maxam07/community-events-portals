import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SquareIcon } from "components/ui/SquareIcon";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import retryIcon from "public/world/portal/halloween/retry.png";
import {
  FINAL_BOSS_TIME_BONUS_PER_SECOND,
  INSTRUCTIONS,
  REVIVE_FLOWER_COST,
  REVIVE_MAX_PER_RUN,
  REVIVE_SCORE_MULTIPLIER,
} from "../../constants";
import { Categories, Enemies, Perks, Skills } from "./CodexCategories";
import { DropItemsXP } from "./CodexCategories";

export const Guide = () => {
  const { t } = useAppTranslation();

  return (
    <div className="flex flex-col gap-1 max-h-[75vh]">
      {/* title */}
      <div className="flex flex-col gap-1">
        <div className="flex text-center">
          {/* <div className="grow mb-3 text-lg">{t("minigame.guide")}</div> */}
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col gap-1 overflow-y-auto scrollable pr-1">
        {/* Instructions */}
        <Label type="default">{t("minigame.instructions")}</Label>
        {INSTRUCTIONS.map(({ image, description, width = 10 }, index) => (
          <div key={index}>
            <div className="flex items-center mb-3 mx-2">
              <SquareIcon icon={image} width={width} />
              <p className="text-xs ml-3 flex-1">
                {t("minigame.guideDescription", {
                  description: description,
                })}
              </p>
            </div>
          </div>
        ))}
        {/* Perks */}
        <Perks />
        {/* Final Boss */}
        <Label type="default">{t("minigame.finalBoss")}</Label>
        <div className="flex items-center mb-3 mx-2">
          <SquareIcon icon={SUNNYSIDE.icons.stopwatch} width={10} />
          <p className="text-xs ml-3 flex-1">
            {t("minigame.finalBossDescription", {
              points: FINAL_BOSS_TIME_BONUS_PER_SECOND,
            })}
          </p>
        </div>
        {/* Retries */}
        <Label type="default">{t("minigame.retries")}</Label>
        <div className="flex items-center mb-3 mx-2">
          <SquareIcon icon={retryIcon} width={10} />
          <p className="text-xs ml-3 flex-1">
            {t("minigame.retriesDescription", {
              cost: REVIVE_FLOWER_COST,
              percent: Math.round(REVIVE_SCORE_MULTIPLIER * 100),
              max: REVIVE_MAX_PER_RUN,
            })}
          </p>
        </div>
        {/* Skills */}
        <Skills />
        {/* Weapon categories + Special Power */}
        <Categories />
        {/* Enemies */}
        <Enemies />
        {/* Drop Items XP */}
        <DropItemsXP />
      </div>
    </div>
  );
};
