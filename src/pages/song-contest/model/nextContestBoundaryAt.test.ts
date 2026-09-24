import { nextContestBoundaryAt } from "./nextContestBoundaryAt";

const stage = {
  contestStartAt: "2026-10-01T18:00:00+09:00",
  contestEndAt: "2026-10-01T21:00:00+09:00",
};

describe("nextContestBoundaryAt", () => {
  it("targets the start time while before the contest", () => {
    expect(nextContestBoundaryAt("BEFORE", stage)).toBe(stage.contestStartAt);
  });

  it("targets the end time while the contest is open", () => {
    expect(nextContestBoundaryAt("OPEN", stage)).toBe(stage.contestEndAt);
  });

  it("has no further boundary once closed", () => {
    expect(nextContestBoundaryAt("CLOSED", stage)).toBeUndefined();
  });

  it("has no boundary when the phase is not yet known", () => {
    expect(nextContestBoundaryAt(undefined, stage)).toBeUndefined();
  });
});
