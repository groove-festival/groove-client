import type { CSSProperties } from "react";

import { MAP_SCALE_VARIABLE } from "./FestivalMap";
import type { MapRatioPoint } from "./mapGeometry";

interface MapPinProps {
  // 핀 끝(아래 점)이 닿을 자리. FestivalMap 의 source 크기에 대한 비율이다.
  point: MapRatioPoint;
  label: string;
}

// 지도 위 장소 이름표 (Figma 56:3765). FestivalMap 의 children 안에 둔다.
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
    {/* 그림자를 filter 로 주면 안쪽 backdrop-blur 가 먹지 않아 상자에만 건다. */}
    <span className="rounded-lg border border-[#fcfcfc] bg-[rgba(252,252,252,0.5)] px-3 py-2 text-sm leading-[normal] font-semibold whitespace-nowrap text-[#fcfcfc] shadow-[0_4px_2px_rgba(28,28,28,0.25)] backdrop-blur-[2px]">
      {label}
    </span>
    {/* 세로선 31px 끝에 지름 16/3px 점. 점의 중심이 핀 끝이다. */}
    <span aria-hidden="true" className="relative h-[31px] w-px bg-[#fcfcfc]">
      <span className="absolute bottom-0 left-1/2 size-[5.333px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#fcfcfc]" />
    </span>
  </div>
);
