import {
  festivalTimetable,
  formatTimetableTime,
  getTimetableDateKey,
  isTimetableItemActive,
  parseTimetableNowOverride,
} from "./timetable";

const kst = (dateTime: string) => new Date(`${dateTime}+09:00`);

const activeTitles = (dateTime: string) => {
  const now = kst(dateTime);
  const dateKey = getTimetableDateKey(now);

  return festivalTimetable[dateKey]
    .filter((item) => isTimetableItemActive(item, dateKey, now))
    .map(({ title }) => title);
};

describe("festival timetable", () => {
  it.each([
    ["2026-09-22T12:00:00", "2026-10-01"],
    ["2026-10-01T11:00:00", "2026-10-01"],
    ["2026-10-02T00:30:00", "2026-10-01"],
    ["2026-10-02T01:00:00", "2026-10-01"],
    ["2026-10-02T01:01:00", "2026-10-02"],
    ["2026-10-02T20:00:00", "2026-10-02"],
    ["2026-10-05T12:00:00", "2026-10-02"],
  ])("shows the %s schedule as %s", (dateTime, expected) => {
    expect(getTimetableDateKey(kst(dateTime))).toBe(expected);
  });

  it("keeps the source order and item counts for each day", () => {
    expect(festivalTimetable["2026-10-01"]).toHaveLength(6);
    expect(festivalTimetable["2026-10-02"]).toHaveLength(14);
    expect(festivalTimetable["2026-10-01"].map(({ startTime }) => startTime)).toEqual([
      "11:00",
      "14:00",
      "16:00",
      "18:00",
      "19:00",
      "01:00",
    ]);
    expect(festivalTimetable["2026-10-02"].at(-1)?.title).toBe("주막 마감");
  });

  it("uses the corrected LOVE ZONE title", () => {
    const titles = Object.values(festivalTimetable)
      .flat()
      .map(({ title }) => title);

    expect(titles.filter((title) => title.startsWith("LOVE ZONE"))).toHaveLength(6);
    expect(titles.some((title) => title.startsWith("OVE ZONE"))).toBe(false);
  });

  it("highlights only items whose time range includes now", () => {
    expect(activeTitles("2026-10-01T12:00:00")).toEqual(["LOVE ZONE 오픈"]);
    expect(activeTitles("2026-10-01T14:00:00")).toEqual(["LOVE ZONE 브레이크 타임"]);
    expect(activeTitles("2026-10-02T18:30:00")).toEqual([
      "LOVE ZONE 재오픈",
      "오프닝 & 밴드동아리 축하 공연",
    ]);
    expect(activeTitles("2026-10-02T22:45:00")).toEqual([
      "그루브 라이벌스 + GROOVE TICKET (인스타팅)",
    ]);
  });

  it("does not highlight point-in-time items or times outside the festival", () => {
    expect(activeTitles("2026-10-02T00:30:00")).toEqual([]);
    expect(activeTitles("2026-09-30T12:00:00")).toEqual([]);
  });

  it("parses a KST preview time and ignores malformed values", () => {
    expect(parseTimetableNowOverride("2026-10-02T20:50")?.toISOString()).toBe(
      "2026-10-02T11:50:00.000Z",
    );
    expect(parseTimetableNowOverride("2026-10-02")).toBeNull();
    expect(parseTimetableNowOverride("tomorrow")).toBeNull();
    expect(parseTimetableNowOverride(null)).toBeNull();
  });

  it("formats ranges and single times", () => {
    const [loveZone, , , pubOpen] = festivalTimetable["2026-10-01"];

    expect(formatTimetableTime(loveZone)).toBe("11:00 - 14:00");
    expect(formatTimetableTime(pubOpen)).toBe("18:00");
  });
});
