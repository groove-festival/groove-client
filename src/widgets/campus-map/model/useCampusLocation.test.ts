import { act, renderHook } from "@testing-library/react";

import { useCampusLocation } from "./useCampusLocation";

const watchPosition = vi.fn();
const clearWatch = vi.fn();

beforeEach(() => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { clearWatch, watchPosition },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCampusLocation", () => {
  it("does not ask for location until the user starts it", () => {
    const { result } = renderHook(() => useCampusLocation());

    expect(result.current.status).toBe("idle");
    expect(watchPosition).not.toHaveBeenCalled();

    act(() => result.current.start());

    expect(watchPosition).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("locating");
  });

  it("keeps updating the reading while the page is mounted", () => {
    let onSuccess: PositionCallback = () => {};
    watchPosition.mockImplementation((success) => {
      onSuccess = success;
      return 7;
    });
    const { result } = renderHook(() => useCampusLocation());

    act(() => result.current.start());
    act(() =>
      onSuccess({
        coords: { accuracy: 12, latitude: 35.8886, longitude: 128.6121 },
        timestamp: 10,
      } as GeolocationPosition),
    );

    expect(result.current.reading?.latitude).toBe(35.8886);
    act(() =>
      onSuccess({
        coords: { accuracy: 8, latitude: 35.88862, longitude: 128.61212 },
        timestamp: 1_010,
      } as GeolocationPosition),
    );

    expect(result.current.status).toBe("tracking");
    expect(result.current.reading?.accuracy).toBe(8);
    expect(result.current.reading?.latitude).toBeGreaterThan(35.8886);
    expect(result.current.reading?.latitude).toBeLessThan(35.88862);
    expect(result.current.reading?.longitude).toBeGreaterThan(128.6121);
    expect(result.current.reading?.longitude).toBeLessThan(128.61212);
    expect(result.current.reading?.timestamp).toBe(1_010);
  });

  it("reports permission denial separately and clears the current reading", () => {
    let onSuccess: PositionCallback = () => {};
    let onError: PositionErrorCallback = () => {};
    watchPosition.mockImplementation((success, error) => {
      onSuccess = success;
      onError = error;
      return 9;
    });
    const { result } = renderHook(() => useCampusLocation());

    act(() => result.current.start());
    act(() =>
      onSuccess({
        coords: { accuracy: 12, latitude: 35.8886, longitude: 128.6121 },
        timestamp: 10,
      } as GeolocationPosition),
    );
    act(() => onError({ code: 1 } as GeolocationPositionError));

    expect(result.current.status).toBe("permission-denied");
    expect(result.current.reading).toBeNull();
    expect(clearWatch).toHaveBeenCalledWith(9);
  });

  it("clears the active watch on unmount", () => {
    watchPosition.mockReturnValue(11);
    const { result, unmount } = renderHook(() => useCampusLocation());

    act(() => result.current.start());
    unmount();

    expect(clearWatch).toHaveBeenCalledWith(11);
  });
});
