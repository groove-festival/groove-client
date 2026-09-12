import { render, screen } from "@testing-library/react";

import type { FinalPlaylistSong } from "../api/getFinalPlaylist";
import { PlaylistEntry } from "./PlaylistEntry";

const entry: FinalPlaylistSong = {
  title: "Ditto",
  artist: "NewJeans",
  nickname: "밤샘코딩",
  college: "NURSING",
  updatedAt: "2026-10-01T09:00:00+09:00",
};

describe("PlaylistEntry", () => {
  it("shows the song, artist, and the college label / nickname meta", () => {
    render(
      <ul>
        <PlaylistEntry entry={entry} />
      </ul>,
    );

    expect(screen.getByText("Ditto")).toBeInTheDocument();
    expect(screen.getByText("NewJeans")).toBeInTheDocument();
    expect(screen.getByText("간호 • 밤샘코딩")).toBeInTheDocument();
  });

  it("renders the album cover when present", () => {
    render(
      <ul>
        <PlaylistEntry entry={{ ...entry, albumCoverUrl: "https://x/cover" }} />
      </ul>,
    );

    expect(document.querySelector('img[src="https://x/cover"]')).not.toBeNull();
  });
});
