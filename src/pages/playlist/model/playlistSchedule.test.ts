import {
  resolvePlaylistPhaseAt,
  SONG_REQUEST_CLOSES_AT,
  SONG_REQUEST_OPENS_AT,
} from "./playlistSchedule";

describe("resolvePlaylistPhaseAt", () => {
  it("is 'before' until the open time", () => {
    expect(resolvePlaylistPhaseAt(new Date(SONG_REQUEST_OPENS_AT.getTime() - 1))).toBe(
      "before",
    );
  });

  it("is 'during' from the open time until the close time", () => {
    expect(resolvePlaylistPhaseAt(SONG_REQUEST_OPENS_AT)).toBe("during");
    expect(resolvePlaylistPhaseAt(new Date(SONG_REQUEST_CLOSES_AT.getTime() - 1))).toBe(
      "during",
    );
  });

  it("is 'after' from the close time on", () => {
    expect(resolvePlaylistPhaseAt(SONG_REQUEST_CLOSES_AT)).toBe("after");
    expect(resolvePlaylistPhaseAt(new Date(SONG_REQUEST_CLOSES_AT.getTime() + 1))).toBe(
      "after",
    );
  });

  it("uses 2026-09-12 and 2026-09-17 (KST) as the boundaries", () => {
    expect(SONG_REQUEST_OPENS_AT.toISOString()).toBe("2026-09-11T15:00:00.000Z");
    expect(SONG_REQUEST_CLOSES_AT.toISOString()).toBe("2026-09-16T15:00:00.000Z");
  });
});
