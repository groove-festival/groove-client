import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { toggleVoteStatus } from "./toggleVoteStatus";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { patch: vi.fn() } };
});

const httpPatch = vi.mocked(httpClient.patch);

afterEach(() => {
  vi.clearAllMocks();
});

describe("toggleVoteStatus", () => {
  it("sends the duration when opening a vote", async () => {
    httpPatch.mockResolvedValueOnce({
      data: { success: true, data: { singingVoteId: 1, status: "OPEN" }, error: null },
      status: 200,
    });

    await toggleVoteStatus({ singingVoteId: 1, status: "OPEN", extendMinutes: 10 });

    expect(httpPatch).toHaveBeenCalledWith("/admin/stage/votes/1/status", {
      status: "OPEN",
      extendMinutes: 10,
    });
  });

  it("sends no duration when closing a vote", async () => {
    httpPatch.mockResolvedValueOnce({
      data: {
        success: true,
        data: { singingVoteId: 1, status: "CLOSED" },
        error: null,
      },
      status: 200,
    });

    await toggleVoteStatus({ singingVoteId: 1, status: "CLOSED" });

    expect(httpPatch).toHaveBeenCalledWith("/admin/stage/votes/1/status", {
      status: "CLOSED",
    });
  });

  it("throws an ApiError when participants are not yet decided (SING013)", async () => {
    const axiosError = new AxiosError("conflict", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "SING013", message: "미정" } },
      status: 409,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPatch.mockRejectedValueOnce(axiosError);

    await expect(
      toggleVoteStatus({ singingVoteId: 2, status: "OPEN", extendMinutes: 5 }),
    ).rejects.toThrowError(expect.objectContaining({ code: "SING013", status: 409 }));
  });
});
