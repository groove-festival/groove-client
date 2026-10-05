import {
  type Booth,
  compareByOperatingDay,
  getBoothDisplayName,
  getBoothSpotCode,
} from "@/entities/booth";
import type { ExperienceZone, ZoneType } from "@/entities/zone";
import type { MapRatioPoint } from "@/shared/ui";

export const CAMPUS_MAP_SIZE = { width: 976, height: 1128 } as const;

export const CAMPUS_MAP_VIEW_BOX = `0 0 ${CAMPUS_MAP_SIZE.width} ${CAMPUS_MAP_SIZE.height}`;

export const CAMPUS_MAP_ALT = "축제 부스 위치가 표시된 캠퍼스 배치도";

export const toMapRatio = (x: number, y: number): MapRatioPoint => ({
  xRatio: x / CAMPUS_MAP_SIZE.width,
  yRatio: y / CAMPUS_MAP_SIZE.height,
});

type Matrix = readonly [number, number, number, number, number, number];

export type MapShape =
  | { kind: "rect"; width: number; height: number; matrix: Matrix }
  | { kind: "polygon"; points: readonly (readonly [number, number])[] }
  | { kind: "path"; d: string; center: { x: number; y: number } };

const rect = (width: number, height: number, matrix: Matrix): MapShape => ({
  kind: "rect",
  width,
  height,
  matrix,
});

const rotatedRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  degrees: number,
): MapShape => {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return rect(width, height, [cos, sin, -sin, cos, x, y]);
};

const polygon = (...points: [number, number][]): MapShape => ({
  kind: "polygon",
  points,
});

export const getShapeCenter = (shape: MapShape) => {
  if (shape.kind === "path") return shape.center;

  if (shape.kind === "polygon") {
    const xs = shape.points.map(([x]) => x);
    const ys = shape.points.map(([, y]) => y);
    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    };
  }

  const [a, b, c, d, e, f] = shape.matrix;
  const u = shape.width / 2;
  const v = shape.height / 2;
  return { x: a * u + c * v + e, y: b * u + d * v + f };
};

const PARKING_ROW = [0.814657, 0.579943, -0.579788, 0.814768] as const;
const WELFARE_ROW = [0.985355, 0.170518, -0.170329, 0.985387] as const;

const pubRect = (
  row: readonly [number, number, number, number],
  width: number,
  height: number,
  x: number,
  y: number,
) => rect(width, height, [...row, x, y]);

const pubShapes: Record<string, MapShape> = {
  "elec-eh": pubRect(PARKING_ROW, 34.6781, 5.55196, 649, 683.58),
  ocean: pubRect(PARKING_ROW, 16.3191, 5.55196, 677.931, 704.193),
  geology: pubRect(PARKING_ROW, 18.359, 5.55196, 695.716, 716.865),
  "edu-kor-home": pubRect(PARKING_ROW, 20.3989, 5.55196, 711.355, 728.009),
  "elec-b-design": pubRect(PARKING_ROW, 28.5584, 5.55196, 728.657, 740.337),
  biotech: pubRect(PARKING_ROW, 12.2393, 5.55196, 656.216, 701.32),
  physics: pubRect(PARKING_ROW, 12.4869, 5.55196, 666.87, 708.911),
  cse: pubRect(PARKING_ROW, 16.3191, 5.55196, 677.727, 716.648),
  "elec-cd": pubRect(PARKING_ROW, 28.5584, 5.55196, 695.5, 729.312),
  "lis-geo": pubRect(PARKING_ROW, 32.6382, 5.55196, 719.446, 746.373),
  "welfare-mobile": pubRect(PARKING_ROW, 16.3191, 11.1039, 664.833, 730.181),
  "music-elec-a": pubRect(PARKING_ROW, 16.3191, 11.1039, 678.813, 740.143),
  nursing: pubRect(PARKING_ROW, 32.6382, 11.1039, 694.739, 751.489),
  "socio-elec": pubRect(PARKING_ROW, 16.3191, 11.1039, 722.011, 770.921),
  "edu-math-bio": pubRect(PARKING_ROW, 18.359, 5.55196, 693.382, 770.97),
  "edu-pe-eng": pubRect(PARKING_ROW, 20.3989, 5.55196, 709.028, 782.104),
  "elec-f": pubRect(WELFARE_ROW, 23.2705, 6.33353, 676.306, 594.011),
  psych: pubRect(WELFARE_ROW, 23.2705, 6.33353, 700.184, 598.153),
  "fine-art": pubRect(WELFARE_ROW, 23.2705, 6.33353, 724.06, 602.296),
  "it-auto": pubRect(WELFARE_ROW, 14.2447, 6.33353, 710.078, 615),
  "edu-geo-ger": pubRect(WELFARE_ROW, 14.2447, 6.33353, 725.06, 617.6),
  "edu-chem-edu": pubRect(WELFARE_ROW, 14.2447, 6.33353, 740.042, 620.198),
};

