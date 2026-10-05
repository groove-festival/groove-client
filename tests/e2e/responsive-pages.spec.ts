import { expect, test, type Locator, type Page } from "@playwright/test";

import { mockSubmissionFestivalStatus } from "./mockFestivalStatus";

const widths = [320, 393, 600, 900];

const booth = {
  area: "PARKING",
  boothCode: "electronics-eh",
  colleges: ["IT"],
  departments: ["전자공학부E", "전자공학부H"],
  description: null,
  name: "일렉트로닉 나이트",
  status: "OPEN",
  xRatio: 0.2,
  yRatio: 0.3,
};

async function mockParticipantSession(page: Page): Promise<void> {
  await page.route("**/auth/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          account: { loggedIn: true, role: "USER", displayName: "테스트", pubId: null },
        },
        error: null,
      }),
    }),
  );
}

async function mockBoothPages(page: Page): Promise<void> {
  await page.route("**/pubs", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [booth], error: null }),
    }),
  );
  await page.route("**/pubs/electronics-eh", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          pub: booth,
          menuBoardImageUrl:
            "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
          menus: [],
        },
        error: null,
      }),
    }),
  );
}

async function mockEventPage(page: Page): Promise<void> {
  const zones = [
    ["MOVE", "MOVE ZONE", "액티비티 프로그램", 0.6258, 0.5852],
    ["LOVE", "LOVE ZONE", "편지 프로그램", 0.6166, 0.5888],
    ["PROVE", "PROVE ZONE", "GROOVE 아트월", 0.5808, 0.5857],
    ["RECOVER", "RECOVER ZONE", "실팔찌", 0.6074, 0.5923],
    ["GROOVE", "GROOVE ZONE", "GRO-OVE를 마무리", 0.5855, 0.5937],
  ].map(([type, name, description, xRatio, yRatio]) => ({
    type,
    name,
    description,
    xRatio,
    yRatio,
  }));
  const scores = [
    ["ART", "예술대학", 505, 1],
    ["NURSING", "간호대학", 410, 2],
    ["EDU", "사범대학", 388, 3],
    ["IT", "IT대학", 340, 4],
    ["SOCIAL", "사회과학대학", 275, 5],
    ["NATURE", "자연과학대학", 260, 6],
  ].map(([college, collegeName, score, rank]) => ({
    college,
    collegeName,
    score,
    rank,
  }));

  await page.route("**/zones", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { totalCount: zones.length, zones },
        error: null,
      }),
    }),
  );
  await page.route("**/rivals/scores", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { scores, updatedAt: null },
        error: null,
      }),
    }),
  );
}

async function mockFinalPlaylist(page: Page): Promise<void> {
  await page.route("**/playlist/final-songs", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { totalCount: 0, songs: [] },
        error: null,
      }),
    }),
  );
}

async function mockBoothOrderPage(page: Page): Promise<void> {
  await page.route("**/pubs/electronics-eh/tables/table-a", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          orderable: true,
          pub: {
            pub: booth,
            menuBoardImageUrl: null,
            menus: [
              {
                category: "MAIN",
                description: "반응형 확인용 메뉴",
                imageUrl: null,
                menuId: 1,
                name: "대표 메뉴",
                price: 10_000,
                separateCharge: false,
                soldOut: false,
              },
            ],
          },
          tableCode: "table-a",
          tableNumber: 1,
        },
        error: null,
      }),
    }),
  );
}

type AdminRole = "PROMO_ADMIN" | "PUB_ADMIN" | "STAGE_ADMIN";

async function mockAuthenticatedAdminPages(
  page: Page,
): Promise<(role: AdminRole) => void> {
  let activeRole: AdminRole = "PROMO_ADMIN";

  await page.route("**/auth/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          account: {
            loggedIn: true,
            role: activeRole,
            displayName: "관리자",
            pubId: activeRole === "PUB_ADMIN" ? 1 : null,
          },
        },
        error: null,
      }),
    }),
  );
  await page.route("**/admin/promo/songs", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { totalCount: 0, selectedCount: 0, groups: [] },
        error: null,
      }),
    }),
  );
  await page.route("**/admin/stage/stories", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [], error: null }),
    }),
  );
  await page.route("**/contest/votes", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [], error: null }),
    }),
  );
  await page.route("**/admin/pub/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          account: null,
          menuBoardImageUrl: null,
          menus: [],
          pub: { ...booth, pubId: 1, name: "테스트 주막" },
        },
        error: null,
      }),
    }),
  );
  for (const endpoint of ["orders", "tables"]) {
    await page.route(`**/admin/pub/${endpoint}`, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [], error: null }),
      }),
    );
  }

  return (role) => {
    activeRole = role;
  };
}

