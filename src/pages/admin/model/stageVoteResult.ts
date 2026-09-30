import type { Vote } from "@/entities/contest";

// 참가팀별 순위 선택. 키는 voteParticipantId.
export type RankSelection = Readonly<Record<number, number>>;

// 이미 저장된 결과가 있으면 그 순위로 시작한다(수정할 때 처음부터 다시 고르지 않도록).
export const initialRankSelection = (vote: Pick<Vote, "participants">): RankSelection =>
  Object.fromEntries(
    vote.participants.flatMap((participant) =>
      participant.resultRank === null
        ? []
        : [[participant.voteParticipantId, participant.resultRank]],
    ),
  );

// 1:1 경기. 승자를 누르면 그 팀이 1위, 나머지가 2위다.
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

// 결선(3팀). 한 팀에 순위를 주면 같은 순위를 갖고 있던 다른 팀에서는 뺀다 —
// 같은 순위가 둘이 되는 입력을 화면에서부터 막는다.
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

// 서버(SING-A8)와 같은 규칙: 참가팀 전원에게 1..N 이 하나씩.
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

// 확인창·결과 요약에 쓰는 "1위 A · 2위 B" 문구.
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
