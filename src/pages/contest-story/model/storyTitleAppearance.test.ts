import { createStoryTitleAppearances } from "./storyTitleAppearance";

const stories = [
  { storyId: 1, title: "첫 번째 사연" },
  { storyId: 2, title: "두 번째 사연" },
  { storyId: 3, title: "세 번째 사연" },
  { storyId: 4, title: "네 번째 사연" },
  { storyId: 5, title: "다섯 번째 사연" },
  { storyId: 6, title: "여섯 번째 사연" },
];

describe("createStoryTitleAppearances", () => {
  it("keeps one page visit stable and changes the arrangement for another seed", () => {
    const firstVisit = createStoryTitleAppearances(stories, 1234);

    expect(createStoryTitleAppearances(stories, 1234)).toEqual(firstVisit);
    expect(createStoryTitleAppearances(stories, 9876)).not.toEqual(firstVisit);
  });

  it("always includes the smallest and largest title sizes when several stories exist", () => {
    const appearances = createStoryTitleAppearances(stories, 1234).map(
      ({ appearance }) => appearance,
    );

    expect(appearances.map(({ fontSize }) => fontSize)).toContain("0.75rem");
    expect(appearances.map(({ fontSize }) => fontSize)).toContain("2.5rem");
    for (const appearance of appearances) {
      expect(appearance.fromRotate).toBeGreaterThanOrEqual(-4);
      expect(appearance.fromRotate).toBeLessThanOrEqual(4);
      expect(appearance.toRotate).toBeGreaterThanOrEqual(-7);
      expect(appearance.toRotate).toBeLessThanOrEqual(7);
    }
  });
});
