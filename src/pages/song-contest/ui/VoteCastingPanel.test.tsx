import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { useAuthMe, useGoogleSignIn, useLoginWithGoogle } from "@/entities/auth";
import { useVotes } from "@/entities/contest";
import { ApiError } from "@/shared/api";

import { useMyBallots } from "../api/getMyBallots";
import { useSubmitBallot } from "../api/submitBallot";
import { useContestLocationGate } from "../model/useContestLocationGate";
import { VoteCastingPanel } from "./VoteCastingPanel";

vi.mock("../model/useContestLocationGate", () => ({
  useContestLocationGate: vi.fn(),
}));
vi.mock("@/entities/contest", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/contest");
  return { ...actual, useVotes: vi.fn() };
});
vi.mock("../api/getMyBallots", () => ({ useMyBallots: vi.fn() }));
vi.mock("../api/submitBallot", () => ({ useSubmitBallot: vi.fn() }));
vi.mock("@/entities/auth", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/auth");
  return {
    ...actual,
    useAuthMe: vi.fn(),
    useLoginWithGoogle: vi.fn(),
    useGoogleSignIn: vi.fn(),
  };
});

const useContestLocationGateMock = vi.mocked(useContestLocationGate);
const useVotesMock = vi.mocked(useVotes);
const useMyBallotsMock = vi.mocked(useMyBallots);
const useSubmitBallotMock = vi.mocked(useSubmitBallot);
const useAuthMeMock = vi.mocked(useAuthMe);
const useLoginWithGoogleMock = vi.mocked(useLoginWithGoogle);
const useGoogleSignInMock = vi.mocked(useGoogleSignIn);

const renderPanel = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<VoteCastingPanel />, { wrapper });
};

