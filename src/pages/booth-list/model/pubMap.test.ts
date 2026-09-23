import { describe, expect, it } from "vitest";

import {
  getBoothsByArea,
  getPubAreaCenter,
  getPubPoint,
  getPubsCenter,
} from "./pubMap";
import { pubShapes } from "./pubShapes";

const booth = (
  boothCode: string,
  overrides: Partial<{
    area: "PARKING" | "WELFARE_CENTER" | null;
    xRatio: number | null;
    yRatio: number | null;
  }> = {},
) => ({
  // null 을 그대로 넘길 수 있어야 구역 없는 주막을 검사할 수 있다.
  area: overrides.area === undefined ? ("PARKING" as const) : overrides.area,
  boothCode,
  xRatio: overrides.xRatio ?? null,
  yRatio: overrides.yRatio ?? null,
});

// 잘라내기 값이 조금이라도 어긋나면 브라우저가 clip-path 를 통째로 버린다.
// 그러면 레이어 한 장이 그대로 보여 주막 22개가 전부 켜진 것처럼 된다.
describe("pubShapes", () => {
  it("draws every pub with a four-corner clip the browser can parse", () => {
    const codes = Object.keys(pubShapes);
    expect(codes).toHaveLength(22);

    codes.forEach((code) => {
      const { clipPath, xRatio, yRatio } = pubShapes[code];
      const corners = clipPath.split(",");

      expect(corners).toHaveLength(4);
      corners.forEach((corner) =>
        expect(corner.trim()).toMatch(/^\d+\.\d+% \d+\.\d+%$/),
      );
      expect(xRatio).toBeGreaterThan(0);
      expect(xRatio).toBeLessThan(1);
      expect(yRatio).toBeGreaterThan(0);
      expect(yRatio).toBeLessThan(1);
    });
  });
});

describe("getPubPoint", () => {
  it("uses the PUB-1 coordinates when the backend has them", () => {
    expect(getPubPoint(booth("nursing", { xRatio: 0.11, yRatio: 0.22 }))).toEqual({
      xRatio: 0.11,
      yRatio: 0.22,
    });
  });

  it("falls back to the design shape centre while the coordinates are empty", () => {
    expect(getPubPoint(booth("nursing"))).toEqual({
      xRatio: pubShapes.nursing.xRatio,
      yRatio: pubShapes.nursing.yRatio,
    });
  });

  it("has no place to point at for a booth the design does not draw", () => {
    expect(getPubPoint(booth("unknown-booth"))).toBeNull();
  });
});

describe("getPubsCenter", () => {
  it("centres the range the booths span instead of averaging them", () => {
    const center = getPubsCenter([
      booth("a", { xRatio: 0.2, yRatio: 0.4 }),
      booth("b", { xRatio: 0.2, yRatio: 0.4 }),
      booth("c", { xRatio: 0.6, yRatio: 0.8 }),
    ]);

    expect(center.xRatio).toBeCloseTo(0.4);
    expect(center.yRatio).toBeCloseTo(0.6);
  });

  it("falls back to the middle of the map when nothing can be placed", () => {
    expect(getPubsCenter([])).toEqual({ xRatio: 0.5, yRatio: 0.5 });
    expect(getPubsCenter([booth("unknown-booth")])).toEqual({
      xRatio: 0.5,
      yRatio: 0.5,
    });
  });
});

describe("getBoothsByArea", () => {
  const booths = [
    booth("a", { area: "PARKING" }),
    booth("b", { area: "WELFARE_CENTER" }),
    booth("c", { area: null }),
  ];

  it("keeps every booth for the whole-map button", () => {
    expect(getBoothsByArea(booths, "all")).toHaveLength(3);
  });

  it("drops the other areas, including booths without one", () => {
    expect(
      getBoothsByArea(booths, "PARKING").map(({ boothCode }) => boothCode),
    ).toEqual(["a"]);
    expect(
      getBoothsByArea(booths, "WELFARE_CENTER").map(({ boothCode }) => boothCode),
    ).toEqual(["b"]);
  });
});

describe("getPubAreaCenter", () => {
  const booths = [
    booth("a", { area: "PARKING", xRatio: 0.2, yRatio: 0.4 }),
    booth("b", { area: "PARKING", xRatio: 0.4, yRatio: 0.6 }),
    booth("c", { area: "WELFARE_CENTER", xRatio: 0.8, yRatio: 0.9 }),
  ];

  it("spans every booth for the whole-map button", () => {
    const center = getPubAreaCenter(booths, "all");

    expect(center.xRatio).toBeCloseTo(0.5);
    expect(center.yRatio).toBeCloseTo(0.65);
  });

  it("spans only the booths of the selected area", () => {
    const parking = getPubAreaCenter(booths, "PARKING");
    expect(parking.xRatio).toBeCloseTo(0.3);
    expect(parking.yRatio).toBeCloseTo(0.5);

    expect(getPubAreaCenter(booths, "WELFARE_CENTER")).toEqual({
      xRatio: 0.8,
      yRatio: 0.9,
    });
  });

  it("keeps the whole-map view when the area has no booths", () => {
    const parkingOnly = booths.filter(({ area }) => area === "PARKING");

    expect(getPubAreaCenter(parkingOnly, "WELFARE_CENTER")).toEqual(
      getPubAreaCenter(parkingOnly, "all"),
    );
  });
});
