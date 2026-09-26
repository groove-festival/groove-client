import { type Booth, getBoothDisplayName } from "@/entities/booth";
import type { ExperienceZone, ZoneType } from "@/entities/zone";
import type { FestivalMapFocus, MapRatioPoint } from "@/shared/ui";

export type MapFilter = "all" | "pub" | "event";

export const mapFilterOptions: readonly { id: MapFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pub", label: "주막" },
  { id: "event", label: "이벤트 부스" },
];

// 배치도를 축제 부스가 모인 구역만 남기고 잘라 둔 범위 (전체 배치도 976×1128 좌표 기준).
// 잘린 그림 밖으로는 끌 수 없어 별도 경계 계산 없이도 지도가 엉뚱한 곳으로 가지 않는다.
// "전체" 필터 화면(Figma 56:3443)을 가운데 두고 사방으로 1.25배 넓혔다.
//
// ⚠️ 범위를 바꿀 때는 width:height 를 반드시 지도 박스와 같은 361:540 으로 맞춘다.
//    height = width * 540 / 361 (폭 270 이면 높이 403.878).
//    비율이 어긋나면 최소 배율에서 지도가 박스를 다 못 채워 빈 띠가 생긴다.
//
// ⚠️ 바꾸면 같은 값을 festival-visuals/main-map-*.svg 3장의 viewBox 와
//    MainMapLayer 의 svg viewBox 에 함께 반영한다.
export const MAIN_MAP_CROP = {
  x: 523.6,
  y: 484.3,
  width: 270,
  height: 403.878,
} as const;
const FULL_MAP = { width: 976, height: 1128 } as const;

export const MAIN_MAP_VIEW_BOX = [
  MAIN_MAP_CROP.x,
  MAIN_MAP_CROP.y,
  MAIN_MAP_CROP.width,
  MAIN_MAP_CROP.height,
].join(" ");

// 배율 1은 잘라낸 배치도가 지도 박스에 전부 들어오는 상태다.
export const MIN_SCALE = 1;
export const MAX_SCALE = 5;
// 장소를 눌렀을 때. Figma 핀 시안(56:3870 등)의 배치도 폭 4646 을 잘린 그림 기준으로 옮긴 값이다.
export const SELECTED_SCALE = 3.56;

// 배치도 위의 점(전체 배치도 px)을 잘린 그림 기준 비율로 옮긴다.
const fromMapPoint = (x: number, y: number): MapRatioPoint => ({
  xRatio: (x - MAIN_MAP_CROP.x) / MAIN_MAP_CROP.width,
  yRatio: (y - MAIN_MAP_CROP.y) / MAIN_MAP_CROP.height,
});

// API 좌표는 캠퍼스 배치도 전체 기준 비율이라 잘라낸 그림 기준으로 옮긴다.
export const toCropRatio = ({ xRatio, yRatio }: MapRatioPoint): MapRatioPoint =>
  fromMapPoint(xRatio * FULL_MAP.width, yRatio * FULL_MAP.height);

// 필터마다 보는 자리. 중심은 Figma 필터 시안(전체 56:3443 · 주막 56:3659 ·
// 이벤트 부스 56:3679)의 지도 위치에서 잰 값이다. 시안은 세 화면의 배율이 같지만
// 필터를 고르면 조금 당겨 보이도록 주막·이벤트 부스만 배율을 올렸다.
const filterViews: Record<MapFilter, { x: number; y: number; scale: number }> = {
  all: { x: 658.54, y: 686.24, scale: 1.25 },
  pub: { x: 706.41, y: 688.04, scale: 1.6 },
  event: { x: 612.47, y: 668.31, scale: 1.6 },
};

export const getFilterView = (filter: MapFilter): FestivalMapFocus => {
  const { x, y, scale } = filterViews[filter];
  return { ...fromMapPoint(x, y), scale };
};

// SVG 가 내보낸 matrix(a b c d e f) 여섯 값.
type Matrix = readonly [number, number, number, number, number, number];

// 지도 위 장소 도형. 누르는 자리와 지도가 옮겨 갈 중심을 모두 여기서 얻는다.
// 좌표는 모두 전체 배치도(976×1128) px 이다.
export type MapShape =
  | { kind: "rect"; width: number; height: number; matrix: Matrix }
  | { kind: "polygon"; points: readonly (readonly [number, number])[] };

const rect = (width: number, height: number, matrix: Matrix): MapShape => ({
  kind: "rect",
  width,
  height,
  matrix,
});

