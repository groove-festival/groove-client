export type VoteStatus = "SCHEDULED" | "OPEN" | "CLOSED";

export type VoteRound = "ROUND_1" | "ROUND_2" | "ROUND_3";

export interface VoteParticipant {
  voteParticipantId: number;
  name: string;

  resultRank: number | null;
}

export interface Vote {
  singingVoteId: number;
  title: string;
  round: VoteRound;
  roundLabel: string;
  roundKeyword: string;
  matchOrder: number;
  status: VoteStatus;

  endsAt: string | null;
  createdAt: string;

  participants: VoteParticipant[];
}
