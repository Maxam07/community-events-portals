import React from "react";

import { Label, type LabelType } from "components/ui/Label";
import { ButtonPanel } from "components/ui/Panel";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";

type StatCardImg = {
  src: string;
  width?: number;
  height?: number;
};

type StatCardLabel = {
  value: React.ReactNode;
  type?: LabelType;
};

type StatCardProps = {
  title: string;
  label?: StatCardLabel;
  warningLabel?: React.ReactNode;
  // Full-width colored label anchored to the bottom (e.g. weapon category).
  bottomLabel?: { text: React.ReactNode; type: LabelType };
  // Smaller text under the title.
  description?: string;
  // Extra labels rendered under the description (e.g. Special Power preview).
  tags?: React.ReactNode;
  // Colored glow around the card. Two colors split it left/right.
  glowColors?: string[];
  className?: string;
  img?: StatCardImg;
  disabled?: boolean;
  selected?: boolean;
  showConfirm?: boolean;
  showLabelAboveDisabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  warningLabel,
  bottomLabel,
  description,
  tags,
  glowColors,
  img,
  className,
  disabled,
  selected,
  showConfirm,
  showLabelAboveDisabled,
  onClick,
  children,
}) => {
  const hasBottomLabel = warningLabel !== undefined || !!bottomLabel;

  const labelNode =
    label !== undefined ? (
      <div
        className={`absolute z-10 flex justify-center w-full ${showLabelAboveDisabled ? "-top-3" : "-top-5"}`}
      >
        <Label type={label?.type || "default"}>{label?.value}</Label>
      </div>
    ) : null;

  return (
    <div className={`relative flex flex-col ${className ?? ""}`}>
      {glowColors && glowColors.length > 0 && (
        // Rendered before the panel so it paints behind it.
        <div
          className="pointer-events-none absolute"
          style={{
            inset: `-${PIXEL_SCALE * 1.5}px`,
            borderRadius: `${PIXEL_SCALE * 3}px`,
            background:
              glowColors.length > 1
                ? `linear-gradient(90deg, ${glowColors[0]} 0 50%, ${glowColors[1]} 50% 100%)`
                : glowColors[0],
            filter: `blur(${PIXEL_SCALE * 2}px)`,
            opacity: 0.9,
          }}
        />
      )}
      {showLabelAboveDisabled ? labelNode : null}
      <ButtonPanel
        className="relative flex min-w-[92px] flex-1 items-center justify-center px-2"
        disabled={disabled}
        selected={selected}
        onClick={onClick}
        style={{
          paddingBottom: hasBottomLabel ? "18px" : "10px",
        }}
      >
        {showLabelAboveDisabled ? null : labelNode}

        <div className="flex flex-col items-center">
          {img !== undefined && (
            <img
              src={img.src}
              width={img.width || 20}
              className={`object-contain pixelated ${label && "mt-2"}`}
            />
          )}

          <span className={`text-center text-xs ${hasBottomLabel && "mb-1"}`}>
            {title}
          </span>

          {description !== undefined && (
            <span className="mb-1 text-center text-xxs leading-tight">
              {description}
            </span>
          )}

          {tags !== undefined && (
            <div className="my-1 flex flex-wrap justify-center gap-1">
              {tags}
            </div>
          )}
        </div>

        {hasBottomLabel && (
          <div
            className={`absolute ${bottomLabel?.type === "The Bloody Harvest" ? "-bottom-6" : "-bottom-4"} left-0 right-0 flex justify-center`}
            style={{
              left: `${PIXEL_SCALE * -3}px`,
              right: `${PIXEL_SCALE * -3}px`,
              width: `calc(100% + ${PIXEL_SCALE * 6}px)`,
            }}
          >
            {bottomLabel ? (
              <Label
                className="max-w-28 justify-center text-center"
                type={bottomLabel.type}
              >
                {bottomLabel.text}
              </Label>
            ) : (
              <Label
                type="vibrant"
                className="w-full justify-center text-center"
              >
                {warningLabel}
              </Label>
            )}
          </div>
        )}

        {showConfirm ? (
          <img
            src={SUNNYSIDE.icons.confirm}
            className="absolute -left-2 -top-3 z-10 h-4"
          />
        ) : null}

        {children}
      </ButtonPanel>
    </div>
  );
};
