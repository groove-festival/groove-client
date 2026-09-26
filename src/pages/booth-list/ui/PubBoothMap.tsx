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
} from "@/widgets/campus-map";

import {
  getPubAreaCenter,
  getPubsCenter,
  pubMapAreaOptions,
  type PubMapArea,
} from "../model/pubMap";

const PUB_MAP_BOX: CampusMapBox = { width: 361, height: 448 };

// 처음 화면과 구역 버튼을 눌렀을 때 박스 폭에 들어오는 배치도 폭 (배치도 px).
// 구역마다 퍼진 정도가 달라 값이 다르다. 학생주차장은 네 줄이 비스듬히 늘어서 있고,
// 복지관은 두 줄로 짧게 모여 있다. 세 값 모두 그 구역의 주막이 지도 박스 안에
// 다 들어오는 선에서 잡았다. "전체" 는 주막 22개가 다 들어오는 처음 화면이다.
const AREA_WIDTH: Record<PubMapArea, number> = {
  all: 185,
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

interface PubBoothMapProps {
  booths: readonly Booth[];
  // 지금 색을 남길 주막들. 단일 주막을 고르면 그 한 곳만 들어온다.
  highlightedCodes: ReadonlySet<string>;
  // 회색이어도 새로 선택할 수 있는 주막들. 현재 구역·단대 필터 결과다.
  selectableCodes: ReadonlySet<string>;
  // 구역은 목록도 함께 거르므로 고른 값을 쓰는 쪽이 들고 있는다.
  selectedArea: PubMapArea;
  onSelectArea: (area: PubMapArea) => void;
  // 색이 들어온 주막을 눌렀을 때. 목록과 지도에 그 주막만 남긴다.
  onSelectBooth: (boothCode: string) => void;
}

// 주막 지도. 캠퍼스 전체 배치도 위에서 주막만 필터와 선택에 따라 색을 켜고 끄고,
// 체험존·기획 부스·랜드마크 같은 다른 장소는 늘 켜 둔다. 한 주막을 골라 나머지가
// 회색이 되어도 필터를 통과한 주막은 눌러서 바꿔 고를 수 있다. 구역 버튼을 누르면
// 같은 배치도의 그 구역으로 확대·이동한다 (PUB-1 §배치도 좌표 기준).
export const PubBoothMap = ({
  booths,
  highlightedCodes,
  onSelectArea,
  onSelectBooth,
  selectableCodes,
  selectedArea,
}: PubBoothMapProps) => {
  // 처음 화면은 initialView 가 잡으므로, 버튼이나 장소를 누른 뒤에만 지도를 옮긴다.
  const [focus, setFocus] = useState<CampusMapView | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  // 체험존은 이 화면에서 지도에만 쓰여, 못 받으면 그 장소만 빠지고 목록은 그대로다.
  const { data: zones = NO_ZONES } = useZones();
  const places = useMemo(() => buildCampusPlaces(booths, zones), [booths, zones]);

  const getAreaView = (area: PubMapArea): CampusMapView => ({
    ...getPubAreaCenter(booths, area),
    width: AREA_WIDTH[area],
  });

  const selectArea = (area: PubMapArea) => {
    onSelectArea(area);
    setSelectedPlaceId(null);
    setFocus(getAreaView(area));
  };

  const selectPlace = (place: CampusPlace | null) => {
    // 주막은 목록과 지도에 그 주막만 남기고 필터 칩에 이름을 띄우므로, 지도에는
    // 핀을 따로 띄우지 않고 보던 자리도 그대로 둔다.
    if (place?.group === "pub") {
      setSelectedPlaceId(null);
      onSelectBooth(place.boothCode);
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
        initialView={{ ...getPubsCenter(booths), width: AREA_WIDTH.all }}
        labelWidths={LABEL_WIDTHS}
        isLit={(place) =>
          place.group === "pub" ? highlightedCodes.has(place.boothCode) : true
        }
        keepDimmedPubNumbers
        isSelectable={(place) =>
          place.group === "pub" ? selectableCodes.has(place.boothCode) : true
        }
        onSelect={selectPlace}
        places={places}
        resetTo={getAreaView(selectedArea)}
        selectedId={selectedPlaceId}
      />
    </section>
  );
};
