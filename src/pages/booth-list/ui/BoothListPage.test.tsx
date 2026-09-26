import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router";

import { httpClient } from "@/shared/api";

import BoothListPage from "./BoothListPage";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

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

// PLAN-1 응답 일부. 주막 지도에서도 체험존은 늘 켜 둔다.
const zones = [
  {
    type: "RECOVER",
    name: "RECOVER ZONE",
    description: "실팔찌를 만드는 프로그램",
    xRatio: 0.6074,
    yRatio: 0.5923,
  },
];

// 켜진 주막은 회색 덮개를 걷어 색 레이어가 보인다.
const isBoothLit = (boothCode: string) =>
  screen.getByTestId(`campus-map-cover-pub:${boothCode}`).style.opacity === "0";
const boothButton = (boothCode: string) =>
  screen.queryByTestId(`campus-map-place-pub:${boothCode}`);
// 고른 주막은 지도 이름표에도 이름이 떠서 목록 안에서만 찾는다.
const boothCard = (name: string) =>
  within(screen.getByRole("list", { name: /주막 목록$/ }))
    .getByText(name)
    .closest("a");

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
    expect(screen.getAllByTestId("booth-card")[0]).toHaveAttribute(
      "href",
      "/pub/elec-eh",
    );
    expect(httpGet).toHaveBeenCalledWith("/pubs");
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
    fireEvent.click((await screen.findAllByTestId("booth-card"))[0]);

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
    // 응답에 없는 주막은 배경의 회색 도형만 남는다.
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

    // 학생주차장 주막만 남고, 복지관 주막은 목록에서도 지도에서도 빠진다.
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

    // 간호대학 주막은 복지관에 있어 학생주차장과 겹치는 주막이 없다.
    expect(screen.getByText("등록된 주막이 아직 없어요.")).toBeInTheDocument();
    expect(isBoothLit("nursing")).toBe(false);
  });

  it("filters the list to the picked booth and restores the base filters", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 학생주차장 보기" }));
    expect(screen.getAllByTestId("booth-card")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: "일렉트로닉 나이트 주막만 보기" }),
    );

    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /일렉트로닉 나이트/ })).toHaveClass(
      "border-[#cfff04]",
    );
    expect(isBoothLit("elec-eh")).toBe(true);
    expect(isBoothLit("elec-b-design")).toBe(false);
    expect(boothButton("elec-b-design")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "전자공학부B • 디자인학과 주막만 보기",
      }),
    );

    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /전자공학부B • 디자인학과/ })).toHaveClass(
      "border-[#cfff04]",
    );
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
      screen.getByRole("link", { name: /전자공학부B • 디자인학과/ }).closest("li"),
    ).toHaveClass("animate-booth-filter-result-in");
    expect(isBoothLit("elec-eh")).toBe(false);
    expect(boothButton("elec-eh")).toBeInTheDocument();
    expect(isBoothLit("elec-b-design")).toBe(true);

    fireEvent.click(
      screen.getByRole("button", {
        name: "전자공학부B • 디자인학과 주막 필터 해제",
      }),
    );

    // 주막 한 곳 선택만 풀리고, 학생주차장 구역 조건은 그대로 남는다.
    expect(screen.getAllByTestId("booth-card")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /일렉트로닉 나이트/ })).toHaveClass(
      "border-[#fcfcfc]",
    );
    expect(isBoothLit("elec-b-design")).toBe(true);
    expect(
      screen.getByRole("button", { name: "지도에서 학생주차장 보기" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("only lets a booth in the base filters be picked and drops the pick when they change", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 학생주차장 보기" }));

    // 복지관 주막은 꺼져 있어 누를 수 없다.
    expect(boothButton("nursing")).not.toBeInTheDocument();

    fireEvent.click(boothButton("elec-eh")!);
    expect(screen.getAllByTestId("booth-card")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "일렉트로닉 나이트 주막 필터 해제" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /일렉트로닉 나이트/ })).toHaveClass(
      "border-[#cfff04]",
    );

    fireEvent.click(screen.getByRole("button", { name: "지도에서 전체 보기" }));
    expect(screen.getAllByTestId("booth-card")).toHaveLength(3);
    expect(
      screen.queryByRole("button", { name: "일렉트로닉 나이트 주막 필터 해제" }),
    ).not.toBeInTheDocument();
    const card = boothCard("일렉트로닉 나이트");
    expect(card).toHaveClass("border-[#fcfcfc]");
    expect(card).not.toHaveClass("border-[#cfff04]");
  });

  it("keeps the other places lit and pins the one that was tapped", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 복지관 보기" }));

    // 주막 필터와 상관없이 체험존·랜드마크는 늘 켜져 있어 누를 수 있다.
    const recover = await screen.findByRole("button", {
      name: "RECOVER ZONE 위치 보기",
    });
    fireEvent.click(recover);
    expect(recover).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("RECOVER ZONE")).toBeInTheDocument();

    // 랜드마크는 누르기 전부터 이름표가 떠 있고, 눌러도 한 번 더 띄우지 않는다.
    expect(screen.getAllByText("IT1호관")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "IT1호관 위치 보기" }));
    expect(screen.queryByText("RECOVER ZONE")).not.toBeInTheDocument();
    expect(screen.getAllByText("IT1호관")).toHaveLength(1);

    // 주막을 누르면 그 주막만 남기고, 이름은 카드와 필터 칩에만 뜬다 (지도 핀 없음).
    fireEvent.click(screen.getByRole("button", { name: "나이팅게일 주막만 보기" }));
    expect(screen.getByText("IT1호관")).toBeInTheDocument();
    expect(screen.getAllByText("나이팅게일")).toHaveLength(2);
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
    fireEvent.click((await screen.findAllByTestId("booth-card"))[0]);
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
