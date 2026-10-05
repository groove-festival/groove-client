import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";
import { authQueryKeys } from "@/entities/auth";

import { pubAdminQueryKeys, stageAdminQueryKeys } from "../api/queryKeys";

import { AdminHeader } from "./AdminHeader";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

const renderHeader = (
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  }),
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<AdminHeader title="가요제 관리자" />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("AdminHeader", () => {
  it("prevents a pending private request from restoring data after logout", async () => {
    const queryClient = new QueryClient();
    let resolveRequest!: (data: unknown[]) => void;
    const response = new Promise<unknown[]>((resolve) => {
      resolveRequest = resolve;
    });
    const pending = queryClient
      .fetchQuery({ queryKey: pubAdminQueryKeys.orders(), queryFn: () => response })
      .catch(() => undefined);
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: {}, error: null },
      status: 200,
    });
    renderHeader(queryClient);
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
    await waitFor(() =>
      expect(queryClient.getQueryState(pubAdminQueryKeys.orders())).toBeUndefined(),
    );
    await act(async () => resolveRequest([{ fixture: "late private order" }]));
    await pending;
    expect(queryClient.getQueryData(pubAdminQueryKeys.orders())).toBeUndefined();
  });

  it("clears private caches on logout while preserving public data", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(pubAdminQueryKeys.me(), { fixture: "previous pub" });
    queryClient.setQueryData(pubAdminQueryKeys.orders(), [
      { fixture: "private order" },
    ]);
    queryClient.setQueryData(stageAdminQueryKeys.stories(), [
      { fixture: "private story" },
    ]);
    queryClient.setQueryData(["festival-status"], { phase: "LIVE" });
    queryClient.setQueryData(authQueryKeys.me(), {
      loggedIn: true,
      role: "PUB_ADMIN",
      pubId: 1,
      displayName: null,
    });
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: {}, error: null },
      status: 200,
    });
    renderHeader(queryClient);
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    await waitFor(() =>
      expect(queryClient.getQueryData(pubAdminQueryKeys.me())).toBeUndefined(),
    );
    expect(queryClient.getQueryData(pubAdminQueryKeys.orders())).toBeUndefined();
    expect(queryClient.getQueryData(stageAdminQueryKeys.stories())).toBeUndefined();
    expect(queryClient.getQueryData(["festival-status"])).toEqual({ phase: "LIVE" });
    expect(queryClient.getQueryData(authQueryKeys.me())).toMatchObject({
      loggedIn: false,
    });
  });

  it("shows a logout error and retains the current session when logout fails", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(pubAdminQueryKeys.orders(), [
      { fixture: "current order" },
    ]);
    httpPost.mockRejectedValueOnce(new Error("offline"));
    renderHeader(queryClient);
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("로그아웃하지 못했어요");
    expect(queryClient.getQueryData(pubAdminQueryKeys.orders())).toEqual([
      { fixture: "current order" },
    ]);
  });

  it("logs out directly without a settings menu", async () => {
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: {}, error: null },
      status: 200,
    });
    renderHeader();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "관리자 설정" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    await waitFor(() => expect(httpPost).toHaveBeenCalledWith("/auth/logout"));
  });
});
