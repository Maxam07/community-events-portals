import React from "react";
import { ButtonPanel, InnerPanel } from "components/ui/Panel";
import {
  SKILLS_TABLE,
  DROP_ITEMS_XP_TABLE,
  ENEMIES_TABLE,
} from "../../constants/ConfigConstants";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";
import { SquareIcon } from "components/ui/SquareIcon";
import {
  CATEGORY_CONFIGS,
  CATEGORY_POWER_EFFECTS,
  SPECIAL_POWER_CONFIG,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_IDS,
  WEAPON_ICONS,
  WEAPON_IDS,
  WEAPON_NAMES,
} from "../../constants";
import type { SpecialPowerKind, WeaponCategoryId } from "../../Types";

const toSeconds = (ms: number) => Number((ms / 1000).toFixed(1));
const toPercent = (ratio: number) => Math.round(ratio * 100);

type Translate = ReturnType<typeof useAppTranslation>["t"];

// Power effect text built from CATEGORY_POWER_EFFECTS so balance changes in
// constants show up here automatically.
const getPowerDescription = (category: WeaponCategoryId, t: Translate) => {
  switch (category) {
    case "plague": {
      const { damagePerTick, tickMs, durationMs } =
        CATEGORY_POWER_EFFECTS.plague;

      return t("minigame.categories.power.plague", {
        damage: damagePerTick,
        tick: toSeconds(tickMs),
        duration: toSeconds(durationMs),
      });
    }
    case "frost": {
      const { speedMultiplier, durationMs } = CATEGORY_POWER_EFFECTS.frost;

      return t("minigame.categories.power.frost", {
        percent: toPercent(1 - speedMultiplier),
        duration: toSeconds(durationMs),
      });
    }
    case "curse":
      return t("minigame.categories.power.curse", {
        duration: toSeconds(CATEGORY_POWER_EFFECTS.curse.durationMs),
      });
    case "bloodyHarvest":
      return t("minigame.categories.power.bloodyHarvest", {
        amount: CATEGORY_POWER_EFFECTS.bloodyHarvest.healPerKill,
      });
  }
};

const COMBINATIONS: {
  kind: SpecialPowerKind;
  rule:
    | "minigame.categories.combo.pureRule"
    | "minigame.categories.combo.hybridRule"
    | "minigame.categories.combo.partialRule"
    | "minigame.categories.combo.noneRule";
  result:
    | "minigame.categories.combo.pure"
    | "minigame.categories.combo.hybrid"
    | "minigame.categories.combo.partial"
    | "minigame.categories.combo.none";
}[] = [
  {
    kind: "pure",
    rule: "minigame.categories.combo.pureRule",
    result: "minigame.categories.combo.pure",
  },
  {
    kind: "hybrid",
    rule: "minigame.categories.combo.hybridRule",
    result: "minigame.categories.combo.hybrid",
  },
  {
    kind: "partial",
    rule: "minigame.categories.combo.partialRule",
    result: "minigame.categories.combo.partial",
  },
  {
    kind: "none",
    rule: "minigame.categories.combo.noneRule",
    result: "minigame.categories.combo.none",
  },
];

