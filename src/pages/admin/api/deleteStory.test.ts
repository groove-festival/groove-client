import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { deleteStory } from "./deleteStory";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { delete: vi.fn() } };
});

const httpDelete = vi.mocked(httpClient.delete);

afterEach(() => {
  vi.clearAllMocks();
});

describe("deleteStory", () => {
  it("deletes the story by id", async () => {
    httpDelete.mockResolvedValueOnce({
      data: { success: true, data: {}, error: null },
      status: 200,
    });

    await expect(deleteStory(1)).resolves.toBeUndefined();
    expect(httpDelete).toHaveBeenCalledWith("/admin/stage/stories/1");
  });

  it("throws an ApiError for an already-deleted story (SING005)", async () => {
    const axiosError = new AxiosError("not found", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "SING005", message: "없음" } },
      status: 404,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpDelete.mockRejectedValueOnce(axiosError);

    await expect(deleteStory(99)).rejects.toThrowError(
      expect.objectContaining({ code: "SING005", status: 404 }),
    );
  });
});
