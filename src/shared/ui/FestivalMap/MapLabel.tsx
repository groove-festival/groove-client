import type { CSSProperties } from "react";

import { MAP_SCALE_VARIABLE } from "./FestivalMap";
import type { MapRatioPoint } from "./mapGeometry";
import { MapBadgeVisual } from "./MapPin";

interface MapLabelProps {
  point: MapRatioPoint;
  label: string;

  visibleScale?: readonly [hidden: number, shown: number];
}

export const MapLabel = ({ point, label, visibleScale }: MapLabelProps) => {
  const scale = `var(${MAP_SCALE_VARIABLE}, 1)`;
  const opacity = visibleScale
    ? `clamp(0, calc((${scale} - ${visibleScale[0]}) / ${visibleScale[1] - visibleScale[0]}), 1)`
    : undefined;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute origin-center select-none"
      style={
        {
          left: `${point.xRatio * 100}%`,
          top: `${point.yRatio * 100}%`,
          translate: "-50% -50%",
          scale: `calc(1 / ${scale})`,
          opacity,
        } as CSSProperties
      }
    >
      <MapBadgeVisual label={label} />
    </div>
  );
};
