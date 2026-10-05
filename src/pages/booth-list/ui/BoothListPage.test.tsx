import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router";

import { httpClient } from "@/shared/api";

import BoothListPage from "./BoothListPage";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);
let scrollBy: ReturnType<typeof vi.fn>;
let scrollIntoView: ReturnType<typeof vi.fn>;

const booths = [
  {
    area: "PARKING",
    boothCode: "elec-eh",
    colleges: ["IT"],
    departments: ["전자공학부E", "전자공학부H"],
    description: null,
    name: "일렉트로닉 나이트",
    status: "OPEN",
    xRatio: 0.2,
    yRatio: 0.3,
  },
  {
    area: "PARKING",
    boothCode: "elec-b-design",
    colleges: ["IT", "ART"],
    departments: ["전자공학부B", "디자인학과"],
    description: null,
    name: "",
    status: "PREPARING",
    xRatio: 0.4,
    yRatio: 0.5,
  },
  {
    area: "WELFARE_CENTER",
    boothCode: "nursing",
    colleges: ["NURSING"],
    departments: ["간호학과"],
    description: null,
    name: "나이팅게일",
    status: "OPEN",
    xRatio: 0.6,
    yRatio: 0.7,
  },
];

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const zones = [
  {
    type: "RECOVER",
    name: "RECOVER ZONE",
    description: "실팔찌를 만드는 프로그램",
    xRatio: 0.6074,
    yRatio: 0.5923,
  },
];

const isBoothLit = (boothCode: string) =>
  screen.getByTestId(`campus-map-cover-pub:${boothCode}`).style.opacity === "0";
const boothButton = (boothCode: string) =>
  screen.queryByTestId(`campus-map-place-pub:${boothCode}`);

const boothCard = (name: string) =>
  within(screen.getByRole("list", { name: /주막 목록$/ }))
    .getByText(name)
    .closest("[data-testid='booth-card']");

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderPage = () => {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  return render(<BoothListPage />, { wrapper });
};

beforeEach(() => {
  vi.clearAllMocks();
  scrollBy = vi.fn();
  scrollIntoView = vi.fn();
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 720,
  });
  Object.defineProperty(window, "scrollBy", {
    configurable: true,
    value: scrollBy,
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  });
  window.localStorage.clear();
  window.sessionStorage.clear();
  httpGet.mockImplementation((url: string) =>
    Promise.resolve(
      url === "/zones"
        ? envelope({ totalCount: zones.length, zones })
        : envelope(booths),
    ),
  );
});

