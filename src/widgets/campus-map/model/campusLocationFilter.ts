import type { CampusLocationReading } from "./georeference";

const EARTH_RADIUS_METERS = 6_378_137;
const RESET_AFTER_MS = 10_000;
const MAX_CAMPUS_SPEED_METERS_PER_SECOND = 8;
const MIN_JUMP_ALLOWANCE_METERS = 20;
const DERIVATIVE_CUTOFF_HZ = 1;
const MIN_POSITION_CUTOFF_HZ = 0.22;
const MAX_POSITION_CUTOFF_HZ = 2.5;
const SPEED_CUTOFF_GAIN = 0.18;

export interface CampusLocationFilterState {
  reading: CampusLocationReading;
  sourceReading: CampusLocationReading;
  filteredSpeedMetersPerSecond: number;
}

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getDistanceMeters = (from: CampusLocationReading, to: CampusLocationReading) => {
  const averageLatitude = degreesToRadians((from.latitude + to.latitude) / 2);
  const east =
    EARTH_RADIUS_METERS *
    degreesToRadians(to.longitude - from.longitude) *
    Math.cos(averageLatitude);
  const north = EARTH_RADIUS_METERS * degreesToRadians(to.latitude - from.latitude);

  return Math.hypot(east, north);
};

const getSmoothingFactor = (cutoffHertz: number, elapsedSeconds: number) => {
  const ratio = 2 * Math.PI * cutoffHertz * elapsedSeconds;
  return ratio / (ratio + 1);
};

const interpolate = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const normalizeAccuracy = (accuracy: number) =>
  Number.isFinite(accuracy) && accuracy > 0 ? accuracy : 5_000;

const isValidReading = (reading: CampusLocationReading) =>
  Number.isFinite(reading.accuracy) &&
  reading.accuracy >= 0 &&
  Number.isFinite(reading.latitude) &&
  reading.latitude >= -90 &&
  reading.latitude <= 90 &&
  Number.isFinite(reading.longitude) &&
  reading.longitude >= -180 &&
  reading.longitude <= 180 &&
  Number.isFinite(reading.timestamp);

const createFilterState = (
  reading: CampusLocationReading,
): CampusLocationFilterState => ({
  reading,
  sourceReading: reading,
  filteredSpeedMetersPerSecond: 0,
});

export const updateCampusLocationFilter = (
  current: CampusLocationFilterState | null,
  nextReading: CampusLocationReading,
): CampusLocationFilterState | null => {
  if (!isValidReading(nextReading)) return current;
  if (!current) return createFilterState(nextReading);

  const elapsedMs = nextReading.timestamp - current.sourceReading.timestamp;
  if (elapsedMs <= 0) return current;
  if (elapsedMs >= RESET_AFTER_MS) return createFilterState(nextReading);

  const elapsedSeconds = elapsedMs / 1_000;
  const distanceMeters = getDistanceMeters(current.sourceReading, nextReading);
  const uncertaintyMeters =
    normalizeAccuracy(current.sourceReading.accuracy) +
    normalizeAccuracy(nextReading.accuracy);
  const maximumPlausibleDistance = Math.max(
    MIN_JUMP_ALLOWANCE_METERS,
    uncertaintyMeters + MAX_CAMPUS_SPEED_METERS_PER_SECOND * elapsedSeconds,
  );

  if (distanceMeters > maximumPlausibleDistance) return current;

  const accuracyNoiseMeters = Math.min(
    normalizeAccuracy(current.sourceReading.accuracy),
    normalizeAccuracy(nextReading.accuracy),
  );
  const usefulSpeed =
    Math.max(0, distanceMeters - accuracyNoiseMeters) / elapsedSeconds;
  const derivativeFactor = getSmoothingFactor(DERIVATIVE_CUTOFF_HZ, elapsedSeconds);
  const filteredSpeed = interpolate(
    current.filteredSpeedMetersPerSecond,
    usefulSpeed,
    derivativeFactor,
  );
  const positionCutoff = Math.min(
    MAX_POSITION_CUTOFF_HZ,
    MIN_POSITION_CUTOFF_HZ + filteredSpeed * SPEED_CUTOFF_GAIN,
  );
  const positionFactor = getSmoothingFactor(positionCutoff, elapsedSeconds);

  return {
    reading: {
      accuracy: nextReading.accuracy,
      latitude: interpolate(
        current.reading.latitude,
        nextReading.latitude,
        positionFactor,
      ),
      longitude: interpolate(
        current.reading.longitude,
        nextReading.longitude,
        positionFactor,
      ),
      timestamp: nextReading.timestamp,
    },
    sourceReading: nextReading,
    filteredSpeedMetersPerSecond: filteredSpeed,
  };
};