export const Categories: React.FC = () => {
  const { t } = useAppTranslation();

  return (
    <div className="flex md:flex-row flex-col-reverse md:mr-1 items-start h-full">
      <InnerPanel className="p-2 w-full">
        <Label type="default">{t("minigame.categories.title")}</Label>
        <span className="text-xs">
          {t("minigame.categories.intro", {
            hotkey: SPECIAL_POWER_CONFIG.hotkey.toUpperCase(),
            cooldown: toSeconds(SPECIAL_POWER_CONFIG.cooldownMs),
          })}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 w-full mt-2 gap-1">
          {WEAPON_CATEGORY_IDS.map((category) => {
            const config = CATEGORY_CONFIGS[category];
            const weapons = WEAPON_IDS.filter(
              (weaponId) => WEAPON_CATEGORIES[weaponId] === category,
            );

            return (
              <ButtonPanel
                key={category}
                className="flex flex-col items-start gap-1 w-full p-1 cursor-default"
              >
                <Label type={config.labelType}>{t(config.name)}</Label>
                <div className="flex flex-wrap items-center gap-1 ml-1">
                  {weapons.map((weaponId) => (
                    <div key={weaponId} title={t(WEAPON_NAMES[weaponId])}>
                      <SquareIcon icon={WEAPON_ICONS[weaponId]} width={10} />
                    </div>
                  ))}
                </div>
                <Label type={config.labelType}>{t(config.effectName)}</Label>
                <span className="text-xs ml-1">
                  {getPowerDescription(category, t)}
                </span>
                <span className="text-xs ml-1">
                  {t("minigame.categories.duration", {
                    seconds: toSeconds(config.baseActiveMs),
                  })}
                </span>
              </ButtonPanel>
            );
          })}
        </div>

        <Label type="default" className="mt-2">
          {t("minigame.categories.combinations")}
        </Label>
        <table className="w-full text-xs table-fixed border-collapse mt-1">
          <tbody>
            {COMBINATIONS.map(({ kind, rule, result }) => {
              const multiplier = SPECIAL_POWER_CONFIG.durationMultipliers[kind];

              return (
                <tr key={kind}>
                  <td
                    style={{ border: "1px solid #b96f50" }}
                    className="p-1.5 w-2/5"
                  >
                    {t(rule)}
                  </td>
                  <td
                    style={{ border: "1px solid #b96f50" }}
                    className="p-1.5 w-3/5"
                  >
                    {t(result, { percent: toPercent(multiplier) })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </InnerPanel>
      <div />
    </div>
  );
};

export const Skills: React.FC = () => {
  const { t } = useAppTranslation();
  return (
    <div className="flex md:flex-row flex-col-reverse md:mr-1 items-start h-full">
      <InnerPanel className="p-2 w-full">
        <Label type="default">{t("minigame.weapon")}</Label>
        <span className="text-xs">{t("minigame.instructions6")}</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 w-full mt-2 gap-1">
          {SKILLS_TABLE.map((skill, index) => (
            <SkillsCard
              key={index}
              icon={skill.image}
              skillName={skill.skillName}
              minDamage={skill.minDamage}
              maxDamage={skill.maxDamage}
            />
          ))}
        </div>
      </InnerPanel>
      <div />
    </div>
  );
};

export const DropItemsXP: React.FC = () => {
  const { t } = useAppTranslation();
  return (
    <div className="flex md:flex-row flex-col-reverse md:mr-1 items-start h-full">
      <InnerPanel className="p-2 w-full">
        <Label type="default">{t("minigame.dropItemXP")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 w-full mt-1 gap-1">
          {DROP_ITEMS_XP_TABLE.map((item, index) => (
            <DropItemCard key={index} icon={item.image} xp={item.xp} />
          ))}
        </div>
      </InnerPanel>
      <div />
    </div>
  );
};

export const Enemies: React.FC = () => {
  const { t } = useAppTranslation();
  return (
    <div className="flex md:flex-row flex-col-reverse md:mr-1 items-start h-full">
      <InnerPanel className="p-2 w-full">
        <Label type="default">{t("minigame.enemy")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 w-full mt-1 gap-1">
          {ENEMIES_TABLE.map((item, index) => (
            <EnemyCard
              key={index}
              icon={item.image}
              type={item.type}
              hp={item.hp}
              damage={item.damage}
              itemIcon={item.itemIcon}
            />
          ))}
        </div>
      </InnerPanel>
      <div />
    </div>
  );
};

export const SkillsCard: React.FC<{
  icon: string;
  skillName: string;
  minDamage: number;
  maxDamage: number;
}> = ({ icon, minDamage, skillName, maxDamage }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col items-center">
      <img src={icon} className="h-10 mr-1 pb-1" />
      <span className="text-xs font-bold">{skillName}</span>
      <div className="flex flex-col pt-3 w-full text-left">
        <span className="text-xs pb-2">{t("minigame.damage")}</span>
      </div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr>
            <th className="bg-black/10 px-2 py-1 text-left font-normal">
              {t("minigame.min")}
            </th>
            <td className="bg-black/10 px-2 py-1 text-center">{minDamage}</td>
          </tr>

          <tr>
            <th className="px-2 py-1 text-left font-normal">
              {t("minigame.max")}
            </th>
            <td className="px-2 py-1 text-center">{maxDamage}</td>
          </tr>
        </tbody>
      </table>
    </ButtonPanel>
  );
};

export const DropItemCard: React.FC<{
  icon: string;
  xp: number;
}> = ({ icon, xp }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col w-full items-center">
      <img src={icon} className="h-10 mr-1 pb-3" />
      <table className="mt-1 w-full border-collapse text-xs">
        <tbody>
          <tr>
            <th className="bg-black/10 px-2 py-1 text-center text-xs font-normal">
              {t("minigame.xp")}
            </th>
            <td className="bg-black/10 px-2 py-1 text-center text-xs">{xp}</td>
          </tr>
        </tbody>
      </table>
    </ButtonPanel>
  );
};

export const EnemyCard: React.FC<{
  icon: string;
  type: string;
  hp: number;
  damage: number;
  itemIcon: string;
}> = ({ icon, type, hp, damage, itemIcon }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col items-center">
      <img src={icon} className="h-10 mr-1 pb-1" />
      <span className="text-xs font-semibold">{type}</span>
      <table className="mt-3 w-full border-collapse text-xs">
        <tbody>
          <tr>
            <th className="bg-black/10 px-2 py-1 text-left font-normal">
              {t("minigame.hp")}
            </th>
            <td className="bg-black/10 px-2 py-1 text-center">{hp}</td>
          </tr>

          <tr>
            <th className="px-2 py-1 text-left font-normal">
              {t("minigame.damage")}
            </th>
            <td className="px-2 py-1 text-center">{damage}</td>
          </tr>

          <tr>
            <th className="bg-black/10 px-2 py-1 text-left font-normal">
              {t("minigame.drop")}
            </th>
            <td className="bg-black/10 px-2 py-1 text-center">
              <img src={itemIcon} className="inline-block h-4" />
            </td>
          </tr>
        </tbody>
      </table>
    </ButtonPanel>
  );
};
