import { httpClient } from "@/shared/api";

import { getPublicContestStories } from "./getPublicContestStories";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getPublicContestStories", () => {
  it("gets public story titles from the participant endpoint", async () => {
    const stories = [
      {
        storyId: 1,
        title: "함께 부르는 밤",
        nickname: null,
        college: "IT" as const,
        submittedAt: "2026-09-22T10:00:00+09:00",
      },
    ];
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: stories, error: null },
      status: 200,
    });

    await expect(getPublicContestStories()).resolves.toEqual(stories);
    expect(httpGet).toHaveBeenCalledWith("/contest/stories");
  });
});
