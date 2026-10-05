import { getTeamPhoto } from "./teamPhotos";

const bracketTeams = [
  "오채원샷",
  "어리고싶다",
  "지문",
  "이쌩훈",
  "치이카와",
  "테리",
  "권용수",
  "꼴등보컬",
  "탐앤탐스",
  "마진보이",
  "알록달록",
  "양념감자",
];

describe("getTeamPhoto", () => {
  it("has a distinct photo for every bracket team", () => {
    const photos = bracketTeams.map(getTeamPhoto);

    expect(photos.every(Boolean)).toBe(true);
    expect(new Set(photos.map((photo) => photo?.src)).size).toBe(12);
    expect(getTeamPhoto("오채원샷")?.srcSet).toMatch(/1x, .+ 2x, .+ 3x$/);
  });

  it("ignores surrounding spaces and returns nothing for unknown names", () => {
    expect(getTeamPhoto(" 지문 ")).toEqual(getTeamPhoto("지문"));
    expect(getTeamPhoto("없는 팀")).toBeUndefined();
  });
});
