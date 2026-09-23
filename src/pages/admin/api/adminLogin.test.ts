import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { adminLogin } from "./adminLogin";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

afterEach(() => {
  vi.clearAllMocks();
});

describe("adminLogin", () => {
  it("posts the credentials and returns the role result", async () => {
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: { role: "PROMO_ADMIN", pubId: null }, error: null },
      status: 200,
    });

    const body = { loginId: "pub-jeonja-eh", password: "secret" };
    await expect(adminLogin(body)).resolves.toEqual({
      role: "PROMO_ADMIN",
      pubId: null,
    });
    expect(httpPost).toHaveBeenCalledWith("/auth/admin/login", body);
  });

  it("surfaces the id/pw mismatch code (A002) as an ApiError", async () => {
    const axiosError = new AxiosError("unauthorized", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "A002", message: "불일치" } },
      status: 401,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPost.mockRejectedValueOnce(axiosError);

    await expect(adminLogin({ loginId: "x", password: "y" })).rejects.toThrowError(
      expect.objectContaining({ code: "A002", status: 401 }),
    );
  });
});
