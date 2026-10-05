import { useMemo, useState } from "react";

import type { Booth } from "@/entities/booth";
import { type ExperienceZone, useZones } from "@/entities/zone";
import {
  buildCampusPlaces,
  CampusMap,
  type CampusMapBox,
  type CampusMapView,
  type CampusPlace,
  getPlaceFocusWidth,
  type PlaceGroup,
} from "@/widgets/campus-map";

import { getPubAreaCenter, pubMapAreaOptions, type PubMapArea } from "../model/pubMap";

const PUB_MAP_BOX: CampusMapBox = { width: 361, height: 448 };

const DEFAULT_VIEW: CampusMapView = {
  xRatio: 0.727,
  yRatio: 0.588,
  width: 327,
};

const AREA_WIDTH: Record<PubMapArea, number> = {
  all: DEFAULT_VIEW.width,
  PARKING: 123.33,
  WELFARE_CENTER: 97.37,
};

const SELECTED_WIDTH = 75.84;

const CLOSEST_WIDTH = 46.25;

const LABEL_WIDTHS = [240, 190] as const;

const NO_ZONES: ExperienceZone[] = [];
const HIDDEN_PUB_MAP_GROUPS: ReadonlySet<PlaceGroup> = new Set([
  "program",
  "operation",
]);

interface PubBoothMapProps {
  booths: readonly Booth[];

  highlightedCodes: ReadonlySet<string>;

  selectableCodes: ReadonlySet<string>;

  selectedArea: PubMapArea;
  selectedSpotCode: string | null;
  onSelectArea: (area: PubMapArea) => void;

  onSelectSpot: (spotCode: string) => void;
}

export const PubBoothMap = ({
  booths,
  highlightedCodes,
  onSelectArea,
  onSelectSpot,
  selectableCodes,
  selectedArea,
  selectedSpotCode,
}: PubBoothMapProps) => {
  const [focus, setFocus] = useState<CampusMapView | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const { data: zones = NO_ZONES } = useZones();
  const places = useMemo(() => buildCampusPlaces(booths, zones), [booths, zones]);

  const getAreaView = (area: PubMapArea): CampusMapView =>
    area === "all"
      ? DEFAULT_VIEW
      : {
          ...getPubAreaCenter(booths, area),
          width: AREA_WIDTH[area],
        };

  const [prevSelectedSpotCode, setPrevSelectedSpotCode] = useState(selectedSpotCode);
  if (prevSelectedSpotCode !== selectedSpotCode) {
    setPrevSelectedSpotCode(selectedSpotCode);
    if (selectedSpotCode === null && selectedPlaceId?.startsWith("pub:")) {
      setSelectedPlaceId(null);
    }
    if (selectedSpotCode !== null) {
      const place = places.find(
        (candidate) =>
          candidate.group === "pub" && candidate.spotCode === selectedSpotCode,
      );
      if (place) {
        setSelectedPlaceId(place.id);
        setFocus({ ...place.point, width: getPlaceFocusWidth(place, SELECTED_WIDTH) });
      }
    }
  }

  const selectArea = (area: PubMapArea) => {
    onSelectArea(area);
    setSelectedPlaceId(null);
    setFocus(getAreaView(area));
  };

  const selectPlace = (place: CampusPlace | null) => {
    if (place?.group === "pub") {
      setSelectedPlaceId(place.id);
      setFocus({ ...place.point, width: getPlaceFocusWidth(place, SELECTED_WIDTH) });
      onSelectSpot(place.spotCode);
      return;
    }

    setSelectedPlaceId(place?.id ?? null);
    if (!place) return;

    setFocus({ ...place.point, width: getPlaceFocusWidth(place, SELECTED_WIDTH) });
  };

  return (
    <section aria-label="주막 지도" className="flex w-full flex-col gap-3">
      <div
        aria-label="지도 구역"
        className="festival-glass flex w-full gap-3 rounded-full p-2 backdrop-blur-[2px]"
        role="group"
      >
        {pubMapAreaOptions.map(({ id, label }) => (
          <button
            aria-label={`지도에서 ${label} 보기`}
            aria-pressed={id === selectedArea}
            className={`flex min-w-0 flex-1 items-center justify-center rounded-full px-5 py-3 text-base leading-[normal] font-semibold whitespace-nowrap transition-transform duration-150 ease-out active:scale-95 motion-reduce:transition-none ${
              id === selectedArea
                ? "bg-[rgba(207,255,4,0.8)] text-[#1c1c1c] shadow-[inset_0_1px_0_rgb(252_252_252/0.3)]"
                : "text-[#a2a2a2]"
            }`}
            key={id}
            onClick={() => selectArea(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <CampusMap
        box={PUB_MAP_BOX}
        className="rounded-3xl bg-[#1c1c1c]"
        closestWidth={CLOSEST_WIDTH}
        controlsClassName="right-[5px] bottom-[7px] gap-3"
        focus={focus}
        getActionLabel={(place) =>
          place.group === "pub"
            ? `${place.label} 주막만 보기`
            : `${place.label} 위치 보기`
        }
        initialView={DEFAULT_VIEW}
        isVisible={(place) => !HIDDEN_PUB_MAP_GROUPS.has(place.group)}
        labelWidths={LABEL_WIDTHS}
        isLit={(place) =>
          place.group === "pub" ? highlightedCodes.has(place.spotCode) : true
        }
        keepDimmedPubNumbers
        isSelectable={(place) =>
          place.group === "pub" ? selectableCodes.has(place.spotCode) : true
        }
        onSelect={selectPlace}
        places={places}
        resetTo={getAreaView(selectedArea)}
        selectedId={selectedPlaceId}
      />
    </section>
  );
};
