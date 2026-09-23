import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import HomePage from "./HomePage";
import { ShortcutSection } from "./ShortcutSection";

const renderPage = (initialEntry = "/") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <HomePage />
    </MemoryRouter>,
  );

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

  it("switches the map image with the filter buttons", () => {
    renderPage();

    const filters = within(screen.getByRole("group", { name: "지도 필터" }));
    expect(filters.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("img", { name: "주막과 이벤트 부스가 모두 표시된 축제 지도" }),
    ).toBeInTheDocument();

    fireEvent.click(filters.getByRole("button", { name: "주막" }));
    expect(filters.getByRole("button", { name: "주막" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(filters.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("img", { name: "주막 위치가 표시된 축제 지도" }),
    ).toBeInTheDocument();

    fireEvent.click(filters.getByRole("button", { name: "이벤트 부스" }));
    expect(
      screen.getByRole("img", { name: "이벤트 부스 위치가 표시된 축제 지도" }),
    ).toBeInTheDocument();
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
        .map((item) => item.querySelector("button span")?.textContent),
    ).toEqual(["LOVE ZONE 재오픈", "오프닝 & 밴드동아리 축하 공연"]);
  });
});

describe("HomePage timetable tone toggle (design QA)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    setKstNow("2026-10-01T12:00:00");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("toggles a card's active tone on each click without changing the current time", () => {
    renderPage();

    const [current, next] = within(
      screen.getByRole("list", { name: "2026-10-01 일정" }),
    ).getAllByRole("listitem");
    const currentCard = within(current).getByRole("button");
    const nextCard = within(next).getByRole("button");

    expect(currentCard).toHaveAttribute("aria-pressed", "true");
    expect(nextCard).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(nextCard);
    expect(nextCard).toHaveAttribute("aria-pressed", "true");
    expect(next).not.toHaveAttribute("aria-current");

    fireEvent.click(currentCard);
    expect(currentCard).toHaveAttribute("aria-pressed", "false");
    expect(current).toHaveAttribute("aria-current", "time");

    fireEvent.click(nextCard);
    expect(nextCard).toHaveAttribute("aria-pressed", "false");
  });
});

describe("HomePage timetable preview time", () => {
  it("uses the ?now= KST time on the dev server", () => {
    renderPage("/?now=2026-10-02T20:50");

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
