import { act, fireEvent, render, screen, within } from "@testing-library/react";

import { CAROUSEL_SLIDE_DURATION_MS } from "../model/useZoneCarousel";
import EventPage from "./EventPage";

// jsdom은 레이아웃을 계산하지 않아 Figma(34:3578) 카드 배치를 직접 넣는다.
const CARD_WIDTH = 204;
const CARD_STEP = 216;
const VIEWPORT_WIDTH = 361;

const CENTERED_LEFT = (index: number) =>
  index * CARD_STEP - (VIEWPORT_WIDTH - CARD_WIDTH) / 2;

const zoneList = () => screen.getByRole("list", { name: "체험존 목록" });
const card = (name: string) =>
  within(zoneList()).getByRole("button", { name: new RegExp(name) });
const booth = (name: string) =>
  screen.getByRole("button", { name: `${name} 위치 선택` });
const pin = () => screen.queryByTestId("booth-pin");

const mockCarouselLayout = () => {
  const scroller = zoneList();
  let scrollLeft = 0;
  Object.defineProperties(scroller, {
    clientWidth: { configurable: true, value: VIEWPORT_WIDTH },
    scrollWidth: { configurable: true, value: CARD_STEP * 4 + CARD_WIDTH },
    scrollLeft: {
      configurable: true,
      get: () => scrollLeft,
      set: (value: number) => {
        scrollLeft = value;
      },
    },
  });
  Array.from(scroller.children).forEach((item, index) => {
    Object.defineProperties(item, {
      offsetLeft: { configurable: true, value: index * CARD_STEP },
      offsetWidth: { configurable: true, value: CARD_WIDTH },
    });
  });
  return scroller;
};

const renderPage = () => {
  render(<EventPage />);
  return mockCarouselLayout();
};

describe("EventPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts without a selected zone", () => {
    renderPage();

    expect(within(zoneList()).getAllByRole("button")).toHaveLength(5);
    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
    expect(pin()).not.toBeInTheDocument();
  });

  it("shows each zone's name and one-line description on its card", () => {
    renderPage();

    expect(card("MOVE ZONE")).toHaveTextContent(
      "다양한 미니게임을 제한 시간 내에 수행하는 액티비티 프로그램",
    );
    expect(card("RECOVER ZONE")).toHaveTextContent(
      "나에게 필요한 의미를 담은 색을 골라 실팔찌를 만드는 프로그램",
    );
  });

  it("pins the tapped booth and centers its card", () => {
    renderPage();

    fireEvent.click(booth("LOVE ZONE"));

    expect(pin()).toHaveAttribute("data-zone", "LOVE");
    expect(booth("LOVE ZONE")).toHaveAttribute("aria-pressed", "true");
    expect(card("LOVE ZONE")).toHaveAttribute("aria-pressed", "true");
  });

  it("slides the selected card to the center with easing", () => {
    const scroller = renderPage();

    fireEvent.click(booth("LOVE ZONE"));

    act(() => vi.advanceTimersByTime(CAROUSEL_SLIDE_DURATION_MS / 2));
    expect(scroller.scrollLeft).toBeGreaterThan(0);
    expect(scroller.scrollLeft).toBeLessThan(CENTERED_LEFT(1));
    // 이동 중에는 스냅을 꺼서 카드 사이에서 끊기지 않게 한다.
    expect(scroller.style.scrollSnapType).toBe("none");

    act(() => vi.advanceTimersByTime(CAROUSEL_SLIDE_DURATION_MS));
    expect(scroller.scrollLeft).toBe(CENTERED_LEFT(1));
    expect(scroller.style.scrollSnapType).toBe("");
  });

  it("moves the pin to the booth of a tapped card", () => {
    renderPage();

    fireEvent.click(card("RECOVER ZONE"));

    expect(pin()).toHaveAttribute("data-zone", "RECOVER");
    expect(booth("RECOVER ZONE")).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps a single selection across the map and the cards", () => {
    renderPage();

    fireEvent.click(booth("MOVE ZONE"));
    fireEvent.click(card("RECOVER ZONE"));

    expect(screen.getAllByTestId("booth-pin")).toHaveLength(1);
    expect(pin()).toHaveAttribute("data-zone", "RECOVER");
    expect(screen.getAllByRole("button", { pressed: true })).toEqual([
      card("RECOVER ZONE"),
      booth("RECOVER ZONE"),
    ]);
  });

  it("does not change the selection by scrolling or swiping", () => {
    const scroller = renderPage();

    fireEvent.pointerDown(scroller);
    scroller.scrollLeft = CENTERED_LEFT(2);
    fireEvent.scroll(scroller);
    act(() => vi.advanceTimersByTime(1000));

    expect(pin()).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
  });

  it("renders the rivals top three on the podium and the rest as rows", () => {
    renderPage();

    const podium = within(screen.getByRole("list", { name: "라이벌스 1~3위" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(podium).toEqual(["1예술대학505점", "2간호대학410점", "3사범대학388점"]);

    const rows = within(screen.getByRole("list", { name: "라이벌스 4위 이하" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(rows).toEqual(["4IT대학340점", "5사회과학대학275점", "6자연과학대학260점"]);
  });

  it("keeps the zoom controls and the SNS notice", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "지도 확대" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지도 축소" })).toBeInTheDocument();
    expect(
      screen.getByText("자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요."),
    ).toBeInTheDocument();
  });
});
