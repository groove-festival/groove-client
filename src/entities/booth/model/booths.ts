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
  // 아래 다섯은 날짜별로 자리를 나눠 쓰는 주막을 위한 값이다. 옛 서버 응답에는 없을
  // 수 있어 선택으로 두고, 비어 있으면 혼자 쓰는 자리로 본다 (get* 헬퍼 참고).
  // 자리 코드. 지도 도형이 이 값에 묶인다. 혼자 쓰는 자리는 boothCode 와 같다.
  spotCode?: string;
  operatingDay?: FestivalDay | null;
  // "2026-10-01" 처럼 KST 날짜. operatingDay 가 없으면 null.
  operatingDate?: string | null;
  // 오늘 여는지. 축제 날(새벽 5시 기준)에만 false 가 될 수 있다.
  operatingToday?: boolean;
  // 같은 자리 모든 학과를 운영일 순서로 이은 목록. 그중 departments 만 강조한다.
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
