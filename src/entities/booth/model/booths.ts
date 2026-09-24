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
}

export const formatBoothDepartments = (departments: string[]) =>
  departments.join(" • ");

export const getBoothDisplayName = (booth: Pick<Booth, "departments" | "name">) =>
  booth.name.trim() || formatBoothDepartments(booth.departments);

export const getBoothsByFilter = (booths: Booth[], filter: BoothFilter) => {
  if (filter === "all") {
    return booths;
  }

  if (filter === "union") {
    return booths.filter((booth) => booth.colleges.length > 1);
  }

  return booths.filter((booth) => booth.colleges.includes(filter));
};
