import { type RivalScore, splitRivalStandings } from "./rivals";

// PLAN-2 응답처럼 점수 내림차순 6건이다.
const scores: RivalScore[] = [
  { college: "ART", collegeName: "예술대학", score: 505, rank: 1 },
  { college: "NURSING", collegeName: "간호대학", score: 410, rank: 2 },
  { college: "EDU", collegeName: "사범대학", score: 388, rank: 3 },
  { college: "IT", collegeName: "IT대학", score: 340, rank: 4 },
  { college: "SOCIAL", collegeName: "사회과학대학", score: 275, rank: 5 },
  { college: "NATURE", collegeName: "자연과학대학", score: 260, rank: 6 },
];

describe("splitRivalStandings", () => {
  it("puts the top three on the podium and the rest in rows", () => {
    const { podium, others } = splitRivalStandings(scores);

    expect(podium.map(({ college }) => college)).toEqual(["ART", "NURSING", "EDU"]);
    expect(others.map(({ college }) => college)).toEqual(["IT", "SOCIAL", "NATURE"]);
  });

  it("splits by response order so tied ranks stay in place", () => {
    const tied = scores.map((entry, index) => ({
      ...entry,
      rank: index < 4 ? 1 : entry.rank,
    }));

    const { podium, others } = splitRivalStandings(tied);

    expect(podium).toHaveLength(3);
    expect(others[0]).toMatchObject({ college: "IT", rank: 1 });
  });
});
