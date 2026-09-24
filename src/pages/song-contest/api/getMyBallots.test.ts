import { httpClient } from "@/shared/api";

import { getMyBallots } from "./getMyBallots";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getMyBallots", () => {
  it("unwraps my ballots list", async () => {
    const ballots = [
      { singingVoteId: 1, voteParticipantId: 1, votedAt: "2026-10-01T18:05:00+09:00" },
    ];
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: ballots, error: null },
      status: 200,
    });

    await expect(getMyBallots()).resolves.toEqual(ballots);
    expect(httpGet).toHaveBeenCalledWith("/contest/my-ballots");
  });
});
