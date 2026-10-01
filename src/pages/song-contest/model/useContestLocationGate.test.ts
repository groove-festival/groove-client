import { act, renderHook } from "@testing-library/react";

import { useContestLocationGate } from "./useContestLocationGate";

const watchPosition = vi.fn();
const clearWatch = vi.fn();

beforeEach(() => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { watchPosition, clearWatch },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useContestLocationGate", () => {
  it("reports in-range when the position is within the venue radius", () => {
    watchPosition.mockImplementation((success) => {
      success({
        coords: { latitude: 35.8893097, longitude: 128.6119262, accuracy: 10 },
      });
      return 1;
    });

    const { result } = renderHook(() => useContestLocationGate());

    expect(result.current.status).toBe("in-range");
  });

  it("reports out-of-range when the position is far from the venue", () => {
    watchPosition.mockImplementation((success) => {
      success({ coords: { latitude: 35.9, longitude: 128.6119262, accuracy: 10 } });
      return 1;
    });

    const { result } = renderHook(() => useContestLocationGate());

    expect(result.current.status).toBe("out-of-range");
  });

  it("keeps watching and auto-updates status as position changes", () => {
    let onSuccess: (position: {
      coords: { latitude: number; longitude: number; accuracy: number };
    }) => void = () => {};
    watchPosition.mockImplementation((success) => {
      onSuccess = success;
      onSuccess({ coords: { latitude: 35.9, longitude: 128.6119262, accuracy: 10 } });
      return 1;
    });

    const { result } = renderHook(() => useContestLocationGate());

    expect(result.current.status).toBe("out-of-range");

    act(() => {
      onSuccess({
        coords: { latitude: 35.8893097, longitude: 128.6119262, accuracy: 10 },
      });
    });

    expect(result.current.status).toBe("in-range");
  });

  it("clears the watch on unmount", () => {
    watchPosition.mockImplementation((success) => {
      success({
        coords: { latitude: 35.8893097, longitude: 128.6119262, accuracy: 10 },
      });
      return 7;
    });

    const { unmount } = renderHook(() => useContestLocationGate());
    unmount();

    expect(clearWatch).toHaveBeenCalledWith(7);
  });

  it("reports permission-denied and retry re-checks", () => {
    watchPosition.mockImplementation((_success, error) => {
      error({ code: 1 });
      return 1;
    });

    const { result } = renderHook(() => useContestLocationGate());

    expect(result.current.status).toBe("permission-denied");

    watchPosition.mockImplementation((success) => {
      success({
        coords: { latitude: 35.8893097, longitude: 128.6119262, accuracy: 10 },
      });
      return 2;
    });
    act(() => {
      result.current.retry();
    });

    expect(result.current.status).toBe("in-range");
  });

  it("reports unavailable when position lookup fails for another reason", () => {
    watchPosition.mockImplementation((_success, error) => {
      error({ code: 2 });
      return 1;
    });

    const { result } = renderHook(() => useContestLocationGate());

    expect(result.current.status).toBe("unavailable");
  });

  it("reports unavailable when geolocation is not supported", () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useContestLocationGate());

    expect(result.current.status).toBe("unavailable");
  });

  it("does not request a position when the gate is disabled", () => {
    const { result } = renderHook(() => useContestLocationGate(false));

    expect(result.current.status).toBe("unavailable");
    expect(watchPosition).not.toHaveBeenCalled();

    act(() => result.current.retry());
    expect(watchPosition).not.toHaveBeenCalled();
  });
});
