import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { useVotes } from "@/entities/contest";
import {
  useFestivalStatus,
  type FestivalStatusResponseBody,
} from "@/entities/festival";

import SongContestPage from "./SongContestPage";

vi.mock("@/entities/festival", () => ({ useFestivalStatus: vi.fn() }));
vi.mock("@/entities/contest", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/contest");
  return { ...actual, useVotes: vi.fn() };
});
vi.mock("./VoteCastingPanel", () => ({
  VoteCastingPanel: () => <div>진행 중인 투표 패널</div>,
}));

const useFestivalStatusMock = vi.mocked(useFestivalStatus);
const useVotesMock = vi.mocked(useVotes);

function statusBody(
  contestPhase: FestivalStatusResponseBody["stage"]["contestPhase"],
): FestivalStatusResponseBody {
  return {
    phase: "BEFORE",
    festivalStartAt: "2026-10-01T00:00:00+09:00",
    festivalEndAt: "2026-10-03T00:00:00+09:00",
    stage: {
      storyPhase: "CLOSED",
      storyCollectionStartAt: "2026-09-20T00:00:00+09:00",
      storyCollectionEndAt: "2026-09-30T00:00:00+09:00",
      contestPhase,
      contestStartAt: "2026-10-01T18:00:00+09:00",
      contestEndAt: "2026-10-01T21:00:00+09:00",
    },
    playlist: {
      phase: "SUBMISSION",
      submissionStartAt: "2026-09-12T00:00:00+09:00",
      submissionEndAt: "2026-09-17T00:00:00+09:00",
      publishAt: "2026-10-01T00:00:00+09:00",
    },
  };
}

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/contest"]}>
        <SongContestPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  useFestivalStatusMock.mockReturnValue({
    data: statusBody("BEFORE"),
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useFestivalStatus>);
  useVotesMock.mockReturnValue({
    isPending: false,
    isError: false,
    data: [],
  } as unknown as ReturnType<typeof useVotes>);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("SongContestPage", () => {
  it("shows the timetable and contest list without story content", () => {
    renderPage();

    expect(screen.getByRole("tab", { name: "타임테이블" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "경연 목록" })).toBeInTheDocument();
    expect(screen.getByText("가요제 투표는 경연 당일에 열려요")).toBeInTheDocument();
    expect(screen.queryByText("사연 신청 목록")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "신청하기" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    expect(screen.getByText("아직 대진표가 공개되지 않았어요")).toBeInTheDocument();
  });

  it("shows the bracket before the contest starts, while voting stays closed", () => {
    useVotesMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [
        {
          singingVoteId: 1,
          title: "1라운드 1경연",
          round: "ROUND_1",
          roundLabel: "1라운드",
          roundKeyword: "자유로움",
          matchOrder: 1,
          status: "SCHEDULED",
          endsAt: null,
          createdAt: "2026-09-21T19:51:06+09:00",
          participants: [
            { voteParticipantId: 1, name: "오채원샷", resultRank: null },
            { voteParticipantId: 2, name: "어리고싶다", resultRank: null },
          ],
        },
      ],
    } as unknown as ReturnType<typeof useVotes>);
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    expect(screen.getByText("오채원샷")).toBeInTheDocument();
    expect(screen.getByText("어리고싶다")).toBeInTheDocument();

    expect(screen.getByText("가요제 투표는 경연 당일에 열려요")).toBeInTheDocument();
    expect(screen.queryByText("진행 중인 투표")).not.toBeInTheDocument();
  });

  it("hides the native scrollbar and moves the custom indicator with the list", () => {
    renderPage();
    const scrollArea = screen.getByRole("tabpanel", { name: "가요제 타임테이블" });

    expect(scrollArea).toHaveClass(
      "[scrollbar-width:none]",
      "[&::-webkit-scrollbar]:hidden",
    );

    Object.defineProperties(scrollArea, {
      clientHeight: { configurable: true, value: 292 },
      scrollHeight: { configurable: true, value: 700 },
      scrollTop: { configurable: true, value: 204, writable: true },
    });
    fireEvent.scroll(scrollArea);

    expect(screen.getByTestId("contest-scroll-thumb")).toHaveStyle({
      transform: "translateY(112px)",
    });
  });

  it("advances the highlighted timetable item without reloading", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-02T19:59:59+09:00"));
    renderPage();

    const scrollArea = screen.getByRole("tabpanel", { name: "가요제 타임테이블" });
    const previousItem = screen.getByText("가요제 1라운드").closest("li");
    const nextItem = screen.getByText("댄스동아리 축하 공연").closest("li");
    expect(previousItem).not.toBeNull();
    expect(nextItem).not.toBeNull();

    Object.defineProperties(scrollArea, {
      clientHeight: { configurable: true, value: 292 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true },
      scrollTo: { configurable: true, value: vi.fn() },
    });
    vi.spyOn(scrollArea, "getBoundingClientRect").mockReturnValue({
      top: 100,
    } as DOMRect);
    vi.spyOn(nextItem!, "getBoundingClientRect").mockReturnValue({
      top: 420,
      height: 61,
    } as DOMRect);

    act(() => vi.advanceTimersByTime(1000));

    expect(previousItem!.querySelector("div")).toHaveClass("border-[#fcfcfc]");
    expect(nextItem!.querySelector("div")).toHaveClass("border-[#ff0080]");
  });

  it("shows the vote panel and open matches while the contest is open", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T18:20:00+09:00"));
    const openVote = {
      singingVoteId: 1,
      title: "가요제 예선 1라운드",
      round: "ROUND_1",
      roundLabel: "예선",
      roundKeyword: "자유로움",
      matchOrder: 1,
      status: "OPEN" as const,
      endsAt: "2026-10-01T18:30:00+09:00",
      createdAt: "2026-09-01T00:00:00+09:00",
      participants: [
        { voteParticipantId: 1, name: "IT대학", resultRank: null },
        { voteParticipantId: 2, name: "간호대학", resultRank: null },
      ],
    };
    useFestivalStatusMock.mockReturnValue({
      data: statusBody("OPEN"),
      isError: false,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFestivalStatus>);
    useVotesMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [openVote],
    } as unknown as ReturnType<typeof useVotes>);

    renderPage();
    expect(screen.getByText("진행 중인 투표 패널")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    expect(screen.getByText("가요제 예선 1라운드")).toBeInTheDocument();
    expect(screen.getByText("10분 남음")).toBeInTheDocument();
  });

  it("shows the closed contest result without the voting panel", () => {
    const finishedVote = {
      singingVoteId: 1,
      title: "가요제 결선",
      round: "ROUND_3",
      roundLabel: "결선",
      roundKeyword: "폭발",
      matchOrder: 1,
      status: "CLOSED" as const,
      endsAt: "2026-10-01T20:00:00+09:00",
      createdAt: "2026-09-01T00:00:00+09:00",
      participants: [
        { voteParticipantId: 1, name: "IT대학", resultRank: 1 },
        { voteParticipantId: 2, name: "간호대학", resultRank: 2 },
      ],
    };
    useFestivalStatusMock.mockReturnValue({
      data: statusBody("CLOSED"),
      isError: false,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFestivalStatus>);
    useVotesMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [finishedVote],
    } as unknown as ReturnType<typeof useVotes>);

    renderPage();
    expect(screen.getByRole("tab", { name: "경연 결과" })).toBeInTheDocument();
    expect(screen.getByText("가요제 투표가 끝났어요")).toBeInTheDocument();
    expect(screen.queryByText("진행 중인 투표 패널")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "경연 결과" }));
    expect(screen.getByText("가요제 결선")).toBeInTheDocument();

    expect(screen.queryByText("우승")).not.toBeInTheDocument();
    expect(screen.getByText("IT대학").closest("div")).toHaveClass("bg-[#d2066c]");
  });
});
