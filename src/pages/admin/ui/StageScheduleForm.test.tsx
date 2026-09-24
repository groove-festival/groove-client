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

const renderForm = (section: "stories" | "votes" = "votes") => {
  useFestivalStatusMock.mockReturnValue({
    data: {
      stage: {
        storyPhase: "BEFORE",
        storyCollectionStartAt: "2026-09-20T10:00:00",
        storyCollectionEndAt: "2026-09-25T18:00:00",
        contestPhase: "BEFORE",
        contestStartAt: null,
        contestEndAt: "2026-10-02T22:30:00",
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
  return render(<StageScheduleForm section={section} />, { wrapper });
};

afterEach(() => {
  Reflect.deleteProperty(HTMLInputElement.prototype, "showPicker");
  vi.clearAllMocks();
});

describe("StageScheduleForm", () => {
  it("shows only the selected section's schedule fields", () => {
    renderForm("stories");

    expect(screen.getByLabelText("사연모집 시작")).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(screen.getByLabelText("사연모집 종료")).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(
      screen.getByRole("button", { name: "사연모집 시작 달력 열기" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "사연모집 종료 달력 열기" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("가요제 시작")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("가요제 종료")).not.toBeInTheDocument();
  });

  it("opens the browser date-time picker from the calendar button", () => {
    const showPicker = vi.fn();
    Object.defineProperty(HTMLInputElement.prototype, "showPicker", {
      configurable: true,
      value: showPicker,
    });
    renderForm("votes");

    fireEvent.click(screen.getByRole("button", { name: "가요제 시작 달력 열기" }));
    fireEvent.click(screen.getByRole("button", { name: "가요제 종료 달력 열기" }));

    expect(showPicker).toHaveBeenCalledTimes(2);
  });

  it("preserves the other section's fields when saving", async () => {
    httpPut.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          storyCollectionStartAt: "2026-09-20T10:00:00",
          storyCollectionEndAt: "2026-09-25T18:00:00",
          contestStartAt: "2026-10-02T19:00:00",
          contestEndAt: "2026-10-02T22:30:00",
        },
        error: null,
      },
      status: 200,
    });
    renderForm();

    fireEvent.change(screen.getByLabelText("가요제 시작"), {
      target: { value: "2026-10-02T19:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "가요제 일정 저장" }));

    await waitFor(() =>
      expect(httpPut).toHaveBeenCalledWith("/admin/stage/schedule", {
        storyCollectionStartAt: "2026-09-20T10:00:00",
        storyCollectionEndAt: "2026-09-25T18:00:00",
        contestStartAt: "2026-10-02T19:00:00",
        contestEndAt: "2026-10-02T22:30:00",
      }),
    );
    expect(await screen.findByText("가요제 일정을 저장했어요.")).toBeInTheDocument();
  });
});
