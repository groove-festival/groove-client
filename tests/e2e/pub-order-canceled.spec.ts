import { expect, test, type Page } from "@playwright/test";

const BOOTH_CODE = "elec-eh";
const TABLE_CODE = "table-a";
const ORDER_ID = 1;
const ORDER_TOKEN = "order-token-1";
const ORDER_PATH = `./pub/${BOOTH_CODE}/${TABLE_CODE}`;
const STORAGE_KEY = `groove:pub-order:${BOOTH_CODE}:${TABLE_CODE}`;

const envelope = (data: unknown) => ({ success: true, data, error: null });

const tableBody = {
  orderable: true,
  pub: {
    menuBoardImageUrl: null,
    menus: [
      {
        category: "SIDE",
        description: null,
        imageUrl: null,
        menuId: 14,
        name: "상차림비",
        price: 2_000,
        separateCharge: true,
        soldOut: false,
      },
      {
        category: "MAIN",
        description: "바삭한 김치전",
        imageUrl: null,
        menuId: 4,
        name: "김치전",
        price: 15_000,
        separateCharge: false,
        soldOut: false,
      },
    ],
    pub: {
      area: "PARKING",
      boothCode: BOOTH_CODE,
      colleges: ["IT"],
      departments: ["전자공학부E"],
      description: "전자공학부 주막",
      name: "일렉트로닉 나이트",
      status: "OPEN",
      xRatio: 0.2,
      yRatio: 0.3,
    },
  },
  tableCode: TABLE_CODE,
  tableNumber: 3,
};

const canceledOrder = {
  account: {
    accountHolder: "홍길동",
    accountNumber: "000000-00-000000",
    bankName: "국민",
  },
  depositorName: "김입금",
  items: [
    {
      lineAmount: 15_000,
      menuId: 4,
      menuName: "김치전",
      quantity: 1,
      unitPrice: 15_000,
    },
  ],
  orderId: ORDER_ID,
  paymentMethod: "TRANSFER",
  pubName: "일렉트로닉 나이트",
  status: "CANCELED",
  totalAmount: 15_000,
};

async function mockCanceledOrder(page: Page) {
  await page.route("**/api/pubs/**", (route) => {
    const url = route.request().url();
    const body = url.includes("/orders/") ? canceledOrder : tableBody;

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(envelope(body)),
    });
  });

  await page.addInitScript(
    ([storageKey, orderRef]) => window.localStorage.setItem(storageKey, orderRef),
    [STORAGE_KEY, JSON.stringify({ orderId: ORDER_ID, orderToken: ORDER_TOKEN })],
  );
}

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

test("blocks a new order until a saved order is restored", async ({ page }) => {
  await mockCanceledOrder(page);
  let releaseOrder!: () => void;
  const pendingOrder = new Promise<void>((resolve) => {
    releaseOrder = resolve;
  });
  await page.route("**/api/pubs/**/orders/**", async (route) => {
    await pendingOrder;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(envelope(canceledOrder)),
    });
  });
  const orderRequest = page.waitForRequest("**/api/pubs/**/orders/**");
  await page.goto(ORDER_PATH);
  await orderRequest;

  await expect(page.getByRole("button", { name: "김치전 수량 늘리기" })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "주문 취소 안내" })).toHaveCount(0);
  releaseOrder();

  const dialog = page.getByRole("dialog", { name: "주문 취소 안내" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "확인했습니다" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "김치전 수량 늘리기" })).toBeVisible();
  expect(
    await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
});

test("retains a saved token on restore failure and retries successfully", async ({
  page,
}) => {
  await mockCanceledOrder(page);
  let orderReads = 0;
  await page.route("**/api/pubs/**/orders/**", (route) => {
    orderReads += 1;
    return route.fulfill({
      status: orderReads === 1 ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        orderReads === 1
          ? {
              success: false,
              data: null,
              error: { code: "NETWORK", message: "offline" },
            }
          : envelope(canceledOrder),
      ),
    });
  });
  await page.goto(ORDER_PATH);
  const retry = page.getByRole("button", { name: "페이지 새로고침" });
  await expect(retry).toBeVisible();
  await expect(page.getByRole("button", { name: "김치전 수량 늘리기" })).toHaveCount(0);
  expect(
    JSON.parse(
      (await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY))!,
    ),
  ).toEqual({ orderId: ORDER_ID, orderToken: ORDER_TOKEN });

  await retry.click();
  await expect(page.getByRole("dialog", { name: "주문 취소 안내" })).toBeVisible();
  expect(orderReads).toBe(2);
});

test("shows the cancel notice and drops the order token when it is closed", async ({
  page,
}, testInfo) => {
  await mockCanceledOrder(page);
  await page.goto(ORDER_PATH);

  const dialog = page.getByRole("dialog", { name: "주문 취소 안내" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("품절 등의 이유로 주문이 취소되었어요.")).toBeVisible();
  await expect(dialog.getByText("자세한 사항은 직원에게 문의해 주세요.")).toBeVisible();

  await waitForStableVisuals(page);

  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).toMatchObject({ width: 320, height: 333 });

  await testInfo.attach("order-canceled-dialog", {
    body: await page.screenshot({
      animations: "disabled",
      caret: "hide",
      clip: dialogBox ?? undefined,
      scale: "css",
    }),
    contentType: "image/png",
  });

  expect(
    await dialog.getByRole("button", { name: "확인했습니다" }).boundingBox(),
  ).toMatchObject({ width: 272, height: 56 });
  expect(
    await dialog.getByRole("heading", { name: "주문 취소 안내" }).boundingBox(),
  ).toMatchObject({ width: 213 });

  expect(await dialog.locator("img").boundingBox()).toMatchObject({
    width: 80,
    height: 80,
  });

  const styleOf = (locator: ReturnType<typeof page.locator>, property: string) =>
    locator.evaluate(
      (element, name) => window.getComputedStyle(element).getPropertyValue(name),
      property,
    );

  expect(await styleOf(dialog, "background-color")).toBe("rgba(252, 252, 252, 0.5)");
  expect(await styleOf(dialog, "border-radius")).toBe("36px");

  const title = dialog.getByRole("heading", { name: "주문 취소 안내" });
  expect(await styleOf(title, "font-size")).toBe("24px");
  expect(await styleOf(title, "font-weight")).toBe("600");
  expect(await styleOf(title, "color")).toBe("rgb(252, 252, 252)");

  const notice = dialog.getByText("품절 등의 이유로 주문이 취소되었어요.");
  expect(await styleOf(notice, "font-size")).toBe("16px");
  expect(await styleOf(notice, "line-height")).toBe("24px");
  expect(await styleOf(notice, "font-weight")).toBe("400");

  await dialog.getByRole("button", { name: "확인했습니다" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "일렉트로닉 나이트" })).toBeVisible();

  expect(
    await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
});
