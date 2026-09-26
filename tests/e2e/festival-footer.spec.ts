import { expect, test } from "@playwright/test";

import { mockSubmissionFestivalStatus } from "./mockFestivalStatus";

test("keeps the policy footer below a failed contest submission", async ({ page }) => {
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
      status: route.request().method() === "POST" ? 403 : 200,
      contentType: "application/json",
      body:
        route.request().method() === "POST"
          ? JSON.stringify({
              success: false,
              data: null,
              error: { code: "SING003", message: "closed" },
            })
          : JSON.stringify({ success: true, data: [], error: null }),
    }),
  );

  await page.goto("./contest?phase=open");
  await page.getByRole("button", { name: "신청하기" }).click();
  await page.getByRole("button", { name: "사연 작성하기" }).click();
  await page.getByRole("button", { name: "IT" }).click();
  await page.getByRole("textbox", { name: "학과 *" }).fill("컴퓨터학부");
  await page.getByRole("textbox", { name: "학번 *" }).fill("20241234");
  await page.getByRole("textbox", { name: "이름 *" }).fill("테스트");
  await page.getByRole("textbox", { name: "사연 제목 *" }).fill("테스트");
  await page.getByRole("textbox", { name: "사연 내용 *" }).fill("테스트");
  await page.getByRole("checkbox", { name: /GROOVE 웹서비스 이용약관/ }).check();
  await page.getByRole("checkbox", { name: /개인정보 수집 및 이용/ }).check();
  await page.getByRole("button", { name: "사연 접수하기" }).click();
  await expect(page.getByText("지금은 사연 모집 기간이 아니에요.")).toBeVisible();

  const submitButton = page.getByRole("button", { name: "사연 접수하기" });
  const footer = page.getByRole("contentinfo");
  await expect(footer).toHaveCount(1);
  await expect(
    page.getByText("자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요."),
  ).toHaveCount(1);

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const buttonBounds = await submitButton.boundingBox();
    const footerBounds = await footer.boundingBox();

    expect(buttonBounds).not.toBeNull();
    expect(footerBounds).not.toBeNull();
    expect(footerBounds!.y).toBeGreaterThanOrEqual(
      buttonBounds!.y + buttonBounds!.height,
    );
  }
});
