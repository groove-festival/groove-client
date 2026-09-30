import type { CSSProperties } from "react";

import { MAP_SCALE_VARIABLE } from "@/shared/ui";

import type { CampusLocationProjection } from "../model/georeference";
import { CAMPUS_MAP_SIZE, CAMPUS_MAP_VIEW_BOX } from "../model/places";

interface CampusLocationLayerProps {
  location: CampusLocationProjection;
}

const toMapPoint = ({ xRatio, yRatio }: { xRatio: number; yRatio: number }) => ({
  x: xRatio * CAMPUS_MAP_SIZE.width,
  y: yRatio * CAMPUS_MAP_SIZE.height,
});

const getAccuracyRadius = (location: CampusLocationProjection) => {
  const center = toMapPoint(location.point);

  return Math.max(
    ...location.accuracyPoints.map((point) => {
      const edge = toMapPoint(point);
      return Math.hypot(edge.x - center.x, edge.y - center.y);
    }),
  );
};

const getRadarSectorPath = (centerX: number, centerY: number, radius: number) => {
  const startAngle = (-70 * Math.PI) / 180;
  const endAngle = (-8 * Math.PI) / 180;
  const startX = centerX + Math.cos(startAngle) * radius;
  const startY = centerY + Math.sin(startAngle) * radius;
  const endX = centerX + Math.cos(endAngle) * radius;
  const endY = centerY + Math.sin(endAngle) * radius;

  return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`;
};

export const CampusLocationLayer = ({ location }: CampusLocationLayerProps) => {
  const showRadar = location.accuracyLevel === "coarse";
  const centerX = location.point.xRatio * CAMPUS_MAP_SIZE.width;
  const centerY = location.point.yRatio * CAMPUS_MAP_SIZE.height;
  const accuracyRadius = getAccuracyRadius(location);

  return (
    <div className="pointer-events-none absolute inset-0" data-testid="campus-location">
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible"
        viewBox={CAMPUS_MAP_VIEW_BOX}
      >
        <circle
          cx={centerX}
          cy={centerY}
          data-testid="campus-location-accuracy"
          fill="rgba(22, 102, 240, 0.14)"
          r={accuracyRadius}
        />
        {showRadar && (
          <g data-testid="campus-location-radar">
            {[0.34, 0.67].map((scale) => (
              <circle
                cx={centerX}
                cy={centerY}
                fill="none"
                key={scale}
                r={accuracyRadius * scale}
                stroke="rgba(142, 185, 255, 0.22)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              className="animate-[spin_5s_linear_infinite] motion-reduce:animate-none"
              d={getRadarSectorPath(centerX, centerY, accuracyRadius)}
              fill="rgba(117, 172, 255, 0.1)"
              style={{ transformOrigin: `${centerX}px ${centerY}px` }}
            />
          </g>
        )}
      </svg>

      <div
        className="absolute size-0 origin-center"
        style={
          {
            left: `${location.point.xRatio * 100}%`,
            top: `${location.point.yRatio * 100}%`,
            scale: `calc(1 / var(${MAP_SCALE_VARIABLE}, 1))`,
          } as CSSProperties
        }
      >
        <span
          aria-label="현재 위치"
          className="absolute top-1/2 left-1/2 block size-7 -translate-1/2 rounded-full bg-[rgba(22,102,240,0.18)]"
          role="img"
        >
          <span
            aria-hidden="true"
            className="absolute inset-[3px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.32)]"
          >
            <span className="absolute inset-[4px] rounded-full bg-[#1666F0]" />
          </span>
        </span>
      </div>
    </div>
  );
};
