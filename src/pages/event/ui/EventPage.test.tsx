import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { RIVAL_SCORES_POLL_INTERVAL_MS } from "../api/getRivalScores";
import { CAROUSEL_SLIDE_DURATION_MS } from "../model/useZoneCarousel";
import EventPage from "./EventPage";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

// jsdom은 레이아웃을 계산하지 않아 Figma(34:3578) 카드 배치를 직접 넣는다.
const CARD_WIDTH = 204;
const CARD_STEP = 216;
const VIEWPORT_WIDTH = 361;

const CENTERED_LEFT = (index: number) =>
  index * CARD_STEP - (VIEWPORT_WIDTH - CARD_WIDTH) / 2;

// PLAN-1 응답 모양. 좌표는 디자인 원본에서 계산한 값이고, 아직 넣지 않았으면 null이다.
interface ZoneResponse {
  type: string;
  name: string;
  description: string;
  xRatio: number | null;
  yRatio: number | null;
}

const zones: ZoneResponse[] = [
  {
    type: "MOVE",
    name: "MOVE ZONE",
    description: "다양한 미니게임을 제한 시간 내에 수행하는 액티비티 프로그램",
    xRatio: 0.6258,
    yRatio: 0.5852,
  },
  {
    type: "LOVE",
    name: "LOVE ZONE",
    description: "소중한 사람에게 마음을 전하는 편지 프로그램",
    xRatio: 0.6166,
    yRatio: 0.5888,
  },
  {
    type: "PROVE",
    name: "PROVE ZONE",
    description: "하나의 GROOVE 아트월을 완성하는 프로그램",
    xRatio: 0.5808,
    yRatio: 0.5857,
  },
  {
    type: "RECOVER",
    name: "RECOVER ZONE",
    description: "나에게 필요한 의미를 담은 색을 골라 실팔찌를 만드는 프로그램",
    xRatio: 0.6074,
    yRatio: 0.5923,
  },
  {
    type: "GROOVE",
    name: "GROOVE ZONE",
    description: "문구를 뽑으며 GRO-OVE를 마무리하는 프로그램",
    xRatio: 0.5855,
    yRatio: 0.5937,
  },
];

// PLAN-2 응답 모양. 점수 내림차순 6건 고정이다.
const rivalScores = [
  { college: "ART", collegeName: "예술대학", score: 505, rank: 1 },
  { college: "NURSING", collegeName: "간호대학", score: 410, rank: 2 },
  { college: "EDU", collegeName: "사범대학", score: 388, rank: 3 },
  { college: "IT", collegeName: "IT대학", score: 340, rank: 4 },
  { college: "SOCIAL", collegeName: "사회과학대학", score: 275, rank: 5 },
  { college: "NATURE", collegeName: "자연과학대학", score: 260, rank: 6 },
];

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

interface RespondOptions {
  zoneList?: ZoneResponse[];
  zonesFail?: boolean;
  rivalsFail?: boolean;
}

const respond = ({ zoneList = zones, zonesFail, rivalsFail }: RespondOptions = {}) => {
  httpGet.mockImplementation((url: string) => {
    if (url === "/zones") {
      return zonesFail
        ? Promise.reject(new Error("network"))
        : Promise.resolve(envelope({ totalCount: zoneList.length, zones: zoneList }));
    }
    return rivalsFail
      ? Promise.reject(new Error("network"))
      : Promise.resolve(envelope({ scores: rivalScores, updatedAt: null }));
  });
};

const zoneList = () => screen.getByRole("list", { name: "체험존 목록" });
const card = (name: string) =>
  within(zoneList()).getByRole("button", { name: new RegExp(name) });
const booth = (name: string) =>
  screen.getByRole("button", { name: `${name} 위치 선택` });
const boothShapes = () => screen.queryAllByTestId(/^zone-booth-[A-Z]+$/);
const boothColours = () => screen.queryAllByTestId(/^zone-booth-color-/);

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

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>
);

// 가짜 타이머를 쓰므로 쿼리가 풀리려면 타이머도 함께 흘려보내야 한다.
const settle = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
};

const renderPage = async () => {
  render(<EventPage />, { wrapper: Providers });
  await settle();
};

const renderLoadedPage = async () => {
  await renderPage();
  return mockCarouselLayout();
};

