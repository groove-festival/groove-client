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
      expect(residualPixels).toBeLessThan(10);
    },
  );

  it("only reports outside when the whole confidence range misses campus", () => {
    const uncertain = projectCampusLocation({
      accuracy: 10,
      latitude: 35.88880274068153,
      longitude: 128.6033213937668,
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

    expect(precise.accuracyMeters).toBe(14);
    expect(precise.accuracyLevel).toBe("precise");
    expect(coarse.accuracyLevel).toBe("coarse");
    expect(coarse.focus.width).toBeGreaterThan(precise.focus.width);
  });
});
