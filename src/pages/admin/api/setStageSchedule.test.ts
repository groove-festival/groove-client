import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { setStageSchedule } from "./setStageSchedule";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { put: vi.fn() } };
});

const httpPut = vi.mocked(httpClient.put);

afterEach(() => {
  vi.clearAllMocks();
});

describe("setStageSchedule", () => {
  it("puts the four schedule fields and unwraps the saved schedule", async () => {
    const args = {
      storyCollectionStartAt: "2026-09-20T00:00:00+09:00",
      storyCollectionEndAt: "2026-09-30T00:00:00+09:00",
      contestStartAt: "2026-10-02T19:00:00+09:00",
      contestEndAt: "2026-10-02T22:45:00+09:00",
    };
    httpPut.mockResolvedValueOnce({
      data: { success: true, data: args, error: null },
      status: 200,
    });

    await expect(setStageSchedule(args)).resolves.toEqual(args);
    expect(httpPut).toHaveBeenCalledWith("/admin/stage/schedule", args);
  });

  it("throws an ApiError when start is not before end (SING011)", async () => {
    const axiosError = new AxiosError("bad request", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "SING011", message: "역전" } },
      status: 400,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPut.mockRejectedValueOnce(axiosError);

    await expect(setStageSchedule({})).rejects.toThrowError(
      expect.objectContaining({ code: "SING011", status: 400 }),
    );
  });
});
