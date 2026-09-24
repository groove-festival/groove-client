import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
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

const boothShape = (boothCode: string) => screen.getByTestId(`pub-booth-${boothCode}`);

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
  httpGet.mockResolvedValue(envelope(booths));
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

    expect(boothShape("elec-eh")).toHaveStyle("opacity: 1");
    expect(boothShape("elec-b-design")).toHaveStyle("opacity: 1");
    expect(boothShape("nursing")).toHaveStyle("opacity: 1");
    // 응답에 없는 주막은 배경의 회색 도형만 남는다.
    expect(boothShape("cse")).toHaveStyle("opacity: 0");

    fireEvent.click(screen.getByRole("button", { name: "전체" }));
    fireEvent.click(screen.getByRole("option", { name: "간호대학" }));

    expect(boothShape("nursing")).toHaveStyle("opacity: 1");
    expect(boothShape("elec-eh")).toHaveStyle("opacity: 0");
    expect(boothShape("elec-b-design")).toHaveStyle("opacity: 0");
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
    expect(boothShape("elec-eh")).toHaveStyle("opacity: 1");
    expect(boothShape("elec-b-design")).toHaveStyle("opacity: 1");
    expect(boothShape("nursing")).toHaveStyle("opacity: 0");

    fireEvent.click(screen.getByRole("button", { name: "지도에서 전체 보기" }));

    expect(screen.getAllByTestId("booth-card")).toHaveLength(3);
    expect(boothShape("nursing")).toHaveStyle("opacity: 1");
  });

  it("keeps both filters on when an area and a college are picked together", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 학생주차장 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "전체" }));
    fireEvent.click(screen.getByRole("option", { name: "간호대학" }));

    // 간호대학 주막은 복지관에 있어 학생주차장과 겹치는 주막이 없다.
    expect(screen.getByText("등록된 주막이 아직 없어요.")).toBeInTheDocument();
    expect(boothShape("nursing")).toHaveStyle("opacity: 0");
  });

  it("takes the picked booth card into view and rings it", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(boothShape("nursing"));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: expect.any(String),
      block: "center",
    });
    expect(screen.getByText("나이팅게일").closest("a")).toHaveClass("border-[#cfff04]");
    // 고른 주막만 표시할 뿐, 나머지 주막 불은 그대로 둔다.
    expect(boothShape("elec-eh")).toHaveStyle("opacity: 1");
  });

  it("only lets a lit booth be picked, and drops the pick when a filter changes", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "지도에서 학생주차장 보기" }));

    // 복지관 주막은 꺼져 있어 누를 수 없다.
    expect(boothShape("nursing")).toBeDisabled();

    fireEvent.click(boothShape("elec-eh"));
    expect(screen.getByText("일렉트로닉 나이트").closest("a")).toHaveClass(
      "border-[#cfff04]",
    );

    fireEvent.click(screen.getByRole("button", { name: "지도에서 전체 보기" }));
    const card = screen.getByText("일렉트로닉 나이트").closest("a");
    expect(card).toHaveClass("border-[#fcfcfc]");
    expect(card).not.toHaveClass("border-[#cfff04]");
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
