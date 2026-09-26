import { FestivalMap } from "@/shared/ui";

import { CAMPUS_MAP_ALT, CAMPUS_MAP_SIZE } from "../model/places";
import {
  type CampusMapBox,
  type CampusMapView,
  getViewScale,
  toMapFocus,
} from "../model/view";
import { CampusMapLayer, type CampusMapLayerProps } from "./CampusMapLayer";

// 지명 뱃지는 충분히 당겼을 때만 띄운다. 멀리서는 뱃지가 지도를 가리고 서로 겹친다.
// [박스 폭에 배치도가 이만큼(배치도 px) 들어올 만큼 멀어지면 사라짐, 이만큼 당기면
// 다 보임]. 기본값은 메인 처음 화면(216)에서는 숨고, 확대 버튼을 한 번만 누르거나
// (216 → 135) 주막·이벤트 부스 필터를 고르면(140) 선명하게 보이는 선이다.
const DEFAULT_LABEL_WIDTHS = [170, 140] as const;

// 배치도 그림은 장소 레이어가 같은 SVG 안에 직접 그린다 (CampusMapLayer).
const CAMPUS_MAP_SOURCE = {
  width: CAMPUS_MAP_SIZE.width,
  height: CAMPUS_MAP_SIZE.height,
  alt: CAMPUS_MAP_ALT,
};

interface CampusMapProps extends Omit<CampusMapLayerProps, "labelVisibleScale"> {
  // 지도 박스의 시안 크기. 박스는 폭을 꽉 채우고 이 비율을 지킨다.
  box: CampusMapBox;
  initialView: CampusMapView;
  // 가장 당겼을 때 박스 폭에 들어오는 배치도 폭 (배치도 px).
  closestWidth: number;
  // 값이 바뀔 때마다 그 자리로 옮긴다. null 이면 그대로 둔다.
  focus?: CampusMapView | null;
  // 되돌리기 버튼이 돌아갈 자리. 없으면 처음 화면이다.
  resetTo?: CampusMapView | null;
  // 박스 모서리·배경은 화면마다 시안이 달라 쓰는 쪽이 정한다.
  className?: string;
  controlsClassName?: string;
  // Figma 에서 테두리가 지도 위에 그려지는 화면이면 켠다.
  bordered?: boolean;
  // 지명 뱃지가 [사라지는 폭, 다 보이는 폭] (배치도 px). 처음 화면부터 지명을
  // 보여야 하는 화면은 넓혀 넘긴다.
  labelWidths?: readonly [hidden: number, shown: number];
}

// 축제 캠퍼스 지도. 배치도 전체를 넣어 어디든 끌어 볼 수 있고, 가장 멀리 보면
// 박스를 빈틈없이 덮는 데까지 줄어든다. 어떤 장소를 켤지, 누르면 무엇을 할지는
// 메인·주막·이벤트 화면이 각자 정한다.
export const CampusMap = ({
  box,
  initialView,
  closestWidth,
  focus = null,
  resetTo = null,
  className = "",
  controlsClassName = "",
  bordered = false,
  labelWidths = DEFAULT_LABEL_WIDTHS,
  ...layerProps
}: CampusMapProps) => (
  <div
    className="relative w-full"
    style={{ aspectRatio: `${box.width} / ${box.height}` }}
  >
    {/* 흐름에서 빼야 지도 내용이 바깥 박스의 비율을 밀어내지 않는다. */}
    <div className="absolute inset-0">
      <FestivalMap
        className={`size-full ${className}`}
        controlsClassName={controlsClassName}
        focus={focus && toMapFocus(box, focus)}
        initialCenter={initialView}
        initialScale={getViewScale(box, initialView.width)}
        maxScale={getViewScale(box, closestWidth)}
        resetTo={resetTo && toMapFocus(box, resetTo)}
        source={CAMPUS_MAP_SOURCE}
      >
        <CampusMapLayer
          labelVisibleScale={[
            getViewScale(box, labelWidths[0]),
            getViewScale(box, labelWidths[1]),
          ]}
          {...layerProps}
        />
      </FestivalMap>
    </div>

    {bordered && (
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-[#767676]" />
    )}
  </div>
);
