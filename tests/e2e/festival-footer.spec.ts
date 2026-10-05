import { expect, test } from "@playwright/test";

import { mockSubmissionFestivalStatus } from "./mockFestivalStatus";

test("keeps the policy footer below a failed story submission", async ({ page }) => {
  await mockSubmissionFestivalStatus(page);
  await page.route("**/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          account: {
            loggedIn: true,
            role: "USER",
            displayName: "테스트",
            pubId: null,
          },
        },
        error: null,
      }),
    }),
  );
  await page.route("**/contest/stories", (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        data: null,
        error: { code: "SING003", message: "closed" },
      }),
    }),
  );

  await page.goto("./story?phase=open");
  await page.getByRole("button", { name: "GROOVE 사연 신청하기", exact: true }).click();
  await page.getByRole("button", { name: "사연 작성하기" }).click();
  await page.getByRole("button", { name: "IT" }).click();
  await page.getByRole("textbox", { name: "학과 *" }).fill("컴퓨터학부");
  await page.getByRole("textbox", { name: "학번 *" }).fill("20241234");
  await page.getByRole("textbox", { name: "이름 *" }).fill("테스트");
  await page.getByRole("textbox", { name: "사연 제목 *" }).fill("테스트");
  await page.getByRole("textbox", { name: "사연 내용 *" }).fill("테스트");
  await page
    .getByRole("textbox", { name: "관련 노래: 가수 - 노래 제목 (예: 오반 - flower) *" })
    .fill("오반 - flower");
  await page.getByRole("checkbox", { name: /GROOVE 웹서비스 이용약관/ }).check();
  await page.getByRole("checkbox", { name: /개인정보 수집 및 이용/ }).check();
  const rejection = page.waitForResponse(
    (response) =>
      response.url().endsWith("/contest/stories") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "사연 접수하기" }).click();
  expect((await rejection).status()).toBe(403);
  await expect(page.getByText("지금은 사연 모집 기간이 아니에요.")).toBeVisible();

  const submitButton = page.getByRole("button", { name: "사연 접수하기" });
  const footer = page.getByRole("contentinfo");
  const footerCopy = page.getByText(
    "자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.",
  );
  const policyLinks = page.getByRole("navigation", { name: "정책 링크" });
  await expect(footer).toHaveCount(1);
  await expect(footerCopy).toHaveCount(1);

  for (const width of [320, 390, 600, 900]) {
    await page.setViewportSize({ width, height: 844 });
    const buttonBounds = await submitButton.boundingBox();
    const footerBounds = await footer.boundingBox();
    const footerCopyBounds = await footerCopy.boundingBox();
    const policyLinksBounds = await policyLinks.boundingBox();
    const expectedFrameWidth = Math.min(width, 600);
    const expectedContentWidth = expectedFrameWidth - 32;

    expect(buttonBounds).not.toBeNull();
    expect(footerBounds).not.toBeNull();
    expect(footerBounds?.width).toBeCloseTo(expectedFrameWidth, 0);
    expect(footerCopyBounds?.width).toBeCloseTo(expectedContentWidth, 0);
    expect(policyLinksBounds?.width).toBeCloseTo(expectedContentWidth, 0);
    expect(footerBounds!.y).toBeGreaterThanOrEqual(
      buttonBounds!.y + buttonBounds!.height,
    );
    await expect(footerCopy).toHaveCSS("font-size", width >= 480 ? "12px" : "10px");
    await expect(policyLinks).toHaveCSS("font-size", width >= 480 ? "14px" : "11px");
  }
});
