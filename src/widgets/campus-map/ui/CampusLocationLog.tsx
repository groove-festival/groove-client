import type {
  CampusLocationProjection,
  CampusLocationReading,
} from "../model/georeference";
import { CAMPUS_MAP_SIZE } from "../model/places";

interface CampusLocationLogProps {
  location: CampusLocationProjection;
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
  location,
  reading,
  sampleNumber,
}: CampusLocationLogProps) => {
  const mapX = location.point.xRatio * CAMPUS_MAP_SIZE.width;
  const mapY = location.point.yRatio * CAMPUS_MAP_SIZE.height;

  return (
    <section
      aria-label="GPS 측정 기록"
      className="festival-glass pointer-events-none absolute top-14 left-3 z-30 w-[226px] rounded-2xl px-3 py-2.5 text-[#f4f7fb] backdrop-blur-[40px]"
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
      </dl>
    </section>
  );
};
