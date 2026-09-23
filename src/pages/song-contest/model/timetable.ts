// 2026/10/2 가요제 순서. 서버 타임테이블 연동 전 화면용 고정 콘텐츠다.
export const timetable = [
  { time: "18:00", title: "가요제 오프닝" },
  { time: "18:10", title: "밴드동아리 축하 공연" },
  { time: "19:00", title: "가요제 1라운드" },
  { time: "20:00", title: "댄스동아리 축하 공연" },
  { time: "20:45", title: "1라운드 결과 발표 & 2라운드" },
  { time: "21:20", title: "풍물동아리 축하 공연" },
  { time: "21:35", title: "가요제 미니게임" },
  { time: "22:05", title: "2라운드 결과 발표 & 3라운드" },
  { time: "22:20", title: "미니게임 & 최종 결과 발표" },
] as const;

const timetableStarts = timetable.map(({ time }) =>
  Date.parse(`2026-10-02T${time}:00+09:00`),
);
const timetableDayEnd = Date.parse("2026-10-03T00:00:00+09:00");

export function currentTimetableIndex(nowMs: number): number | null {
  if (nowMs >= timetableDayEnd) return null;

  for (let index = timetableStarts.length - 1; index >= 0; index -= 1) {
    if (nowMs >= timetableStarts[index]!) return index;
  }

  return 0;
}

export function nextTimetableBoundary(nowMs: number): number | undefined {
  return [...timetableStarts, timetableDayEnd].find((at) => at > nowMs);
}
