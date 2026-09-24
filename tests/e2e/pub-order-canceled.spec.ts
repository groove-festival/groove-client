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

// 관리자가 취소한 주문은 서버 시드 없이는 재현할 수 없어 PUB-3·PUB-5 응답을
// 고정한다. 취소 안내는 PUB-5가 CANCELED를 줄 때만 뜬다.
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

test("shows the cancel notice and drops the order token when it is closed", async ({
  page,
}, testInfo) => {
  await mockCanceledOrder(page);
  await page.goto(ORDER_PATH);

  const dialog = page.getByRole("dialog", { name: "주문 취소 안내" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("내 주문이 취소되었어요.")).toBeVisible();
  await expect(dialog.getByText("자세한 사항은 직원에게 문의해 주세요.")).toBeVisible();

  await waitForStableVisuals(page);

  // Figma 49:6617 기준 치수. 카드 320x273, 닫기 16, 경고 아이콘 80.
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).toMatchObject({ width: 320, height: 273 });

  // 요소 스크린샷은 높이를 올림해 274가 되므로 정확한 박스로 잘라낸다.
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
    await page.getByRole("button", { name: "주문 취소 안내 닫기" }).boundingBox(),
  ).toMatchObject({ width: 16, height: 16 });
  expect(
    await dialog.getByRole("heading", { name: "주문 취소 안내" }).boundingBox(),
  ).toMatchObject({ width: 213 });
  // 장식 아이콘 두 개는 모두 alt 가 비어 있다. 닫기 다음이 경고 아이콘이다.
  expect(await dialog.locator("img").nth(1).boundingBox()).toMatchObject({
    width: 80,
    height: 80,
  });

  // 카드가 반투명이라 단독 프레임 export 와는 픽셀이 맞지 않는다. 대신 Figma
  // 가 준 값(White 500 = #FCFCFC 50%, radius 36, 24/16px 문구)을 직접 잰다.
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

  const notice = dialog.getByText("내 주문이 취소되었어요.");
  expect(await styleOf(notice, "font-size")).toBe("16px");
  expect(await styleOf(notice, "line-height")).toBe("24px");
  expect(await styleOf(notice, "font-weight")).toBe("700");

  await page.getByRole("button", { name: "주문 취소 안내 닫기" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "일렉트로닉 나이트" })).toBeVisible();
  // 토큰을 남기면 재진입할 때마다 같은 안내가 다시 뜬다.
  expect(
    await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
});
