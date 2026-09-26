import type { CSSProperties } from "react";

import { MAP_SCALE_VARIABLE } from "./FestivalMap";
import type { MapRatioPoint } from "./mapGeometry";
import { mapBadgeClassName } from "./MapPin";

interface MapLabelProps {
  // 글자 한가운데가 놓일 자리. FestivalMap 의 source 크기에 대한 비율이다.
  point: MapRatioPoint;
  label: string;
  // [이 배율 이하에서 사라짐, 이 배율부터 다 보임]. 사이에서는 배율에 따라 서서히
  // 나타난다. 멀리 볼 때 이름끼리 겹치지 않게 하려는 것으로, 없으면 늘 보인다.
  visibleScale?: readonly [hidden: number, shown: number];
}

// 지도에 적어 두는 지명 뱃지. 눌러서 뜨는 핀(MapPin)과 같은 이름표를 꼬리 없이
// 자리 한가운데에 얹는다. FestivalMap 의 children 안에 두면 확대해도 크기가 같다.
// 배율은 CSS 변수로만 읽어 확대하는 동안에도 다시 그리지 않는다.
export const MapLabel = ({ point, label, visibleScale }: MapLabelProps) => {
  const scale = `var(${MAP_SCALE_VARIABLE}, 1)`;
  const opacity = visibleScale
    ? `clamp(0, calc((${scale} - ${visibleScale[0]}) / ${visibleScale[1] - visibleScale[0]}), 1)`
    : undefined;

  return (
    <span
      // 누르는 자리의 이름으로 이미 알리므로 보조기술에는 한 번만 읽힌다.
      aria-hidden="true"
      className={`pointer-events-none absolute origin-center select-none ${mapBadgeClassName}`}
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
      {label}
    </span>
  );
};