const openVote = {
  singingVoteId: 1,
  title: "가요제 예선 1라운드",
  round: "ROUND_1" as const,
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

const submitMutate = vi.fn();

beforeEach(() => {
  useContestLocationGateMock.mockReturnValue({ status: "in-range", retry: vi.fn() });
  useVotesMock.mockReturnValue({ data: [openVote] } as unknown as ReturnType<
    typeof useVotes
  >);
  useMyBallotsMock.mockReturnValue({ data: [] } as unknown as ReturnType<
    typeof useMyBallots
  >);
  useSubmitBallotMock.mockReturnValue({
    mutate: submitMutate,
    isPending: false,
    isError: false,
    reset: vi.fn(),
  } as unknown as ReturnType<typeof useSubmitBallot>);
  useAuthMeMock.mockReturnValue({ data: { loggedIn: false } } as unknown as ReturnType<
    typeof useAuthMe
  >);
  useLoginWithGoogleMock.mockReturnValue({ mutate: vi.fn() } as unknown as ReturnType<
    typeof useLoginWithGoogle
  >);
  useGoogleSignInMock.mockReturnValue({
    hiddenButtonRef: { current: null },
    ready: false,
  } as unknown as ReturnType<typeof useGoogleSignIn>);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("VoteCastingPanel", () => {
  it("shows the venue notice and retries when out of range", () => {
    const retry = vi.fn();
    useContestLocationGateMock.mockReturnValue({ status: "out-of-range", retry });

    renderPanel();
    expect(
      screen.getByText("무대 주변으로 이동하면 투표가 가능해요"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "위치 다시 확인" }));
    expect(retry).toHaveBeenCalled();
  });

  it("opens the Google sign-in guide when a logged-out participant taps a tile", () => {
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: false },
    } as unknown as ReturnType<typeof useAuthMe>);

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "IT대학" }));

    expect(
      screen.getByRole("dialog", { name: "가요제 투표 안내 사항" }),
    ).toBeInTheDocument();
  });

  it("still asks for a Google login when only an admin session is active", () => {
    // 관리자(STAGE_ADMIN 등) 세션도 loggedIn: true라, role까지 확인하지 않으면
    // 구글 로그인을 한 것으로 착각한다.
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: true, role: "STAGE_ADMIN" },
    } as unknown as ReturnType<typeof useAuthMe>);

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "IT대학" }));

    expect(screen.getByText("Google로 계속하기")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "확인" })).not.toBeInTheDocument();
  });

  it("applies the tapped participant automatically once Google login succeeds", () => {
    let capturedOnIdToken: ((idToken: string) => void) | undefined;
    useGoogleSignInMock.mockImplementation((args) => {
      capturedOnIdToken = args.onIdToken;
      return { hiddenButtonRef: { current: null }, ready: false };
    });
    const loginMutate = vi.fn(
      (_idToken: string, options?: { onSuccess?: () => void }) =>
        options?.onSuccess?.(),
    );
    useLoginWithGoogleMock.mockReturnValue({
      mutate: loginMutate,
    } as unknown as ReturnType<typeof useLoginWithGoogle>);

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "IT대학" }));
    expect(
      screen.getByRole("dialog", { name: "가요제 투표 안내 사항" }),
    ).toBeInTheDocument();

    act(() => capturedOnIdToken?.("test-id-token"));

    expect(loginMutate).toHaveBeenCalledWith("test-id-token", expect.anything());
    expect(
      screen.queryByRole("dialog", { name: "가요제 투표 안내 사항" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IT대학" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("selects a participant, confirms, and submits the ballot when logged in", () => {
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: true, role: "USER" },
    } as unknown as ReturnType<typeof useAuthMe>);

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "IT대학" }));

    // 이미 로그인된 상태라 안내 팝업 없이 바로 선택된다.
    expect(
      screen.queryByRole("dialog", { name: "가요제 투표 안내 사항" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "투표하기" }));

    expect(screen.getByText("투표 완료!")).toBeInTheDocument();
    expect(screen.getAllByText("IT대학").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(submitMutate).toHaveBeenCalledWith(
      expect.objectContaining({ singingVoteId: 1, voteParticipantId: 1 }),
      expect.anything(),
    );
  });

  it("shows an error and keeps the dialog open when the match closed underneath the user", () => {
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: true, role: "USER" },
    } as unknown as ReturnType<typeof useAuthMe>);
    const resetMock = vi.fn();
    useSubmitBallotMock.mockReturnValue({
      mutate: submitMutate,
      isPending: false,
      isError: true,
      error: new ApiError("SING007", "이미 마감됨", 409),
      reset: resetMock,
    } as unknown as ReturnType<typeof useSubmitBallot>);

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "IT대학" }));
    fireEvent.click(screen.getByRole("button", { name: "투표하기" }));
    expect(resetMock).toHaveBeenCalled();

    expect(
      screen.getByText("이미 마감된 경기예요. 목록을 새로고침해 주세요."),
    ).toBeInTheDocument();
    // 실패해도 팝업은 닫히지 않는다 — 사용자가 상황을 보고 "변경"을 고를 수 있다.
    expect(screen.getByText("투표 완료!")).toBeInTheDocument();
  });

  it("shows the empty state when there is nothing to vote on", () => {
    useVotesMock.mockReturnValue({ data: [] } as unknown as ReturnType<
      typeof useVotes
    >);
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: true, role: "USER" },
    } as unknown as ReturnType<typeof useAuthMe>);

    renderPanel();
    expect(screen.getByText("지금 진행 중인 투표가 없어요")).toBeInTheDocument();
  });

  it("shows a completed vote with the voted badge under 참여한 투표", () => {
    useMyBallotsMock.mockReturnValue({
      data: [
        {
          singingVoteId: 1,
          voteParticipantId: 1,
          votedAt: "2026-10-01T18:05:00+09:00",
        },
      ],
    } as unknown as ReturnType<typeof useMyBallots>);
    useAuthMeMock.mockReturnValue({
      data: { loggedIn: true, role: "USER" },
    } as unknown as ReturnType<typeof useAuthMe>);

    renderPanel();
    fireEvent.click(screen.getByRole("tab", { name: "참여한 투표" }));

    expect(screen.getByText("투표 완료")).toBeInTheDocument();
    const itButton = screen.getByRole("button", { name: "IT대학" });
    expect(itButton).toHaveAttribute("aria-pressed", "true");
    expect(itButton).toBeDisabled();
  });
});