const zoneShapes: Record<ZoneType, MapShape> = {
  MOVE: rotatedRect(605.991, 659.145, 8.13116, 5.5, -22.7032),
  LOVE: rotatedRect(596.992, 663.144, 8.13116, 5.5, -22.7032),
  PROVE: rotatedRect(568.1, 665.398, 8.13116, 5.5, -138.615),
  RECOVER: rotatedRect(587.993, 667.143, 8.13116, 5.5, -22.7032),
  GROOVE: rotatedRect(572.835, 665, 8.13116, 5.5, 72.2177),
};

export type PlaceGroup =
  "pub" | "zone" | "program" | "operation" | "stage" | "landmark";

interface PlaceBase {
  id: string;
  label: string;
  shape: MapShape;

  point: MapRatioPoint;
}

export type CampusPlace = PlaceBase &
  (
    | { group: "pub"; spotCode: string; boothCodes: string[] }
    | { group: "zone"; zoneType: ZoneType }
    | { group: Exclude<PlaceGroup, "pub" | "zone"> }
  );

type FixedPlace = Omit<PlaceBase, "point"> & {
  group: Exclude<PlaceGroup, "pub" | "zone">;
};

export const STAGE_SHAPE = polygon(
  [580.842, 646.312],
  [595.323, 637.287],
  [590.03, 633.833],
  [580.219, 639.948],
);

const fixedPlaces: readonly FixedPlace[] = [
  {
    id: "groove-rivals",
    label: "GROOVE RIVALS",
    group: "program",
    shape: rotatedRect(625.408, 688.998, 11.47, 5.55, 76.99),
  },
  {
    id: "groove-ticket",
    label: "GROOVE TICKET",
    group: "program",
    shape: rect(8.15956, 5.55196, [...PARKING_ROW, 635.575, 674.014]),
  },
  {
    id: "operation-booth",
    label: "운영 부스",
    group: "operation",
    shape: rect(
      16.3191,
      5.55196,
      [0.225071, 0.974342, -0.974299, 0.225258, 648.088, 711.047],
    ),
  },
  {
    id: "headquarters",
    label: "일청담 본부",
    group: "operation",
    shape: rotatedRect(565.756, 643.138, 8.13116, 5.5, 10.1769),
  },
  { id: "stage", label: "가요제 무대", group: "stage", shape: STAGE_SHAPE },
  {
    id: "welfare-center",
    label: "복지관",
    group: "landmark",
    shape: polygon(
      [772.228, 633.45],
      [729.98, 625.856],
      [726.296, 646.349],
      [768.544, 653.943],
    ),
  },
  {
    id: "ilcheongdam",
    label: "일청담",
    group: "landmark",

    shape: {
      kind: "path",
      d: "M609.688 679.101C608.103 678.61 605.455 679.011 605.455 679.011C605.455 679.011 603.44 676.876 601.753 676.168C600.276 675.523 597.711 675.387 597.711 675.387C597.711 675.387 595.363 676.811 594.47 678.239C593.654 679.503 593.268 681.95 593.268 681.95C593.268 681.95 590.57 682.92 589.331 684.153C588.144 685.343 587.236 687.886 587.236 687.886C587.236 687.886 587.937 690.541 588.948 691.931C589.949 693.3 592.189 694.78 592.189 694.78C592.189 694.78 592.412 697.701 593.246 699.317C593.858 700.503 595.357 701.971 595.357 701.971C595.357 701.971 598.542 702.231 600.328 701.356C602.121 700.503 603.298 699.156 603.298 699.156C603.298 699.156 605.727 699.941 607.34 699.938C609.126 699.895 611.777 698.869 611.777 698.869C611.777 698.869 613.01 696.393 613.026 694.45C613.032 692.741 612.102 689.706 612.102 689.706C612.102 689.706 613.588 686.978 613.737 685.08C613.839 683.566 613.149 681.208 613.149 681.208C613.149 681.208 611.221 679.503 609.719 679.052L609.695 679.107L609.688 679.101Z",
      center: { x: 600.54, y: 688.81 },
    },
  },
  {
    id: "it5",
    label: "IT5호관(융복합관)",
    group: "landmark",

    shape: {
      kind: "path",
      d: "M584.364 727.167L554.882 726.966L554.774 742.901L584.256 743.102Z M596.674 736.004L554.794 735.719L554.686 751.654L596.565 751.939Z",
      center: { x: 575.68, y: 739.45 },
    },
  },
  {
    id: "it1",
    label: "IT1호관",
    group: "landmark",
    shape: polygon(
      [680.933, 798.455],
      [630.904, 799.687],
      [631.271, 814.62],
      [681.301, 813.388],
    ),
  },
];

