import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { type StagePhase, useFestivalStatus } from "@/entities/festival";
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

interface RenderFormOptions {
  contestPhase?: StagePhase;
  isError?: boolean;
  isPending?: boolean;
  storyPhase?: StagePhase;
}

const renderForm = (
  section: "stories" | "votes" = "votes",
  {
    contestPhase = "BEFORE",
    isError = false,
    isPending = false,
    storyPhase = "BEFORE",
  }: RenderFormOptions = {},
) => {
  useFestivalStatusMock.mockReturnValue({
    data:
      isPending || isError
        ? undefined
        : {
            stage: {
              storyPhase,
              storyCollectionStartAt: "2026-09-20T10:00:00",
              storyCollectionEndAt: "2026-09-25T18:00:00",
              contestPhase,
              contestStartAt: null,
              contestEndAt: "2026-10-02T22:30:00",
            },
          },
    isPending,
    isError,
  } as unknown as ReturnType<typeof useFestivalStatus>);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<StageScheduleForm section={section} />, { wrapper });
};

const expectStatus = (name: string, label: string) => {
  expect(screen.getByRole("status", { name })).toHaveTextContent(
    `현재 상태 : ${label}`,
  );
};

afterEach(() => {
  Reflect.deleteProperty(HTMLInputElement.prototype, "showPicker");
  vi.clearAllMocks();
});

describe("StageScheduleForm", () => {
  it.each([
    ["BEFORE", "모집 전"],
    ["OPEN", "모집 중"],
    ["CLOSED", "모집 종료"],
  ] as const)("shows the %s story phase", (storyPhase, label) => {
    renderForm("stories", { storyPhase });

    expectStatus("사연 모집 현재 상태", label);
  });

  it.each([
    ["BEFORE", "시작 전"],
    ["OPEN", "진행 중"],
    ["CLOSED", "종료"],
  ] as const)("shows the %s contest phase", (contestPhase, label) => {
    renderForm("votes", { contestPhase });

    expectStatus("가요제 진행 현재 상태", label);
  });

  it("shows status loading and failure states", () => {
    const pending = renderForm("stories", { isPending: true });
    expectStatus("사연 모집 현재 상태", "확인 중");
    pending.unmount();

    renderForm("votes", { isError: true });
    expectStatus("가요제 진행 현재 상태", "확인 실패");
  });

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
