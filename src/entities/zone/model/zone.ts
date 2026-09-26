// PLAN-1 체험존 종류. 선언 순서가 곧 화면 카드 순서다.
export type ZoneType = "MOVE" | "LOVE" | "PROVE" | "RECOVER" | "GROOVE";

// PLAN-1 응답의 zones 항목 모양을 따른다.
export interface ExperienceZone {
  type: ZoneType;
  name: string;
  description: string;
  // 캠퍼스 전체 배치도 기준 비율(0.0~1.0). 좌표를 아직 넣지 않았으면 null이고,
  // 이때는 지도에 그리지 않는다 (API 명세 PLAN-1).
  xRatio: number | null;
  yRatio: number | null;
}

// 좌표가 들어온 존. 지도에 그릴 수 있는지 한 번만 판별하고 이후로는 타입이 보장한다.
export interface PlacedZone extends ExperienceZone {
  xRatio: number;
  yRatio: number;
}

export const isPlacedZone = (zone: ExperienceZone): zone is PlacedZone =>
  zone.xRatio !== null && zone.yRatio !== null;
