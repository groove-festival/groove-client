import { expect, type Page, test } from "@playwright/test";

const zoneList = (page: Page) => page.getByRole("list", { name: "체험존 목록" });
const boothPin = (page: Page) => page.getByTestId("booth-pin");

const scrollState = (page: Page) =>
  zoneList(page).evaluate((list) => ({
    scrollLeft: Math.round(list.scrollLeft),
    maxScrollLeft: Math.round(list.scrollWidth - list.clientWidth),
  }));

test.beforeEach(async ({ page }) => {
  await page.goto("./event");
  await expect(page.getByRole("heading", { name: "GRO-OVE ZONE" })).toBeVisible();
});

test("starts with no selected zone", async ({ page }) => {
  await expect(boothPin(page)).toHaveCount(0);
  await expect(page.getByRole("button", { pressed: true })).toHaveCount(0);
  expect(await scrollState(page)).toMatchObject({ scrollLeft: 0 });
});

test("pins the tapped booth and slides its card into view", async ({ page }) => {
  await page.getByRole("button", { name: "GROOVE ZONE 위치 선택" }).tap();

  await expect(boothPin(page)).toHaveAttribute("data-zone", "GROOVE");
  await expect(
    zoneList(page).getByRole("button", { name: /GROOVE ZONE/ }),
  ).toHaveAttribute("aria-pressed", "true");

  // 마지막 카드라 스크롤 끝에서 멈춘다. 이동이 끝날 때까지 기다린다.
  await expect
    .poll(async () => {
      const { scrollLeft, maxScrollLeft } = await scrollState(page);
      return scrollLeft === maxScrollLeft;
    })
    .toBe(true);
});

test("keeps a single selection when another booth is tapped", async ({ page }) => {
  await page.getByRole("button", { name: "LOVE ZONE 위치 선택" }).tap();
  await expect(boothPin(page)).toHaveAttribute("data-zone", "LOVE");

  await page.getByRole("button", { name: "PROVE ZONE 위치 선택" }).tap();

  await expect(boothPin(page)).toHaveCount(1);
  await expect(boothPin(page)).toHaveAttribute("data-zone", "PROVE");
  await expect(page.getByRole("button", { pressed: true })).toHaveCount(2);
});

test("does not select a zone by scrolling the cards", async ({ page }) => {
  const list = zoneList(page);
  const box = await list.boundingBox();
  if (!box) throw new Error("체험존 목록의 위치를 읽지 못했다");

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(300, 0);

  await expect
    .poll(async () => (await scrollState(page)).scrollLeft)
    .toBeGreaterThan(0);
  await page.waitForTimeout(500);

  await expect(boothPin(page)).toHaveCount(0);
  await expect(page.getByRole("button", { pressed: true })).toHaveCount(0);
});
