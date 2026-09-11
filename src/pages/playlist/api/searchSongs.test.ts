import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { searchSongs } from "./searchSongs";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("searchSongs", () => {
  it("passes the keyword as a query param and returns the track list", async () => {
    const tracks = [
      {
        trackId: "1",
        title: "Ditto",
        artist: "NewJeans",
        albumCoverUrl: "https://x/1",
      },
    ];
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: { tracks }, error: null },
      status: 200,
    });

    await expect(searchSongs("ditto")).resolves.toEqual(tracks);
    expect(httpGet).toHaveBeenCalledWith("/playlist/search", {
      params: { keyword: "ditto" },
    });
  });

  it("returns an empty array when nothing matches", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: { tracks: [] }, error: null },
      status: 200,
    });

    await expect(searchSongs("zzz")).resolves.toEqual([]);
  });

  it("surfaces the external-failure code (PLST005) as an ApiError", async () => {
    const axiosError = new AxiosError("bad gateway", "ERR_BAD_RESPONSE");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "PLST005", message: "장애" } },
      status: 502,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpGet.mockRejectedValueOnce(axiosError);

    await expect(searchSongs("ditto")).rejects.toThrowError(
      expect.objectContaining({ code: "PLST005", status: 502 }),
    );
  });
});
