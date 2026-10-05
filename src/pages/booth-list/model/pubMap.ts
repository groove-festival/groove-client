import { type Booth, type BoothArea, getBoothSpotCode } from "@/entities/booth";
import type { MapRatioPoint } from "@/shared/ui";
import { getPubDesignPoint } from "@/widgets/campus-map";

export type PubMapArea = "all" | BoothArea;

export const pubMapAreaOptions: readonly { id: PubMapArea; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "PARKING", label: "학생주차장" },
  { id: "WELFARE_CENTER", label: "복지관" },
];

export const getBoothsByArea = <T extends Pick<Booth, "area">>(
  booths: readonly T[],
  area: PubMapArea,
): T[] =>
  area === "all" ? [...booths] : booths.filter((booth) => booth.area === area);

export const getPubPoint = (
  booth: Pick<Booth, "boothCode" | "spotCode" | "xRatio" | "yRatio">,
): MapRatioPoint | null => {
  if (booth.xRatio !== null && booth.yRatio !== null) {
    return { xRatio: booth.xRatio, yRatio: booth.yRatio };
  }

  return getPubDesignPoint(getBoothSpotCode(booth));
};

const BOOTH_LIST_CENTER: MapRatioPoint = { xRatio: 0.5, yRatio: 0.5 };

export const getPubsCenter = (
  booths: readonly Pick<Booth, "boothCode" | "spotCode" | "xRatio" | "yRatio">[],
): MapRatioPoint => {
  const points = booths
    .map(getPubPoint)
    .filter((point): point is MapRatioPoint => point !== null);

  if (points.length === 0) return BOOTH_LIST_CENTER;

  const xs = points.map(({ xRatio }) => xRatio);
  const ys = points.map(({ yRatio }) => yRatio);

  return {
    xRatio: (Math.min(...xs) + Math.max(...xs)) / 2,
    yRatio: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
};

export const getPubAreaCenter = (
  booths: readonly Pick<
    Booth,
    "area" | "boothCode" | "spotCode" | "xRatio" | "yRatio"
  >[],
  area: PubMapArea,
): MapRatioPoint => {
  if (area === "all") return getPubsCenter(booths);

  const areaBooths = booths.filter((booth) => booth.area === area);

  return getPubsCenter(areaBooths.length > 0 ? areaBooths : booths);
};
