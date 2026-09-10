import { render, screen } from "@testing-library/react";

import { PlaylistEntry } from "./PlaylistEntry";

const entry = {
  id: "1",
  song: "Ditto",
  artist: "NewJeans",
  college: "IT",
  nickname: "밤샘코딩",
  thumbnailUrl: null,
};

describe("PlaylistEntry", () => {
  it("shows the song, artist, and the college / nickname meta", () => {
    render(
      <ul>
        <PlaylistEntry entry={entry} />
      </ul>,
    );

    expect(screen.getByText("Ditto")).toBeInTheDocument();
    expect(screen.getByText("NewJeans")).toBeInTheDocument();
    expect(screen.getByText("IT • 밤샘코딩")).toBeInTheDocument();
  });
});
