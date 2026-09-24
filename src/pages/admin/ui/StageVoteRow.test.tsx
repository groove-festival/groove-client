import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import type { Vote } from "@/entities/contest";
import { httpClient } from "@/shared/api";

import { StageVoteRow } from "./StageVoteRow";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), patch: vi.fn(), put: vi.fn() } };
});

const httpPatch = vi.mocked(httpClient.patch);
const httpPut = vi.mocked(httpClient.put);

const scheduledVote: Vote = {
  singingVoteId: 1,
  title: "가요제 예선 1라운드",
  round: "ROUND_1" as const,
  roundLabel: "예선",
  roundKeyword: "자유로움",
  matchOrder: 1,
  status: "SCHEDULED",
  endsAt: null,
  createdAt: "2026-09-01T00:00:00+09:00",
  participants: [
    { voteParticipantId: 1, name: "IT대학", resultRank: null },
    { voteParticipantId: 2, name: "간호대학", resultRank: null },
  ],
};

const renderRow = (vote: Vote) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<StageVoteRow vote={vote} />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("StageVoteRow", () => {
  it("opens a scheduled vote with the entered duration", async () => {
    httpPatch.mockResolvedValueOnce({
      data: { success: true, data: { ...scheduledVote, status: "OPEN" }, error: null },
      status: 200,
    });
    renderRow(scheduledVote);

    fireEvent.change(screen.getByDisplayValue("10"), { target: { value: "15" } });
    fireEvent.click(screen.getByRole("button", { name: "경기 열기" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/stage/votes/1/status", {
        status: "OPEN",
        extendMinutes: 15,
      }),
    );
  });

  it("hides the open/result controls until every participant slot is filled", () => {
    renderRow({
      ...scheduledVote,
      participants: [{ voteParticipantId: 1, name: "IT대학", resultRank: null }],
    });

    expect(
      screen.getByText("앞 라운드 결과가 입력되면 참가팀이 자동으로 채워져요."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "경기 열기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "결과 입력" })).not.toBeInTheDocument();
  });

  it("requires the final round's third slot before allowing it to open", () => {
    renderRow({
      ...scheduledVote,
      round: "ROUND_3",
      participants: [
        { voteParticipantId: 1, name: "IT대학", resultRank: null },
        { voteParticipantId: 2, name: "간호대학", resultRank: null },
      ],
    });

    expect(screen.queryByRole("button", { name: "경기 열기" })).not.toBeInTheDocument();
  });

  it("confirms before reopening an already-closed match", async () => {
    httpPatch.mockResolvedValueOnce({
      data: { success: true, data: { ...scheduledVote, status: "OPEN" }, error: null },
      status: 200,
    });
    renderRow({
      ...scheduledVote,
      status: "CLOSED",
      endsAt: "2026-10-02T19:10:00+09:00",
    });

    fireEvent.click(screen.getByRole("button", { name: "경기 재오픈" }));
    expect(httpPatch).not.toHaveBeenCalled();

    expect(
      screen.getByRole("dialog", { name: "경기를 다시 열까요?" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/stage/votes/1/status", {
        status: "OPEN",
        extendMinutes: 10,
      }),
    );
  });

  it("closes an open vote", async () => {
    httpPatch.mockResolvedValueOnce({
      data: {
        success: true,
        data: { ...scheduledVote, status: "CLOSED" },
        error: null,
      },
      status: 200,
    });
    renderRow({
      ...scheduledVote,
      status: "OPEN",
      endsAt: "2026-10-02T19:10:00+09:00",
    });

    fireEvent.click(screen.getByRole("button", { name: "경기 마감" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/stage/votes/1/status", {
        status: "CLOSED",
      }),
    );
  });

  it("submits ranked results through the result form", async () => {
    httpPut.mockResolvedValueOnce({
      data: {
        success: true,
        data: { ...scheduledVote, status: "CLOSED" },
        error: null,
      },
      status: 200,
    });
    renderRow(scheduledVote);

    fireEvent.click(screen.getByRole("button", { name: "결과 입력" }));
    const rankInputs = screen.getAllByPlaceholderText("순위");
    fireEvent.change(rankInputs[0], { target: { value: "1" } });
    fireEvent.change(rankInputs[1], { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "결과 저장" }));

    await waitFor(() =>
      expect(httpPut).toHaveBeenCalledWith("/admin/stage/votes/1/result", {
        results: [
          { voteParticipantId: 1, rank: 1 },
          { voteParticipantId: 2, rank: 2 },
        ],
      }),
    );
    expect(await screen.findByText("결과를 저장했어요.")).toBeInTheDocument();
  });
});
