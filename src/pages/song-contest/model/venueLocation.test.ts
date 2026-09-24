import { contestVenueLocation, isWithinContestVenueRadius } from "./venueLocation";

describe("isWithinContestVenueRadius", () => {
  it("is true exactly at the venue coordinates", () => {
    expect(
      isWithinContestVenueRadius({
        latitude: contestVenueLocation.latitude,
        longitude: contestVenueLocation.longitude,
      }),
    ).toBe(true);
  });

  it("is true for a point well inside the 100m radius", () => {
    // 위도 0.0005도 ≈ 55m 북쪽.
    expect(
      isWithinContestVenueRadius({
        latitude: contestVenueLocation.latitude + 0.0005,
        longitude: contestVenueLocation.longitude,
      }),
    ).toBe(true);
  });

  it("is false for a point well outside the 100m radius", () => {
    // 위도 0.01도 ≈ 1.1km 북쪽.
    expect(
      isWithinContestVenueRadius({
        latitude: contestVenueLocation.latitude + 0.01,
        longitude: contestVenueLocation.longitude,
      }),
    ).toBe(false);
  });

  it("extends the allowed radius by the reported accuracy", () => {
    // 위도 0.00108도 ≈ 120m 북쪽 (반경 100m 밖).
    const position = {
      latitude: contestVenueLocation.latitude + 0.00108,
      longitude: contestVenueLocation.longitude,
    };

    expect(isWithinContestVenueRadius(position)).toBe(false);
    expect(isWithinContestVenueRadius(position, 25)).toBe(true);
  });

  it("caps the accuracy bonus so a huge reading cannot bypass the radius", () => {
    // 위도 0.00153도 ≈ 170m 북쪽 (반경 100m + 50m 상한을 넘어섬).
    const position = {
      latitude: contestVenueLocation.latitude + 0.00153,
      longitude: contestVenueLocation.longitude,
    };

    expect(isWithinContestVenueRadius(position, 500)).toBe(false);
  });
});
