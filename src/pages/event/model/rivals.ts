// PLAN-2 단과대학 코드. 선언 순서는 API의 College 선언 순서와 같다.
export type College = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

// PLAN-2 응답의 scores 항목 모양을 따른다.
export interface RivalScore {
  college: College;
  collegeName: string;
  score: number;
  rank: number;
}

// API 연동 전까지 쓰는 Figma(34:3619) 점수. 응답처럼 점수 내림차순이다.
export const MOCK_RIVAL_SCORES: readonly RivalScore[] = [
  { college: "ART", collegeName: "예술대학", score: 505, rank: 1 },
  { college: "NURSING", collegeName: "간호대학", score: 410, rank: 2 },
  { college: "EDU", collegeName: "사범대학", score: 388, rank: 3 },
  { college: "IT", collegeName: "IT대학", score: 340, rank: 4 },
  { college: "SOCIAL", collegeName: "사회과학대학", score: 275, rank: 5 },
  { college: "NATURE", collegeName: "자연과학대학", score: 260, rank: 6 },
];

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
