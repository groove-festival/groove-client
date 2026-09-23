import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { logout } from "./logout";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

afterEach(() => {
  vi.clearAllMocks();
});

describe("logout", () => {
  it("resolves on a success envelope even with an empty data body", async () => {
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: {}, error: null },
      status: 200,
    });

    await expect(logout()).resolves.toBeUndefined();
    expect(httpPost).toHaveBeenCalledWith("/auth/logout");
  });

  it("throws an ApiError when not logged in (C003)", async () => {
    const axiosError = new AxiosError("unauthorized", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: {
        success: false,
        data: null,
        error: { code: "C003", message: "미로그인" },
      },
      status: 401,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPost.mockRejectedValueOnce(axiosError);

    await expect(logout()).rejects.toThrowError(
      expect.objectContaining({ code: "C003" }),
    );
  });
});
