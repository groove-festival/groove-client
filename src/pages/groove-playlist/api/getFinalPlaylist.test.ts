import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { getFinalPlaylist, isNotPublishedYet } from "./getFinalPlaylist";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

const errorResponse = (code: string, status: number) => ({
  data: { success: false, data: null, error: { code, message: code } },
  status,
  statusText: "",
  headers: {},
  config: { headers: new AxiosHeaders() },
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getFinalPlaylist", () => {
  it("returns the songs array in backend (display) order", async () => {
    const songs = [
      {
        title: "Ditto",
        artist: "NewJeans",
        nickname: "밤샘코딩",
        college: "IT",
        albumCoverUrl: "https://x/1",
        updatedAt: "2026-10-01T09:00:00+09:00",
      },
    ];
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: { totalCount: 1, songs }, error: null },
      status: 200,
    });

    await expect(getFinalPlaylist()).resolves.toEqual(songs);
    expect(httpGet).toHaveBeenCalledWith("/playlist/final-songs");
  });

  it("throws an ApiError with PLST006 when the playlist is not published yet", async () => {
    const axiosError = new AxiosError("forbidden", "ERR_BAD_REQUEST");
    axiosError.response = errorResponse("PLST006", 403);
    httpGet.mockRejectedValueOnce(axiosError);

    const error = await getFinalPlaylist().catch((caught: unknown) => caught);

    expect(isNotPublishedYet(error)).toBe(true);
  });
});

describe("isNotPublishedYet", () => {
  it("is false for other errors", () => {
    expect(isNotPublishedYet(new Error("boom"))).toBe(false);
  });
});
