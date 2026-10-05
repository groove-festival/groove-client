import type { Vote } from "@/entities/contest";

export type RankSelection = Readonly<Record<number, number>>;

export const initialRankSelection = (vote: Pick<Vote, "participants">): RankSelection =>
  Object.fromEntries(
    vote.participants.flatMap((participant) =>
      participant.resultRank === null
        ? []
        : [[participant.voteParticipantId, participant.resultRank]],
    ),
  );

export const pickWinner = (
  vote: Pick<Vote, "participants">,
  winnerId: number,
): RankSelection =>
  Object.fromEntries(
    vote.participants.map((participant) => [
      participant.voteParticipantId,
      participant.voteParticipantId === winnerId ? 1 : 2,
    ]),
  );

export const assignRank = (
  selection: RankSelection,
  participantId: number,
  rank: number,
): RankSelection => {
  const next = Object.fromEntries(
    Object.entries(selection).filter(
      ([id, value]) => value !== rank && Number(id) !== participantId,
    ),
  ) as Record<number, number>;
  next[participantId] = rank;
  return next;
};

export const isCompleteRanking = (
  vote: Pick<Vote, "participants">,
  selection: RankSelection,
): boolean => {
  const ranks = vote.participants.map(
    (participant) => selection[participant.voteParticipantId],
  );
  const expected = vote.participants.map((_, index) => index + 1);
  return (
    ranks.every((rank) => rank !== undefined) &&
    [...ranks].sort((left, right) => left - right).join() === expected.join()
  );
};

export const describeRanking = (
  vote: Pick<Vote, "participants">,
  selection: RankSelection,
): string =>
  [...vote.participants]
    .filter((participant) => selection[participant.voteParticipantId] !== undefined)
    .sort(
      (left, right) =>
        selection[left.voteParticipantId] - selection[right.voteParticipantId],
    )
    .map(
      (participant) =>
        `${selection[participant.voteParticipantId]}위 ${participant.name}`,
    )
    .join(" · ");