async function expectWithinFrame(page: Page, locator: Locator): Promise<void> {
  const frame = await page.locator(".page-frame").boundingBox();
  const bounds = await locator.boundingBox();

  expect(frame).not.toBeNull();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(frame!.x - 1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);
}

test("home hero and shortcuts scale inside the shared mobile frame", async ({
  page,
}) => {
  await mockSubmissionFestivalStatus(page);
  await page.goto("./");

  const hero = page.getByRole("region", { name: "GROOVE 축제 소개" });
  const slogan = page.getByLabel("우리의 밤은 당신의 낮보다 아름답다");
  const shortcutLinks = page
    .getByRole("region", { name: "바로가기" })
    .getByRole("link");

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const expectedFrameWidth = Math.min(width, 600);
    const heroBounds = await hero.boundingBox();

    expect(heroBounds?.width).toBeCloseTo(expectedFrameWidth, 0);
    expect(heroBounds?.height).toBeCloseTo((expectedFrameWidth * 2224) / 393, 0);
    await expectWithinFrame(page, hero);
    await expectWithinFrame(page, slogan);
    expect(
      await slogan.evaluate(
        (element) => element.scrollWidth <= element.clientWidth + 1,
      ),
    ).toBe(true);

    for (const link of await shortcutLinks.all()) {
      await expectWithinFrame(page, link);
      expect(
        await link.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        ),
      ).toBe(true);
    }

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test("not-found page uses the shared mobile frame", async ({ page }) => {
  await page.goto("./missing-page");
  await expect(
    page.getByRole("heading", { name: "페이지를 찾을 수 없어요" }),
  ).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const expectedFrameWidth = Math.min(width, 600);
    const main = page.locator("main");

    expect((await main.boundingBox())?.width).toBeCloseTo(expectedFrameWidth, 0);
    await expectWithinFrame(page, main);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test("story and contest sections grow with the 600px app frame", async ({ page }) => {
  await mockSubmissionFestivalStatus(page);
  await mockParticipantSession(page);

  await page.goto("./story?phase=open");
  await expect(
    page.getByRole("heading", { name: "GROOVE 사연 모집 이벤트" }),
  ).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const expectedFrameWidth = Math.min(width, 600);
    const frame = page.locator(".page-frame");
    const intro = page
      .getByRole("heading", { name: "GROOVE 사연 모집 이벤트" })
      .locator("xpath=ancestor::section[1]");

    await expect(frame).toHaveJSProperty("clientWidth", expectedFrameWidth);
    expect((await intro.boundingBox())?.width).toBeCloseTo(expectedFrameWidth - 32, 0);
    await expectWithinFrame(page, intro);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }

  await page.getByRole("button", { name: "GROOVE 사연 신청하기" }).click();
  await page.getByRole("button", { name: "사연 작성하기" }).click();
  const formSection = page.getByRole("region", { name: "사연 신청하기" });
  await expect(formSection).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    expect((await formSection.boundingBox())?.width).toBeCloseTo(
      Math.min(width, 600) - 32,
      0,
    );
    await expectWithinFrame(page, formSection);
  }

  await page.goto("./contest");
  const overview = page.getByRole("region", { name: "가요제 일정과 경연" });
  await expect(overview).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    expect((await overview.boundingBox())?.width).toBeCloseTo(
      Math.min(width, 600) - 32,
      0,
    );
    await expectWithinFrame(page, overview);
  }
});

