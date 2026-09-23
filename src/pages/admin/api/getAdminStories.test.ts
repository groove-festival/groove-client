import { httpClient } from "@/shared/api";

import { getAdminStories } from "./getAdminStories";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getAdminStories", () => {
  it("unwraps the full story list including private fields", async () => {
    const stories = [
      {
        storySubmissionId: 1,
        college: "IT",
        department: "컴퓨터학부",
        studentNumber: "2025000123",
        name: "김그루브",
        nickname: "gv",
        title: "축제 이야기",
        content: "함께 노래해요.",
        submittedAt: "2026-09-25T10:00:00+09:00",
      },
    ];
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: stories, error: null },
      status: 200,
    });

    await expect(getAdminStories()).resolves.toEqual(stories);
    expect(httpGet).toHaveBeenCalledWith("/admin/stage/stories");
  });
});
