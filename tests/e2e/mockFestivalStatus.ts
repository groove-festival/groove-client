import type { Page } from "@playwright/test";

const submissionStatus = {
  success: true,
  data: {
    phase: "BEFORE",
    festivalStartAt: "2099-02-01T00:00:00+09:00",
    festivalEndAt: "2099-02-03T00:00:00+09:00",
    stage: {
      storyPhase: "BEFORE",
      storyCollectionStartAt: null,
      storyCollectionEndAt: null,
      contestPhase: "BEFORE",
      contestStartAt: null,
      contestEndAt: null,
    },
    playlist: {
      phase: "SUBMISSION",
      submissionStartAt: "2026-09-12T00:00:00+09:00",
      submissionEndAt: "2099-01-01T00:00:00+09:00",
      publishAt: "2099-02-01T00:00:00+09:00",
    },
  },
  error: null,
};

// 홈 화면 검사는 외부 API 상태와 무관하게 같은 접수 화면을 대상으로 한다.
export async function mockSubmissionFestivalStatus(page: Page): Promise<void> {
  await page.route("**/festival/status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(submissionStatus),
    }),
  );
}
