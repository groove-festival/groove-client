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

import { ApiError, httpClient } from "@/shared/api";
import { useSubmitContestStory } from "../api/submitContestStory";
import ContestStoryPage from "./ContestStoryPage";

vi.mock("@/entities/festival", () => ({ useFestivalStatus: vi.fn() }));
vi.mock("@/entities/auth", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/auth");
  return { ...actual, useAuthMe: vi.fn(), useLoginWithGoogle: vi.fn() };
});
vi.mock("@/features/google-auth", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("@/features/google-auth")),
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
vi.mock("../api/submitContestStory", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "../api/submitContestStory",
  );
  return { ...actual, useSubmitContestStory: vi.fn() };
});

const useFestivalStatusMock = vi.mocked(useFestivalStatus);
const useAuthMeMock = vi.mocked(useAuthMe);
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

const fillStoryForm = () => {
  fireEvent.click(screen.getByRole("button", { name: "IT" }));
  for (const [name, value] of [
    ["학과 *", "컴퓨터학부"],
    ["학번 *", "20241234"],
    ["이름 *", "홍길동"],
    ["사연 제목 *", "축제 이야기"],
    ["사연 내용 *", "함께 노래해요."],
    ["관련 노래: 가수 - 노래 제목 (예: 오반 - flower) *", "오반 - flower"],
  ]) {
    fireEvent.change(screen.getByRole("textbox", { name }), { target: { value } });
  }
  fireEvent.click(screen.getByRole("checkbox", { name: /GROOVE 웹서비스 이용약관/ }));
  fireEvent.click(screen.getByRole("checkbox", { name: /개인정보 수집 및 이용/ }));
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
  it.each(["before", "open", "closed", "open&preview=stories"])(
    "does not fetch or display public story titles for %s",
    (phase) => {
      const get = vi.spyOn(httpClient, "get");
      renderPage("/story?phase=" + phase);
      expect(get).not.toHaveBeenCalled();
      expect(
        screen.queryByRole("list", { name: "접수된 사연 제목" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("예시 미리보기")).not.toBeInTheDocument();
    },
  );

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

  it("ignores a login response after the guide has been dismissed", () => {
    const login = vi.fn();
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: false },
    } as unknown as ReturnType<typeof useAuthMe>);
    useLoginWithGoogleMock.mockReturnValue({
      mutate: login,
      reset: googleLoginReset,
    } as unknown as ReturnType<typeof useLoginWithGoogle>);
    renderPage("/story?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "GROOVE 사연 신청하기" }));
    fireEvent.click(screen.getByRole("button", { name: "Google 계정으로 로그인" }));
    fireEvent.click(screen.getByRole("button", { name: "안내 닫기" }));
    act(() => login.mock.calls[0]![1].onSuccess());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "사연 신청하기" }),
    ).not.toBeInTheDocument();
  });

  it("requires fresh Google authentication when submission reports an expired session", async () => {
    const login = vi.fn();
    useLoginWithGoogleMock.mockReturnValue({
      mutate: login,
      reset: googleLoginReset,
    } as unknown as ReturnType<typeof useLoginWithGoogle>);
    submitStoryMutateAsync.mockRejectedValueOnce(
      new ApiError("C003", "세션 만료", 401),
    );
    renderPage("/story?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "GROOVE 사연 신청하기" }));
    fireEvent.click(screen.getByRole("button", { name: "사연 작성하기" }));
    fillStoryForm();
    fireEvent.click(screen.getByRole("button", { name: "사연 접수하기" }));
    const dialog = await screen.findByRole("dialog", { name: "사연 신청 안내 사항" });
    expect(
      within(dialog).getByRole("button", { name: "Google 계정으로 로그인" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "사연 작성하기" }),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Google 로그인 후 사연을 접수할 수 있어요.",
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Google 계정으로 로그인" }),
    );
    act(() => login.mock.calls[0]![1].onSuccess());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "사연 신청하기" })).toBeInTheDocument();
    expect(
      screen.queryByText("Google 로그인 후 사연을 접수할 수 있어요."),
    ).not.toBeInTheDocument();
  });

  it("does not advance a reopened guide with the previous login response", () => {
    const login = vi.fn();
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: false },
    } as unknown as ReturnType<typeof useAuthMe>);
    useLoginWithGoogleMock.mockReturnValue({
      mutate: login,
      reset: googleLoginReset,
    } as unknown as ReturnType<typeof useLoginWithGoogle>);
    renderPage("/story?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "GROOVE 사연 신청하기" }));
    fireEvent.click(screen.getByRole("button", { name: "Google 계정으로 로그인" }));
    fireEvent.click(screen.getByRole("button", { name: "안내 닫기" }));
    fireEvent.click(screen.getByRole("button", { name: "GROOVE 사연 신청하기" }));
    act(() => login.mock.calls[0]![1].onSuccess());
    expect(
      screen.getByRole("dialog", { name: "사연 신청 안내 사항" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "사연 신청하기" }),
    ).not.toBeInTheDocument();
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
