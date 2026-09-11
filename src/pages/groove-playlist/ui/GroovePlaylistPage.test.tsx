import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import { ApiError } from "@/shared/api";

import { useFinalPlaylist } from "../api/getFinalPlaylist";
import GroovePlaylistPage from "./GroovePlaylistPage";

vi.mock("../api/getFinalPlaylist", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "../api/getFinalPlaylist",
  );
  return { ...actual, useFinalPlaylist: vi.fn() };
});

const useFinalPlaylistMock = vi.mocked(useFinalPlaylist);

type PlaylistQuery = ReturnType<typeof useFinalPlaylist>;

const mockPlaylist = (value: Partial<PlaylistQuery>) => {
  useFinalPlaylistMock.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...value,
  } as PlaylistQuery);
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/playlist"]}>
      <Routes>
        <Route path="/" element={<p>home route</p>} />
        <Route path="/playlist" element={<GroovePlaylistPage />} />
      </Routes>
    </MemoryRouter>,
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe("GroovePlaylistPage", () => {
  it("shows the header and the PLAYLIST heading", () => {
    mockPlaylist({ data: [] });
    renderPage();

    expect(
      screen.getByRole("heading", { name: "GROOVE PLAYLIST" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "PLAYLIST" })).toBeInTheDocument();
  });

  it("renders the fetched playlist entries in order", () => {
    mockPlaylist({
      data: [
        {
          title: "Ditto",
          artist: "NewJeans",
          nickname: "밤샘코딩",
          college: "IT",
          updatedAt: "2026-10-01T09:00:00+09:00",
        },
      ],
    });
    renderPage();

    expect(screen.getByText("Ditto")).toBeInTheDocument();
    expect(screen.getByText("IT • 밤샘코딩")).toBeInTheDocument();
  });

  it("shows a not-published-yet notice for PLST006", () => {
    mockPlaylist({ isError: true, error: new ApiError("PLST006", "not yet", 403) });
    renderPage();

    expect(
      screen.getByText("아직 공개 전이에요. 축제 기간에 다시 확인해 주세요."),
    ).toBeInTheDocument();
  });

  it("shows a generic error notice for other failures", () => {
    mockPlaylist({ isError: true, error: new ApiError("NETWORK", "boom") });
    renderPage();

    expect(screen.getByText("플레이리스트를 불러오지 못했어요.")).toBeInTheDocument();
  });

  it("goes to the home route from the back button", () => {
    mockPlaylist({ data: [] });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(screen.getByText("home route")).toBeInTheDocument();
  });
});
