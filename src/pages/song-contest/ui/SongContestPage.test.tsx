import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { useVotes } from "@/entities/contest";
import { useFestivalStatus } from "@/entities/festival";

import SongContestPage from "./SongContestPage";

// 이 파일은 사연 모집 프리뷰(?phase=)만 다룬다. 투표 탭 자체의 상태별
// 동작(경연 전/반경 밖/로그인/투표)은 별도 파일에서 검증한다 — 여기서는
// festival/status·votes를 항상 로딩 중으로 고정해 무관한 네트워크 요청 없이
// 결정적으로 만든다.
vi.mock("@/entities/festival", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/festival");
  return { ...actual, useFestivalStatus: vi.fn() };
});
vi.mock("@/entities/contest", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/contest");
  return { ...actual, useVotes: vi.fn() };
});
// VoteCastingPanel은 로그인·위치·투표 상태를 자체적으로 조회하는 무거운
// 컴포넌트라, 여기서는 렌더 여부만 확인하고 내부 동작은
// VoteCastingPanel.test.tsx에서 검증한다.
vi.mock("./VoteCastingPanel", () => ({
  VoteCastingPanel: () => <div>진행 중인 투표 패널</div>,
}));

const useFestivalStatusMock = vi.mocked(useFestivalStatus);
const useVotesMock = vi.mocked(useVotes);

const stageStatus = (contestPhase: "BEFORE" | "OPEN" | "CLOSED") => ({
  isPending: false,
  isError: false,
  refetch: vi.fn(),
  data: {
    phase: "LIVE",
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
      phase: "PUBLISHED",
      submissionStartAt: "2026-09-12T00:00:00+09:00",
      submissionEndAt: "2026-09-17T00:00:00+09:00",
      publishAt: "2026-10-01T00:00:00+09:00",
    },
  },
});

const renderPage = (path: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <SongContestPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  useFestivalStatusMock.mockReturnValue({
    isPending: true,
    isError: false,
    data: undefined,
  } as unknown as ReturnType<typeof useFestivalStatus>);
  useVotesMock.mockReturnValue({
    isPending: true,
    isError: false,
    data: undefined,
  } as unknown as ReturnType<typeof useVotes>);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("SongContestPage preview", () => {
  it("shows a closed form before collection and after collection", () => {
    const before = renderPage("/contest");
    expect(screen.getByText("사연 모집이 아직이에요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "신청하기" })).not.toBeInTheDocument();
    before.unmount();

    renderPage("/contest?phase=closed");
    expect(screen.getByText("사연 모집이 끝났어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "신청하기" })).not.toBeInTheDocument();
  });

  it("switches the two overview tabs without leaving the page", () => {
    renderPage("/contest?phase=open");
    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    expect(screen.getByText("불러오는 중…")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "타임테이블" }));
    expect(screen.getByText("가요제 오프닝")).toBeInTheDocument();
  });

  it("hides the native scrollbar and moves the custom indicator with the list", () => {
    renderPage("/contest");
    const scrollArea = screen.getByRole("tabpanel", { name: "가요제 타임테이블" });
    const scrollThumb = screen.getByTestId("contest-scroll-thumb");

    expect(scrollArea).toHaveClass(
      "[scrollbar-width:none]",
      "[&::-webkit-scrollbar]:hidden",
    );
    expect(scrollThumb).toHaveClass(
      "motion-safe:[animation:contest-scroll-nudge_1.8s_ease-in-out_infinite]",
    );
    expect(scrollThumb).toHaveStyle({ transform: "translateY(0px)" });

    Object.defineProperties(scrollArea, {
      clientHeight: { configurable: true, value: 292 },
      scrollHeight: { configurable: true, value: 700 },
      scrollTop: { configurable: true, value: 204, writable: true },
    });
    fireEvent.scroll(scrollArea);

    expect(scrollThumb).not.toHaveClass(
      "motion-safe:[animation:contest-scroll-nudge_1.8s_ease-in-out_infinite]",
    );
    expect(scrollThumb).toHaveStyle({ transform: "translateY(112px)" });
  });

  it("validates the form and labels completion as a preview", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderPage("/contest?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    expect(
      screen.getByRole("dialog", { name: "사연 신청 안내 사항" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "작성 화면 미리보기" }));
    fireEvent.click(screen.getByRole("button", { name: "접수 완료 화면 미리보기" }));
    expect(await screen.findByText("단대를 선택해 주세요.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "IT" }));
    fireEvent.change(screen.getByRole("textbox", { name: "학과 *" }), {
      target: { value: "컴퓨터학부" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "학번 *" }), {
      target: { value: "20241234" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "이름 *" }), {
      target: { value: "홍길동" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "사연 제목 *" }), {
      target: { value: "축제 이야기" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "사연 내용 *" }), {
      target: { value: "함께 노래해요." },
    });
    fireEvent.click(screen.getByRole("button", { name: "접수 완료 화면 미리보기" }));
    await waitFor(() =>
      expect(
        screen.getByText("실제 접수가 아닌 완료 화면 미리보기입니다"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("status")).toHaveTextContent("실제 접수는 연결 전");
  });
});

describe("SongContestPage contest phase", () => {
  it("shows the before-contest notice and keeps the 경연 목록 tab label", () => {
    useFestivalStatusMock.mockReturnValue(
      stageStatus("BEFORE") as unknown as ReturnType<typeof useFestivalStatus>,
    );
    useVotesMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useVotes>);

    renderPage("/contest");
    expect(screen.getByRole("tab", { name: "경연 목록" })).toBeInTheDocument();
    expect(screen.getByText("가요제 투표가 아직이에요")).toBeInTheDocument();
    expect(screen.queryByText("진행 중인 투표 패널")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    expect(screen.getByText("아직 경연이 시작되지 않았어요")).toBeInTheDocument();
  });

  it("shows the vote-casting panel and results while the contest is open", () => {
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
    useFestivalStatusMock.mockReturnValue(
      stageStatus("OPEN") as unknown as ReturnType<typeof useFestivalStatus>,
    );
    useVotesMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [openVote],
    } as unknown as ReturnType<typeof useVotes>);

    renderPage("/contest");
    expect(screen.getByText("진행 중인 투표 패널")).toBeInTheDocument();
    expect(screen.getByText("경연 결과")).toBeInTheDocument();
    expect(screen.queryByText("가요제 투표가 끝났어요")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    expect(screen.getByText("가요제 예선 1라운드")).toBeInTheDocument();
    expect(screen.getByText("10분 남음")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renames the tab to 경연 결과, shows the closed notice, and hides the voting panel once closed", () => {
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
    useFestivalStatusMock.mockReturnValue(
      stageStatus("CLOSED") as unknown as ReturnType<typeof useFestivalStatus>,
    );
    useVotesMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [finishedVote],
    } as unknown as ReturnType<typeof useVotes>);

    renderPage("/contest");
    expect(screen.getByRole("tab", { name: "경연 결과" })).toBeInTheDocument();
    expect(screen.getByText("가요제 투표가 끝났어요")).toBeInTheDocument();
    expect(screen.queryByText("진행 중인 투표 패널")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "경연 결과" }));
    expect(screen.getByText("가요제 결선")).toBeInTheDocument();
    expect(screen.getByText("우승")).toBeInTheDocument();
  });
});
