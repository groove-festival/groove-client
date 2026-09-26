export type TimetableCategory = "program" | "contest" | "operation";

export type TimetableDateKey = "2026-10-01" | "2026-10-02";

export interface TimetableItem {
  id: string;
  // "HH:mm" (KST). 06시 이전 시각은 다음 날 새벽으로 본다.
  startTime: string;
  endTime?: string;
  // 표시 문구에는 쓰지 않고 강조만 이 시각까지 유지한다.
  // 주막 오픈처럼 시작 시각만 보여 주지만 문 닫을 때까지 켜두는 항목에 쓴다.
  activeUntil?: string;
  category: TimetableCategory;
  title: string;
}

// 표시 순서는 이 배열 순서를 그대로 따른다. 시간 문자열로 정렬하지 않는다.
export const festivalTimetable: Record<TimetableDateKey, TimetableItem[]> = {
  "2026-10-01": [
    {
      id: "d1-love-zone-open",
      startTime: "11:00",
      endTime: "14:00",
      category: "program",
      title: "LOVE ZONE 오픈",
    },
    {
      id: "d1-love-zone-break",
      startTime: "14:00",
      endTime: "16:00",
      category: "program",
      title: "LOVE ZONE 브레이크 타임",
    },
    {
      id: "d1-love-zone-reopen",
      startTime: "16:00",
      endTime: "19:00",
      category: "program",
      title: "LOVE ZONE 재오픈",
    },
    {
      id: "d1-pub-open",
      startTime: "18:00",
      activeUntil: "01:00",
      category: "operation",
      title: "주막 오픈",
    },
    {
      id: "d1-rivals",
      startTime: "19:00",
      endTime: "23:00",
      category: "program",
      title: "그루브 라이벌스 + GROOVE TICKET (인스타팅)",
    },
    {
      id: "d1-pub-close",
      startTime: "01:00",
      category: "operation",
      title: "주막 마감",
    },
  ],
  "2026-10-02": [
    {
      id: "d2-love-zone-open",
      startTime: "11:00",
      endTime: "14:00",
      category: "program",
      title: "LOVE ZONE 오픈",
    },
    {
      id: "d2-love-zone-break",
      startTime: "14:00",
      endTime: "16:00",
      category: "program",
      title: "LOVE ZONE 브레이크 타임",
    },
    {
      id: "d2-love-zone-reopen",
      startTime: "16:00",
      endTime: "19:00",
      category: "program",
      title: "LOVE ZONE 재오픈",
    },
    {
      id: "d2-pub-open",
      startTime: "18:00",
      activeUntil: "01:00",
      category: "operation",
      title: "주막 오픈",
    },
    {
      id: "d2-contest-opening",
      startTime: "18:00",
      endTime: "19:00",
      category: "contest",
      title: "오프닝 & 밴드동아리 축하 공연",
    },
    {
      id: "d2-contest-round-1",
      startTime: "19:00",
      endTime: "20:00",
      category: "contest",
      title: "가요제 1라운드",
    },
    {
      id: "d2-rivals",
      startTime: "19:00",
      endTime: "23:00",
      category: "program",
      title: "그루브 라이벌스 + GROOVE TICKET (인스타팅)",
    },
    {
      id: "d2-contest-dance",
      startTime: "20:00",
      endTime: "20:45",
      category: "contest",
      title: "댄스동아리 축하공연",
    },
    {
      id: "d2-contest-round-2",
      startTime: "20:45",
      endTime: "21:20",
      category: "contest",
      title: "1라운드 결과 발표 & 가요제 2라운드",
    },
    {
      id: "d2-contest-pungmul",
      startTime: "21:20",
      endTime: "21:35",
      category: "contest",
      title: "풍물동아리 축하 공연",
    },
    {
      id: "d2-contest-minigame-1",
      startTime: "21:35",
      endTime: "22:05",
      category: "contest",
      title: "가요제 미니게임 (PICK개팅 & 가사재판소)",
    },
    {
      id: "d2-contest-round-3",
      startTime: "22:05",
      endTime: "22:20",
      category: "contest",
      title: "2라운드 결과 발표 & 가요제 3라운드",
    },
    {
      id: "d2-contest-final",
      startTime: "22:20",
      endTime: "22:45",
      category: "contest",
      title: "가요제 미니게임 (P.S.) & 최종 결과 발표",
    },
    {
      id: "d2-pub-close",
      startTime: "01:00",
      category: "operation",
      title: "주막 마감",
    },
  ],
};

const KST_OFFSET = "+09:00";
const NEXT_DAY_CUTOFF_HOUR = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

// 10/1 일정의 마지막 항목(01:00 주막 마감)까지는 10/1 목록을 유지한다.
const SECOND_DAY_STARTS_AFTER = Date.parse(`2026-10-02T01:00:00${KST_OFFSET}`);

export function getTimetableDateKey(now: Date): TimetableDateKey {
  return now.getTime() > SECOND_DAY_STARTS_AFTER ? "2026-10-02" : "2026-10-01";
}

function toTimestamp(dateKey: TimetableDateKey, time: string): number {
  const base = Date.parse(`${dateKey}T${time}:00${KST_OFFSET}`);
  const hour = Number(time.slice(0, 2));
  return hour < NEXT_DAY_CUTOFF_HOUR ? base + DAY_MS : base;
}

// 시작~종료 구간 안에 있는 항목만 진행 중으로 본다. 종료 시각은 endTime을
// 먼저 보고, 시작 시각만 표시하는 항목은 activeUntil을 쓴다. 둘 다 없는
// 한 시점 항목(주막 마감)은 강조하지 않는다.
export function isTimetableItemActive(
  item: TimetableItem,
  dateKey: TimetableDateKey,
  now: Date,
): boolean {
  const until = item.endTime ?? item.activeUntil;
  if (!until) {
    return false;
  }

  const current = now.getTime();
  return (
    toTimestamp(dateKey, item.startTime) <= current &&
    current < toTimestamp(dateKey, until)
  );
}

export function formatTimetableTime({ startTime, endTime }: TimetableItem): string {
  return endTime ? `${startTime} - ${endTime}` : startTime;
}
