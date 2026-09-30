import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

    // 공연이 끝난 뒤 누르는 버튼이라 그 의미를 먼저 알려준다. 기본 투표 시간은 5분이다.
    expect(
      screen.getByText(/참가팀 공연이 모두 끝나면 투표를 시작해 주세요/),
    ).toBeInTheDocument();
    expect(screen.getByText("가요제 예선 1라운드")).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue("5"), { target: { value: "15" } });
    fireEvent.click(screen.getByRole("button", { name: "투표 시작" }));

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
    expect(screen.queryByRole("button", { name: "투표 시작" })).not.toBeInTheDocument();
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

    expect(screen.queryByRole("button", { name: "투표 시작" })).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "투표 다시 열기" }));
    expect(httpPatch).not.toHaveBeenCalled();

    expect(
      screen.getByRole("dialog", { name: "투표를 다시 열까요?" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/stage/votes/1/status", {
        status: "OPEN",
        extendMinutes: 5,
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

    fireEvent.click(screen.getByRole("button", { name: "투표 마감" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/stage/votes/1/status", {
        status: "CLOSED",
      }),
    );
  });

  const respondTallies = (
    tallies: { voteParticipantId: number; voteCount: number }[],
  ) =>
    vi.mocked(httpClient.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          totalVotes: tallies.reduce((sum, entry) => sum + entry.voteCount, 0),
          tallies,
        },
        error: null,
      },
      status: 200,
    });

  const ok = (data: unknown) => ({
    data: { success: true, data, error: null },
    status: 200,
  });

  it("picks the winner of a 1:1 match with one tap and shows votes only as a reference", async () => {
    // 득표가 더 많은 팀이 져도 무대팀이 고른 대로 저장된다 (심사 점수 합산).
    respondTallies([
      { voteParticipantId: 1, voteCount: 30 },
      { voteParticipantId: 2, voteCount: 12 },
    ]);
    httpPut.mockResolvedValueOnce(ok({ ...scheduledVote, status: "CLOSED" }));
    renderRow({ ...scheduledVote, status: "CLOSED" });

    // 마감됐는데 결과가 없으면 결과 입력이 펼쳐져 있다.
    expect(await screen.findByText("30표 (참고)")).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "결과 확정" });
    expect(confirmButton).toBeDisabled();

    fireEvent.click(screen.getAllByRole("button", { name: "이 팀 승리" })[1]);
    expect(screen.getByRole("button", { name: "승리 ✓" })).toBeInTheDocument();
    fireEvent.click(confirmButton);
    expect(screen.getByText(/1위 간호대학 · 2위 IT대학/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "확정" }));

    await waitFor(() =>
      expect(httpPut).toHaveBeenCalledWith("/admin/stage/votes/1/result", {
        results: [
          { voteParticipantId: 1, rank: 2 },
          { voteParticipantId: 2, rank: 1 },
        ],
      }),
    );
    expect(httpPatch).not.toHaveBeenCalled();
    expect(
      await screen.findByText("결과를 저장했어요. 이긴 팀이 다음 경연으로 올라갔어요."),
    ).toBeInTheDocument();
  });

  it("closes voting first when the result is confirmed on an open match", async () => {
    respondTallies([]);
    httpPatch.mockResolvedValueOnce(ok({ ...scheduledVote, status: "CLOSED" }));
    httpPut.mockResolvedValueOnce(ok({ ...scheduledVote, status: "CLOSED" }));
    renderRow({
      ...scheduledVote,
      status: "OPEN",
      endsAt: "2026-10-02T19:10:00+09:00",
    });

    fireEvent.click(screen.getByRole("button", { name: "결과 입력" }));
    fireEvent.click(screen.getAllByRole("button", { name: "이 팀 승리" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "결과 확정하고 투표 마감" }));
    expect(screen.getByText(/투표도 함께 마감돼요/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "확정하고 마감" }));

    await waitFor(() => expect(httpPut).toHaveBeenCalled());
    expect(httpPatch).toHaveBeenCalledWith("/admin/stage/votes/1/status", {
      status: "CLOSED",
    });
    expect(httpPatch.mock.invocationCallOrder[0]).toBeLessThan(
      httpPut.mock.invocationCallOrder[0],
    );
  });

  it("ranks the three finalists without letting two teams share a rank", async () => {
    respondTallies([]);
    httpPut.mockResolvedValueOnce(ok(scheduledVote));
    const finalVote: Vote = {
      ...scheduledVote,
      singingVoteId: 10,
      title: "1/2/3위 결정",
      round: "ROUND_3",
      status: "CLOSED",
      participants: [
        { voteParticipantId: 7, name: "A팀", resultRank: null },
        { voteParticipantId: 8, name: "B팀", resultRank: null },
        { voteParticipantId: 9, name: "C팀", resultRank: null },
      ],
    };
    renderRow(finalVote);

    const rankOf = (team: string, rank: number) =>
      fireEvent.click(
        within(screen.getByRole("group", { name: `${team} 순위` })).getByRole(
          "button",
          {
            name: `${rank}위`,
          },
        ),
      );
    rankOf("A팀", 1);
    rankOf("B팀", 1); // A팀의 1위가 풀린다
    rankOf("A팀", 3);
    expect(screen.getByRole("button", { name: "결과 확정" })).toBeDisabled();
    rankOf("C팀", 2);
    fireEvent.click(screen.getByRole("button", { name: "결과 확정" }));
    fireEvent.click(screen.getByRole("button", { name: "확정" }));

    await waitFor(() =>
      expect(httpPut).toHaveBeenCalledWith("/admin/stage/votes/10/result", {
        results: [
          { voteParticipantId: 7, rank: 3 },
          { voteParticipantId: 8, rank: 1 },
          { voteParticipantId: 9, rank: 2 },
        ],
      }),
    );
  });

  it("shows the saved result on the row", () => {
    renderRow({
      ...scheduledVote,
      status: "CLOSED",
      participants: [
        { voteParticipantId: 1, name: "IT대학", resultRank: 2 },
        { voteParticipantId: 2, name: "간호대학", resultRank: 1 },
      ],
    });

    expect(screen.getByText("결과: 1위 간호대학 · 2위 IT대학")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "결과 수정" })).toBeInTheDocument();
  });
});
