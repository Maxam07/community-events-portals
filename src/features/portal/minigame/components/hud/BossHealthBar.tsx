import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import type { PortalMachineState } from "../../lib/Machine";
import { SUNNYSIDE } from "assets/sunnyside"; // same import as your heart icon
import { ResizableBar } from "components/ui/ProgressBar"; // same import you use in your original file
import finalBossIcon from "public/world/portal/halloween/icons/final_boss.png";

const StatusBar: React.FC<{
  icon: string;
  value: string;
  percentage: number;
  type: "error" | "progress" | "health";
  width?: number;
}> = ({ icon, value, percentage, type, width = 42 }) => {
  return (
    <div className="flex flex-col pb-5">
      <div className="flex items-center justify-center text-xxs text-white">
        <span className="ml-6">{value}</span>
      </div>
      <div className="flex items-center gap-1">
        <img src={finalBossIcon} className="h-12 object-contain pixelated" />
        <ResizableBar
          percentage={percentage}
          type={type}
          outerDimensions={{ width, height: 7.5 }}
        />
      </div>
    </div>
  );
};

const _bossHealth = (state: PortalMachineState) => state.context.bossHealth;

export const BossHealthBar: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const boss = useSelector(portalService, _bossHealth);

  if (!boss) return null;

  const percentage = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));

  return (
    <div className="pointer-events-none">
      <StatusBar
        icon={SUNNYSIDE.icons.heart}
        value={`${Math.ceil(boss.hp)} / ${boss.maxHp}`}
        percentage={percentage}
        type="error"
        width={80}
      />
    </div>
  );
};
