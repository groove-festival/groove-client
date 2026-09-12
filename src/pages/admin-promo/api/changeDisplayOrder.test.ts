import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { changeDisplayOrder } from "./changeDisplayOrder";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { put: vi.fn() } };
});

const httpPut = vi.mocked(httpClient.put);

afterEach(() => {
  vi.clearAllMocks();
});

describe("changeDisplayOrder", () => {
  it("puts the ordered id array and unwraps the result", async () => {
    httpPut.mockResolvedValueOnce({
      data: { success: true, data: { totalCount: 3, songs: [] }, error: null },
      status: 200,
    });

    await changeDisplayOrder([12, 7, 30]);

    expect(httpPut).toHaveBeenCalledWith("/admin/promo/songs/display-order", {
      songRequestIds: [12, 7, 30],
    });
  });

  it("throws an ApiError when the order does not match the selected set (PLST008)", async () => {
    const axiosError = new AxiosError("bad request", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: {
        success: false,
        data: null,
        error: { code: "PLST008", message: "불일치" },
      },
      status: 400,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPut.mockRejectedValueOnce(axiosError);

    await expect(changeDisplayOrder([1])).rejects.toThrowError(
      expect.objectContaining({ code: "PLST008", status: 400 }),
    );
  });
});
