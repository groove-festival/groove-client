import { isPlacedZone, type ExperienceZone, type ZoneType } from "@/entities/zone";

// 체험존 타입은 메인 지도도 함께 쓰므로 entities/zone 에 두고, 이 페이지 안에서는
// 예전 경로 그대로 가져다 쓸 수 있게 다시 내보낸다.
export {
  isPlacedZone,
  type ExperienceZone,
  type PlacedZone,
  type ZoneType,
} from "@/entities/zone";

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
