import { MOCK_RIVAL_SCORES, splitRivalStandings } from "./rivals";

describe("splitRivalStandings", () => {
  it("puts the top three on the podium and the rest in rows", () => {
    const { podium, others } = splitRivalStandings(MOCK_RIVAL_SCORES);

    expect(podium.map(({ college }) => college)).toEqual(["ART", "NURSING", "EDU"]);
    expect(others.map(({ college }) => college)).toEqual(["IT", "SOCIAL", "NATURE"]);
  });

  it("splits by response order so tied ranks stay in place", () => {
    const tied = MOCK_RIVAL_SCORES.map((entry, index) => ({
      ...entry,
      rank: index < 4 ? 1 : entry.rank,
    }));

    const { podium, others } = splitRivalStandings(tied);

    expect(podium).toHaveLength(3);
    expect(others[0]).toMatchObject({ college: "IT", rank: 1 });
  });
});
