import { useState } from "react";

import type { Booth } from "@/entities/booth";
import { FestivalMap, type FestivalMapFocus, type MapRatioPoint } from "@/shared/ui";

import campusMap from "../festival-visuals/campus-map.svg";
import {
  getPubAreaCenter,
  getPubsCenter,
  pubMapAreaOptions,
  type PubMapArea,
} from "../model/pubMap";
import { PubBoothLayer } from "./PubBoothLayer";

// 배치도를 주막이 있는 구역만 남기고 잘라 둔 범위 (전체 배치도 976×1128 좌표 기준).
// 잘린 그림 밖으로는 끌 수 없어 별도 경계 계산 없이도 지도가 엉뚱한 곳으로 가지 않는다.
//
// ⚠️ 범위를 바꿀 때는 width:height 를 반드시 지도 박스와 같은 361:448 로 맞춘다.
//    height = width * 448 / 361 (폭 185 이면 높이 229.584).
//    비율이 어긋나면 최소 배율에서 지도가 박스를 다 못 채워 빈 띠가 생긴다.
//
// ⚠️ 바꾸면 같은 값을 아래 두 곳에 함께 반영한다.
//    ① 배경·주막 SVG 2장의 viewBox (festival-visuals/campus-map.svg, pub-booths-active.svg)
//    ② `model/pubShapes.ts` 의 clipPath (잘린 그림 기준 비율이다)
const CROP = { x: 607.4, y: 581.5, width: 185, height: 229.584 } as const;
const FULL_MAP = { width: 976, height: 1128 } as const;

const MAP_SOURCE = {
  src: campusMap,
  width: CROP.width,
  height: CROP.height,
  alt: "주막 위치가 표시된 캠퍼스 배치도",
};

// 배율 1은 잘라낸 배치도가 지도 박스에 전부 들어오는 상태다.
// 주막 22개가 그 안에 다 들어오므로 처음 화면이 곧 전체 보기다.
const INITIAL_SCALE = 1;
// 잘라낸 구역 전체가 보이는 상태.
const MIN_SCALE = 1;
const MAX_SCALE = 4;

// API 좌표는 캠퍼스 배치도 전체 기준이라 잘라낸 그림 기준으로 옮긴다.
const toCropRatio = ({ xRatio, yRatio }: MapRatioPoint): MapRatioPoint => ({
  xRatio: (xRatio * FULL_MAP.width - CROP.x) / CROP.width,
  yRatio: (yRatio * FULL_MAP.height - CROP.y) / CROP.height,
});

// 구역 버튼을 눌렀을 때의 배율. 구역마다 퍼진 정도가 달라 값이 다르다.
// 학생주차장은 네 줄이 비스듬히 늘어서 있고, 복지관은 두 줄로 짧게 모여 있다.
// 세 값 모두 그 구역의 주막이 지도 박스 안에 다 들어오는 선에서 잡았다.
const AREA_SCALE: Record<PubMapArea, number> = {
  all: INITIAL_SCALE,
  PARKING: 1.5,
  WELFARE_CENTER: 1.9,
};

interface PubBoothMapProps {
  booths: readonly Booth[];
  // 지금 색을 남길 주막들. 구역·단대 필터를 모두 거친 결과가 그대로 들어온다.
  highlightedCodes: ReadonlySet<string>;
  // 구역은 목록도 함께 거르므로 고른 값을 쓰는 쪽이 들고 있는다.
  selectedArea: PubMapArea;
  onSelectArea: (area: PubMapArea) => void;
  // 색이 들어온 주막을 눌렀을 때. 목록의 그 카드로 데려간다.
  onSelectBooth: (boothCode: string) => void;
}

// 주막 지도. 배경 배치도 위에 주막 레이어를 겹쳐 그리고, 구역 버튼을 누르면
// 배치도를 갈아끼우는 대신 같은 배치도의 그 구역으로 확대·이동한다 (PUB-1 §배치도 좌표 기준).
export const PubBoothMap = ({
  booths,
  highlightedCodes,
  onSelectArea,
  onSelectBooth,
  selectedArea,
}: PubBoothMapProps) => {
  // 처음 화면은 initialCenter 가 잡으므로, 버튼을 누른 뒤에만 지도를 옮긴다.
  const [focus, setFocus] = useState<FestivalMapFocus | null>(null);

  const selectArea = (area: PubMapArea) => {
    onSelectArea(area);
    setFocus({
      ...toCropRatio(getPubAreaCenter(booths, area)),
      scale: AREA_SCALE[area],
    });
  };

  return (
    <section aria-label="주막 지도" className="flex w-full flex-col gap-3">
      <div
        aria-label="지도 구역"
        className="grid h-[59px] grid-cols-3 gap-2 rounded-full border border-[#767676] bg-[rgba(252,252,252,0.1)] p-2"
        role="group"
      >
        {pubMapAreaOptions.map(({ id, label }) => (
          <button
            // 아래 단대 필터에도 "전체" 버튼이 있어 이름만으로는 구분되지 않는다.
            aria-label={`지도에서 ${label} 보기`}
            aria-pressed={id === selectedArea}
            className={`flex items-center justify-center rounded-full px-5 text-base font-semibold whitespace-nowrap ${
              id === selectedArea
                ? "bg-[rgba(207,255,4,0.8)] text-[#1c1c1c]"
                : "text-[#767676]"
            }`}
            key={id}
            onClick={() => selectArea(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative aspect-[361/448] w-full">
        {/* 흐름에서 빼야 지도 내용이 바깥 박스의 비율(361:448)을 밀어내지 않는다. */}
        <div className="absolute inset-0">
          <FestivalMap
            className="size-full rounded-3xl bg-[#1c1c1c]"
            controlsClassName="right-[5px] bottom-[7px] gap-4"
            focus={focus}
            initialCenter={toCropRatio(getPubsCenter(booths))}
            initialScale={INITIAL_SCALE}
            maxScale={MAX_SCALE}
            minScale={MIN_SCALE}
            source={MAP_SOURCE}
            zoomStepButtonSize={44}
          >
            <PubBoothLayer
              booths={booths}
              highlightedCodes={highlightedCodes}
              onSelect={onSelectBooth}
            />
          </FestivalMap>
        </div>
      </div>
    </section>
  );
};