test("story and contest phase notices grow with the 600px app frame", async ({
  page,
}) => {
  await mockSubmissionFestivalStatus(page);
  await mockParticipantSession(page);
  await page.goto("./story");

  const storyNotice = page
    .getByRole("heading", { name: "사연 모집을 준비하고 있어요" })
    .locator("xpath=ancestor::section[1]");
  await expect(storyNotice).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const expectedContentWidth = Math.min(width, 600) - 32;
    const header = page.locator("header");
    const headerBox = await header.boundingBox();
    const storyHeadingBox = await page
      .getByRole("heading", { name: "사연 모집을 준비하고 있어요" })
      .boundingBox();

    expect((await storyNotice.boundingBox())?.width).toBeCloseTo(
      expectedContentWidth,
      0,
    );
    const storyHeaderGap =
      (storyHeadingBox?.y ?? 0) - ((headerBox?.y ?? 0) + (headerBox?.height ?? 0));
    expect(storyHeaderGap).toBeGreaterThanOrEqual(152);
    expect(storyHeaderGap).toBeLessThanOrEqual(184);
    const storyIllustration = storyNotice.locator("img");
    expect((await storyIllustration.boundingBox())?.width).toBeCloseTo(
      Math.min(expectedContentWidth * 0.73, 360),
      0,
    );
    expect((await storyNotice.locator("p").boundingBox())?.width).toBeCloseTo(
      expectedContentWidth,
      0,
    );
    await expectWithinFrame(page, storyNotice);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }

  await page.goto("./story?phase=open");
  const storyIntroHeadingBox = await page
    .getByRole("heading", { name: "GROOVE 사연 모집 이벤트" })
    .boundingBox();
  const storyHeaderBox = await page.locator("header").boundingBox();
  const storyIntroHeaderGap =
    (storyIntroHeadingBox?.y ?? 0) -
    ((storyHeaderBox?.y ?? 0) + (storyHeaderBox?.height ?? 0));
  expect(storyIntroHeaderGap).toBeGreaterThanOrEqual(112);
  expect(storyIntroHeaderGap).toBeLessThanOrEqual(144);

  await page.goto("./contest");
  const voteNotice = page
    .getByRole("heading", { name: "가요제 투표는 경연 당일에 열려요" })
    .locator("xpath=ancestor::section[1]");
  await expect(voteNotice).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const expectedContentWidth = Math.min(width, 600) - 32;
    expect((await voteNotice.boundingBox())?.width).toBeCloseTo(
      expectedContentWidth,
      0,
    );
    expect((await voteNotice.locator("img").boundingBox())?.width).toBeCloseTo(200, 0);
    expect((await voteNotice.locator("p").boundingBox())?.width).toBeCloseTo(
      expectedContentWidth,
      0,
    );
    await expectWithinFrame(page, voteNotice);
  }
});

test("routed pages use the shared mobile frame without horizontal clipping", async ({
  page,
}) => {
  await mockSubmissionFestivalStatus(page);
  await mockEventPage(page);
  await mockFinalPlaylist(page);
  await page.route("**/auth/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          account: {
            loggedIn: false,
            role: null,
            displayName: null,
            pubId: null,
          },
        },
        error: null,
      }),
    }),
  );

  const routes = [
    ["./event", "GRO-OVE ZONE"],
    ["./playlist", "GROOVE PLAYLIST"],
    ["./credits", "CREDITS"],
    ["./coming-soon", "페이지 준비중입니다"],
    ["./admin", "GROOVE 관리자"],
  ] as const;

  for (const [route, visibleText] of routes) {
    await page.goto(route);
    await expect(page.getByText(visibleText, { exact: true }).first()).toBeVisible();

    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      const expectedFrameWidth = Math.min(width, 600);
      const frame = page.locator(".page-frame");
      const main = page.locator("main").first();

      await expect(frame).toHaveJSProperty("clientWidth", expectedFrameWidth);
      expect((await main.boundingBox())?.width).toBeCloseTo(expectedFrameWidth, 0);
      await expectWithinFrame(page, main);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);

      if (route === "./event") {
        await expectWithinFrame(
          page,
          page.getByRole("list", { name: "라이벌스 1~3위" }),
        );
      }
    }
  }
});

test("authenticated admin dashboards stay inside the shared mobile frame", async ({
  page,
}) => {
  await mockSubmissionFestivalStatus(page);
  const setAdminRole = await mockAuthenticatedAdminPages(page);
  const dashboards = [
    ["PROMO_ADMIN", "GROOVE PLAYLIST 관리자"],
    ["STAGE_ADMIN", "가요제 관리자"],
    ["PUB_ADMIN", "테스트 주막"],
  ] as const;

  for (const [role, title] of dashboards) {
    setAdminRole(role);
    await page.goto("./admin");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      const expectedFrameWidth = Math.min(width, 600);
      const main = page.locator("main");
      const header = page.locator("header").first();

      expect((await main.boundingBox())?.width).toBeCloseTo(expectedFrameWidth, 0);
      await expectWithinFrame(page, main);
      await expectWithinFrame(page, header);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
  }
});

