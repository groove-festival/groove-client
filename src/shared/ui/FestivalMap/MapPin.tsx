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

// 지도에서 선택한 장소에 쓰는 핀 (Figma 1896:17170).
// 이름 길이에 따라 가로로 늘어나되 지도 박스를 넘길 만큼 긴 이름은 제한한다.
export const MapPinVisual = ({ label }: MapPinVisualProps) => (
  <div className="flex flex-col items-center">
    <MapBadgeVisual label={label} strongGlass />
    {/* 세로선 31px 끝에 지름 16/3px 점. 점의 중심이 핀 끝이다. */}
    <span aria-hidden="true" className="relative h-[31px] w-px bg-[#fcfcfc]">
      <span className="absolute bottom-0 left-1/2 size-[5.333px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#fcfcfc]" />
    </span>
  </div>
);

interface MapPinProps {
  // 핀 끝(아래 점)이 닿을 자리. FestivalMap 의 source 크기에 대한 비율이다.
  point: MapRatioPoint;
  label: string;
}

// 지도 위 장소 이름표 (Figma 1896:17170). FestivalMap 의 children 안에 둔다.
// 레이어는 지도와 함께 확대되므로, 지금 배율의 역수만큼 줄여 화면에서는
// 늘 같은 크기로 보이게 한다. 줄이는 기준은 핀 끝이라 확대해도 자리가 밀리지 않는다.
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
