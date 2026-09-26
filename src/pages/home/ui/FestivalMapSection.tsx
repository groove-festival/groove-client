import { useMemo, useState } from "react";

import { type Booth, useBooths } from "@/entities/booth";
import { type ExperienceZone, useZones } from "@/entities/zone";
import { FestivalMap, type FestivalMapFocus } from "@/shared/ui";

import mapBase from "../festival-visuals/main-map-base.svg";
import {
  buildMainMapPlaces,
  getFilterView,
  MAIN_MAP_CROP,
  mapFilterOptions,
  type MapFilter,
  MAX_SCALE,
  MIN_SCALE,
  SELECTED_SCALE,
} from "../model/mainMap";
import { MainMapLayer } from "./MainMapLayer";

const MAP_SOURCE = {
  src: mapBase,
  width: MAIN_MAP_CROP.width,
  height: MAIN_MAP_CROP.height,
  alt: "축제 부스 위치가 표시된 캠퍼스 배치도",
};

const INITIAL_VIEW = getFilterView("all");

// 응답 전에도 배치도와 고정 장소는 그려야 하므로 빈 목록으로 시작한다.
// 렌더마다 새 배열을 만들면 장소 목록을 매번 다시 계산하므로 하나를 같이 쓴다.
const NO_BOOTHS: Booth[] = [];
const NO_ZONES: ExperienceZone[] = [];

// 축제 전체 지도. 필터를 고르면 그 묶음에 색이 들어오며 해당 구역으로 조금 당기고,
// 장소를 누르면 그 자리로 확대해 이름표(핀)를 띄운다 (Figma 56:3406).
// 목록을 못 받아도 지도는 그대로 두고, 그 장소들만 누를 수 없게 된다.
export const FestivalMapSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<MapFilter>("all");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  // 처음 화면은 initialCenter 가 잡으므로, 필터나 장소를 고른 뒤에만 지도를 옮긴다.
  const [focus, setFocus] = useState<FestivalMapFocus | null>(null);

  const { data: booths = NO_BOOTHS } = useBooths();
  const { data: zones = NO_ZONES } = useZones();
  const places = useMemo(() => buildMainMapPlaces(booths, zones), [booths, zones]);

  const selectFilter = (filter: MapFilter) => {
    setSelectedFilter(filter);
    setSelectedPlaceId(null);
    setFocus(getFilterView(filter));
  };

  const selectPlace = (placeId: string | null) => {
    setSelectedPlaceId(placeId);
    // 빈 곳을 눌러 핀만 닫을 때는 보던 자리를 그대로 둔다.
    const place = places.find(({ id }) => id === placeId);
    if (place) setFocus({ ...place.point, scale: SELECTED_SCALE });
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        aria-label="지도 필터"
        className="festival-glass flex w-full gap-3 rounded-full p-2 backdrop-blur-[2px]"
        role="group"
      >
        {mapFilterOptions.map(({ id, label }) => {
          const isSelected = id === selectedFilter;

          return (
            <button
              aria-pressed={isSelected}
              className={`flex min-w-0 flex-1 items-center justify-center rounded-full px-5 py-3 text-base leading-[normal] font-semibold whitespace-nowrap transition-transform duration-150 ease-out active:scale-95 motion-reduce:transition-none ${
                isSelected
                  ? "bg-[rgba(255,0,128,0.8)] text-[#fcfcfc] shadow-[inset_0_1px_0_rgb(252_252_252/0.3)]"
                  : "text-[#a2a2a2]"
              }`}
              key={id}
              onClick={() => selectFilter(id)}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="relative aspect-[361/540] w-full">
        {/* 흐름에서 빼야 지도 내용이 바깥 박스의 비율(361:540)을 밀어내지 않는다. */}
        <div className="absolute inset-0">
          <FestivalMap
            className="size-full rounded-3xl bg-[#1c1c1c]"
            controlsClassName="right-[9px] bottom-3 gap-3"
            focus={focus}
            initialCenter={INITIAL_VIEW}
            initialScale={INITIAL_VIEW.scale}
            maxScale={MAX_SCALE}
            minScale={MIN_SCALE}
            resetTo={getFilterView(selectedFilter)}
            source={MAP_SOURCE}
          >
            <MainMapLayer
              filter={selectedFilter}
              onSelect={selectPlace}
              places={places}
              selectedId={selectedPlaceId}
            />
          </FestivalMap>
        </div>

        {/* Figma에서 테두리는 지도 위에 그려진다. */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-[#767676]" />
      </div>
    </div>
  );
};
