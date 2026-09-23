import { currentTimetableIndex, nextTimetableBoundary } from "./timetable";

const at = (time: string) => Date.parse(`2026-10-02T${time}:00+09:00`);

describe("contest timetable time", () => {
  it("keeps the initial highlight before the first event", () => {
    expect(currentTimetableIndex(at("17:59"))).toBe(0);
    expect(nextTimetableBoundary(at("17:59"))).toBe(at("18:00"));
  });

  it("advances the active event at each Korean-time start boundary", () => {
    expect(currentTimetableIndex(at("18:00"))).toBe(0);
    expect(currentTimetableIndex(at("19:59"))).toBe(2);
    expect(nextTimetableBoundary(at("19:59"))).toBe(at("20:00"));
    expect(currentTimetableIndex(at("20:00"))).toBe(3);
    expect(currentTimetableIndex(at("22:20"))).toBe(8);
  });

  it("stops scheduling updates after the event day", () => {
    const dayEnd = Date.parse("2026-10-03T00:00:00+09:00");

    expect(currentTimetableIndex(dayEnd - 1)).toBe(8);
    expect(nextTimetableBoundary(dayEnd - 1)).toBe(dayEnd);
    expect(currentTimetableIndex(dayEnd)).toBeNull();
    expect(nextTimetableBoundary(dayEnd)).toBeUndefined();
  });
});
