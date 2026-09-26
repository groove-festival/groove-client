import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { useAuthMe, useLoginWithGoogle } from "@/entities/auth";
import { useVotes } from "@/entities/contest";
import {
  useFestivalStatus,
  type FestivalStatusResponseBody,
} from "@/entities/festival";

import { usePublicContestStories } from "../api/getPublicContestStories";
import { useSubmitContestStory } from "../api/submitContestStory";
import SongContestPage from "./SongContestPage";

vi.mock("@/entities/festival", () => ({ useFestivalStatus: vi.fn() }));
vi.mock("@/entities/auth", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/auth");
  return { ...actual, useAuthMe: vi.fn(), useLoginWithGoogle: vi.fn() };
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
vi.mock("./GoogleSignInButton", () => ({
  GoogleSignInButton: ({
    onCredential,
  }: {
    onCredential: (credential: string) => void;
  }) => (
    <button onClick={() => onCredential("test-id-token")} type="button">
      Google 계정으로 로그인
    </button>
  ),
}));
vi.mock("../api/getPublicContestStories", () => ({
  usePublicContestStories: vi.fn(),
}));
vi.mock("../api/submitContestStory", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "../api/submitContestStory",
  );
  return { ...actual, useSubmitContestStory: vi.fn() };
});

const useFestivalStatusMock = vi.mocked(useFestivalStatus);
const useAuthMeMock = vi.mocked(useAuthMe);
const useVotesMock = vi.mocked(useVotes);
const usePublicContestStoriesMock = vi.mocked(usePublicContestStories);
const useLoginWithGoogleMock = vi.mocked(useLoginWithGoogle);
const useSubmitContestStoryMock = vi.mocked(useSubmitContestStory);

const submitStoryMutateAsync = vi.fn();
const submitStoryReset = vi.fn();

