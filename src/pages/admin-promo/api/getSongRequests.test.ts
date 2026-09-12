import { httpClient } from "@/shared/api";

import { getSongRequests } from "./getSongRequests";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getSongRequests", () => {
  it("unwraps the grouped list", async () => {
    const list = {
      totalCount: 1,
      selectedCount: 0,
      groups: [
        {
          college: "IT",
          collegeName: "IT융합대학",
          count: 1,
          songs: [
            {
              songRequestId: 12,
              title: "Super Shy",
              artist: "NewJeans",
              trackId: "1",
              nickname: "그루브러버",
              name: "이상민",
              studentNumber: "2021123456",
              college: "IT",
              department: "컴퓨터학부",
              selected: false,
              requestedAt: "2026-09-12T10:30:00+09:00",
              updatedAt: "2026-09-14T21:05:00+09:00",
            },
          ],
        },
      ],
    };
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: list, error: null },
      status: 200,
    });

    await expect(getSongRequests()).resolves.toEqual(list);
    expect(httpGet).toHaveBeenCalledWith("/admin/promo/songs");
  });
});
