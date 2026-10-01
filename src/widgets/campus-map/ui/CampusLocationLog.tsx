import type { MapRatioPoint } from "@/shared/ui";

import type {
  CampusLocationProjection,
  CampusLocationReading,
} from "../model/georeference";
import { CAMPUS_MAP_SIZE } from "../model/places";

interface CampusLocationLogProps {
  actualPoint: MapRatioPoint | null;
  isSelectingActualPoint: boolean;
  location: CampusLocationProjection;
  onStartActualPointSelection: () => void;
  reading: CampusLocationReading;
  sampleNumber: number;
}

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

const formatMeasurementTime = (timestamp: number) => {
  const measuredAt = new Date(timestamp);
  if (Number.isNaN(measuredAt.getTime())) return "-";

  return [
    `${pad(measuredAt.getHours())}:${pad(measuredAt.getMinutes())}:${pad(
      measuredAt.getSeconds(),
    )}`,
    pad(measuredAt.getMilliseconds(), 3),
  ].join(".");
};

const formatNumber = (value: number, digits: number) =>
  Number.isFinite(value) ? value.toFixed(digits) : "-";

export const CampusLocationLog = ({
  actualPoint,
  isSelectingActualPoint,
  location,
  onStartActualPointSelection,
  reading,
  sampleNumber,
}: CampusLocationLogProps) => {
  const mapX = location.point.xRatio * CAMPUS_MAP_SIZE.width;
  const mapY = location.point.yRatio * CAMPUS_MAP_SIZE.height;
  const actualMapX = actualPoint ? actualPoint.xRatio * CAMPUS_MAP_SIZE.width : null;
  const actualMapY = actualPoint ? actualPoint.yRatio * CAMPUS_MAP_SIZE.height : null;

  return (
    <section
      aria-label="GPS 측정 기록"
      className="festival-glass absolute top-14 left-3 z-30 w-[226px] rounded-2xl px-3 py-2.5 text-[#f4f7fb] backdrop-blur-[40px]"
    >
      <h3 className="mb-1.5 text-[11px] leading-4 font-bold tracking-tight">
        GPS 측정 #{sampleNumber}
      </h3>
      <dl className="grid grid-cols-[48px_1fr] gap-x-2 gap-y-0.5 font-mono text-[10px] leading-4 tabular-nums">
        <dt className="text-[#aeb7c5]">시각</dt>
        <dd>{formatMeasurementTime(reading.timestamp)}</dd>
        <dt className="text-[#aeb7c5]">위도</dt>
        <dd>{formatNumber(reading.latitude, 7)}</dd>
        <dt className="text-[#aeb7c5]">경도</dt>
        <dd>{formatNumber(reading.longitude, 7)}</dd>
        <dt className="text-[#aeb7c5]">GPS 오차</dt>
        <dd>± {formatNumber(reading.accuracy, 1)}m</dd>
        <dt className="text-[#aeb7c5]">SVG</dt>
        <dd>
          x {formatNumber(mapX, 1)} y {formatNumber(mapY, 1)}
        </dd>
        <dt className="text-[#aeb7c5]">실제 SVG</dt>
        <dd>
          {actualMapX === null || actualMapY === null
            ? "-"
            : `x ${formatNumber(actualMapX, 1)} y ${formatNumber(actualMapY, 1)}`}
        </dd>
        {actualMapX !== null && actualMapY !== null && (
          <>
            <dt className="text-[#aeb7c5]">차이</dt>
            <dd>
              Δx {formatNumber(actualMapX - mapX, 1)} Δy{" "}
              {formatNumber(actualMapY - mapY, 1)}
            </dd>
          </>
        )}
      </dl>
      <button
        className="mt-2 w-full rounded-lg border border-white/45 bg-black/15 px-2 py-1.5 text-[10px] leading-4 font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-crosshair disabled:text-[#d9e0ea]"
        disabled={isSelectingActualPoint}
        onClick={onStartActualPointSelection}
        type="button"
      >
        {isSelectingActualPoint
          ? "지도에서 실제 위치를 눌러주세요"
          : actualPoint
            ? "실제 위치 다시 찍기"
            : "실제 위치 찍기"}
      </button>
    </section>
  );
};
