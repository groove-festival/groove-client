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

// 처음 화면이 볼 자리. 부스 5개를 감싸는 범위의 한가운데다.
// 상수로 박지 않아 좌표가 바뀌어도 화면이 따라간다.
export const getZonesCenter = (zones: readonly ExperienceZone[]) => {
  const placed = zones.filter(isPlacedZone);
  if (placed.length === 0) return { xRatio: 0.5, yRatio: 0.5 };

  const xs = placed.map(({ xRatio }) => xRatio);
  const ys = placed.map(({ yRatio }) => yRatio);

  return {
    xRatio: (Math.min(...xs) + Math.max(...xs)) / 2,
    yRatio: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
};

// 선택한 존으로 지도를 옮길 자리. 좌표가 없는 존은 옮기지 않는다.
export const getZoneFocus = (
  zones: readonly ExperienceZone[],
  selectedZone: ZoneType | null,
) => {
  if (!selectedZone) return null;

  const zone = zones.find(({ type }) => type === selectedZone);
  if (!zone || !isPlacedZone(zone)) return null;

  return { xRatio: zone.xRatio, yRatio: zone.yRatio };
};
