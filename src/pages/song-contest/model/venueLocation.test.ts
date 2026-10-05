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
    expect(
      isWithinContestVenueRadius({
        latitude: contestVenueLocation.latitude + 0.0005,
        longitude: contestVenueLocation.longitude,
      }),
    ).toBe(true);
  });

  it("is false for a point well outside the 100m radius", () => {
    expect(
      isWithinContestVenueRadius({
        latitude: contestVenueLocation.latitude + 0.01,
        longitude: contestVenueLocation.longitude,
      }),
    ).toBe(false);
  });

  it("extends the allowed radius by the reported accuracy", () => {
    const position = {
      latitude: contestVenueLocation.latitude + 0.00108,
      longitude: contestVenueLocation.longitude,
    };

    expect(isWithinContestVenueRadius(position)).toBe(false);
    expect(isWithinContestVenueRadius(position, 25)).toBe(true);
  });

  it("caps the accuracy bonus so a huge reading cannot bypass the radius", () => {
    const position = {
      latitude: contestVenueLocation.latitude + 0.00153,
      longitude: contestVenueLocation.longitude,
    };

    expect(isWithinContestVenueRadius(position, 500)).toBe(false);
  });
});
