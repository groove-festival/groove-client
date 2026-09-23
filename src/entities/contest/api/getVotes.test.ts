import { httpClient } from "@/shared/api";

import { getVotes } from "./getVotes";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getVotes", () => {
  it("unwraps the vote list envelope", async () => {
    const votes = [
      {
        singingVoteId: 1,
        title: "가요제 예선 1라운드",
        round: "ROUND_1",
        roundLabel: "예선",
        roundKeyword: "자유로움",
        matchOrder: 1,
        status: "OPEN",
        endsAt: "2026-10-01T18:30:00+09:00",
        createdAt: "2026-09-01T00:00:00+09:00",
        participants: [
          { voteParticipantId: 1, name: "IT대학", resultRank: null },
          { voteParticipantId: 2, name: "간호대학", resultRank: null },
        ],
      },
    ];
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: votes, error: null },
      status: 200,
    });

    await expect(getVotes()).resolves.toEqual(votes);
    expect(httpGet).toHaveBeenCalledWith("/contest/votes");
  });
});
