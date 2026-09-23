// 경기·투표의 상태. SING-2·SING-A2·SING-A3가 모두 같은 값을 쓴다.
export type VoteStatus = "SCHEDULED" | "OPEN" | "CLOSED";

// 라운드. 1·2라운드는 1위만 진출, 3라운드(결선)만 1·2·3위를 모두 가린다.
export type VoteRound = "ROUND_1" | "ROUND_2" | "ROUND_3";

export interface VoteParticipant {
  voteParticipantId: number;
  name: string;
  // 순위 발표 전에는 null. 1·2라운드는 1위만, 3라운드는 1·2·3위 모두 채워진다.
  resultRank: number | null;
}

// SING-2 응답 항목. 실제 서버 응답으로 확인된 필드명이다
// (curl 조회, 2026-09-25).
export interface Vote {
  singingVoteId: number;
  title: string;
  round: VoteRound;
  roundLabel: string;
  roundKeyword: string;
  matchOrder: number;
  status: VoteStatus;
  // 미개시(참가팀 미정) 경기는 null.
  endsAt: string | null;
  createdAt: string;
  // 2·3라운드는 앞 라운드 결과가 나오기 전까지 빈 배열.
  participants: VoteParticipant[];
}
