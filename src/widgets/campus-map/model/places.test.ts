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
  it("puts pubs sharing a spot on one shape, first operating day first", () => {
    const shared = (
      boothCode: string,
      name: string,
      operatingDay: "DAY1" | "DAY2",
    ): Booth => ({
      ...booth(boothCode, null, null),
      name,
      operatingDay,
      spotCode: "edu-kor-home",
    });
    const pubs = buildCampusPlaces(
      [shared("edu-home", "가리고", "DAY2"), shared("edu-kor", "취향", "DAY1")],
      [],
    ).filter((place) => place.group === "pub");

    expect(pubs).toHaveLength(1);
    expect(pubs[0]).toMatchObject({
      boothCodes: ["edu-kor", "edu-home"],
      id: pubPlaceId("edu-kor-home"),
      label: "취향 · 가리고",
      spotCode: "edu-kor-home",
    });
    expect(pubs[0].point).toEqual(getPubDesignPoint("edu-kor-home"));
  });

  it("creates shapes for all five numbered day-shift spots", () => {
    const sharedSpotCodes = [
      "edu-kor-home",
      "edu-math-bio",
      "edu-pe-eng",
      "edu-geo-ger",
      "edu-chem-edu",
    ];
    const sharedBooths = sharedSpotCodes.flatMap((spotCode, index) => [
      {
        ...booth(`${spotCode}-day1`, null, null),
        name: `${index + 1}일차`,
        operatingDay: "DAY1" as const,
        spotCode,
      },
      {
        ...booth(`${spotCode}-day2`, null, null),
        name: `${index + 1}일차 다음`,
        operatingDay: "DAY2" as const,
        spotCode,
      },
    ]);

    const ids = buildCampusPlaces(sharedBooths, [])
      .filter((place) => place.group === "pub")
      .map(({ id }) => id);

    expect(ids).toEqual(sharedSpotCodes.map(pubPlaceId));
  });

  it("uses the API coordinates and falls back to the design shape center", () => {
    const places = buildCampusPlaces(
      [booth("nursing", 0.7221, 0.6786), booth("cse", null, null)],
      [zone(null, null)],
    );

    const nursing = places.find(({ id }) => id === pubPlaceId("nursing"));
    expect(nursing?.point).toEqual({ xRatio: 0.7221, yRatio: 0.6786 });

    expect(nursing?.label).toBe("간호학과");

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
    expect(getViewScale({ width: 361, height: 540 }, 244)).toBeCloseTo(4, 5);

    expect(getViewScale({ width: 361, height: 320 }, (1128 * 361) / 320)).toBeCloseTo(
      1,
      5,
    );
    expect(
      toMapFocus({ width: 361, height: 540 }, { xRatio: 0.5, yRatio: 0.4, width: 488 }),
    ).toEqual({ xRatio: 0.5, yRatio: 0.4, scale: 2 });
  });
});
