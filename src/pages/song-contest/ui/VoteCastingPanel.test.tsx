import { fireEvent, render, screen } from "@testing-library/react";

import { useAuthMe, useGoogleSignIn, useLoginWithGoogle } from "@/entities/auth";
import { useVotes } from "@/entities/contest";

import { useMyBallots } from "../api/getMyBallots";
import { useSubmitBallot } from "../api/submitBallot";
import { useContestLocationGate } from "../model/useContestLocationGate";
import { VoteCastingPanel } from "./VoteCastingPanel";

vi.mock("../model/useContestLocationGate", () => ({
  useContestLocationGate: vi.fn(),
}));
vi.mock("@/entities/contest", () => ({ useVotes: vi.fn() }));
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

    render(<VoteCastingPanel />);
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

    render(<VoteCastingPanel />);
    fireEvent.click(screen.getByRole("button", { name: "IT대학" }));

    expect(
      screen.getByRole("dialog", { name: "가요제 투표 안내 사항" }),
    ).toBeInTheDocument();
  });

  it("selects a participant, confirms, and submits the ballot when logged in", () => {
    useAuthMeMock.mockReturnValue({ data: { loggedIn: true } } as unknown as ReturnType<
      typeof useAuthMe
    >);

    render(<VoteCastingPanel />);
    fireEvent.click(screen.getByRole("button", { name: "IT대학" }));
    fireEvent.click(screen.getByRole("button", { name: "투표하기" }));

    expect(screen.getByText("투표 완료!")).toBeInTheDocument();
    expect(screen.getAllByText("IT대학").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(submitMutate).toHaveBeenCalledWith(
      expect.objectContaining({ singingVoteId: 1, voteParticipantId: 1 }),
      expect.anything(),
    );
  });

  it("shows the empty state when there is nothing to vote on", () => {
    useVotesMock.mockReturnValue({ data: [] } as unknown as ReturnType<
      typeof useVotes
    >);
    useAuthMeMock.mockReturnValue({ data: { loggedIn: true } } as unknown as ReturnType<
      typeof useAuthMe
    >);

    render(<VoteCastingPanel />);
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
    useAuthMeMock.mockReturnValue({ data: { loggedIn: true } } as unknown as ReturnType<
      typeof useAuthMe
    >);

    render(<VoteCastingPanel />);
    fireEvent.click(screen.getByRole("tab", { name: "참여한 투표" }));

    expect(screen.getByText("투표 완료")).toBeInTheDocument();
    const itButton = screen.getByRole("button", { name: "IT대학" });
    expect(itButton).toHaveAttribute("aria-pressed", "true");
    expect(itButton).toBeDisabled();
  });
});
