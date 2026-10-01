import { CAMPUS_GEOREFERENCE_CALIBRATION_POINTS } from "../config/campusGeoreference";
import { projectCampusLocation, toCampusMapPoint } from "./georeference";

describe("campus georeference", () => {
  it.each(CAMPUS_GEOREFERENCE_CALIBRATION_POINTS)(
    "projects $label near its SVG landmark",
    ({ latitude, longitude, mapX, mapY }) => {
      const point = toCampusMapPoint(latitude, longitude);

      const residualPixels = Math.hypot(
        point.xRatio * 976 - mapX,
        point.yRatio * 1128 - mapY,
      );
      expect(residualPixels).toBeLessThan(20);
    },
  );

  it("keeps every Figma-verified structure in the public calibration set", () => {
    const labels = CAMPUS_GEOREFERENCE_CALIBRATION_POINTS.map(({ label }) => label);

    expect(labels).toEqual(
      expect.arrayContaining([
        "제2과학관 210동",
        "제1과학관 208동",
        "대학원동",
        "본관",
        "융합교육정보관",
        "백호관",
        "학군단",
        "공대 2호관",
        "공대 1호관",
        "공대 3호관",
        "공대 6호관",
        "IT 2호관",
        "교수아파트",
        "수의과대학 420동",
        "동물병원 421동",
      ]),
    );
  });

  it("only reports outside when the whole confidence range misses campus", () => {
    const uncertain = projectCampusLocation({
      accuracy: 10,
      latitude: 35.88851941955974,
      longitude: 128.6037505213492,
      timestamp: 1,
    });
    const outside = projectCampusLocation({
      accuracy: 10,
      latitude: 35.88,
      longitude: 128.62,
      timestamp: 2,
    });

    expect(uncertain.boundaryStatus).toBe("uncertain");
    expect(outside.boundaryStatus).toBe("outside");
  });

  it("adds calibration uncertainty and widens the first view for coarse fixes", () => {
    const precise = projectCampusLocation({
      accuracy: 5,
      latitude: 35.8886615,
      longitude: 128.6121297,
      timestamp: 1,
    });
    const coarse = projectCampusLocation({
      accuracy: 100,
      latitude: 35.8886615,
      longitude: 128.6121297,
      timestamp: 2,
    });

    expect(precise.accuracyMeters).toBe(32);
    expect(precise.accuracyLevel).toBe("approximate");
    expect(coarse.accuracyLevel).toBe("coarse");
    expect(coarse.focus.width).toBeGreaterThan(precise.focus.width);
  });
});
