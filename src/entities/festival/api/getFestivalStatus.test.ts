import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { getFestivalStatus } from "./getFestivalStatus";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

const statusBody = {
  phase: "BEFORE",
  festivalStartAt: "2026-10-01T00:00:00+09:00",
  festivalEndAt: "2026-10-03T00:00:00+09:00",
  storyCollectionOpen: false,
  playlist: {
    phase: "SUBMISSION",
    submissionStartAt: "2026-09-12T00:00:00+09:00",
    submissionEndAt: "2026-09-17T00:00:00+09:00",
    publishAt: "2026-10-01T00:00:00+09:00",
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("getFestivalStatus", () => {
  it("unwraps the festival status envelope", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: statusBody, error: null },
      status: 200,
    });

    await expect(getFestivalStatus()).resolves.toEqual(statusBody);
    expect(httpGet).toHaveBeenCalledWith("/festival/status");
  });

  it("throws a normalized ApiError when the request fails", async () => {
    const axiosError = new AxiosError("boom", "ERR_BAD_RESPONSE");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "C001", message: "bad" } },
      status: 400,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpGet.mockRejectedValueOnce(axiosError);

    await expect(getFestivalStatus()).rejects.toThrowError(
      expect.objectContaining({ code: "C001", status: 400 }),
    );
  });
});
