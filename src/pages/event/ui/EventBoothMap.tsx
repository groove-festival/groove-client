import { FestivalMap } from "@/shared/ui";

import mapBase from "../festival-visuals/map-base.svg";
import {
  getZoneFocus,
  getZonesCenter,
  type ExperienceZone,
  type ZoneType,
} from "../model/zones";
import { ZoneBoothLayer } from "./ZoneBoothLayer";

// 배율 1은 잘라낸 배치도가 지도 박스에 전부 들어오는 상태다.
// 처음 배율은 이전 정적 지도의 프레이밍을 실측해 맞췄다.
const INITIAL_SCALE = 1.794;
// 잘라낸 구역 전체가 보이는 상태.
const MIN_SCALE = 1;
const MAX_SCALE = 5.52;
// 선택한 부스를 키우면서 이웃 부스는 화면에 남긴다. 5개가 좁게 몰려 있어
// 이보다 더 당기면 위치 감각을 잃는다.
const SELECTED_SCALE = 2.484;
// 처음 화면에서 부스 묶음을 정중앙보다 아래에 둔다. 위쪽 도로와 광장이 보여야
// 부스가 캠퍼스 어디쯤인지 읽히기 때문이다. 보는 자리를 이만큼 위로 올리면
// 지도가 그만큼 내려온다. 잘린 높이에 대한 비율이라 CROP.height 를 바꾸면
// 화면상 같은 위치를 유지하도록 이 값도 함께 조정한다 (내림폭 ÷ CROP.height).
const INITIAL_CENTER_LIFT = 0.0659;

// 배치도를 부스 구역만 남기고 잘라 둔 범위 (전체 배치도 976×1128 좌표 기준).
// 잘린 그림 밖으로는 끌 수 없어 별도 경계 계산 없이도 지도가 엉뚱한 곳으로 가지 않는다.
//
// ⚠️ 범위를 바꿀 때는 width:height 를 반드시 지도 박스와 같은 361:320 으로 맞춘다.
//    height = width * 320 / 361 (폭 138 이면 높이 122.327).
//    비율이 어긋나면 최소 배율에서 지도가 박스를 다 못 채워 위아래나 좌우에
//    빈 띠가 생긴다.
//
// ⚠️ 바꾸면 같은 값을 아래 세 곳에 함께 반영한다.
//    ① 배경·부스 SVG 6장의 viewBox (festival-visuals/map-base.svg, booth-*.svg)
//    ② ZoneBoothLayer 의 MAP_VIEW_BOX (누르는 자리를 도형에 맞추기 위해)
//    ③ INITIAL_CENTER_LIFT (잘린 높이가 바뀌면 같은 화면 위치를 유지하도록 보정)
// 최소 상태 시안(Figma 51:2692)에서 클리핑 박스와 지도 노드 위치를 재어 옮긴 값이다.
const CROP = { x: 527.2, y: 592.6, width: 138, height: 122.327 } as const;
const FULL_MAP = { width: 976, height: 1128 } as const;

const MAP_SOURCE = {
  src: mapBase,
  width: CROP.width,
  height: CROP.height,
  alt: "체험존 부스가 표시된 배치도",
};

// API 좌표는 캠퍼스 배치도 전체 기준이라 잘라낸 그림 기준으로 옮긴다.
const toCropRatio = ({ xRatio, yRatio }: { xRatio: number; yRatio: number }) => ({
  xRatio: (xRatio * FULL_MAP.width - CROP.x) / CROP.width,
  yRatio: (yRatio * FULL_MAP.height - CROP.y) / CROP.height,
});

interface EventBoothMapProps {
  zones: readonly ExperienceZone[];
  selectedZone: ZoneType | null;
  onSelect: (zone: ZoneType | null) => void;
}

// 이벤트 부스 지도. 배경 배치도 위에 부스 레이어를 겹쳐 그리고, 부스나 카드를
// 고르면 그 자리로 확대·이동한다. 레이어는 지도와 함께 움직인다.
export const EventBoothMap = ({
  zones,
  selectedZone,
  onSelect,
}: EventBoothMapProps) => {
  const focus = getZoneFocus(zones, selectedZone);
  const zonesCenter = toCropRatio(getZonesCenter(zones));
  const initialCenter = {
    xRatio: zonesCenter.xRatio,
    yRatio: zonesCenter.yRatio - INITIAL_CENTER_LIFT,
  };

  return (
    <div className="relative aspect-[361/320] w-full">
      {/* 흐름에서 빼야 지도 내용이 바깥 박스의 비율(361:320)을 밀어내지 않는다. */}
      <div className="absolute inset-0">
        <FestivalMap
          className="size-full rounded-3xl bg-[#1c1c1c]"
          controlsClassName="right-[5px] bottom-[7px] gap-3"
          focus={focus && { ...toCropRatio(focus), scale: SELECTED_SCALE }}
          initialCenter={initialCenter}
          initialScale={INITIAL_SCALE}
          maxScale={MAX_SCALE}
          minScale={MIN_SCALE}
          source={MAP_SOURCE}
        >
          <ZoneBoothLayer
            onSelect={onSelect}
            selectedZone={selectedZone}
            zones={zones}
          />
        </FestivalMap>
      </div>

      {/* Figma에서 테두리는 지도 위에 그려진다. */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-[#767676]" />
    </div>
  );
};