function statusBody(
  storyPhase: FestivalStatusResponseBody["stage"]["storyPhase"],
  contestPhase: FestivalStatusResponseBody["stage"]["contestPhase"] = "BEFORE",
): FestivalStatusResponseBody {
  return {
    phase: "BEFORE",
    festivalStartAt: "2026-10-01T00:00:00+09:00",
    festivalEndAt: "2026-10-03T00:00:00+09:00",
    stage: {
      storyPhase,
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

const renderPage = (path: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 }, queries: { retry: false } },
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
  submitStoryMutateAsync.mockResolvedValue({
    storyId: 1,
    title: "축제 이야기",
    nickname: null,
    college: "IT",
    submittedAt: "2026-09-22T10:00:00+09:00",
    updatedAt: "2026-09-22T10:00:00+09:00",
  });
  submitStoryReset.mockReset();

  useFestivalStatusMock.mockReturnValue({
    data: statusBody("BEFORE"),
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useFestivalStatus>);
  useAuthMeMock.mockReturnValue({
    data: { loggedIn: true, role: "USER", displayName: "홍길동", pubId: null },
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useAuthMe>);
  useVotesMock.mockReturnValue({
    isPending: true,
    isError: false,
    data: undefined,
  } as unknown as ReturnType<typeof useVotes>);
  usePublicContestStoriesMock.mockReturnValue({
    data: [
      {
        storyId: 7,
        title: "함께 부르는 밤",
        nickname: "groove",
        college: "IT",
        submittedAt: "2026-09-22T10:00:00+09:00",
      },
      {
        storyId: 8,
        title: "첫 무대의 떨림",
        nickname: null,
        college: "ART",
        submittedAt: "2026-09-22T10:05:00+09:00",
      },
      {
        storyId: 9,
        title: "우리 과 응원가",
        nickname: "응원단장",
        college: "SOCIAL",
        submittedAt: "2026-09-22T10:10:00+09:00",
      },
    ],
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof usePublicContestStories>);
  useLoginWithGoogleMock.mockReturnValue({
    error: null,
    isPending: false,
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useLoginWithGoogle>);
  useSubmitContestStoryMock.mockReturnValue({
    isPending: false,
    mutateAsync: submitStoryMutateAsync,
    reset: submitStoryReset,
  } as unknown as ReturnType<typeof useSubmitContestStory>);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("SongContestPage", () => {
  it("requires Google login before showing the form and forwards the credential", () => {
    const login = vi.fn();
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: false, role: null, displayName: null, pubId: null },
      isError: false,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAuthMe>);
    useLoginWithGoogleMock.mockReturnValue({
      error: null,
      isPending: false,
      mutate: login,
    } as unknown as ReturnType<typeof useLoginWithGoogle>);
    renderPage("/contest?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    fireEvent.click(screen.getByRole("button", { name: "사연 작성하기" }));

    expect(screen.getByRole("heading", { name: "Google 로그인" })).toBeInTheDocument();
    const accountLimit = screen.getByText(
      "사연은 Google 계정당 하나만 접수할 수 있어요.",
    );
    expect(accountLimit).toHaveClass("block");
    expect(accountLimit.nextElementSibling).toHaveTextContent(
      "다시 제출하면 기존 사연이 새 내용으로 바뀝니다.",
    );
    expect(
      screen.getByText(
        /학교 계정이 아니어도 참여할 수 있어요. 1인 1회 참여 원칙을 위해/,
      ),
    ).toBeInTheDocument();
    const passwordNotice = screen.getByText(
      "Google 비밀번호는 GROOVE에 전달되지 않아요.",
    );
    expect(passwordNotice).toHaveClass("block");
    expect(passwordNotice.nextElementSibling).toHaveClass("block");
    expect(passwordNotice.nextElementSibling).toHaveTextContent(
      "Google에서 발급한 인증 정보로 로그인 상태를 확인합니다.",
    );
    expect(
      screen.queryByRole("heading", { name: "사연 신청하기" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Google 계정으로 로그인" }));
    expect(login).toHaveBeenCalledWith("test-id-token");
  });

  it("shows a closed form before collection and after collection", () => {
    const before = renderPage("/contest");
    expect(screen.getByText("사연 모집을 준비하고 있어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "신청하기" })).not.toBeInTheDocument();
    before.unmount();

    renderPage("/contest?phase=closed");
    expect(screen.getByText("사연 모집이 끝났어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "신청하기" })).not.toBeInTheDocument();
  });

  it.each([
    [
      "BEFORE",
      "사연 모집이 먼저 시작되고, 모집이 끝난 뒤 가요제 당일에 투표가 열려요.",
    ],
    [
      "OPEN",
      "지금은 사연 모집 기간이에요. 투표는 모집 종료 후 가요제 경연이 시작되면 열려요.",
    ],
    ["CLOSED", "사연 모집이 종료됐어요. 투표는 가요제 경연이 시작되면 열려요."],
  ] as const)("explains the %s story-to-vote sequence", (storyPhase, message) => {
    useFestivalStatusMock.mockReturnValue({
      data: statusBody(storyPhase, "BEFORE"),
      isError: false,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFestivalStatus>);

    renderPage("/contest");

    expect(screen.getByRole("region", { name: "가요제 진행 순서" })).toHaveTextContent(
      message,
    );
    expect(
      screen.getByRole("region", { name: "가요제 투표는 경연 당일에 열려요" }),
    ).toHaveTextContent("현장에서 진행 중인 경기에만 투표할 수 있어요.");
    expect(
      screen.queryByText(
        "자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.",
      ),
    ).not.toBeInTheDocument();
  });

  it("switches the two overview tabs without leaving the page", () => {
    renderPage("/contest?phase=open");
    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    expect(screen.getByText("불러오는 중…")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "타임테이블" }));
    expect(screen.getByText("가요제 오프닝")).toBeInTheDocument();
  });

  it("renders public story titles in the open phase", () => {
    renderPage("/contest?phase=open");

    expect(screen.getByText("함께 부르는 밤")).toBeInTheDocument();
    expect(screen.getByText("첫 무대의 떨림")).toBeInTheDocument();
    expect(screen.getByText("우리 과 응원가")).toBeInTheDocument();
    const [firstStoryTitle] = screen.getAllByTestId("contest-story-title");

    if (!firstStoryTitle) {
      throw new Error("Expected at least one story title token.");
    }

    expect(firstStoryTitle).toHaveStyle({ lineHeight: "1.05" });
    expect(firstStoryTitle.style.getPropertyValue("--story-float-duration")).toMatch(
      /s$/,
    );
  });

  it("shows clearly labeled sample titles without fetching stories in development preview", () => {
    usePublicContestStoriesMock.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePublicContestStories>);

    renderPage("/contest?phase=open&preview=stories");

    expect(usePublicContestStoriesMock).toHaveBeenCalledWith(false);
    expect(screen.getByText("예시 미리보기")).toBeInTheDocument();
    expect(screen.getAllByTestId("contest-story-title")).toHaveLength(12);
    expect(screen.getByText("졸업 전에 꼭 하고 싶은 이야기")).toBeInTheDocument();
    expect(
      screen.queryByText("사연 목록을 불러오지 못했어요."),
    ).not.toBeInTheDocument();
  });

  it("hides the native scrollbar and moves the custom indicator with the list", () => {
    renderPage("/contest");
    const scrollArea = screen.getByRole("tabpanel", { name: "가요제 타임테이블" });

    expect(scrollArea).toHaveClass(
      "[scrollbar-width:none]",
      "[&::-webkit-scrollbar]:hidden",
    );

    Object.defineProperties(scrollArea, {
      clientHeight: { configurable: true, value: 292 },
      scrollHeight: { configurable: true, value: 700 },
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    fireEvent.scroll(scrollArea);

    const initialScrollThumb = screen.getByTestId("contest-scroll-thumb");
    expect(initialScrollThumb).toHaveClass(
      "motion-safe:[animation:contest-scroll-nudge_1.8s_ease-in-out_infinite]",
    );
    expect(initialScrollThumb).toHaveStyle({ transform: "translateY(0px)" });

    scrollArea.scrollTop = 204;
    fireEvent.scroll(scrollArea);

    const scrollThumb = screen.getByTestId("contest-scroll-thumb");
    expect(scrollThumb).not.toHaveClass(
      "motion-safe:[animation:contest-scroll-nudge_1.8s_ease-in-out_infinite]",
    );
    expect(scrollThumb).toHaveStyle({ transform: "translateY(112px)" });

    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    fireEvent.scroll(screen.getByRole("tabpanel", { name: "경연 목록" }));

    expect(screen.getByTestId("contest-scroll-thumb")).toBeInTheDocument();
  });

  it("advances the highlighted event and centers it without reloading the page", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-02T19:59:59+09:00"));
    renderPage("/contest");

    const scrollArea = screen.getByRole("tabpanel", { name: "가요제 타임테이블" });
    const previousItem = screen.getByText("가요제 1라운드").closest("li");
    const nextItem = screen.getByText("댄스동아리 축하 공연").closest("li");
    expect(previousItem).not.toBeNull();
    expect(nextItem).not.toBeNull();
    expect(previousItem!.querySelector("div")).toHaveClass("border-[#ff0080]");
    expect(nextItem!.querySelector("div")).toHaveClass("border-[#fcfcfc]");

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
    expect(scrollArea.scrollTo).toHaveBeenCalledWith({
      top: 205,
      behavior: "smooth",
    });
  });

  it("validates the form and submits the story API body", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderPage("/contest?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    expect(
      screen.getByRole("dialog", { name: "사연 신청 안내 사항" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "사연 작성하기" }));
    const submitButton = screen.getByRole("button", { name: "사연 접수하기" });
    const termsCheckbox = screen.getByRole("checkbox", {
      name: /GROOVE 웹서비스 이용약관에 동의합니다/,
    });
    const consentCheckbox = screen.getByRole("checkbox", {
      name: /개인정보 수집 및 이용에 동의합니다/,
    });
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole("link", { name: "약관 전문 보기" })).toHaveAttribute(
      "href",
      "https://knu-cse-sysdev.notion.site/festival-terms-of-services",
    );
    expect(screen.getByRole("link", { name: "동의서 전문 보기" })).toHaveAttribute(
      "href",
      "https://knu-cse-sysdev.notion.site/festival-personal-information-collection-and-use-consent",
    );
    expect(termsCheckbox).not.toBeChecked();
    expect(consentCheckbox).not.toBeChecked();
    expect(screen.getAllByText("(필수)")).toHaveLength(2);
    for (const required of screen.getAllByText("(필수)")) {
      expect(required).toHaveClass("text-[#ff0080]");
    }
    expect(termsCheckbox).toHaveClass("accent-[#ff0080]");
    expect(consentCheckbox).toHaveClass("accent-[#ff0080]");
    expect(submitStoryMutateAsync).not.toHaveBeenCalled();

    fireEvent.click(consentCheckbox);
    expect(submitButton).toBeDisabled();
    fireEvent.click(termsCheckbox);
    expect(submitButton).toBeEnabled();
    fireEvent.click(termsCheckbox);
    expect(submitButton).toBeDisabled();
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);
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
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(submitStoryMutateAsync).toHaveBeenCalledWith({
        college: "IT",
        department: "컴퓨터학부",
        studentNumber: "20241234",
        name: "홍길동",
        nickname: null,
        title: "축제 이야기",
        content: "함께 노래해요.",
      }),
    );
    expect(await screen.findByText("사연이 접수되었어요")).toBeInTheDocument();
  });
});

describe("SongContestPage contest phase", () => {
  it("shows the before-contest notice and keeps the 경연 목록 tab label", () => {
    useFestivalStatusMock.mockReturnValue({
      data: statusBody("CLOSED", "BEFORE"),
      isError: false,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFestivalStatus>);
    useVotesMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useVotes>);

    renderPage("/contest");
    expect(screen.getByRole("tab", { name: "경연 목록" })).toBeInTheDocument();
    expect(screen.getByText("가요제 투표는 경연 당일에 열려요")).toBeInTheDocument();
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
    useFestivalStatusMock.mockReturnValue({
      data: statusBody("CLOSED", "OPEN"),
      isError: false,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFestivalStatus>);
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
    useFestivalStatusMock.mockReturnValue({
      data: statusBody("CLOSED", "CLOSED"),
      isError: false,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFestivalStatus>);
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
