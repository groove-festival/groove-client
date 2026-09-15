import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type TestClarityCommand = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  queue?: unknown[][];
};

describe("initializeAnalytics", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_TELEMETRY_ENABLED", "true");
    vi.stubEnv("VITE_CLARITY_PROJECT_ID", "yi8q84dumw");
    document.head.innerHTML = "";
    delete window.clarity;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("queues Clarity commands on the queue used by the official tag", async () => {
    const { initializeAnalytics } = await import("./initialize-analytics");

    initializeAnalytics();

    const clarity = window.clarity as TestClarityCommand | undefined;
    clarity?.("event", "test_event");

    expect(clarity?.q).toEqual([["event", "test_event"]]);
    expect(clarity?.queue).toBeUndefined();
    expect(
      document.querySelector<HTMLScriptElement>("#groove-microsoft-clarity")?.src,
    ).toBe("https://www.clarity.ms/tag/yi8q84dumw");
  });
});