const getShapePoint = (shape: MapShape) => {
  const { x, y } = getShapeCenter(shape);
  return toMapRatio(x, y);
};

const getPlacePoint = (
  coordinates: { xRatio: number | null; yRatio: number | null },
  shape: MapShape,
): MapRatioPoint =>
  coordinates.xRatio !== null && coordinates.yRatio !== null
    ? { xRatio: coordinates.xRatio, yRatio: coordinates.yRatio }
    : getShapePoint(shape);

export const getPubDesignPoint = (spotCode: string): MapRatioPoint | null => {
  const shape = pubShapes[spotCode];
  return shape ? getShapePoint(shape) : null;
};

const LANDMARK_FOCUS_SPREAD = 1.5;

export const getPlaceFocusWidth = (place: CampusPlace, width: number) =>
  place.group === "landmark" ? width * LANDMARK_FOCUS_SPREAD : width;

export const pubPlaceId = (spotCode: string) => `pub:${spotCode}`;
export const zonePlaceId = (zoneType: ZoneType) => `zone:${zoneType}`;

export const campusCoverShapes: readonly { id: string; shape: MapShape }[] = [
  ...Object.entries(pubShapes).map(([spotCode, shape]) => ({
    id: pubPlaceId(spotCode),
    shape,
  })),
  ...(Object.entries(zoneShapes) as [ZoneType, MapShape][]).map(
    ([zoneType, shape]) => ({
      id: zonePlaceId(zoneType),
      shape,
    }),
  ),
];

export const buildCampusPlaces = (
  booths: readonly Booth[],
  zones: readonly ExperienceZone[],
): CampusPlace[] => {
  const spots = new Map<string, Booth[]>();
  for (const booth of booths) {
    const spotCode = getBoothSpotCode(booth);
    spots.set(spotCode, [...(spots.get(spotCode) ?? []), booth]);
  }

  const pubs = [...spots].flatMap(([spotCode, spotBooths]): CampusPlace[] => {
    const shape = pubShapes[spotCode];
    if (!shape) return [];

    const ordered = [...spotBooths].sort(compareByOperatingDay);
    return [
      {
        id: pubPlaceId(spotCode),
        label: ordered.map(getBoothDisplayName).join(" · "),
        group: "pub",
        spotCode,
        boothCodes: ordered.map(({ boothCode }) => boothCode),
        shape,
        point: getPlacePoint(ordered[0], shape),
      },
    ];
  });

  const zonePlaces = zones.map((zone): CampusPlace => ({
    id: zonePlaceId(zone.type),
    label: zone.name,
    group: "zone",
    zoneType: zone.type,
    shape: zoneShapes[zone.type],
    point: getPlacePoint(zone, zoneShapes[zone.type]),
  }));

  const fixed = fixedPlaces.map((place): CampusPlace => ({
    ...place,
    point: getShapePoint(place.shape),
  }));

  return [...pubs, ...zonePlaces, ...fixed];
};
