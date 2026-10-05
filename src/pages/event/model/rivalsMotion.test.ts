import type { RivalScore } from "./rivals";
import { getCountUpValue, getRisenColleges } from "./rivalsMotion";

const entry = (college: RivalScore["college"], rank: number): RivalScore => ({
  college,
  collegeName: college,
  score: 0,
  rank,
});

describe("getRisenColleges", () => {
  it("finds only the colleges that moved ahead in response order", () => {
    const before = [
      entry("ART", 1),
      entry("NURSING", 2),
      entry("EDU", 3),
      entry("IT", 4),
    ];
    const after = [
      entry("ART", 1),
      entry("IT", 2),
      entry("NURSING", 3),
      entry("EDU", 4),
    ];

    expect([...getRisenColleges(before, after)]).toEqual(["IT"]);
  });

  it("uses order rather than rank so ties do not count as a rise", () => {
    const before = [entry("ART", 1), entry("NURSING", 2), entry("EDU", 3)];
    const after = [entry("ART", 1), entry("NURSING", 1), entry("EDU", 3)];

    expect(getRisenColleges(before, after).size).toBe(0);
  });

  it("does not treat a college seen for the first time as risen", () => {
    expect(getRisenColleges([], [entry("ART", 1)]).size).toBe(0);
  });
});

describe("getCountUpValue", () => {
  it("starts at the old score and lands on the new one", () => {
    expect(getCountUpValue(100, 200, 0)).toBe(100);
    expect(getCountUpValue(100, 200, 1)).toBe(200);
    expect(getCountUpValue(100, 200, 2)).toBe(200);
  });

  it("slows down towards the end", () => {
    expect(getCountUpValue(0, 100, 0.5)).toBeGreaterThan(50);
  });
});
