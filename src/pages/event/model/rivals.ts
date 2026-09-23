// PLAN-2 단과대학 코드. 선언 순서는 API의 College 선언 순서와 같다.
export type College = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

// PLAN-2 응답의 scores 항목 모양을 따른다.
export interface RivalScore {
  college: College;
  collegeName: string;
  score: number;
  rank: number;
}

export interface RivalStandings {
  podium: readonly RivalScore[];
  others: readonly RivalScore[];
}

// 응답 순서대로 앞 3건은 단상, 나머지는 목록 행으로 나눈다.
// 동점이면 같은 등수가 여러 건일 수 있어 등수 값이 아니라 순서로 나눈다.
export const splitRivalStandings = (scores: readonly RivalScore[]): RivalStandings => ({
  podium: scores.slice(0, 3),
  others: scores.slice(3),
});
