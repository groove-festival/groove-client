import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { submitVoteResult } from "./submitVoteResult";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { put: vi.fn() } };
});

const httpPut = vi.mocked(httpClient.put);

afterEach(() => {
  vi.clearAllMocks();
});

describe("submitVoteResult", () => {
  it("puts the ranked results for the vote", async () => {
    const results = [
      { voteParticipantId: 1, rank: 1 },
      { voteParticipantId: 2, rank: 2 },
    ];
    httpPut.mockResolvedValueOnce({
      data: {
        success: true,
        data: { singingVoteId: 1, status: "CLOSED" },
        error: null,
      },
      status: 200,
    });

    await submitVoteResult({ singingVoteId: 1, results });

    expect(httpPut).toHaveBeenCalledWith("/admin/stage/votes/1/result", { results });
  });

  it("throws an ApiError for missing or duplicate ranks (SING012)", async () => {
    const axiosError = new AxiosError("bad request", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "SING012", message: "중복" } },
      status: 400,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPut.mockRejectedValueOnce(axiosError);

    await expect(
      submitVoteResult({
        singingVoteId: 1,
        results: [
          { voteParticipantId: 1, rank: 1 },
          { voteParticipantId: 2, rank: 1 },
        ],
      }),
    ).rejects.toThrowError(expect.objectContaining({ code: "SING012", status: 400 }));
  });
});
