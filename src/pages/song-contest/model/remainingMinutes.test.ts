import { formatRemainingMinutes } from "./remainingMinutes";

const now = new Date("2026-10-01T18:00:00+09:00");

describe("formatRemainingMinutes", () => {
  it("rounds up the remaining minutes", () => {
    expect(formatRemainingMinutes("2026-10-01T18:05:30+09:00", now)).toBe("6분 남음");
  });

  it("floors at 0 for a null end time", () => {
    expect(formatRemainingMinutes(null, now)).toBe("0분 남음");
  });

  it("floors at 0 once the end time has passed", () => {
    expect(formatRemainingMinutes("2026-10-01T17:59:00+09:00", now)).toBe("0분 남음");
  });
});