// 디자인이 rotate(각도 x y) 로 내보낸 사각형. 같은 변환을 matrix 로 옮겨 한 가지로 다룬다.
const rotatedRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  degrees: number,
): MapShape => {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return rect(width, height, [cos, sin, -sin, cos, x, y]);
};

export const getShapeCenter = (shape: MapShape) => {
  if (shape.kind === "polygon") {
    const xs = shape.points.map(([x]) => x);
    const ys = shape.points.map(([, y]) => y);
    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    };
  }

  const [a, b, c, d, e, f] = shape.matrix;
  const u = shape.width / 2;
  const v = shape.height / 2;
  return { x: a * u + c * v + e, y: b * u + d * v + f };
};

// 주막 도형 (festival-visuals/main-map-pubs.svg). 주막 지도(pages/booth-list 의
// pubShapes)와 같은 디자인 도형이라, 도형 중심을 그쪽 좌표와 대조해 boothCode 를 붙였다
// (22개 모두 0.1px 안쪽으로 일치). 디자인이 배치를 바꾸면 두 곳을 함께 갱신한다.
const PARKING_ROW = [0.814657, 0.579943, -0.579788, 0.814768] as const;
const WELFARE_ROW = [0.985355, 0.170518, -0.170329, 0.985387] as const;

const pubRect = (
  row: readonly [number, number, number, number],
  width: number,
  height: number,
  x: number,
  y: number,
) => rect(width, height, [...row, x, y]);

const pubShapes: Record<string, MapShape> = {
  "elec-eh": pubRect(PARKING_ROW, 34.6781, 5.55196, 649, 683.58),
  ocean: pubRect(PARKING_ROW, 16.3191, 5.55196, 677.931, 704.193),
  geology: pubRect(PARKING_ROW, 18.359, 5.55196, 695.716, 716.865),
  "edu-kor-home": pubRect(PARKING_ROW, 20.3989, 5.55196, 711.355, 728.009),
  "elec-b-design": pubRect(PARKING_ROW, 28.5584, 5.55196, 728.657, 740.337),
  biotech: pubRect(PARKING_ROW, 12.2393, 5.55196, 656.216, 701.32),
  physics: pubRect(PARKING_ROW, 12.4869, 5.55196, 666.87, 708.911),
  cse: pubRect(PARKING_ROW, 16.3191, 5.55196, 677.727, 716.648),
  "elec-cd": pubRect(PARKING_ROW, 28.5584, 5.55196, 695.5, 729.312),
  "lis-geo": pubRect(PARKING_ROW, 32.6382, 5.55196, 719.446, 746.373),
  "welfare-mobile": pubRect(PARKING_ROW, 16.3191, 11.1039, 664.833, 730.181),
  "music-elec-a": pubRect(PARKING_ROW, 16.3191, 11.1039, 678.813, 740.143),
  nursing: pubRect(PARKING_ROW, 32.6382, 11.1039, 694.739, 751.489),
  "socio-elec": pubRect(PARKING_ROW, 16.3191, 11.1039, 722.011, 770.921),
  "edu-math-bio": pubRect(PARKING_ROW, 18.359, 5.55196, 693.382, 770.97),
  "edu-pe-eng": pubRect(PARKING_ROW, 20.3989, 5.55196, 709.028, 782.104),
  "elec-f": pubRect(WELFARE_ROW, 23.2705, 6.33353, 676.306, 594.011),
  psych: pubRect(WELFARE_ROW, 23.2705, 6.33353, 700.184, 598.153),
  "fine-art": pubRect(WELFARE_ROW, 23.2705, 6.33353, 724.06, 602.296),
  "it-auto": pubRect(WELFARE_ROW, 14.2447, 6.33353, 710.078, 615),
  "edu-geo-ger": pubRect(WELFARE_ROW, 14.2447, 6.33353, 725.06, 617.6),
  "edu-chem-edu": pubRect(WELFARE_ROW, 14.2447, 6.33353, 740.042, 620.198),
};

// 체험존 도형 (festival-visuals/main-map-zones.svg). 이벤트 페이지 지도와 같은 자리다.
const zoneShapes: Record<ZoneType, MapShape> = {
  MOVE: rotatedRect(605.991, 659.145, 8.13116, 5.5, -22.7032),
  LOVE: rotatedRect(596.992, 663.144, 8.13116, 5.5, -22.7032),
  PROVE: rotatedRect(568.1, 665.398, 8.13116, 5.5, -138.615),
  RECOVER: rotatedRect(587.993, 667.143, 8.13116, 5.5, -22.7032),
  GROOVE: rotatedRect(572.835, 665, 8.13116, 5.5, 72.2177),
};

