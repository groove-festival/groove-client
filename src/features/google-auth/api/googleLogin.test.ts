import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { createElement, type ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { googleLogin, useGoogleLogin } from "./googleLogin";
import { googleAuthQueryKeys } from "./queryKeys";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

afterEach(() => {
  vi.clearAllMocks();
});

describe("googleLogin", () => {
  it("posts the Google ID token and unwraps the login result", async () => {
    const responseBody = {
      loggedIn: true,
      role: "USER" as const,
      displayName: "홍길동",
    };
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: responseBody, error: null },
      status: 200,
    });

    await expect(googleLogin({ idToken: "token-1" })).resolves.toEqual(responseBody);
    expect(httpPost).toHaveBeenCalledWith("/auth/google", { idToken: "token-1" });
  });

  it("surfaces invalid Google credentials as an ApiError", async () => {
    const axiosError = new AxiosError("unauthorized", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: {
        success: false,
        data: null,
        error: { code: "A001", message: "invalid" },
      },
      status: 401,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPost.mockRejectedValueOnce(axiosError);

    await expect(googleLogin({ idToken: "bad-token" })).rejects.toThrowError(
      expect.objectContaining({ code: "A001", status: 401 }),
    );
  });
});

describe("useGoogleLogin", () => {
  it("refreshes the shared session after a successful login", async () => {
    httpPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: { loggedIn: true, role: "USER", displayName: "홍길동" },
        error: null,
      },
      status: 200,
    });
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useGoogleLogin(), { wrapper });

    await result.current.mutateAsync({ idToken: "test-token" });

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: googleAuthQueryKeys.me(),
      }),
    );
  });

  it("does not refresh the session when login fails", async () => {
    httpPost.mockRejectedValueOnce(new Error("login failed"));
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useGoogleLogin(), { wrapper });

    await expect(
      result.current.mutateAsync({ idToken: "bad-token" }),
    ).rejects.toThrow();
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
