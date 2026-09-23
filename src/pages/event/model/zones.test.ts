import type { ExperienceZone } from "./zones";
import { getZoneFocus, getZonesCenter, isPlacedZone } from "./zones";

const zone = (
  type: ExperienceZone["type"],
  xRatio: number | null,
  yRatio: number | null,
): ExperienceZone => ({ type, name: `${type} ZONE`, description: "", xRatio, yRatio });

describe("isPlacedZone", () => {
  it("treats a zone without coordinates as not placed", () => {
    expect(isPlacedZone(zone("MOVE", 0.6, 0.58))).toBe(true);
    expect(isPlacedZone(zone("MOVE", null, null))).toBe(false);
    // 한쪽만 들어온 응답도 그릴 수 없다.
    expect(isPlacedZone(zone("MOVE", 0.6, null))).toBe(false);
  });
});

describe("getZoneFocus", () => {
  const zones = [zone("MOVE", 0.6258, 0.5852), zone("LOVE", null, null)];

  it("returns the selected zone's coordinates", () => {
    expect(getZoneFocus(zones, "MOVE")).toEqual({ xRatio: 0.6258, yRatio: 0.5852 });
  });

  it("does not move the map for a zone without coordinates", () => {
    expect(getZoneFocus(zones, "LOVE")).toBeNull();
  });

  it("does not move the map when nothing is selected", () => {
    expect(getZoneFocus(zones, null)).toBeNull();
  });
});

describe("getZonesCenter", () => {
  it("centers on the middle of the placed zones", () => {
    const center = getZonesCenter([
      zone("PROVE", 0.5808, 0.5857),
      zone("MOVE", 0.6258, 0.5852),
      zone("GROOVE", 0.5855, 0.5937),
      zone("LOVE", null, null),
    ]);

    expect(center.xRatio).toBeCloseTo((0.5808 + 0.6258) / 2, 6);
    expect(center.yRatio).toBeCloseTo((0.5852 + 0.5937) / 2, 6);
  });

  it("falls back to the middle of the map when no zone has coordinates", () => {
    expect(getZonesCenter([zone("MOVE", null, null)])).toEqual({
      xRatio: 0.5,
      yRatio: 0.5,
    });
  });
});
