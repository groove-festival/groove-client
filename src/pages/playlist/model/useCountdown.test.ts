import { act, renderHook } from "@testing-library/react";

import { useCountdown } from "./useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("splits the remaining time and allows 3-digit hours past 100h", () => {
    // 5일 13시간 2분 7초 -> 133:02:07
    const target = new Date("2026-09-06T13:02:07Z");
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current).toMatchObject({
      hours: 133,
      minutes: 2,
      seconds: 7,
      isElapsed: false,
    });
  });

  it("ticks down every second", () => {
    const target = new Date("2026-09-01T00:00:10Z");
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.seconds).toBe(10);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.seconds).toBe(7);
  });

  it("reports elapsed once the target passes", () => {
    const target = new Date("2026-09-01T00:00:02Z");
    const { result } = renderHook(() => useCountdown(target));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current).toMatchObject({
      hours: 0,
      minutes: 0,
      seconds: 0,
      isElapsed: true,
    });
  });
});
