import { useMemo, useState } from "react";

import { type Booth, useBooths } from "@/entities/booth";
import { type ExperienceZone, useZones } from "@/entities/zone";
import {
  buildCampusPlaces,
  CampusMap,
  type CampusMapView,
  type CampusPlace,
  getPlaceFocusWidth,
} from "@/widgets/campus-map";

import {
  CLOSEST_WIDTH,
  getFilterView,
  isGroupLit,
  MAIN_MAP_BOX,
  mapFilterOptions,
  type MapFilter,
  SELECTED_WIDTH,
} from "../model/mainMap";

const NO_BOOTHS: Booth[] = [];
const NO_ZONES: ExperienceZone[] = [];

export const FestivalMapSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<MapFilter>("all");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [focus, setFocus] = useState<CampusMapView | null>(null);

  const { data: booths = NO_BOOTHS } = useBooths();
  const { data: zones = NO_ZONES } = useZones();
  const places = useMemo(() => buildCampusPlaces(booths, zones), [booths, zones]);

  const selectFilter = (filter: MapFilter) => {
    setSelectedFilter(filter);
    setSelectedPlaceId(null);
    setFocus(getFilterView(filter));
  };

  const selectPlace = (place: CampusPlace | null) => {
    setSelectedPlaceId(place?.id ?? null);

    if (place) {
      setFocus({ ...place.point, width: getPlaceFocusWidth(place, SELECTED_WIDTH) });
    }
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

      <CampusMap
        bordered
        box={MAIN_MAP_BOX}
        className="rounded-3xl bg-[#1c1c1c]"
        closestWidth={CLOSEST_WIDTH}
        controlsClassName="right-[9px] bottom-3 gap-3"
        focus={focus}
        initialView={getFilterView("all")}
        isLit={(place) => isGroupLit(place.group, selectedFilter)}
        onSelect={selectPlace}
        places={places}
        resetTo={getFilterView(selectedFilter)}
        selectedId={selectedPlaceId}
      />
    </div>
  );
};
