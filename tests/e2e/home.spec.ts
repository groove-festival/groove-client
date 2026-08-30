import { expect, test } from "@playwright/test";

test("serves the application from the /groove base path", async ({ page }) => {
  await page.goto("./");

  await expect(
    page.getByRole("heading", { name: /축제의 흐름을 한 화면에 담습니다/ }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/groove\/$/);
});
