import type { FestivalMapFocus, MapRatioPoint } from "@/shared/ui";

import { CAMPUS_MAP_SIZE } from "./places";

// 지도 박스의 시안 크기. 비율만 쓴다.
export interface CampusMapBox {
  width: number;
  height: number;
}

// 지도가 보여 줄 자리. 중심은 캠퍼스 전체 배치도 기준 비율이고,
// 확대 정도는 "박스 폭에 배치도 몇 px 이 들어오는가" 로 적는다.
// 배율 숫자는 박스 비율에 따라 뜻이 달라지지만 이 폭은 화면마다 같은 뜻이라
// 시안에서 잰 값을 그대로 옮겨 적을 수 있다.
export interface CampusMapView extends MapRatioPoint {
  width: number;
}

// 배율 1(배치도 전체가 박스에 들어오는 상태)에서 박스 폭에 들어오는 배치도 폭.
// 박스가 배치도보다 가로로 넓으면 높이에 맞춰지므로 폭이 배치도보다 넓어진다.
const getWholeMapWidth = (box: CampusMapBox) =>
  Math.max(CAMPUS_MAP_SIZE.width, (CAMPUS_MAP_SIZE.height * box.width) / box.height);

export const getViewScale = (box: CampusMapBox, width: number) =>
  getWholeMapWidth(box) / width;

export const toMapFocus = (
  box: CampusMapBox,
  { xRatio, yRatio, width }: CampusMapView,
): FestivalMapFocus => ({ xRatio, yRatio, scale: getViewScale(box, width) });