describe("BoothListPage", () => {
  it("renders PUB-1 booths and uses the API booth code in detail links", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));

    expect(await screen.findAllByTestId("booth-card")).toHaveLength(3);
    expect(screen.getByText("일렉트로닉 나이트")).toBeInTheDocument();
    expect(screen.getByText("전자공학부B • 디자인학과")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "일렉트로닉 나이트 메뉴 보기" }),
    ).toHaveAttribute("href", "/pub/elec-eh");
    expect(httpGet).toHaveBeenCalledWith("/pubs");
  });

  it("shows both day-specific pubs as regular cards when the API returns both", async () => {
    const sharedBooths = [
      {
        ...booths[0],
        boothCode: "edu-home",
        colleges: ["EDU"],
        departments: ["가정교육과"],
        name: "가리고",
        operatingDate: "2026-10-02",
        operatingDay: "DAY2",
        spotCode: "edu-kor-home",
        spotDepartments: ["국어교육과", "가정교육과"],
        xRatio: null,
        yRatio: null,
      },
      {
        ...booths[0],
        boothCode: "edu-kor",
        colleges: ["EDU"],
        departments: ["국어교육과"],
        name: "취향",
        operatingDate: "2026-10-01",
        operatingDay: "DAY1",
        spotCode: "edu-kor-home",
        spotDepartments: ["국어교육과", "가정교육과"],
        xRatio: null,
        yRatio: null,
      },
    ];
    httpGet.mockImplementation((url: string) =>
      Promise.resolve(
        url === "/zones"
          ? envelope({ totalCount: 0, zones: [] })
          : envelope(sharedBooths),
      ),
    );

    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "취향 · 가리고 주막만 보기" }));

    const cards = screen.getAllByTestId("booth-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("취향");
    expect(cards[0]).toHaveTextContent("국어교육과");
    expect(cards[0]).not.toHaveTextContent("가정교육과");
    expect(cards[1]).toHaveTextContent("가리고");
    expect(cards[1]).toHaveTextContent("가정교육과");
    expect(cards[1]).not.toHaveTextContent("국어교육과");
    expect(screen.queryByTestId("operating-date-badge")).not.toBeInTheDocument();
  });

  it("opens the selected booth detail route", async () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={["/pub"]}>
          <Routes>
            <Route path="/pub" element={<BoothListPage />} />
            <Route path="/pub/:boothId" element={<div>주막 상세</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(
      await screen.findByRole("link", { name: "일렉트로닉 나이트 메뉴 보기" }),
    );

    expect(screen.getByText("주막 상세")).toBeInTheDocument();
  });

  it("filters union and college booths from the fetched list", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "전체" }));
    fireEvent.click(screen.getByRole("option", { name: "연합" }));
    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    expect(screen.getByText("전자공학부B • 디자인학과")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "연합" }));
    fireEvent.click(screen.getByRole("option", { name: "간호대학" }));
    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    expect(screen.getByText("나이팅게일")).toBeInTheDocument();
  });

  it("colours every listed booth on the map until a college filter narrows it", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));

    expect(isBoothLit("elec-eh")).toBe(true);
    expect(isBoothLit("elec-b-design")).toBe(true);
    expect(isBoothLit("nursing")).toBe(true);

    expect(isBoothLit("cse")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "전체" }));
    fireEvent.click(screen.getByRole("option", { name: "간호대학" }));

    expect(isBoothLit("nursing")).toBe(true);
    expect(isBoothLit("elec-eh")).toBe(false);
    expect(isBoothLit("elec-b-design")).toBe(false);
  });

  it("narrows the map and the list to the picked area", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));

    const parkingButton = screen.getByRole("button", {
      name: "지도에서 학생주차장 보기",
    });
    fireEvent.click(parkingButton);

    expect(parkingButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "지도에서 전체 보기" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    expect(screen.getAllByTestId("booth-card")).toHaveLength(2);
    expect(screen.queryByText("나이팅게일")).not.toBeInTheDocument();
    expect(isBoothLit("elec-eh")).toBe(true);
    expect(isBoothLit("elec-b-design")).toBe(true);
    expect(isBoothLit("nursing")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "지도에서 전체 보기" }));

    expect(screen.getAllByTestId("booth-card")).toHaveLength(3);
    expect(isBoothLit("nursing")).toBe(true);
  });

  it("keeps both filters on when an area and a college are picked together", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 학생주차장 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "전체" }));
    fireEvent.click(screen.getByRole("option", { name: "간호대학" }));

    expect(screen.getByText("등록된 주막이 아직 없어요.")).toBeInTheDocument();
    expect(isBoothLit("nursing")).toBe(false);
  });

  it("filters the list to the picked booth and restores the base filters", async () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        bottom: window.innerHeight + 80,
        height: 160,
        left: 0,
        right: 0,
        top: window.innerHeight - 80,
        width: 0,
        x: 0,
        y: window.innerHeight - 80,
        toJSON: () => ({}),
      } as DOMRect);

    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 학생주차장 보기" }));
    expect(screen.getAllByTestId("booth-card")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: "일렉트로닉 나이트 주막만 보기" }),
    );

    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    expect(boothCard("일렉트로닉 나이트")).toHaveClass("border-[#fcfcfc]");
    expect(screen.getAllByText("일렉트로닉 나이트")).toHaveLength(3);
    await waitFor(() =>
      expect(scrollBy).toHaveBeenCalledWith({
        behavior: "smooth",
        top: 104,
      }),
    );
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).not.toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(isBoothLit("elec-eh")).toBe(true);
    expect(isBoothLit("elec-b-design")).toBe(false);
    expect(boothButton("elec-b-design")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "일렉트로닉 나이트 주막 위치 보기" }),
    );

    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      }),
    );
    expect(isBoothLit("elec-eh")).toBe(true);

    fireEvent.click(
      screen.getByRole("button", {
        name: "전자공학부B • 디자인학과 주막만 보기",
      }),
    );

    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    expect(boothCard("전자공학부B • 디자인학과")).toHaveClass("border-[#fcfcfc]");
    expect(screen.getAllByText("전자공학부B • 디자인학과")).toHaveLength(3);
    expect(
      screen.getByRole("button", {
        name: "전자공학부B • 디자인학과 주막 필터 해제",
      }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole("button", {
          name: "전자공학부B • 디자인학과 주막 필터 해제",
        })
        .closest("div"),
    ).toHaveClass("animate-booth-filter-chip-in");
    expect(
      screen
        .getByRole("button", { name: "전자공학부B • 디자인학과 주막 위치 보기" })
        .closest("li"),
    ).toHaveClass("animate-booth-filter-result-in");
    expect(isBoothLit("elec-eh")).toBe(false);
    expect(boothButton("elec-eh")).toBeInTheDocument();
    expect(isBoothLit("elec-b-design")).toBe(true);

    fireEvent.click(
      screen.getByRole("button", {
        name: "전자공학부B • 디자인학과 주막 필터 해제",
      }),
    );

    expect(screen.getAllByTestId("booth-card")).toHaveLength(2);
    expect(boothCard("일렉트로닉 나이트")).toHaveClass("border-[#fcfcfc]");
    expect(isBoothLit("elec-b-design")).toBe(true);
    expect(
      screen.getByRole("button", { name: "지도에서 학생주차장 보기" }),
    ).toHaveAttribute("aria-pressed", "true");
    getBoundingClientRect.mockRestore();
  });

  it("only lets a booth in the base filters be picked and drops the pick when they change", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 학생주차장 보기" }));

    expect(boothButton("nursing")).not.toBeInTheDocument();

    fireEvent.click(boothButton("elec-eh")!);
    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "일렉트로닉 나이트 주막 필터 해제" }),
    ).toBeInTheDocument();
    expect(boothCard("일렉트로닉 나이트")).toHaveClass("border-[#fcfcfc]");

    fireEvent.click(screen.getByRole("button", { name: "지도에서 전체 보기" }));
    expect(screen.getAllByTestId("booth-card")).toHaveLength(3);
    expect(
      screen.queryByRole("button", { name: "일렉트로닉 나이트 주막 필터 해제" }),
    ).not.toBeInTheDocument();
    const card = boothCard("일렉트로닉 나이트");
    expect(card).toHaveClass("border-[#fcfcfc]");
    expect(card).not.toHaveClass("border-[#cfff04]");
  });

  it("hides event and operation booths while keeping zones and landmarks", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 복지관 보기" }));

    expect(
      screen.queryByRole("button", { name: "GROOVE RIVALS 위치 보기" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "운영 부스 위치 보기" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("campus-map-hidden-groove-rivals")).toHaveAttribute(
      "fill",
      "#CFCFCF",
    );
    expect(screen.getByTestId("campus-map-hidden-operation-booth")).toHaveAttribute(
      "fill",
      "#CFCFCF",
    );

    const recover = await screen.findByRole("button", {
      name: "RECOVER ZONE 위치 보기",
    });
    fireEvent.click(recover);
    expect(recover).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("RECOVER ZONE")).toBeInTheDocument();

    expect(screen.getAllByText("IT1호관")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "IT1호관 위치 보기" }));
    expect(screen.queryByText("RECOVER ZONE")).not.toBeInTheDocument();
    expect(screen.getAllByText("IT1호관")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "나이팅게일 주막만 보기" }));
    expect(screen.getByText("IT1호관")).toBeInTheDocument();
    expect(screen.getAllByText("나이팅게일")).toHaveLength(3);
  });

  it("shows an empty state when PUB-1 has no booths", async () => {
    httpGet.mockResolvedValueOnce(envelope([]));

    renderPage();

    expect(await screen.findByText("등록된 주막이 아직 없어요.")).toBeInTheDocument();
  });

  it("shows a retry action when PUB-1 fails", async () => {
    httpGet.mockRejectedValueOnce(new Error("network"));

    renderPage();

    expect(
      await screen.findByRole("button", { name: "페이지 새로고침" }),
    ).toBeInTheDocument();
  });

  it("pins the notice to the viewport so it stays visible at any scroll position", async () => {
    renderPage();

    const overlay = (
      await screen.findByRole("dialog", {
        name: "주막 이용 안내 사항",
      })
    ).closest(".fixed");
    expect(overlay).toHaveClass("h-dvh", "overflow-y-auto");
  });

  it("does not reopen a confirmed notice when returning from a booth detail", async () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={["/pub"]}>
          <Routes>
            <Route path="/pub" element={<BoothListPage />} />
            <Route
              path="/pub/:boothId"
              element={<Link to="/pub">주막 목록으로</Link>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(
      await screen.findByRole("link", { name: "일렉트로닉 나이트 메뉴 보기" }),
    );
    fireEvent.click(screen.getByRole("link", { name: "주막 목록으로" }));

    expect(await screen.findAllByTestId("booth-card")).toHaveLength(3);
    expect(
      screen.queryByRole("heading", { name: "주막 이용 안내 사항" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a permanently dismissed notice closed on the next render", async () => {
    const firstRender = renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "다시 보지 않기" }));
    firstRender.unmount();
    renderPage();

    await screen.findByText("일렉트로닉 나이트");
    expect(
      screen.queryByRole("heading", { name: "주막 이용 안내 사항" }),
    ).not.toBeInTheDocument();
  });
});
