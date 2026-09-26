import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { httpClient } from "@/shared/api";

import HomePage from "./HomePage";
import { ShortcutSection } from "./ShortcutSection";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

// PUB-1 · PLAN-1 응답 일부. 지도에 올리는 데 쓰는 필드만 채운다.
const booths = [
  {
    area: "PARKING",
    boothCode: "nursing",
    colleges: ["NURSING"],
    departments: ["간호학과"],
    description: null,
    name: "간호학과 주막",
    status: "OPEN",
    xRatio: 0.7221,
    yRatio: 0.6786,
  },
  {
    area: "PARKING",
    // 디자인 도형이 없는 코드는 지도에 올리지 않는다.
    boothCode: "unknown-booth",
    colleges: ["IT"],
    departments: ["컴퓨터학부"],
    description: null,
    name: "도형 없는 주막",
    status: "OPEN",
    xRatio: null,
    yRatio: null,
  },
];

const zones = [
  {
    type: "RECOVER",
    name: "RECOVER ZONE",
    description: "실팔찌를 만드는 프로그램",
    xRatio: 0.6074,
    yRatio: 0.5923,
  },
];

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const renderPage = (initialEntry = "/") =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[initialEntry]}>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  httpGet.mockImplementation((url: string) =>
    Promise.resolve(
      url === "/zones"
        ? envelope({ totalCount: zones.length, zones })
        : envelope(booths),
    ),
  );
});

const mapFilters = () => within(screen.getByRole("group", { name: "지도 필터" }));
const placeButton = (name: string) =>
  screen.findByRole("button", { name: `${name} 위치 보기` });

const timetableRegion = () => screen.getByRole("region", { name: "타임테이블" });

