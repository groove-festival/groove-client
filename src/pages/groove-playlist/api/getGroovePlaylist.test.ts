import { getGroovePlaylist } from "./getGroovePlaylist";

describe("getGroovePlaylist (mock)", () => {
  it("returns a non-empty list of fully shaped entries", async () => {
    const playlist = await getGroovePlaylist();

    expect(playlist.length).toBeGreaterThan(0);
    for (const entry of playlist) {
      expect(entry).toMatchObject({
        id: expect.any(String),
        song: expect.any(String),
        artist: expect.any(String),
        college: expect.any(String),
        nickname: expect.any(String),
      });
      expect(entry.thumbnailUrl).toBeNull();
    }
  });

  it("gives every entry a unique id", async () => {
    const playlist = await getGroovePlaylist();
    const ids = new Set(playlist.map((entry) => entry.id));

    expect(ids.size).toBe(playlist.length);
  });
});
