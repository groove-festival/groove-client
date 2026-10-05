import type { FestivalMapFocus, MapRatioPoint } from "@/shared/ui";

import { CAMPUS_MAP_SIZE } from "./places";

export interface CampusMapBox {
  width: number;
  height: number;
}

export interface CampusMapView extends MapRatioPoint {
  width: number;
}

const getWholeMapWidth = (box: CampusMapBox) =>
  Math.max(CAMPUS_MAP_SIZE.width, (CAMPUS_MAP_SIZE.height * box.width) / box.height);

export const getViewScale = (box: CampusMapBox, width: number) =>
  getWholeMapWidth(box) / width;

export const toMapFocus = (
  box: CampusMapBox,
  { xRatio, yRatio, width }: CampusMapView,
): FestivalMapFocus => ({ xRatio, yRatio, scale: getViewScale(box, width) });
