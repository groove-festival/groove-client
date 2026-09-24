// 투표 가능 반경 판정용 행사장 좌표. SING-7/SING-A7(GPS 설정 API)이 폐기되며
// 서버가 위치를 다루지 않게 됐으므로, 프론트가 정적값으로 들고 판정한다
// (§1.2, SING-3 참고).
export const contestVenueLocation = {
  latitude: 35.8893097,
  longitude: 128.6119262,
  radiusMeters: 100,
};

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Haversine 공식으로 두 좌표 사이 거리(m)를 구한다.
function distanceInMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const deltaLat = toRadians(b.latitude - a.latitude);
  const deltaLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDeltaLat = Math.sin(deltaLat / 2);
  const sinDeltaLng = Math.sin(deltaLng / 2);
  const h =
    sinDeltaLat * sinDeltaLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDeltaLng * sinDeltaLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

// GPS 콜드 스타트나 실내/WiFi 기반 위치 추정은 accuracy(오차 반경, m)가
// 크게 튈 수 있다. 이를 반경에 그대로 더하면 부정확한 값 하나로 100m 제한이
// 사실상 무력화되므로, 더해줄 수 있는 오차 보정치에 상한을 둔다. 실제 E2E
// 측정치를 보고 재조정할 잠정값이다.
const MAX_ACCURACY_BONUS_METERS = 50;

export function isWithinContestVenueRadius(
  position: { latitude: number; longitude: number },
  accuracyMeters = 0,
): boolean {
  const allowedRadius =
    contestVenueLocation.radiusMeters +
    Math.min(Math.max(accuracyMeters, 0), MAX_ACCURACY_BONUS_METERS);

  return distanceInMeters(position, contestVenueLocation) <= allowedRadius;
}
