import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { submitBallot } from "./submitBallot";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

afterEach(() => {
  vi.clearAllMocks();
});

describe("submitBallot", () => {
  it("sends the participant id with the Idempotency-Key header", async () => {
    const responseBody = {
      singingVoteId: 1,
      voteParticipantId: 1,
      votedAt: "2026-10-01T18:05:00+09:00",
    };
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: responseBody, error: null },
      status: 200,
    });

    await expect(
      submitBallot({ singingVoteId: 1, voteParticipantId: 1, idempotencyKey: "key-1" }),
    ).resolves.toEqual(responseBody);
    expect(httpPost).toHaveBeenCalledWith(
      "/contest/votes/1/ballots",
      { voteParticipantId: 1 },
      { headers: { "Idempotency-Key": "key-1" } },
    );
  });

  it("surfaces the already-voted code (SING006) as an ApiError", async () => {
    const axiosError = new AxiosError("conflict", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: {
        success: false,
        data: null,
        error: { code: "SING006", message: "이미 투표함" },
      },
      status: 409,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPost.mockRejectedValueOnce(axiosError);

    await expect(
      submitBallot({ singingVoteId: 1, voteParticipantId: 1, idempotencyKey: "key-2" }),
    ).rejects.toThrowError(expect.objectContaining({ code: "SING006", status: 409 }));
  });
});
