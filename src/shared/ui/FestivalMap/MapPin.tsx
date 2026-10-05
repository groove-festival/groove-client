import type { CSSProperties } from "react";

import { MAP_SCALE_VARIABLE } from "./FestivalMap";
import type { MapRatioPoint } from "./mapGeometry";

interface MapPinVisualProps {
  label: string;
}

interface MapBadgeVisualProps {
  label: string;
  strongGlass?: boolean;
}

export const MapBadgeVisual = ({ label, strongGlass = false }: MapBadgeVisualProps) => (
  <span
    className={`map-glass-badge inline-block max-w-[240px] rounded-lg border border-[#fcfcfc] px-3 py-2 text-center text-sm leading-[17px] font-semibold whitespace-nowrap text-[#fcfcfc] ${
      strongGlass
        ? "map-glass-badge--strong bg-[rgba(252,252,252,0.5)] shadow-[0_4px_2px_rgba(28,28,28,0.25),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-[80px] backdrop-saturate-[1.2] [text-shadow:0_1px_2px_rgba(28,28,28,0.3)]"
        : "bg-[rgba(252,252,252,0.62)] shadow-[0_4px_2px_rgba(28,28,28,0.25),inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-[80px]"
    }`}
  >
    {label}
  </span>
);

export const MapPinVisual = ({ label }: MapPinVisualProps) => (
  <div className="flex flex-col items-center">
    <MapBadgeVisual label={label} strongGlass />

    <span aria-hidden="true" className="relative h-[31px] w-px bg-[#fcfcfc]">
      <span className="absolute bottom-0 left-1/2 size-[5.333px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#fcfcfc]" />
    </span>
  </div>
);

interface MapPinProps {
  point: MapRatioPoint;
  label: string;
}

export const MapPin = ({ point, label }: MapPinProps) => (
  <div
    className="pointer-events-none absolute flex origin-bottom flex-col items-center"
    style={
      {
        left: `${point.xRatio * 100}%`,
        top: `${point.yRatio * 100}%`,
        translate: "-50% -100%",
        scale: `calc(1 / var(${MAP_SCALE_VARIABLE}, 1))`,
      } as CSSProperties
    }
  >
    <MapPinVisual label={label} />
  </div>
);