describe("EventPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    respond();
  });

  afterEach(() => {
    vi.useRealTimers();
    httpGet.mockReset();
  });

  it("shows each zone's name and description from the API", async () => {
    await renderLoadedPage();

    expect(within(zoneList()).getAllByRole("button")).toHaveLength(5);
    expect(card("MOVE ZONE")).toHaveTextContent(
      "다양한 미니게임을 제한 시간 내에 수행하는 액티비티 프로그램",
    );
    expect(card("RECOVER ZONE")).toHaveTextContent(
      "나에게 필요한 의미를 담은 색을 골라 실팔찌를 만드는 프로그램",
    );
  });

  it("starts with no selection and every booth in its own colour", async () => {
    await renderLoadedPage();

    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
    expect(boothShapes()).toHaveLength(5);
    boothColours().forEach((colour) => expect(colour).toHaveStyle("opacity: 1"));
  });

  it("keeps only the selected booth coloured and dims the rest to the map grey", async () => {
    await renderLoadedPage();

    fireEvent.click(booth("LOVE ZONE"));

    expect(screen.getByTestId("zone-booth-color-LOVE")).toHaveStyle("opacity: 1");
    ["MOVE", "PROVE", "RECOVER", "GROOVE"].forEach((type) =>
      expect(screen.getByTestId(`zone-booth-color-${type}`)).toHaveStyle("opacity: 0"),
    );
  });

  it("clears the selection when an empty part of the map is tapped", async () => {
    await renderLoadedPage();

    fireEvent.click(booth("LOVE ZONE"));
    expect(screen.getByTestId("zone-booth-color-MOVE")).toHaveStyle("opacity: 0");

    fireEvent.click(screen.getByTestId("zone-map-background"));

    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
    boothColours().forEach((colour) => expect(colour).toHaveStyle("opacity: 1"));
  });

  it("shares one selection between the map and the cards", async () => {
    await renderLoadedPage();

    fireEvent.click(booth("MOVE ZONE"));
    fireEvent.click(card("RECOVER ZONE"));

    expect(screen.getAllByRole("button", { pressed: true })).toEqual([
      card("RECOVER ZONE"),
      booth("RECOVER ZONE"),
    ]);
  });

  it("slides the selected card to the center with easing", async () => {
    const scroller = await renderLoadedPage();

    fireEvent.click(booth("LOVE ZONE"));

    act(() => void vi.advanceTimersByTime(CAROUSEL_SLIDE_DURATION_MS / 2));
    expect(scroller.scrollLeft).toBeGreaterThan(0);
    expect(scroller.scrollLeft).toBeLessThan(CENTERED_LEFT(1));

    act(() => void vi.advanceTimersByTime(CAROUSEL_SLIDE_DURATION_MS));
    expect(scroller.scrollLeft).toBe(CENTERED_LEFT(1));
  });

  it("does not change the selection by scrolling or swiping", async () => {
    const scroller = await renderLoadedPage();

    fireEvent.pointerDown(scroller);
    scroller.scrollLeft = CENTERED_LEFT(2);
    fireEvent.scroll(scroller);
    // 스냅을 걸지 않아 사용자가 넘긴 자리에 그대로 멈춘다.
    expect(scroller.className).not.toMatch(/snap-/);
    act(() => void vi.advanceTimersByTime(1000));

    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
  });

  it("draws no booth for a zone without coordinates", async () => {
    respond({
      zoneList: zones.map((zone) =>
        zone.type === "PROVE" ? { ...zone, xRatio: null, yRatio: null } : zone,
      ),
    });
    await renderLoadedPage();

    // 카드는 그대로 5장이고 지도에만 그리지 않는다.
    expect(within(zoneList()).getAllByRole("button")).toHaveLength(5);
    expect(boothShapes()).toHaveLength(4);
    expect(screen.queryByTestId("zone-booth-PROVE")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "PROVE ZONE 위치 선택" }),
    ).not.toBeInTheDocument();
  });

  it("renders the rivals top three on the podium and the rest as rows", async () => {
    await renderLoadedPage();

    const podium = within(screen.getByRole("list", { name: "라이벌스 1~3위" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(podium).toEqual(["1예술대학505점", "2간호대학410점", "3사범대학388점"]);

    const rows = within(screen.getByRole("list", { name: "라이벌스 4위 이하" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(rows).toEqual(["4IT대학340점", "5사회과학대학275점", "6자연과학대학260점"]);
  });

  it("keeps tied colleges at a shared rank in response order", async () => {
    httpGet.mockImplementation((url: string) => {
      if (url === "/zones") {
        return Promise.resolve(envelope({ totalCount: zones.length, zones }));
      }
      return Promise.resolve(
        envelope({
          scores: [
            { college: "ART", collegeName: "예술대학", score: 100, rank: 1 },
            { college: "NURSING", collegeName: "간호대학", score: 90, rank: 2 },
            { college: "EDU", collegeName: "사범대학", score: 90, rank: 2 },
            { college: "IT", collegeName: "IT대학", score: 80, rank: 4 },
            { college: "SOCIAL", collegeName: "사회과학대학", score: 0, rank: 5 },
            { college: "NATURE", collegeName: "자연과학대학", score: 0, rank: 5 },
          ],
          updatedAt: null,
        }),
      );
    });
    await renderLoadedPage();

    const podium = within(screen.getByRole("list", { name: "라이벌스 1~3위" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(podium).toEqual(["1예술대학100점", "2간호대학90점", "2사범대학90점"]);
  });

  it("polls the rivals scores every five seconds", async () => {
    await renderLoadedPage();

    const callsFor = (url: string) =>
      httpGet.mock.calls.filter(([called]) => called === url).length;

    expect(callsFor("/rivals/scores")).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(RIVAL_SCORES_POLL_INTERVAL_MS - 100);
    });
    expect(callsFor("/rivals/scores")).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(callsFor("/rivals/scores")).toBe(2);
    // 체험존은 폴링 대상이 아니다.
    expect(callsFor("/zones")).toBe(1);
  });

  it("offers a retry when the zones request fails", async () => {
    respond({ zonesFail: true });
    await renderPage();

    expect(screen.queryByRole("list", { name: "체험존 목록" })).not.toBeInTheDocument();

    respond();
    fireEvent.click(screen.getAllByRole("button", { name: "페이지 새로고침" })[0]);
    await settle();

    expect(within(zoneList()).getAllByRole("button")).toHaveLength(5);
  });

  it("keeps the map when only the rivals request fails", async () => {
    respond({ rivalsFail: true });
    await renderLoadedPage();

    // 지도와 카드는 그대로 두고 라이벌스 자리만 대체한다.
    expect(within(zoneList()).getAllByRole("button")).toHaveLength(5);
    expect(boothShapes()).toHaveLength(5);
    expect(
      screen.queryByRole("list", { name: "라이벌스 1~3위" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the zoom controls", async () => {
    await renderLoadedPage();

    expect(screen.getByRole("button", { name: "지도 확대" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지도 축소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지도 초기화" })).toBeInTheDocument();
  });
});
