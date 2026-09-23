import { render, screen } from "@testing-library/react";

import type { Vote } from "@/entities/contest";

import { BracketMatchRow } from "./BracketMatchRow";

const twoWayVote: Vote = {
  singingVoteId: 1,
  title: "가요제 예선 1라운드",
  round: "ROUND_1",
  roundLabel: "예선",
  roundKeyword: "자유로움",
  matchOrder: 1,
  status: "OPEN",
  endsAt: "2026-10-01T18:30:00+09:00",
  createdAt: "2026-09-01T00:00:00+09:00",
  participants: [
    { voteParticipantId: 1, name: "IT대학", resultRank: null },
    { voteParticipantId: 2, name: "간호대학", resultRank: null },
  ],
};

describe("BracketMatchRow", () => {
  it("renders a VS layout for a two-participant match with its meta label", () => {
    render(<BracketMatchRow metaLabel="12분 남음" vote={twoWayVote} />);

    expect(screen.getByText("가요제 예선 1라운드")).toBeInTheDocument();
    expect(screen.getByText("12분 남음")).toBeInTheDocument();
    expect(screen.getByText("vs")).toBeInTheDocument();
    expect(screen.getByText("IT대학")).toBeInTheDocument();
    expect(screen.getByText("간호대학")).toBeInTheDocument();
  });

  it("shows a placeholder when the bracket slot is not yet decided", () => {
    render(
      <BracketMatchRow
        vote={{ ...twoWayVote, status: "SCHEDULED", participants: [] }}
      />,
    );

    expect(screen.getByText("아직 참가팀이 정해지지 않았어요")).toBeInTheDocument();
  });

  it("stacks three participants for the final round instead of a VS layout", () => {
    render(
      <BracketMatchRow
        vote={{
          ...twoWayVote,
          title: "가요제 결선",
          participants: [
            { voteParticipantId: 1, name: "IT대학", resultRank: null },
            { voteParticipantId: 2, name: "간호대학", resultRank: null },
            { voteParticipantId: 3, name: "예술대학", resultRank: null },
          ],
        }}
      />,
    );

    expect(screen.queryByText("vs")).not.toBeInTheDocument();
    expect(screen.getByText("IT대학")).toBeInTheDocument();
    expect(screen.getByText("간호대학")).toBeInTheDocument();
    expect(screen.getByText("예술대학")).toBeInTheDocument();
  });

  it("shows the winner badge only on the participant with resultRank 1 when requested", () => {
    render(
      <BracketMatchRow
        showWinnerBadge
        vote={{
          ...twoWayVote,
          participants: [
            { voteParticipantId: 1, name: "IT대학", resultRank: 1 },
            { voteParticipantId: 2, name: "간호대학", resultRank: 2 },
          ],
        }}
      />,
    );

    expect(screen.getAllByText("우승")).toHaveLength(1);
  });
});
