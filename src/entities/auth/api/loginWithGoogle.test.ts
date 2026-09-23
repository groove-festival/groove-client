import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { loginWithGoogle } from "./loginWithGoogle";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

afterEach(() => {
  vi.clearAllMocks();
});

describe("loginWithGoogle", () => {
  it("sends the ID token and unwraps the display name", async () => {
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: { displayName: "김그루브" }, error: null },
      status: 200,
    });

    await expect(loginWithGoogle("id-token-abc")).resolves.toEqual({
      displayName: "김그루브",
    });
    expect(httpPost).toHaveBeenCalledWith("/auth/google", { idToken: "id-token-abc" });
  });

  it("throws an ApiError for an invalid Google credential (401)", async () => {
    const axiosError = new AxiosError("unauthorized", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "A001", message: "invalid" } },
      status: 401,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPost.mockRejectedValueOnce(axiosError);

    await expect(loginWithGoogle("bad-token")).rejects.toThrowError(
      expect.objectContaining({ status: 401 }),
    );
  });
});
