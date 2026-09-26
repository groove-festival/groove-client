import type { CampusMapBox, CampusMapView, PlaceGroup } from "@/widgets/campus-map";

export type MapFilter = "all" | "pub" | "event";

export const mapFilterOptions: readonly { id: MapFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pub", label: "주막" },
  { id: "event", label: "이벤트 부스" },
];

// 메인 지도 박스 (Figma 56:3443).
export const MAIN_MAP_BOX: CampusMapBox = { width: 361, height: 540 };

// 배치도 px 로 적은 자리를 지도 화면으로 옮긴다.
const view = (x: number, y: number, width: number): CampusMapView => ({
  xRatio: x / 976,
  yRatio: y / 1128,
  width,
});

// 필터마다 보는 자리. 중심과 폭은 Figma 필터 시안(전체 56:3443 · 주막 56:3659 ·
// 이벤트 부스 56:3679)의 지도 위치에서 잰 값이다. 시안은 세 화면의 확대 정도가 같지만
// 필터를 고르면 당겨 보이도록 주막·이벤트 부스는 폭을 140 으로 좁혔다. 랜드마크
// 지명 뱃지가 선명하게 보이는 폭이고, 주막은 22개가 위아래로 다 들어오도록 중심을
// 주막 묶음 한가운데(y 695.5)로 내렸다.
const filterViews: Record<MapFilter, CampusMapView> = {
  all: view(658.54, 686.24, 216.02),
  pub: view(706.41, 695.5, 140),
  event: view(612.47, 668.31, 140),
};

export const getFilterView = (filter: MapFilter) => filterViews[filter];

// 장소를 눌렀을 때. Figma 핀 시안(56:3870 등)에서 박스 폭에 들어오는 배치도 폭이다.
export const SELECTED_WIDTH = 75.84;
// 가장 당겼을 때.
export const CLOSEST_WIDTH = 54;

// 필터에 따라 색이 켜지는 묶음 (Figma 56:3769 설명). 청록 부스·가요제 무대·랜드마크는
// 필터와 상관없이 늘 켜져 있어, 보이는 대로 늘 누를 수 있게 둔다.
const litFilters: Record<PlaceGroup, readonly MapFilter[]> = {
  pub: ["all", "pub"],
  zone: ["all", "event"],
  program: ["all", "pub", "event"],
  operation: ["all", "pub", "event"],
  landmark: ["all", "pub", "event"],
  stage: ["all", "pub", "event"],
};

export const isGroupLit = (group: PlaceGroup, filter: MapFilter) =>
  litFilters[group].includes(filter);
