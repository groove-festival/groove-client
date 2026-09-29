import {
  formatOperatingDate,
  getBoothDepartmentParts,
  getBoothDisplayName,
  getBoothsByFilter,
  type Booth,
} from "./booths";

const booths: Booth[] = [
  {
    area: "PARKING",
    boothCode: "it-art",
    colleges: ["IT", "ART"],
    departments: ["전자공학부B", "디자인학과"],
    description: null,
    name: "",
    status: "OPEN",
    xRatio: 0.2,
    yRatio: 0.4,
  },
  {
    area: "WELFARE_CENTER",
    boothCode: "nursing",
    colleges: ["NURSING"],
    departments: ["간호학과"],
    description: "간호대학 주막",
    name: "나이팅게일",
    status: "PREPARING",
    xRatio: null,
    yRatio: null,
  },
];

describe("booth list model", () => {
  it("uses the department combination when a booth name is blank", () => {
    expect(getBoothDisplayName(booths[0])).toBe("전자공학부B • 디자인학과");
    expect(getBoothDisplayName(booths[1])).toBe("나이팅게일");
  });

  it("filters union and college booths from the fetched list", () => {
    expect(getBoothsByFilter(booths, "union")).toEqual([booths[0]]);
    expect(getBoothsByFilter(booths, "ART")).toEqual([booths[0]]);
    expect(getBoothsByFilter(booths, "NURSING")).toEqual([booths[1]]);
  });
});

describe("day-shift booths", () => {
  const korean: Booth = {
    area: "PARKING",
    boothCode: "edu-kor",
    colleges: ["EDU"],
    departments: ["국어교육과"],
    description: null,
    name: "취향",
    operatingDate: "2026-10-01",
    operatingDay: "DAY1",
    operatingToday: true,
    spotCode: "edu-kor-home",
    spotDepartments: ["국어교육과", "가정교육과"],
    status: "OPEN",
    xRatio: null,
    yRatio: null,
  };

  it("marks the department operating the shared spot", () => {
    expect(getBoothDepartmentParts(korean)).toEqual([
      { department: "국어교육과", isOwn: true },
      { department: "가정교육과", isOwn: false },
    ]);
    expect(getBoothDepartmentParts(booths[0]).some(({ isOwn }) => isOwn)).toBe(false);
  });

  it("includes day-shift booths in the union filter", () => {
    expect(getBoothsByFilter([korean, booths[1]], "union")).toEqual([korean]);
  });

  it("formats operating dates independently of the device time zone", () => {
    expect(formatOperatingDate("2026-10-01")).toBe("10월 1일 (목)");
    expect(formatOperatingDate("2026-10-02", "short")).toBe("10/2 금");
  });
});
