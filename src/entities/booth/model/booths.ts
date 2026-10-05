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

export const isDayShiftBooth = (booth: Pick<Booth, "operatingDay">) =>
  Boolean(booth.operatingDay);

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

export const compareByOperatingDay = (
  a: Pick<Booth, "operatingDay">,
  b: Pick<Booth, "operatingDay">,
) => (a.operatingDay ?? "").localeCompare(b.operatingDay ?? "");

export const getBoothsByFilter = (booths: Booth[], filter: BoothFilter) => {
  if (filter === "all") {
    return booths;
  }

  if (filter === "union") {
    return booths.filter(
      (booth) => booth.colleges.length > 1 || isDayShiftBooth(booth),
    );
  }

  return booths.filter((booth) => booth.colleges.includes(filter));
};
