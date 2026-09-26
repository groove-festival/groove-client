import type { Booth } from "@/entities/booth";
import type { ExperienceZone } from "@/entities/zone";

import {
  buildMainMapPlaces,
  getShapeCenter,
  isGroupLit,
  MAIN_MAP_CROP,
  toCropRatio,
} from "./mainMap";

const booth = (
  boothCode: string,
  xRatio: number | null,
  yRatio: number | null,
): Booth => ({
  area: "PARKING",
  boothCode,
  colleges: ["NURSING"],
  departments: ["간호학과"],
  description: null,
  name: "",
  status: "OPEN",
  xRatio,
  yRatio,
});

const zone = (xRatio: number | null, yRatio: number | null): ExperienceZone => ({
  type: "RECOVER",
  name: "RECOVER ZONE",
  description: "",
  xRatio,
  yRatio,
});

describe("toCropRatio", () => {
  it("moves a campus-wide ratio onto the cropped map", () => {
    const topLeft = toCropRatio({
      xRatio: MAIN_MAP_CROP.x / 976,
      yRatio: MAIN_MAP_CROP.y / 1128,
    });

    expect(topLeft.xRatio).toBeCloseTo(0);
    expect(topLeft.yRatio).toBeCloseTo(0);
  });
});

describe("buildMainMapPlaces", () => {
  it("uses the API coordinates and falls back to the design shape center", () => {
    const places = buildMainMapPlaces(
      [booth("nursing", 0.7221, 0.6786), booth("cse", null, null)],
      [zone(null, null)],
    );

    const nursing = places.find(({ id }) => id === "pub:nursing");
    expect(nursing?.point).toEqual(toCropRatio({ xRatio: 0.7221, yRatio: 0.6786 }));
    // 이름이 비면 학과 조합으로 부른다 (getBoothDisplayName).
    expect(nursing?.label).toBe("간호학과");

    // 좌표가 비어도 같은 디자인 도형의 중심으로 같은 자리를 가리킨다.
    const cse = places.find(({ id }) => id === "pub:cse");
    const cseApi = toCropRatio({ xRatio: 0.6996, yRatio: 0.6415 });
    expect(cse?.point.xRatio).toBeCloseTo(cseApi.xRatio, 3);
    expect(cse?.point.yRatio).toBeCloseTo(cseApi.yRatio, 3);

    const recover = places.find(({ id }) => id === "zone:RECOVER");
    const recoverApi = toCropRatio({ xRatio: 0.6074, yRatio: 0.5923 });
    expect(recover?.point.xRatio).toBeCloseTo(recoverApi.xRatio, 2);
    expect(recover?.point.yRatio).toBeCloseTo(recoverApi.yRatio, 2);
  });

  it("skips booths without a design shape and always adds the fixed places", () => {
    const places = buildMainMapPlaces([booth("unknown-booth", 0.5, 0.5)], []);

    expect(places.map(({ label }) => label)).toEqual([
      "GROOVE RIVALS",
      "GROOVE TICKET",
      "운영 부스",
      "일청담 본부",
      "가요제 무대",
    ]);
  });
});

describe("getShapeCenter", () => {
  it("matches the pub map center of the same design shape", () => {
    const [nursing] = buildMainMapPlaces([booth("nursing", null, null)], []);
    const { x, y } = getShapeCenter(nursing.shape);

    // 주막 지도(pubShapes)의 간호학과 중심과 같은 자리.
    expect(x / 976).toBeCloseTo(0.7221, 3);
    expect(y / 1128).toBeCloseTo(0.6786, 3);
  });
});

describe("isGroupLit", () => {
  it("lights each group only in its filters", () => {
    expect(isGroupLit("pub", "event")).toBe(false);
    expect(isGroupLit("zone", "pub")).toBe(false);
    expect(isGroupLit("stage", "pub")).toBe(false);
    expect(isGroupLit("stage", "all")).toBe(true);
    // 청록 부스는 필터와 상관없이 늘 켜져 있다.
    expect(isGroupLit("program", "pub")).toBe(true);
    expect(isGroupLit("operation", "event")).toBe(true);
  });
});
