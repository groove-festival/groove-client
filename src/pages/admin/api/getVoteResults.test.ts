import { httpClient } from "@/shared/api";

import { getVoteResults } from "./getVoteResults";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getVoteResults", () => {
  it("unwraps the vote results envelope", async () => {
    const body = {
      totalVotes: 12,
      tallies: [
        { voteParticipantId: 1, voteCount: 7 },
        { voteParticipantId: 2, voteCount: 5 },
      ],
    };
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: body, error: null },
      status: 200,
    });

    await expect(getVoteResults(1)).resolves.toEqual(body);
    expect(httpGet).toHaveBeenCalledWith("/admin/stage/votes/1/results");
  });
});
