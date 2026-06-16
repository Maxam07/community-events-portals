import React from "react";

import { Label, LabelType } from "components/ui/Label";
import { ButtonPanel } from "components/ui/Panel";
import { ProgressType, ResizableBar } from "components/ui/ProgressBar";
import { PIXEL_SCALE } from "features/game/lib/constants";
import powerupIcon from "assets/icons/level_up.png";

type StatCardFooter =
  | {
      warningLabel: React.ReactNode;
      progress?: never;
    }
  | {
      progress: {
        percentage: number;
        type?: ProgressType;
      };
      warningLabel?: never;
    }
  | {
      warningLabel?: never;
      progress?: never;
    };

type StatCardImg = {
  src: string;
  width?: number;
  height?: number;
};

type StatCardLabel = {
  value: React.ReactNode;
  type?: LabelType;
};

type StatCardProps = StatCardFooter & {
  title: string;
  label?: StatCardLabel;
  className?: string;
  img?: StatCardImg;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  warningLabel,
  progress,
  img,
  className,
}) => {
  return (
    <ButtonPanel
      className={`relative flex min-w-[92px] items-center justify-center px-2 ${className ?? ""}`}
      style={{
        paddingBottom: warningLabel ? "18px" : "10px",
      }}
    >
      {label !== undefined && (
        <div className="absolute -top-5 flex">
          <Label type={label?.type || "default"}>{label?.value}</Label>
        </div>
      )}

      <div className="flex flex-col items-center">
        {img !== undefined && (
          <img
            src={img.src}
            width={img.width || 20}
            className={`object-contain pixelated ${label && "mt-2"}`}
          />
        )}

        <span className={`text-center text-xs ${warningLabel && "mb-1"}`}>
          {title}
        </span>
      </div>

      {warningLabel !== undefined && (
        <div
          className="absolute -bottom-2 left-0 right-0 flex justify-center"
          style={{
            left: `${PIXEL_SCALE * -3}px`,
            right: `${PIXEL_SCALE * -3}px`,
            width: `calc(100% + ${PIXEL_SCALE * 6}px)`,
          }}
        >
          <Label type="warning" className="w-full justify-center text-center">
            {warningLabel}
          </Label>
        </div>
      )}

      {progress !== undefined && (
        <div className="absolute -bottom-4">
          {progress.percentage === 100 && (
            <img className="absolute -left-5" src={powerupIcon} width={16} />
          )}
          <ResizableBar
            percentage={progress.percentage}
            type={progress.type ?? "progress"}
            outerDimensions={{ width: 16, height: 7.5 }}
          />
        </div>
      )}
    </ButtonPanel>
  );
};
