import { expect, test } from "@playwright/test";

import { mockSubmissionFestivalStatus } from "./mockFestivalStatus";

test("serves the application from the /groove base path", async ({ page }) => {
  await mockSubmissionFestivalStatus(page);
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "GROOVE FESTIVAL" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "축제 전체 지도" })).toBeAttached();
  await expect(page).toHaveURL(/\/groove\/$/);
});
