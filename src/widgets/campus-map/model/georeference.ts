import type { MapRatioPoint } from "@/shared/ui";

import {
  CAMPUS_BOUNDARY_POINTS,
  CAMPUS_GEOREFERENCE,
} from "../config/campusGeoreference";
import { CAMPUS_MAP_SIZE } from "./places";
import type { CampusMapView } from "./view";

const EARTH_RADIUS_METERS = 6_378_137;
const ACCURACY_POLYGON_SIDES = 36;
const MIN_ACCURACY_METERS = 1;
const MAX_ACCURACY_METERS = 5_000;
const MIN_LOCATION_VIEW_WIDTH = 140;
const MAX_LOCATION_VIEW_WIDTH = 420;
const LOCATION_VIEW_PADDING = 2.6;

interface LocalPoint {
  east: number;
  north: number;
}

interface MapPoint {
  x: number;
  y: number;
}

export interface CampusLocationReading {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type CampusBoundaryStatus = "inside" | "uncertain" | "outside";
export type CampusAccuracyLevel = "precise" | "approximate" | "coarse";

export interface CampusLocationProjection {
  point: MapRatioPoint;
  accuracyPoints: readonly MapRatioPoint[];
  accuracyMeters: number;
  accuracyLevel: CampusAccuracyLevel;
  boundaryStatus: CampusBoundaryStatus;
  focus: CampusMapView;
}

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

const toLocalPoint = (latitude: number, longitude: number): LocalPoint => {
  const { origin } = CAMPUS_GEOREFERENCE;
  const originLatitudeRadians = degreesToRadians(origin.latitude);

  return {
    east:
      EARTH_RADIUS_METERS *
      degreesToRadians(longitude - origin.longitude) *
      Math.cos(originLatitudeRadians),
    north: EARTH_RADIUS_METERS * degreesToRadians(latitude - origin.latitude),
  };
};

const localToMapPoint = ({ east, north }: LocalPoint): MapPoint => {
  const transform = CAMPUS_GEOREFERENCE.transform;

  return {
    x: transform.eastToX * east + transform.northToX * north + transform.offsetX,
    y: transform.eastToY * east + transform.northToY * north + transform.offsetY,
  };
};

const mapToLocalPoint = ({ x, y }: MapPoint): LocalPoint => {
  const transform = CAMPUS_GEOREFERENCE.transform;
  const relativeX = x - transform.offsetX;
  const relativeY = y - transform.offsetY;
  const determinant =
    transform.eastToX * transform.northToY - transform.northToX * transform.eastToY;

  return {
    east:
      (transform.northToY * relativeX - transform.northToX * relativeY) / determinant,
    north:
      (-transform.eastToY * relativeX + transform.eastToX * relativeY) / determinant,
  };
};

const toRatioPoint = ({ x, y }: MapPoint): MapRatioPoint => ({
  xRatio: x / CAMPUS_MAP_SIZE.width,
  yRatio: y / CAMPUS_MAP_SIZE.height,
});

const isPointInPolygon = (point: LocalPoint, polygon: readonly LocalPoint[]) => {
  let isInside = false;

  for (
    let index = 0, previous = polygon.length - 1;
    index < polygon.length;
    previous = index++
  ) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const crossesRay =
      currentPoint.north > point.north !== previousPoint.north > point.north &&
      point.east <
        ((previousPoint.east - currentPoint.east) *
          (point.north - currentPoint.north)) /
          (previousPoint.north - currentPoint.north) +
          currentPoint.east;

    if (crossesRay) isInside = !isInside;
  }

  return isInside;
};

const distanceToSegment = (point: LocalPoint, start: LocalPoint, end: LocalPoint) => {
  const segmentEast = end.east - start.east;
  const segmentNorth = end.north - start.north;
  const segmentLengthSquared = segmentEast ** 2 + segmentNorth ** 2;
  const progress =
    segmentLengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point.east - start.east) * segmentEast +
              (point.north - start.north) * segmentNorth) /
              segmentLengthSquared,
          ),
        );

  return Math.hypot(
    point.east - (start.east + progress * segmentEast),
    point.north - (start.north + progress * segmentNorth),
  );
};

const campusBoundary = CAMPUS_BOUNDARY_POINTS.map(([x, y]) =>
  mapToLocalPoint({ x, y }),
);

const classifyBoundary = (
  point: LocalPoint,
  confidenceRadiusMeters: number,
): CampusBoundaryStatus => {
  const isInside = isPointInPolygon(point, campusBoundary);
  const distanceToBoundary = Math.min(
    ...campusBoundary.map((start, index) =>
      distanceToSegment(
        point,
        start,
        campusBoundary[(index + 1) % campusBoundary.length],
      ),
    ),
  );

  if (distanceToBoundary <= confidenceRadiusMeters) return "uncertain";
  return isInside ? "inside" : "outside";
};

const getAccuracyLevel = (accuracyMeters: number): CampusAccuracyLevel => {
  if (accuracyMeters <= 20) return "precise";
  if (accuracyMeters <= 50) return "approximate";
  return "coarse";
};

const getAccuracyPolygon = (
  center: LocalPoint,
  radiusMeters: number,
): readonly MapRatioPoint[] =>
  Array.from({ length: ACCURACY_POLYGON_SIDES }, (_, index) => {
    const radians = (index / ACCURACY_POLYGON_SIDES) * Math.PI * 2;
    return toRatioPoint(
      localToMapPoint({
        east: center.east + Math.cos(radians) * radiusMeters,
        north: center.north + Math.sin(radians) * radiusMeters,
      }),
    );
  });

export const toCampusMapPoint = (latitude: number, longitude: number): MapRatioPoint =>
  toRatioPoint(localToMapPoint(toLocalPoint(latitude, longitude)));

export const projectCampusLocation = (
  reading: CampusLocationReading,
): CampusLocationProjection => {
  const browserAccuracy = Number.isFinite(reading.accuracy)
    ? Math.max(MIN_ACCURACY_METERS, Math.min(MAX_ACCURACY_METERS, reading.accuracy))
    : MAX_ACCURACY_METERS;
  const confidenceRadiusMeters =
    browserAccuracy + CAMPUS_GEOREFERENCE.calibrationErrorMeters;
  const localPoint = toLocalPoint(reading.latitude, reading.longitude);
  const mapPoint = localToMapPoint(localPoint);
  const accuracyPoints = getAccuracyPolygon(localPoint, confidenceRadiusMeters);
  const xRatios = accuracyPoints.map(({ xRatio }) => xRatio);
  const accuracyWidth =
    (Math.max(...xRatios) - Math.min(...xRatios)) * CAMPUS_MAP_SIZE.width;

  return {
    point: toRatioPoint(mapPoint),
    accuracyPoints,
    accuracyMeters: confidenceRadiusMeters,
    accuracyLevel: getAccuracyLevel(confidenceRadiusMeters),
    boundaryStatus: classifyBoundary(localPoint, confidenceRadiusMeters),
    focus: {
      ...toRatioPoint(mapPoint),
      width: Math.max(
        MIN_LOCATION_VIEW_WIDTH,
        Math.min(MAX_LOCATION_VIEW_WIDTH, accuracyWidth * LOCATION_VIEW_PADDING),
      ),
    },
  };
};
