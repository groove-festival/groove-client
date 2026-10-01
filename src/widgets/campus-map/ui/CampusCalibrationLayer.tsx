import { type CSSProperties, type MouseEvent } from "react";

import { MAP_SCALE_VARIABLE, type MapRatioPoint } from "@/shared/ui";

interface CampusCalibrationLayerProps {
  actualPoint: MapRatioPoint | null;
  isSelecting: boolean;
  onSelect: (point: MapRatioPoint) => void;
}

const clampRatio = (value: number) => Math.max(0, Math.min(1, value));

export const CampusCalibrationLayer = ({
  actualPoint,
  isSelecting,
  onSelect,
}: CampusCalibrationLayerProps) => {
  const handleSelect = (event: MouseEvent<HTMLButtonElement>) => {
    const { height, left, top, width } = event.currentTarget.getBoundingClientRect();
    if (width <= 0 || height <= 0 || event.detail === 0) return;

    onSelect({
      xRatio: clampRatio((event.clientX - left) / width),
      yRatio: clampRatio((event.clientY - top) / height),
    });
  };

  return (
    <>
      {actualPoint && (
        <div
          className="pointer-events-none absolute z-30 size-0 origin-center"
          data-testid="campus-actual-location"
          style={
            {
              left: `${actualPoint.xRatio * 100}%`,
              top: `${actualPoint.yRatio * 100}%`,
              scale: `calc(1 / var(${MAP_SCALE_VARIABLE}, 1))`,
            } as CSSProperties
          }
        >
          <span
            aria-label="실제 위치"
            className="absolute top-1/2 left-1/2 block size-4 -translate-1/2 rounded-full border-2 border-white bg-[#ff3b3b] shadow-[0_1px_5px_rgba(0,0,0,0.55)]"
            role="img"
          />
        </div>
      )}

      {isSelecting && (
        <button
          aria-label="지도에서 실제 위치 선택"
          className="absolute inset-0 z-40 cursor-crosshair touch-none border-0 bg-transparent p-0"
          onClick={handleSelect}
          type="button"
        />
      )}
    </>
  );
};
