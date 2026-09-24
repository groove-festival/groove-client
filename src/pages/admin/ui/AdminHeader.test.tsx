import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { AdminHeader } from "./AdminHeader";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

const renderHeader = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<AdminHeader title="가요제 관리자" />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("AdminHeader", () => {
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
