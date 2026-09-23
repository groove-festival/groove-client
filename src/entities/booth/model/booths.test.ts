import { getBoothDisplayName, getBoothsByFilter, type Booth } from "./booths";

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
