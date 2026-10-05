import { useMemo, useState } from "react";

import { type Booth, useBooths } from "@/entities/booth";
import {
  buildCampusPlaces,
  CampusMap,
  type CampusMapBox,
  type CampusPlace,
  getPlaceFocusWidth,
  zonePlaceId,
} from "@/widgets/campus-map";

import {
  type ExperienceZone,
  getZoneFocus,
  getZonesCenter,
  isPlacedZone,
  type ZoneType,
} from "../model/zones";

const EVENT_MAP_BOX: CampusMapBox = { width: 361, height: 320 };

const INITIAL_WIDTH = 95;

const SELECTED_WIDTH = 55.56;

const CLOSEST_WIDTH = 25;

const INITIAL_CENTER_LIFT = (8.06 * INITIAL_WIDTH) / 76.92 / 1128;

const NO_BOOTHS: Booth[] = [];

interface EventBoothMapProps {
  zones: readonly ExperienceZone[];
  selectedZone: ZoneType | null;
  onSelect: (zone: ZoneType | null) => void;
}

export const EventBoothMap = ({
  zones,
  selectedZone,
  onSelect,
}: EventBoothMapProps) => {
  const [otherPlace, setOtherPlace] = useState<CampusPlace | null>(null);

  const { data: booths = NO_BOOTHS } = useBooths();

  const places = useMemo(
    () => buildCampusPlaces(booths, zones.filter(isPlacedZone)),
    [booths, zones],
  );

  if (selectedZone !== null && otherPlace !== null) setOtherPlace(null);

  const zonesCenter = getZonesCenter(zones);
  const zoneFocus = getZoneFocus(zones, selectedZone);
  const focus =
    (zoneFocus && { ...zoneFocus, width: SELECTED_WIDTH }) ??
    (otherPlace && {
      ...otherPlace.point,
      width: getPlaceFocusWidth(otherPlace, SELECTED_WIDTH),
    });

  const selectPlace = (place: CampusPlace | null) => {
    if (place?.group === "zone") {
      setOtherPlace(null);
      onSelect(place.zoneType);
      return;
    }

    setOtherPlace(place);
    onSelect(null);
  };

  return (
    <CampusMap
      bordered
      box={EVENT_MAP_BOX}
      className="rounded-3xl bg-[#1c1c1c]"
      closestWidth={CLOSEST_WIDTH}
      controlsClassName="right-[5px] bottom-[7px] gap-3"
      focus={focus}
      initialView={{
        xRatio: zonesCenter.xRatio,
        yRatio: zonesCenter.yRatio - INITIAL_CENTER_LIFT,
        width: INITIAL_WIDTH,
      }}
      isLit={(place) =>
        place.group === "zone"
          ? selectedZone === null || place.zoneType === selectedZone
          : true
      }

      isSelectable={() => true}
      onSelect={selectPlace}
      places={places}
      selectedId={selectedZone ? zonePlaceId(selectedZone) : (otherPlace?.id ?? null)}
    />
  );
};
