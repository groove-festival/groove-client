import type { Booth, BoothArea } from "@/entities/booth";
import type { MapRatioPoint } from "@/shared/ui";
import { getPubDesignPoint } from "@/widgets/campus-map";

// 지도 위 구역 버튼. "전체"는 구역이 아니라 두 구역을 모두 보여주는 상태다.
export type PubMapArea = "all" | BoothArea;

export const pubMapAreaOptions: readonly { id: PubMapArea; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "PARKING", label: "학생주차장" },
  { id: "WELFARE_CENTER", label: "복지관" },
];

// 구역으로 거른 주막. 지도 색과 아래 목록이 늘 같은 묶음을 가리키도록
// 두 곳이 이 함수를 함께 쓴다 (API 명세 §1.5 — area 는 목록 필터 겸 줌 타깃).
export const getBoothsByArea = <T extends Pick<Booth, "area">>(
  booths: readonly T[],
  area: PubMapArea,
): T[] =>
  area === "all" ? [...booths] : booths.filter((booth) => booth.area === area);

// 지도에서 이 주막을 가리킬 자리. API 좌표(PUB-A13)가 들어오면 그 값을 쓰고,
// 아직 비어 있으면 같은 도형에서 계산해 둔 중심으로 대신한다. 두 값은 같은
// 디자인 도형에서 나온 것이라 좌표가 채워져도 자리가 튀지 않는다.
// 도형이 없는 주막(디자인에 없는 코드)은 가리킬 자리가 없다.
export const getPubPoint = (
  booth: Pick<Booth, "boothCode" | "xRatio" | "yRatio">,
): MapRatioPoint | null => {
  if (booth.xRatio !== null && booth.yRatio !== null) {
    return { xRatio: booth.xRatio, yRatio: booth.yRatio };
  }

  return getPubDesignPoint(booth.boothCode);
};

const BOOTH_LIST_CENTER: MapRatioPoint = { xRatio: 0.5, yRatio: 0.5 };

// 주막 묶음을 감싸는 범위의 한가운데. 상수로 박지 않아 좌표가 바뀌어도 따라간다.
export const getPubsCenter = (
  booths: readonly Pick<Booth, "boothCode" | "xRatio" | "yRatio">[],
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

// 구역 버튼을 눌렀을 때 지도가 갈 자리. "전체"는 주막 전부를 감싸는 한가운데다.
// 구역에 주막이 하나도 없으면 전체 기준으로 물러난다 (API 명세 §5 PUB-1).
export const getPubAreaCenter = (
  booths: readonly Pick<Booth, "area" | "boothCode" | "xRatio" | "yRatio">[],
  area: PubMapArea,
): MapRatioPoint => {
  if (area === "all") return getPubsCenter(booths);

  const areaBooths = booths.filter((booth) => booth.area === area);

  return getPubsCenter(areaBooths.length > 0 ? areaBooths : booths);
};