const setKstNow = (dateTime: string) => {
  vi.setSystemTime(new Date(`${dateTime}+09:00`));
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    setKstNow("2026-10-01T12:00:00");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the hero and the three main sections in order", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "GROOVE FESTIVAL" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(["축제 전체 지도", "바로가기", "타임테이블"]);
  });

  it("lights the booth groups that belong to the selected filter", async () => {
    renderPage();

    // 켜진 도형은 회색 덮개를 걷어 색 레이어가 보인다.
    const isLit = (id: string) =>
      screen.getByTestId(`campus-map-cover-${id}`).style.opacity === "0";
    const stageOpacity = () =>
      screen.getByTestId("campus-map-color-stage").style.opacity;

    await placeButton("간호학과 주막");
    expect(mapFilters().getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(isLit("pub:nursing")).toBe(true);
    expect(isLit("zone:RECOVER")).toBe(true);
    expect(stageOpacity()).toBe("1");
    // 목록에 없는 주막은 디자인에 그려져 있어도 꺼 둔다.
    expect(isLit("pub:cse")).toBe(false);

    fireEvent.click(mapFilters().getByRole("button", { name: "주막" }));
    expect(mapFilters().getByRole("button", { name: "주막" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(mapFilters().getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(isLit("pub:nursing")).toBe(true);
    expect(isLit("zone:RECOVER")).toBe(false);
    // 가요제 무대는 필터와 상관없이 늘 켜져 있다.
    expect(stageOpacity()).toBe("1");

    fireEvent.click(mapFilters().getByRole("button", { name: "이벤트 부스" }));
    expect(isLit("pub:nursing")).toBe(false);
    expect(isLit("zone:RECOVER")).toBe(true);
    expect(stageOpacity()).toBe("1");
    // 랜드마크는 필터와 상관없이 늘 켜져 있고, 누르지 않아도 이름표가 떠 있다.
    expect(screen.getByTestId("campus-map-color-it1").style.opacity).toBe("1");
    expect(screen.getByText("IT1호관")).toBeInTheDocument();
  });

  it("pins the tapped place with its API name and closes it on an empty tap", async () => {
    renderPage();

    const nursing = await placeButton("간호학과 주막");
    fireEvent.click(nursing);
    expect(nursing).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("간호학과 주막")).toBeInTheDocument();

    fireEvent.click(await placeButton("RECOVER ZONE"));
    expect(screen.queryByText("간호학과 주막")).not.toBeInTheDocument();
    expect(screen.getByText("RECOVER ZONE")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("campus-map-background"));
    expect(screen.queryByText("RECOVER ZONE")).not.toBeInTheDocument();
    // 디자인 도형이 없는 주막은 지도에서 누를 수 없다.
    expect(
      screen.queryByRole("button", { name: "도형 없는 주막 위치 보기" }),
    ).not.toBeInTheDocument();
  });

  it("lets only the lit places be tapped and closes the pin on a filter change", async () => {
    renderPage();

    fireEvent.click(await placeButton("가요제 무대"));
    expect(screen.getByText("가요제 무대")).toBeInTheDocument();

    fireEvent.click(mapFilters().getByRole("button", { name: "이벤트 부스" }));
    expect(screen.queryByText("가요제 무대")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "간호학과 주막 위치 보기" }),
    ).not.toBeInTheDocument();
    expect(await placeButton("가요제 무대")).toBeInTheDocument();
    expect(await placeButton("RECOVER ZONE")).toBeInTheDocument();
    // 청록 부스는 필터와 상관없이 늘 켜져 있어 누를 수 있다.
    expect(await placeButton("GROOVE RIVALS")).toBeInTheDocument();
    expect(await placeButton("일청담 본부")).toBeInTheDocument();
    expect(await placeButton("IT5호관(융복합관)")).toBeInTheDocument();

    fireEvent.click(mapFilters().getByRole("button", { name: "주막" }));
    expect(await placeButton("간호학과 주막")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "RECOVER ZONE 위치 보기" }),
    ).not.toBeInTheDocument();
    expect(await placeButton("GROOVE TICKET")).toBeInTheDocument();
  });

  it("renders the zoom controls", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "지도 확대" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지도 축소" })).toBeInTheDocument();
  });

  it("links each shortcut to its destination", () => {
    renderPage();

    const shortcuts = within(screen.getByRole("region", { name: "바로가기" }));
    expect(shortcuts.getByRole("link", { name: /주막 바로가기/ })).toHaveAttribute(
      "href",
      "/pub",
    );
    expect(shortcuts.getByRole("link", { name: /가요제 바로가기/ })).toHaveAttribute(
      "href",
      "/coming-soon",
    );
    expect(shortcuts.getByRole("link", { name: /이벤트 바로가기/ })).toHaveAttribute(
      "href",
      "/event",
    );
    expect(shortcuts.getByRole("link", { name: /GROOVE PLAYLIST/ })).toHaveAttribute(
      "href",
      "/playlist",
    );
  });

  it("shows only today's timetable and highlights the current item", () => {
    renderPage();

    const items = within(
      screen.getByRole("list", { name: "2026-10-01 일정" }),
    ).getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveAttribute("aria-current", "time");
    expect(within(items[0]).getByText("LOVE ZONE 오픈")).toBeInTheDocument();
    expect(within(items[0]).getByText("11:00 - 14:00")).toBeInTheDocument();
    expect(within(timetableRegion()).queryByText("프로그램")).not.toBeInTheDocument();
    expect(within(timetableRegion()).queryByText("운영")).not.toBeInTheDocument();
    expect(items.slice(1).some((item) => item.hasAttribute("aria-current"))).toBe(
      false,
    );
  });

  it("keeps the first day's list until 01:00 and then switches to day two", () => {
    setKstNow("2026-10-02T00:30:00");
    const { unmount } = renderPage();
    expect(screen.getByRole("list", { name: "2026-10-01 일정" })).toBeInTheDocument();
    unmount();

    setKstNow("2026-10-02T18:30:00");
    renderPage();
    const items = within(
      screen.getByRole("list", { name: "2026-10-02 일정" }),
    ).getAllByRole("listitem");
    expect(items).toHaveLength(14);
    expect(
      items
        .filter((item) => item.getAttribute("aria-current") === "time")
        .map((item) => item.querySelector("div > span")?.textContent),
    ).toEqual(["LOVE ZONE 재오픈", "주막 오픈", "오프닝 & 밴드동아리 축하 공연"]);
  });
});

describe("HomePage timetable by clock", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lights only the item whose time range contains now", () => {
    setKstNow("2026-10-01T12:00:00");
    renderPage();

    const items = within(
      screen.getByRole("list", { name: "2026-10-01 일정" }),
    ).getAllByRole("listitem");

    expect(
      items.filter((item) => item.getAttribute("aria-current") === "time"),
    ).toHaveLength(1);
    expect(items[0]).toHaveAttribute("aria-current", "time");
  });

  it("moves the lit item as the clock enters the next range", () => {
    setKstNow("2026-10-01T15:00:00");
    renderPage();

    const items = within(
      screen.getByRole("list", { name: "2026-10-01 일정" }),
    ).getAllByRole("listitem");

    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[1]).toHaveAttribute("aria-current", "time");
  });

  it("shows the second day schedule once the clock passes it", () => {
    setKstNow("2026-10-02T20:50:00");
    renderPage();

    expect(screen.getByRole("list", { name: "2026-10-02 일정" })).toBeInTheDocument();
  });
});

describe("ShortcutSection contest badge", () => {
  it.each([
    ["story", "사연 모집중"],
    ["vote", "투표 진행중"],
  ] as const)("shows the %s badge on the contest card", (status, label) => {
    render(
      <MemoryRouter>
        <ShortcutSection contestBadgeStatus={status} />
      </MemoryRouter>,
    );

    const contestCard = screen.getByRole("link", { name: /가요제 바로가기/ });
    expect(within(contestCard).getByText(label)).toBeInTheDocument();
    expect(screen.getAllByText(label)).toHaveLength(1);
  });
});