// 장소 묶음. 필터에 따라 색이 켜지는 범위가 다르다 (Figma 56:3769 설명).
// - program: 라이벌스·인스타팅 기획 부스
// - operation: 운영 부스·본부
// - stage: 가요제 무대
export type PlaceGroup = "pub" | "zone" | "program" | "operation" | "stage";

// 색이 켜져 있고 누를 수 있는 필터. 청록 부스(program·operation)는 필터와
// 상관없이 늘 청록이라, 보이는 대로 늘 누를 수 있게 둔다.
const litFilters: Record<PlaceGroup, readonly MapFilter[]> = {
  pub: ["all", "pub"],
  zone: ["all", "event"],
  program: ["all", "pub", "event"],
  operation: ["all", "pub", "event"],
  stage: ["all"],
};

export const isGroupLit = (group: PlaceGroup, filter: MapFilter) =>
  litFilters[group].includes(filter);

interface FixedPlace {
  id: string;
  label: string;
  group: PlaceGroup;
  shape: MapShape;
}

// API 가 없는 장소. 청록 네 곳은 배경 배치도(main-map-base.svg)에 이미 색이 칠해져 있고,
// 가요제 무대만 배경에서 회색이라 색을 따로 얹는다 (MainMapLayer).
export const STAGE_SHAPE: MapShape = {
  kind: "polygon",
  points: [
    [580.842, 646.312],
    [595.323, 637.287],
    [590.03, 633.833],
    [580.219, 639.948],
  ],
};

const fixedPlaces: readonly FixedPlace[] = [
  {
    id: "groove-rivals",
    label: "GROOVE RIVALS",
    group: "program",
    shape: rotatedRect(625.408, 688.998, 11.47, 5.55, 76.99),
  },
  {
    id: "groove-ticket",
    label: "GROOVE TICKET",
    group: "program",
    shape: rect(8.15956, 5.55196, [...PARKING_ROW, 635.575, 674.014]),
  },
  {
    id: "operation-booth",
    label: "운영 부스",
    group: "operation",
    shape: rect(
      16.3191,
      5.55196,
      [0.225071, 0.974342, -0.974299, 0.225258, 648.088, 711.047],
    ),
  },
  {
    id: "headquarters",
    label: "일청담 본부",
    group: "operation",
    shape: rotatedRect(565.756, 643.138, 8.13116, 5.5, 10.1769),
  },
  { id: "stage", label: "가요제 무대", group: "stage", shape: STAGE_SHAPE },
];

export interface MainMapPlace extends FixedPlace {
  // 지도가 옮겨 가고 핀이 꽂힐 자리. 잘린 그림 기준 비율이다.
  point: MapRatioPoint;
}

// API 좌표가 있으면 그 값을, 없으면 같은 디자인 도형의 중심을 쓴다.
const getPlacePoint = (
  coordinates: { xRatio: number | null; yRatio: number | null },
  shape: MapShape,
): MapRatioPoint => {
  if (coordinates.xRatio !== null && coordinates.yRatio !== null) {
    return toCropRatio({ xRatio: coordinates.xRatio, yRatio: coordinates.yRatio });
  }

  const { x, y } = getShapeCenter(shape);
  return fromMapPoint(x, y);
};

// 지도에 올릴 장소 전부. 주막은 PUB-1, 체험존은 PLAN-1 을 쓰고 (API 명세 §4),
// 나머지는 디자인 고정값이다. 도형이 없는 코드(디자인에 없는 부스)는 뺀다.
export const buildMainMapPlaces = (
  booths: readonly Booth[],
  zones: readonly ExperienceZone[],
): MainMapPlace[] => {
  const pubs = booths.flatMap((booth): MainMapPlace[] => {
    const shape = pubShapes[booth.boothCode];
    if (!shape) return [];

    return [
      {
        id: `pub:${booth.boothCode}`,
        label: getBoothDisplayName(booth),
        group: "pub",
        shape,
        point: getPlacePoint(booth, shape),
      },
    ];
  });

  const zonePlaces = zones.map((zone): MainMapPlace => ({
    id: `zone:${zone.type}`,
    label: zone.name,
    group: "zone",
    shape: zoneShapes[zone.type],
    point: getPlacePoint(zone, zoneShapes[zone.type]),
  }));

  const fixed = fixedPlaces.map((place): MainMapPlace => ({
    ...place,
    point: getPlacePoint({ xRatio: null, yRatio: null }, place.shape),
  }));

  return [...pubs, ...zonePlaces, ...fixed];
};
