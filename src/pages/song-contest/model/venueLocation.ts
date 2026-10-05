export const contestVenueLocation = {
  latitude: 35.8893097,
  longitude: 128.6119262,
  radiusMeters: 100,
};

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

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
