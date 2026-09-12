import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { useFestivalStatus } from "@/entities/festival";
import { httpClient } from "@/shared/api";

import { PhaseOverridePanel } from "./PhaseOverridePanel";

vi.mock("@/entities/festival", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/festival");
  return { ...actual, useFestivalStatus: vi.fn() };
});
vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { put: vi.fn() } };
});

const useFestivalStatusMock = vi.mocked(useFestivalStatus);
const httpPut = vi.mocked(httpClient.put);

const renderPanel = () => {
  useFestivalStatusMock.mockReturnValue({
    data: { playlist: { phase: "SUBMISSION" } },
    isPending: false,
    isError: false,
  } as ReturnType<typeof useFestivalStatus>);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<PhaseOverridePanel />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("PhaseOverridePanel", () => {
  it("shows the current applied phase", () => {
    renderPanel();
    expect(screen.getByText("접수 중")).toBeInTheDocument();
  });

  it("confirms before forcing a phase and sends it", async () => {
    httpPut.mockResolvedValueOnce({
      data: {
        success: true,
        data: { phase: "BEFORE_OPEN", phaseOverride: "BEFORE_OPEN" },
        error: null,
      },
      status: 200,
    });
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "접수 전 단계로" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("단계를 변경할까요?");
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() =>
      expect(httpPut).toHaveBeenCalledWith("/admin/promo/playlist-phase", {
        phase: "BEFORE_OPEN",
      }),
    );
  });

  it("sends null when returning to automatic detection", async () => {
    httpPut.mockResolvedValueOnce({
      data: {
        success: true,
        data: { phase: "SUBMISSION", phaseOverride: null },
        error: null,
      },
      status: 200,
    });
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "자동 판정으로 되돌리기" }));
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() =>
      expect(httpPut).toHaveBeenCalledWith("/admin/promo/playlist-phase", {
        phase: null,
      }),
    );
  });
});
