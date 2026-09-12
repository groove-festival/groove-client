import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { deleteSongRequest } from "./deleteSongRequest";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { delete: vi.fn() } };
});

const httpDelete = vi.mocked(httpClient.delete);

afterEach(() => {
  vi.clearAllMocks();
});

describe("deleteSongRequest", () => {
  it("calls DELETE with the song id path", async () => {
    httpDelete.mockResolvedValueOnce({
      data: { success: true, data: {}, error: null },
      status: 200,
    });

    await expect(deleteSongRequest(12)).resolves.toBeUndefined();
    expect(httpDelete).toHaveBeenCalledWith("/admin/promo/songs/12");
  });

  it("throws an ApiError for a missing song (PLST002)", async () => {
    const axiosError = new AxiosError("not found", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "PLST002", message: "없음" } },
      status: 404,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpDelete.mockRejectedValueOnce(axiosError);

    await expect(deleteSongRequest(99)).rejects.toThrowError(
      expect.objectContaining({ code: "PLST002" }),
    );
  });
});
