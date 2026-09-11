import { parsePlaylistPhaseOverride } from "./playlistPhase";

describe("parsePlaylistPhaseOverride", () => {
  it("returns null when no override is given", () => {
    expect(parsePlaylistPhaseOverride(null)).toBeNull();
    expect(parsePlaylistPhaseOverride("")).toBeNull();
  });

  it("accepts the spec enum values case-insensitively", () => {
    expect(parsePlaylistPhaseOverride("SUBMISSION")).toBe("SUBMISSION");
    expect(parsePlaylistPhaseOverride("published")).toBe("PUBLISHED");
    expect(parsePlaylistPhaseOverride(" Before_Open ")).toBe("BEFORE_OPEN");
  });

  it("maps the legacy before/during/after aliases", () => {
    expect(parsePlaylistPhaseOverride("before")).toBe("BEFORE_OPEN");
    expect(parsePlaylistPhaseOverride("during")).toBe("SUBMISSION");
    expect(parsePlaylistPhaseOverride("after")).toBe("SELECTION");
  });

  it("returns null for an unknown value", () => {
    expect(parsePlaylistPhaseOverride("closed")).toBeNull();
  });
});
