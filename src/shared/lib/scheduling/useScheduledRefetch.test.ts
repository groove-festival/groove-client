import { renderHook } from "@testing-library/react";

import { useScheduledRefetch } from "./useScheduledRefetch";

describe("useScheduledRefetch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-12T00:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires the callback once the target time is reached", () => {
    const onReach = vi.fn();
    renderHook(() => useScheduledRefetch("2026-09-12T00:00:10+09:00", onReach));

    vi.advanceTimersByTime(9000);
    expect(onReach).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(onReach).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the target is already in the past", () => {
    const onReach = vi.fn();
    renderHook(() => useScheduledRefetch("2026-09-11T23:59:00+09:00", onReach));

    vi.advanceTimersByTime(60_000);
    expect(onReach).not.toHaveBeenCalled();
  });

  it("does nothing without a target", () => {
    const onReach = vi.fn();
    renderHook(() => useScheduledRefetch(undefined, onReach));

    vi.advanceTimersByTime(60_000);
    expect(onReach).not.toHaveBeenCalled();
  });

  it("clears the pending timer on unmount", () => {
    const onReach = vi.fn();
    const { unmount } = renderHook(() =>
      useScheduledRefetch("2026-09-12T00:00:10+09:00", onReach),
    );

    unmount();
    vi.advanceTimersByTime(10_000);

    expect(onReach).not.toHaveBeenCalled();
  });
});
