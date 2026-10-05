import type { CampusMapBox, CampusMapView, PlaceGroup } from "@/widgets/campus-map";

export type MapFilter = "all" | "pub" | "event";

export const mapFilterOptions: readonly { id: MapFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pub", label: "주막" },
  { id: "event", label: "이벤트 부스" },
];

export const MAIN_MAP_BOX: CampusMapBox = { width: 361, height: 540 };

const view = (x: number, y: number, width: number): CampusMapView => ({
  xRatio: x / 976,
  yRatio: y / 1128,
  width,
});

const filterViews: Record<MapFilter, CampusMapView> = {
  all: view(658.54, 686.24, 216.02),
  pub: view(706.41, 695.5, 140),
  event: view(602.11, 678.66, 140),
};

export const getFilterView = (filter: MapFilter) => filterViews[filter];

export const SELECTED_WIDTH = 75.84;

export const CLOSEST_WIDTH = 54;

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
