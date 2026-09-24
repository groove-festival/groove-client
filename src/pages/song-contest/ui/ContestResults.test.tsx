import { render, screen } from "@testing-library/react";

import type { Vote } from "@/entities/contest";

import { ContestResults } from "./ContestResults";

const baseVote: Vote = {
  singingVoteId: 1,
  title: "가요제 예선 1라운드",
  round: "ROUND_1",
  roundLabel: "예선",
  roundKeyword: "자유로움",
  matchOrder: 1,
  status: "CLOSED",
  endsAt: "2026-10-01T18:30:00+09:00",
  createdAt: "2026-09-01T00:00:00+09:00",
  participants: [
    { voteParticipantId: 1, name: "IT대학", resultRank: 1 },
    { voteParticipantId: 2, name: "간호대학", resultRank: 2 },
  ],
};

describe("ContestResults", () => {
  it("shows the empty placeholder when no match has a result yet", () => {
    render(
      <ContestResults
        votes={[
          {
            ...baseVote,
            participants: [{ voteParticipantId: 1, name: "IT대학", resultRank: null }],
          },
        ]}
      />,
    );

    expect(screen.getByText("아직 완료된 경연이 없어요.")).toBeInTheDocument();
  });

  it("lists finished matches with the winner highlighted", () => {
    render(<ContestResults votes={[baseVote]} />);

    expect(screen.getByText("가요제 예선 1라운드")).toBeInTheDocument();
    expect(screen.getByText("우승")).toBeInTheDocument();
  });
});
