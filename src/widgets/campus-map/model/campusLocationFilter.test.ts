import type { CampusLocationReading } from "./georeference";
import { updateCampusLocationFilter } from "./campusLocationFilter";

const createReading = (
  overrides: Partial<CampusLocationReading> = {},
): CampusLocationReading => ({
  accuracy: 5,
  latitude: 35.889,
  longitude: 128.612,
  timestamp: 1_000,
  ...overrides,
});

describe("campus location filter", () => {
  it("shows the first valid reading immediately", () => {
    const reading = createReading();
    const state = updateCampusLocationFilter(null, reading);

    expect(state?.reading).toEqual(reading);
  });

  it("ignores invalid and non-increasing readings", () => {
    const initial = updateCampusLocationFilter(null, createReading());
    const invalid = updateCampusLocationFilter(
      initial,
      createReading({ accuracy: -1, timestamp: 2_000 }),
    );
    const older = updateCampusLocationFilter(
      initial,
      createReading({ longitude: 128.613, timestamp: 1_000 }),
    );

    expect(invalid).toBe(initial);
    expect(older).toBe(initial);
  });

  it("dampens small GPS movement inside the reported accuracy", () => {
    const initial = updateCampusLocationFilter(null, createReading({ accuracy: 6 }));
    const nextLongitude = 128.61205;
    const updated = updateCampusLocationFilter(
      initial,
      createReading({
        accuracy: 6,
        longitude: nextLongitude,
        timestamp: 2_000,
      }),
    );

    expect(updated?.reading.longitude).toBeGreaterThan(128.612);
    expect(updated?.reading.longitude).toBeLessThan(nextLongitude);
  });

  it("keeps following a sequence of normal walking updates", () => {
    let state = updateCampusLocationFilter(null, createReading({ accuracy: 3 }));

    for (let index = 1; index <= 5; index += 1) {
      state = updateCampusLocationFilter(
        state,
        createReading({
          accuracy: 3,
          longitude: 128.612 + index * 0.00002,
          timestamp: 1_000 + index * 1_000,
        }),
      );
    }

    expect(state?.reading.longitude).toBeGreaterThan(128.61206);
    expect(state?.reading.longitude).toBeLessThan(128.6121);
  });

  it("rejects an implausible short-term jump", () => {
    const initial = updateCampusLocationFilter(null, createReading({ accuracy: 3 }));
    const jumped = updateCampusLocationFilter(
      initial,
      createReading({
        accuracy: 3,
        longitude: 128.615,
        timestamp: 2_000,
      }),
    );

    expect(jumped).toBe(initial);
  });

  it("snaps to a fresh reading after a long update gap", () => {
    const initial = updateCampusLocationFilter(null, createReading());
    const freshReading = createReading({
      latitude: 35.888,
      longitude: 128.614,
      timestamp: 11_000,
    });
    const restarted = updateCampusLocationFilter(initial, freshReading);

    expect(restarted?.reading).toEqual(freshReading);
  });
});
