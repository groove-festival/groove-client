import { useState } from "react";

import { MapZoomControls } from "@/shared/ui";

import mapAll from "../festival-visuals/map-all.png";
import mapEvent from "../festival-visuals/map-event.png";
import mapPub from "../festival-visuals/map-pub.png";

type MapFilter = "all" | "pub" | "event";

// 실제 지도와 마커 연동 전까지 쓰는 Figma 정적 이미지 (25:939 / 25:1245 / 25:1513).
const mapFilters: { id: MapFilter; label: string; image: string; alt: string }[] = [
  {
    id: "all",
    label: "전체",
    image: mapAll,
    alt: "주막과 이벤트 부스가 모두 표시된 축제 지도",
  },
  { id: "pub", label: "주막", image: mapPub, alt: "주막 위치가 표시된 축제 지도" },
  {
    id: "event",
    label: "이벤트 부스",
    image: mapEvent,
    alt: "이벤트 부스 위치가 표시된 축제 지도",
  },
];

export const FestivalMapSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<MapFilter>("all");
  const selectedMap =
    mapFilters.find(({ id }) => id === selectedFilter) ?? mapFilters[0];

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        aria-label="지도 필터"
        className="festival-glass flex w-full gap-3 rounded-full p-2 backdrop-blur-[2px]"
        role="group"
      >
        {mapFilters.map(({ id, label }) => {
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
              onClick={() => setSelectedFilter(id)}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="relative aspect-[361/540] w-full overflow-hidden rounded-3xl border border-[#767676] bg-[#1c1c1c]">
        <img
          alt={selectedMap.alt}
          className="size-full object-cover"
          src={selectedMap.image}
        />
        <MapZoomControls className="absolute right-2 bottom-[11px] gap-3" />
      </div>
    </div>
  );
};
