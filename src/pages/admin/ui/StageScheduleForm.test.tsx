import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { useFestivalStatus } from "@/entities/festival";
import { httpClient } from "@/shared/api";

import { StageScheduleForm } from "./StageScheduleForm";

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

const renderForm = () => {
  useFestivalStatusMock.mockReturnValue({
    data: {
      stage: {
        storyPhase: "BEFORE",
        storyCollectionStartAt: null,
        storyCollectionEndAt: null,
        contestPhase: "BEFORE",
        contestStartAt: null,
        contestEndAt: null,
      },
    },
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useFestivalStatus>);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<StageScheduleForm />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("StageScheduleForm", () => {
  it("submits the four fields with seconds appended, no offset", async () => {
    httpPut.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          storyCollectionStartAt: null,
          storyCollectionEndAt: null,
          contestStartAt: "2026-10-02T19:00:00",
          contestEndAt: null,
        },
        error: null,
      },
      status: 200,
    });
    renderForm();

    fireEvent.change(screen.getByLabelText("가요제 시작"), {
      target: { value: "2026-10-02T19:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "일정 저장" }));

    await waitFor(() =>
      expect(httpPut).toHaveBeenCalledWith(
        "/admin/stage/schedule",
        expect.objectContaining({ contestStartAt: "2026-10-02T19:00:00" }),
      ),
    );
    expect(await screen.findByText("일정을 저장했어요.")).toBeInTheDocument();
  });
});
