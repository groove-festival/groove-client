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

// 박스 폭에 들어오는 배치도 폭 (배치도 px). 처음 화면은 이전 정적 지도의
// 프레이밍(76.92)보다 조금 넓게 잡아 주변 길과 건물이 더 보이게 했다.
const INITIAL_WIDTH = 95;
// 선택한 부스를 키우면서 이웃 부스는 화면에 남긴다. 5개가 좁게 몰려 있어
// 이보다 더 당기면 위치 감각을 잃는다. 체험존이 아닌 장소도 같은 거리로 본다.
const SELECTED_WIDTH = 55.56;
// 가장 당겼을 때.
const CLOSEST_WIDTH = 25;
// 처음 화면에서 부스 묶음을 정중앙보다 아래에 둔다. 위쪽 도로와 광장이 보여야
// 부스가 캠퍼스 어디쯤인지 읽히기 때문이다. 보는 자리를 배치도에서 위로 올리면
// 지도가 그만큼 내려온다. 화면에서 같은 자리에 오도록 처음 폭에 비례해 올린다
// (폭 76.92 일 때 8.06px, 배치도 높이 1128 에 대한 비율).
const INITIAL_CENTER_LIFT = (8.06 * INITIAL_WIDTH) / 76.92 / 1128;

const NO_BOOTHS: Booth[] = [];

interface EventBoothMapProps {
  zones: readonly ExperienceZone[];
  selectedZone: ZoneType | null;
  onSelect: (zone: ZoneType | null) => void;
}

// 이벤트 부스 지도. 캠퍼스 전체 배치도 위에서 체험존만 선택에 따라 색을 켜고 끄고,
// 주막·기획 부스·랜드마크 같은 다른 장소는 늘 켜 둔다. 부스나 카드를 고르면 그
// 자리로 확대·이동하고 이름표를 띄운다. 체험존이 아닌 장소를 누르면 체험존 선택은
// 풀고 그 장소에 이름표만 띄운다.
export const EventBoothMap = ({
  zones,
  selectedZone,
  onSelect,
}: EventBoothMapProps) => {
  // 체험존이 아닌 장소. 체험존 선택은 카드와 함께 쓰므로 쓰는 쪽이 들고 있는다.
  const [otherPlace, setOtherPlace] = useState<CampusPlace | null>(null);
  // 주막은 이 화면에서 지도에만 쓰여, 못 받으면 그 장소만 빠지고 체험존은 그대로다.
  const { data: booths = NO_BOOTHS } = useBooths();
  // 좌표를 아직 넣지 않은 존은 지도에 그리지 않는다 (API 명세 PLAN-1).
  const places = useMemo(
    () => buildCampusPlaces(booths, zones.filter(isPlacedZone)),
    [booths, zones],
  );

  // 카드에서 체험존을 고르면 다른 장소의 이름표는 닫는다. 나중에 선택을 풀어도
  // 예전 이름표가 되살아나지 않도록 값 자체를 비운다.
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
      onSelect={selectPlace}
      places={places}
      selectedId={selectedZone ? zonePlaceId(selectedZone) : (otherPlace?.id ?? null)}
    />
  );
};
