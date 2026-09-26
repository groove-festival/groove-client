import type { Booth } from "@/entities/booth";
import type { ExperienceZone } from "@/entities/zone";

import {
  buildCampusPlaces,
  campusCoverShapes,
  getPlaceFocusWidth,
  getPubDesignPoint,
  getShapeCenter,
  pubPlaceId,
  zonePlaceId,
} from "./places";
import { getViewScale, toMapFocus } from "./view";

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

describe("buildCampusPlaces", () => {
  it("uses the API coordinates and falls back to the design shape center", () => {
    const places = buildCampusPlaces(
      [booth("nursing", 0.7221, 0.6786), booth("cse", null, null)],
      [zone(null, null)],
    );

    const nursing = places.find(({ id }) => id === pubPlaceId("nursing"));
    expect(nursing?.point).toEqual({ xRatio: 0.7221, yRatio: 0.6786 });
    // 이름이 비면 학과 조합으로 부른다 (getBoothDisplayName).
    expect(nursing?.label).toBe("간호학과");

    // 좌표가 비어도 같은 디자인 도형의 중심으로 같은 자리를 가리킨다 (PUB-1 실제 값과 대조).
    const cse = places.find(({ id }) => id === pubPlaceId("cse"));
    expect(cse?.point.xRatio).toBeCloseTo(0.6996, 3);
    expect(cse?.point.yRatio).toBeCloseTo(0.6415, 3);

    const recover = places.find(({ id }) => id === zonePlaceId("RECOVER"));
    expect(recover?.point.xRatio).toBeCloseTo(0.6074, 2);
    expect(recover?.point.yRatio).toBeCloseTo(0.5923, 2);
  });

  it("skips booths without a design shape and always adds the fixed places", () => {
    const places = buildCampusPlaces([booth("unknown-booth", 0.5, 0.5)], []);

    expect(places.map(({ label }) => label)).toEqual([
      "GROOVE RIVALS",
      "GROOVE TICKET",
      "운영 부스",
      "일청담 본부",
      "가요제 무대",
      "복지관",
      "일청담",
      "IT5호관(융복합관)",
      "IT1호관",
    ]);
  });
});

describe("design shapes", () => {
  it("covers every pub and zone drawn on the colour layers", () => {
    expect(campusCoverShapes).toHaveLength(22 + 5);
  });

  it("puts each pub shape at the PUB-1 coordinates of the same booth", () => {
    // 주막 지도(PUB-A13)에 넣은 간호학과 좌표와 같은 자리.
    const nursing = getPubDesignPoint("nursing");
    expect(nursing?.xRatio).toBeCloseTo(0.7221, 3);
    expect(nursing?.yRatio).toBeCloseTo(0.6786, 3);
    expect(getPubDesignPoint("unknown-booth")).toBeNull();
  });

  it("finds the center of a polygon", () => {
    const [welfare] = buildCampusPlaces([], []).filter(
      ({ id }) => id === "welfare-center",
    );
    expect(getShapeCenter(welfare.shape).x).toBeCloseTo((726.296 + 772.228) / 2, 3);
  });
});

describe("getPlaceFocusWidth", () => {
  it("zooms in less on a landmark than on a booth", () => {
    const places = buildCampusPlaces([booth("nursing", null, null)], []);
    const nursing = places.find(({ id }) => id === pubPlaceId("nursing"))!;
    const it1 = places.find(({ id }) => id === "it1")!;

    expect(getPlaceFocusWidth(nursing, 80)).toBe(80);
    expect(getPlaceFocusWidth(it1, 80)).toBeGreaterThan(80);
  });
});

describe("view", () => {
  it("turns the visible map width into a scale for the box", () => {
    // 세로로 긴 박스는 배치도 폭(976)에 맞춰진다.
    expect(getViewScale({ width: 361, height: 540 }, 244)).toBeCloseTo(4, 5);
    // 가로로 넓은 박스는 높이에 맞춰져, 배율 1 에서 배치도보다 넓게 보인다.
    expect(getViewScale({ width: 361, height: 320 }, (1128 * 361) / 320)).toBeCloseTo(
      1,
      5,
    );
    expect(
      toMapFocus({ width: 361, height: 540 }, { xRatio: 0.5, yRatio: 0.4, width: 488 }),
    ).toEqual({ xRatio: 0.5, yRatio: 0.4, scale: 2 });
  });
});
