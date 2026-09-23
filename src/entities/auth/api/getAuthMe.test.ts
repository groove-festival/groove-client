import { AxiosError } from "axios";

import { httpClient } from "@/shared/api";

import { getAuthMe } from "./getAuthMe";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getAuthMe", () => {
  it("unwraps the account block", async () => {
    const account = {
      loggedIn: true,
      role: "PROMO_ADMIN",
      displayName: null,
      pubId: null,
    };
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: { account }, error: null },
      status: 200,
    });

    await expect(getAuthMe()).resolves.toEqual(account);
    expect(httpGet).toHaveBeenCalledWith("/auth/me");
  });

  it("returns the not-logged-in account without throwing", async () => {
    const account = {
      loggedIn: false,
      role: null,
      displayName: null,
      pubId: null,
    };
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: { account }, error: null },
      status: 200,
    });

    await expect(getAuthMe()).resolves.toEqual(account);
  });

  it("normalizes a transport failure to an ApiError", async () => {
    const axiosError = new AxiosError("network", "ERR_NETWORK");
    axiosError.response = undefined;
    httpGet.mockRejectedValueOnce(axiosError);

    await expect(getAuthMe()).rejects.toThrowError(
      expect.objectContaining({ code: "NETWORK" }),
    );
  });
});
