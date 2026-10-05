export type College = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

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

export const splitRivalStandings = (scores: readonly RivalScore[]): RivalStandings => ({
  podium: scores.slice(0, 3),
  others: scores.slice(3),
});