test("booth pages keep controls and notices inside the app frame", async ({ page }) => {
  await mockBoothPages(page);
  await mockBoothOrderPage(page);
  await page.goto("./pub");
  await expect(page.getByRole("dialog", { name: "주막 이용 안내 사항" })).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const frame = page.locator(".page-frame");
    await expect(frame).toHaveJSProperty("clientWidth", Math.min(width, 600));
    await expectWithinFrame(
      page,
      page.getByRole("dialog", { name: "주막 이용 안내 사항" }),
    );
    await expectWithinFrame(page, page.getByLabel("주막 지도"));
    expect(
      await page
        .getByText("학생주차장")
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }

  await page.goto("./pub/electronics-eh");
  await expect(page.getByRole("dialog", { name: "QR 셀프 주문 안내" })).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await expectWithinFrame(
      page,
      page.getByRole("dialog", { name: "QR 셀프 주문 안내" }),
    );
    await expectWithinFrame(page, page.getByAltText("일렉트로닉 나이트 메뉴판"));
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }

  await page.goto("./pub/electronics-eh/table-a");
  await expect(page.getByText("대표 메뉴", { exact: true })).toBeVisible();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const expectedFrameWidth = Math.min(width, 600);
    const orderMain = page.locator("main");

    expect((await orderMain.boundingBox())?.width).toBeCloseTo(expectedFrameWidth, 0);
    await expectWithinFrame(page, orderMain);
    await expectWithinFrame(page, page.locator("header").first());
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test("story titles remain hidden without public GET requests", async ({ page }) => {
  await mockSubmissionFestivalStatus(page);
  await mockParticipantSession(page);
  const listReads: string[] = [];
  await page.route("**/contest/stories", (route) => {
    if (route.request().method() === "GET") listReads.push(route.request().url());
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [], error: null }),
    });
  });
  for (const phase of ["before", "open", "closed", "open&preview=stories"]) {
    await page.goto("./story?phase=" + phase);
    await expect(
      page.getByRole("heading", {
        name: phase.startsWith("open")
          ? "GROOVE 사연 모집 이벤트"
          : phase === "closed"
            ? "사연 모집이 끝났어요"
            : "사연 모집을 준비하고 있어요",
      }),
    ).toBeVisible();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      await expect(page.getByRole("list", { name: "접수된 사연 제목" })).toHaveCount(0);
      await expect(page.getByTestId("contest-story-title")).toHaveCount(0);
      await expect(page.getByText("예시 미리보기")).toHaveCount(0);
    }
  }
  expect(listReads).toEqual([]);
});

test("story and booth notices stay centered and scroll on short screens", async ({
  page,
}) => {
  await mockSubmissionFestivalStatus(page);
  await mockBoothPages(page);
  await mockParticipantSession(page);
  await page.goto("./story?phase=open");
  await page.getByRole("button", { name: "GROOVE 사연 신청하기" }).click();

  for (const route of ["story", "booth", "qr"] as const) {
    if (route === "booth") await page.goto("./pub");
    if (route === "qr") await page.goto("./pub/electronics-eh");
    const name =
      route === "story"
        ? "사연 신청 안내 사항"
        : route === "booth"
          ? "주막 이용 안내 사항"
          : "QR 셀프 주문 안내";
    const dialog = page.getByRole("dialog", { name });
    await expect(dialog).toBeVisible();

    for (const height of [844, 500, 360]) {
      await page.setViewportSize({ width: 320, height });
      const bounds = await dialog.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.y + bounds!.height / 2).toBeCloseTo(height / 2, 0);
      expect(bounds!.x).toBeGreaterThanOrEqual(15);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(305);
    }

    expect(
      await dialog.evaluate((element) => element.scrollHeight > element.clientHeight),
    ).toBe(true);
    await dialog
      .getByRole("button", {
        name: route === "story" ? "사연 작성하기" : "확인했습니다",
      })
      .click();
    await expect(dialog).not.toBeVisible();
  }
});

test("story guide keeps keyboard focus inside and restores its trigger", async ({
  page,
}) => {
  await mockSubmissionFestivalStatus(page);
  await mockParticipantSession(page);
  await page.goto("./story?phase=open");
  const trigger = page.getByRole("button", { name: "GROOVE 사연 신청하기" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "사연 신청 안내 사항" });
  await expect(dialog).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "안내 닫기" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "사연 작성하기" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "안내 닫기" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("full-screen menu keeps focus inside and restores it on Escape", async ({
  page,
}) => {
  await mockSubmissionFestivalStatus(page);
  await mockParticipantSession(page);
  await page.goto("./story?phase=open");
  const trigger = page.getByRole("button", { name: "메뉴 열기" });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "전체 메뉴" });
  await expect(menu).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(menu.getByRole("link", { name: "CREDITS" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menu.getByRole("button", { name: "메뉴 닫기" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});
