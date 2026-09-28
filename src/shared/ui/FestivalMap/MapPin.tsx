import type { CSSProperties } from "react";

import { MAP_SCALE_VARIABLE } from "./FestivalMap";
import type { MapRatioPoint } from "./mapGeometry";

// 핀과 지명 뱃지가 함께 쓰는 이름표 상자 (Figma 56:3765).
// 시안의 배경 흐림(backdrop-blur)은 넣지 않는다. iOS Safari 는 확대되는 지도 안에
// backdrop-filter 가 있으면 지도를 확대 전 크기로 그려 늘려서 배치도가 뭉개진다.
// 배경이 거의 불투명(0.92)이라 흐림이 빠져도 눈에 띄지 않는다.
export const mapBadgeClassName =
  "max-w-[240px] rounded-lg border border-[rgba(252,252,252,0.72)] bg-[rgba(28,28,28,0.92)] px-3 py-2 text-center text-sm leading-[1.35] font-semibold whitespace-normal break-keep text-[#fcfcfc] shadow-[0_4px_8px_rgba(0,0,0,0.5)]";

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
    <span className={mapBadgeClassName}>{label}</span>
    {/* 세로선 31px 끝에 지름 16/3px 점. 점의 중심이 핀 끝이다. */}
    <span aria-hidden="true" className="relative h-[31px] w-px bg-[#fcfcfc]">
      <span className="absolute bottom-0 left-1/2 size-[5.333px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#fcfcfc]" />
    </span>
  </div>
);
