import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { changeSelection } from "./changeSelection";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { patch: vi.fn() } };
});

const httpPatch = vi.mocked(httpClient.patch);

afterEach(() => {
  vi.clearAllMocks();
});

describe("changeSelection", () => {
  it("patches the selection flag for the given song id", async () => {
    httpPatch.mockResolvedValueOnce({
      data: { success: true, data: { songRequestId: 12, selected: true }, error: null },
      status: 200,
    });

    await changeSelection({ songRequestId: 12, selected: true });

    expect(httpPatch).toHaveBeenCalledWith("/admin/promo/songs/12/selection", {
      selected: true,
    });
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
    httpPatch.mockRejectedValueOnce(axiosError);

    await expect(
      changeSelection({ songRequestId: 99, selected: false }),
    ).rejects.toThrowError(expect.objectContaining({ code: "PLST002", status: 404 }));
  });
});
