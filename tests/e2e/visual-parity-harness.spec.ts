import { expect, test, type Page } from "@playwright/test";

const screenshotOptions = {
  animations: "disabled",
  caret: "hide",
  fullPage: true,
  scale: "css",
} as const;

async function waitForStableVisuals(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;

    await Promise.all(
      Array.from(document.images, (image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }),
    );
  });
}

test("detects a controlled visual mismatch and returns to the same capture", async ({
  page,
}, testInfo) => {
  await page.goto("./");
  await waitForStableVisuals(page);

  const reference = await page.screenshot(screenshotOptions);
  const perturbation = await page.addStyleTag({
    content: "html { filter: invert(1) !important; }",
  });
  const mismatch = await page.screenshot(screenshotOptions);

  await perturbation.evaluate((element) => element.remove());
  const corrected = await page.screenshot(screenshotOptions);

  await testInfo.attach("reference", {
    body: reference,
    contentType: "image/png",
  });
  await testInfo.attach("controlled-mismatch", {
    body: mismatch,
    contentType: "image/png",
  });
  await testInfo.attach("corrected", {
    body: corrected,
    contentType: "image/png",
  });

  expect(mismatch.equals(reference)).toBe(false);
  expect(corrected.equals(reference)).toBe(true);
});
