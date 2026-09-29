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

// 첨부된 기준 이미지에서 지도 박스와 배치도 도로를 대조해 잰 전체 기본 시점.
// 일청담·복지관·IT 건물 색은 그대로 보이면서 주막 두 구역과 주변 길을 함께 담는다.
const DEFAULT_VIEW: CampusMapView = {
  xRatio: 0.727,
  yRatio: 0.588,
  width: 327,
};

// 구역 버튼을 눌렀을 때 박스 폭에 들어오는 배치도 폭 (배치도 px).
// 구역마다 퍼진 정도가 달라 값이 다르다. 학생주차장은 네 줄이 비스듬히 늘어서 있고,
// 복지관은 두 줄로 짧게 모여 있다. 세 값 모두 그 구역의 주막이 지도 박스 안에
// 다 들어오는 선에서 잡았다. "전체" 는 첨부 이미지의 기본 시점으로 돌아간다.
const AREA_WIDTH: Record<PubMapArea, number> = {
  all: DEFAULT_VIEW.width,
  PARKING: 123.33,
  WELFARE_CENTER: 97.37,
};
// 주막이 아닌 장소를 눌렀을 때. 메인 지도와 같은 거리다.
const SELECTED_WIDTH = 75.84;
// 가장 당겼을 때.
const CLOSEST_WIDTH = 46.25;
// 지명 뱃지가 [사라지는 폭, 다 보이는 폭]. 주막 지도는 처음 화면(185)부터 지명을
// 보여 주고, 거기서 한 번만 줄여도(185 → 296) 숨긴다.
const LABEL_WIDTHS = [240, 190] as const;

const NO_ZONES: ExperienceZone[] = [];
const HIDDEN_PUB_MAP_GROUPS: ReadonlySet<PlaceGroup> = new Set([
  "program",
  "operation",
]);

interface PubBoothMapProps {
  booths: readonly Booth[];
  // 지금 색을 남길 자리(spotCode)들.
  highlightedCodes: ReadonlySet<string>;
  // 회색이어도 새로 선택할 수 있는 자리들. 현재 구역·단대 필터 결과다.
  selectableCodes: ReadonlySet<string>;
  // 구역은 목록도 함께 거르므로 고른 값을 쓰는 쪽이 들고 있는다.
  selectedArea: PubMapArea;
  selectedSpotCode: string | null;
  onSelectArea: (area: PubMapArea) => void;
  onSelectSpot: (spotCode: string) => void;
}

// 주막 지도. 캠퍼스 전체 배치도 위에서 주막만 필터와 선택에 따라 색을 켜고 끈다.
// 주막 옆 이벤트·운영 부스는 숨기되 일청담 같은 랜드마크 색과 체험존은 유지한다. 한 주막을 골라 나머지가
// 회색이 되어도 필터를 통과한 주막은 눌러서 바꿔 고를 수 있다. 구역 버튼을 누르면
// 같은 배치도의 그 구역으로 확대·이동한다 (PUB-1 §배치도 좌표 기준).
export const PubBoothMap = ({
  booths,
  highlightedCodes,
  onSelectArea,
  onSelectSpot,
  selectableCodes,
  selectedArea,
  selectedSpotCode,
}: PubBoothMapProps) => {
  // 처음 화면은 initialView 가 잡으므로, 버튼이나 장소를 누른 뒤에만 지도를 옮긴다.
  const [focus, setFocus] = useState<CampusMapView | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  // 체험존은 이 화면에서 지도에만 쓰여, 못 받으면 그 장소만 빠지고 목록은 그대로다.
  const { data: zones = NO_ZONES } = useZones();
  const places = useMemo(() => buildCampusPlaces(booths, zones), [booths, zones]);

  const getAreaView = (area: PubMapArea): CampusMapView =>
    area === "all"
      ? DEFAULT_VIEW
      : {
          ...getPubAreaCenter(booths, area),
          width: AREA_WIDTH[area],
        };

  // 목록에서 주막 선택이 풀리면 지도의 주막 핀 선택도 푼다. Effect로 하면 한
  // 번 그린 뒤 다시 그리므로, 선택이 바뀐 렌더에서 바로 맞춘다.
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
            // 아래 단대 필터에도 "전체" 버튼이 있어 이름만으로는 구분되지 않는다.
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
