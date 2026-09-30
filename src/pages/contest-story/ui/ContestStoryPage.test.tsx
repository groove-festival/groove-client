import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { useAuthMe, useLoginWithGoogle } from "@/entities/auth";
import {
  useFestivalStatus,
  type FestivalStatusResponseBody,
} from "@/entities/festival";

import { usePublicContestStories } from "../api/getPublicContestStories";
import { useSubmitContestStory } from "../api/submitContestStory";
import ContestStoryPage from "./ContestStoryPage";

vi.mock("@/entities/festival", () => ({ useFestivalStatus: vi.fn() }));
vi.mock("@/entities/auth", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/auth");
  return { ...actual, useAuthMe: vi.fn(), useLoginWithGoogle: vi.fn() };
});
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
const usePublicContestStoriesMock = vi.mocked(usePublicContestStories);
const useLoginWithGoogleMock = vi.mocked(useLoginWithGoogle);
const useSubmitContestStoryMock = vi.mocked(useSubmitContestStory);

const submitStoryMutateAsync = vi.fn();
const submitStoryReset = vi.fn();
const googleLoginReset = vi.fn();

function statusBody(
  storyPhase: FestivalStatusResponseBody["stage"]["storyPhase"],
): FestivalStatusResponseBody {
  return {
    phase: "BEFORE",
    festivalStartAt: "2026-10-01T00:00:00+09:00",
    festivalEndAt: "2026-10-03T00:00:00+09:00",
    stage: {
      storyPhase,
      storyCollectionStartAt: "2026-09-20T00:00:00+09:00",
      storyCollectionEndAt: "2026-09-30T00:00:00+09:00",
      contestPhase: "BEFORE",
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
        <ContestStoryPage />
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
  googleLoginReset.mockReset();

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
    ],
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof usePublicContestStories>);
  useLoginWithGoogleMock.mockReturnValue({
    error: null,
    isPending: false,
    mutate: vi.fn(),
    reset: googleLoginReset,
  } as unknown as ReturnType<typeof useLoginWithGoogle>);
  useSubmitContestStoryMock.mockReturnValue({
    isPending: false,
    mutateAsync: submitStoryMutateAsync,
    reset: submitStoryReset,
  } as unknown as ReturnType<typeof useSubmitContestStory>);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("ContestStoryPage", () => {
  it("shows only the story notice before collection", () => {
    renderPage("/story");

    expect(screen.getByText("사연 모집을 준비하고 있어요")).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "타임테이블" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "경연 목록" })).not.toBeInTheDocument();
  });

  it("shows the closed notice after collection", () => {
    renderPage("/story?phase=closed");

    expect(screen.getByText("사연 모집이 끝났어요")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "GROOVE 사연 신청하기" }),
    ).not.toBeInTheDocument();
  });

  // 사연 제목 클라우드 임시 숨김(SHOW_STORY_TITLE_CLOUD) 동안 건너뛴다.
  it.skip("renders public story titles in the open phase", () => {
    renderPage("/story?phase=open");

    expect(
      screen.getByRole("heading", { name: "GROOVE 사연 모집 이벤트" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("사연 신청 목록")).not.toBeInTheDocument();
    expect(
      screen.queryByText("신청한 사연은 축제 무대에서 MC가 소개합니다."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("함께 나누고 싶은 이야기를 남겨 주세요."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("함께 부르는 밤")).toBeInTheDocument();
    expect(screen.getByText("첫 무대의 떨림")).toBeInTheDocument();
    const [firstStoryTitle] = screen.getAllByTestId("contest-story-title");

    expect(firstStoryTitle).toHaveStyle({ lineHeight: "1.05" });
    expect(firstStoryTitle?.style.getPropertyValue("--story-float-duration")).toMatch(
      /s$/,
    );
    expect(
      screen.getAllByTestId("contest-story-title").map((title) => title.style.fontSize),
    ).toEqual(expect.arrayContaining(["0.75rem", "2.5rem"]));
    expect(screen.queryByRole("tab", { name: "타임테이블" })).not.toBeInTheDocument();
  });

  // 사연 제목 클라우드 임시 숨김(SHOW_STORY_TITLE_CLOUD) 동안 건너뛴다.
  it.skip("shows the story list error and retries", () => {
    const refetch = vi.fn();
    usePublicContestStoriesMock.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch,
    } as unknown as ReturnType<typeof usePublicContestStories>);

    renderPage("/story?phase=open");
    expect(screen.getByText("사연 목록을 불러오지 못했어요.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다시 불러오기" }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  // 사연 제목 클라우드 임시 숨김(SHOW_STORY_TITLE_CLOUD) 동안 건너뛴다.
  it.skip("shows clearly labeled sample titles without fetching stories in development preview", () => {
    usePublicContestStoriesMock.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePublicContestStories>);

    renderPage("/story?phase=open&preview=stories");

    expect(usePublicContestStoriesMock).toHaveBeenCalledWith(false);
    expect(screen.getByText("예시 미리보기")).toBeInTheDocument();
    expect(screen.getAllByTestId("contest-story-title")).toHaveLength(12);
    expect(screen.getByText("졸업 전에 꼭 하고 싶은 이야기")).toBeInTheDocument();
    expect(
      screen.queryByText("사연 목록을 불러오지 못했어요."),
    ).not.toBeInTheDocument();
  });

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
      reset: googleLoginReset,
    } as unknown as ReturnType<typeof useLoginWithGoogle>);
    renderPage("/story?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "GROOVE 사연 신청하기" }));

    const dialog = screen.getByRole("dialog", { name: "사연 신청 안내 사항" });
    expect(dialog).toHaveClass("bg-[rgba(252,252,252,0.5)]", "backdrop-blur-[24px]");
    expect(
      within(dialog).getByText("Google 비밀번호는 GROOVE에 전달되지 않습니다."),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Google에서 발급한 인증 정보로 로그인 상태만/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Google 로그인" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "사연 신청하기" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Google 계정으로 로그인" }));
    expect(login).toHaveBeenCalledWith("test-id-token", expect.any(Object));

    const loginOptions = login.mock.calls[0]?.[1] as { onSuccess?: () => void };
    act(() => loginOptions.onSuccess?.());

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "사연 신청하기" })).toBeInTheDocument();
  });

  it("shows a Google login error inside the guide modal", () => {
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: false, role: null, displayName: null, pubId: null },
      isError: false,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAuthMe>);
    useLoginWithGoogleMock.mockReturnValue({
      error: new Error("login failed"),
      isPending: false,
      mutate: vi.fn(),
      reset: googleLoginReset,
    } as unknown as ReturnType<typeof useLoginWithGoogle>);

    renderPage("/story?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "GROOVE 사연 신청하기" }));

    expect(
      screen.getByText("Google 로그인에 실패했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("validates the form and submits the story API body", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderPage("/story?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "GROOVE 사연 신청하기" }));
    fireEvent.click(screen.getByRole("button", { name: "사연 작성하기" }));
    const submitButton = screen.getByRole("button", { name: "사연 접수하기" });
    const termsCheckbox = screen.getByRole("checkbox", {
      name: /GROOVE 웹서비스 이용약관에 동의합니다/,
    });
    const consentCheckbox = screen.getByRole("checkbox", {
      name: /개인정보 수집 및 이용에 동의합니다/,
    });
    expect(submitButton).toBeDisabled();

    fireEvent.click(termsCheckbox);
    fireEvent.click(consentCheckbox);
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
    expect(
      await screen.findByText("가수와 노래 제목을 입력해 주세요."),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "관련 노래: 가수 - 노래 제목 (예: 오반 - flower) *",
      }),
      { target: { value: "오반 - flower" } },
    );
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(submitStoryMutateAsync).toHaveBeenCalledWith({
        college: "IT",
        department: "컴퓨터학부",
        studentNumber: "20241234",
        name: "홍길동",
        nickname: null,
        song: "오반 - flower",
        title: "축제 이야기",
        content: "함께 노래해요.",
      }),
    );
    expect(await screen.findByText("사연이 접수되었어요")).toBeInTheDocument();
  });
});
