export const collegeCodes = [
  "IT",
  "NURSING",
  "ART",
  "SOCIAL",
  "EDU",
  "NATURE",
] as const;

export type College = (typeof collegeCodes)[number];
export type BoothArea = "PARKING" | "WELFARE_CENTER";
export type BoothStatus = "OPEN" | "PREPARING";
// 사범대 학과들은 한 자리(천막)를 날짜별로 나눠 쓴다. null 이면 이틀 다 연다.
export type FestivalDay = "DAY1" | "DAY2";

export const boothFilterOptions = [
  { id: "all", label: "전체" },
  { id: "union", label: "연합" },
  { id: "IT", label: "IT대학" },
  { id: "NURSING", label: "간호대학" },
  { id: "ART", label: "예술대학" },
  { id: "SOCIAL", label: "사회과학대학" },
  { id: "EDU", label: "사범대학" },
  { id: "NATURE", label: "자연과학대학" },
] as const;

export type BoothFilter = (typeof boothFilterOptions)[number]["id"];

export interface Booth {
  area: BoothArea | null;
  boothCode: string;
  colleges: College[];
  departments: string[];
  description: string | null;
  name: string;
  status: BoothStatus;
  xRatio: number | null;
  yRatio: number | null;
  // API v0.9 이전 응답과 테스트 fixture도 안전하게 읽도록 선택 필드로 두고,
  // 비어 있으면 기존 boothCode/일반 주막 동작으로 되돌린다.
  spotCode?: string;
  operatingDay?: FestivalDay | null;
  operatingDate?: string | null;
  operatingToday?: boolean;
  spotDepartments?: string[];
}

export const formatBoothDepartments = (departments: string[]) =>
  departments.join(" • ");

export const getBoothDisplayName = (booth: Pick<Booth, "departments" | "name">) =>
  booth.name.trim() || formatBoothDepartments(booth.departments);

export const getBoothSpotCode = (booth: Pick<Booth, "boothCode" | "spotCode">) =>
  booth.spotCode || booth.boothCode;

// 연합주막 표기에 쓸 학과들. 날짜별로 나눠 쓰는 자리는 쉬는 날 학과까지 모두 싣고,
// 이 주막(오늘 여는 학과)만 isOwn 으로 표시해 강조한다.
export const getBoothDepartmentParts = (
  booth: Pick<Booth, "departments" | "spotDepartments">,
): { department: string; isOwn: boolean }[] => {
  const spotDepartments = booth.spotDepartments?.length
    ? booth.spotDepartments
    : booth.departments;
  const isShared = spotDepartments.length > booth.departments.length;

  return spotDepartments.map((department) => ({
    department,
    isOwn: isShared && booth.departments.includes(department),
  }));
};

// 한 자리를 날짜별로 나눠 쓰는 주막인지.
export const isDayShiftBooth = (booth: Pick<Booth, "operatingDay">) =>
  Boolean(booth.operatingDay);

// "2026-10-01" → "10월 1일 (목)" · 짧게는 "10/1 목". 날짜 문자열을 그대로 쪼개 읽어
// 기기 시간대에 흔들리지 않는다.
export const formatOperatingDate = (
  date: string,
  length: "long" | "short" = "long",
) => {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  ];
  return length === "short"
    ? `${month}/${day} ${weekday}`
    : `${month}월 ${day}일 (${weekday})`;
};

// 같은 자리 주막 중 먼저 여는 쪽이 앞. 운영일이 없는(이틀 다 여는) 주막이 가장 앞이다.
export const compareByOperatingDay = (
  a: Pick<Booth, "operatingDay">,
  b: Pick<Booth, "operatingDay">,
) => (a.operatingDay ?? "").localeCompare(b.operatingDay ?? "");

export const getBoothsByFilter = (booths: Booth[], filter: BoothFilter) => {
  if (filter === "all") {
    return booths;
  }

  if (filter === "union") {
    // 날짜별로 나눠 쓰는 사범대 자리도 연합주막이다 (같은 단대끼리라 colleges 는 하나).
    return booths.filter(
      (booth) => booth.colleges.length > 1 || isDayShiftBooth(booth),
    );
  }

  return booths.filter((booth) => booth.colleges.includes(filter));
};
