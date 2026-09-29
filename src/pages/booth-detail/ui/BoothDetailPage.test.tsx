import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { MemoryRouter, Route, Routes } from "react-router";

import { httpClient } from "@/shared/api";

import BoothDetailPage from "./BoothDetailPage";
import { BoothMenuItemRow } from "./BoothMenuItemRow";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

const detail = {
  pub: {
    area: "PARKING",
    boothCode: "electronics-eh",
    colleges: ["IT"],
    departments: ["전자공학부E", "전자공학부H"],
    description: "전자공학부 주막",
    name: "일렉트로닉 나이트",
    status: "OPEN",
    xRatio: 0.2,
    yRatio: 0.3,
  },
  menuBoardImageUrl: "https://example.com/menu.webp",
  menus: [
    {
      menuId: 1,
      name: "상차림비",
      description: null,
      price: 1_000,
      soldOut: false,
      imageUrl: null,
      category: "SIDE",
      separateCharge: true,
    },
    {
      menuId: 2,
      name: "김치전",
      description: "바삭한 김치전",
      price: 15_000,
      soldOut: false,
      imageUrl: null,
      category: "MAIN",
      separateCharge: false,
    },
  ],
};

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const renderDetailPage = (path: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/pub" element={<div>주막 목록</div>} />
          <Route path="/pub/:boothId" element={<BoothDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  httpGet.mockResolvedValue(envelope(detail));
});

describe("BoothDetailPage", () => {
  it("renders PUB-2 booth and grouped menu data", async () => {
    renderDetailPage("/pub/electronics-eh");

    expect(await screen.findByAltText("일렉트로닉 나이트 메뉴판")).toBeInTheDocument();
    const boothName = screen.getByRole("heading", { name: "일렉트로닉 나이트" });
    expect(boothName.parentElement).toHaveClass("gap-1");
    expect(boothName.nextElementSibling).toHaveTextContent("전자공학부E • 전자공학부H");
    expect(screen.getByText("전자공학부 주막")).toHaveClass(
      "text-base",
      "leading-[19px]",
      "font-medium",
    );
    expect(screen.getByText("전자공학부 주막").parentElement).toHaveClass("gap-3");
    expect(screen.getByRole("heading", { name: "상차림비" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "메인 메뉴" })).toBeInTheDocument();
    expect(screen.getByText("1,000원")).toBeInTheDocument();
    expect(screen.getByText("15,000원")).toBeInTheDocument();
    expect(httpGet).toHaveBeenCalledWith("/pubs/electronics-eh");
  });

  it("renders the no-image and empty-menu state", async () => {
    httpGet.mockResolvedValueOnce(
      envelope({ ...detail, menuBoardImageUrl: null, menus: [] }),
    );

    renderDetailPage("/pub/electronics-eh");

    expect(
      await screen.findByRole("heading", { name: "일렉트로닉 나이트" }),
    ).toBeInTheDocument();
    expect(screen.queryByAltText("일렉트로닉 나이트 메뉴판")).not.toBeInTheDocument();
    expect(screen.getByText("등록된 메뉴가 아직 없어요.")).toBeInTheDocument();
  });

  it("keeps a permanently dismissed QR notice closed on later booth visits", async () => {
    const firstRender = renderDetailPage("/pub/electronics-eh");

    fireEvent.click(await screen.findByRole("button", { name: "다시 보지 않기" }));
    firstRender.unmount();
    renderDetailPage("/pub/electronics-eh");

    await screen.findByRole("heading", { name: "일렉트로닉 나이트" });
    expect(
      screen.queryByRole("heading", { name: "QR 셀프 주문 안내" }),
    ).not.toBeInTheDocument();
  });

  const notFound = () => {
    const axiosError = new AxiosError("not found", "ERR_BAD_RESPONSE");
    axiosError.response = {
      data: {
        success: false,
        data: null,
        error: { code: "PUB002", message: "주막을 찾을 수 없습니다." },
      },
      status: 404,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    return axiosError;
  };

  const spotBooth = (boothCode: string, operatingDay: "DAY1" | "DAY2") => ({
    ...detail.pub,
    boothCode,
    operatingDay,
    spotCode: "edu-kor-home",
  });

  it("redirects PUB002 to the booth list", async () => {
    httpGet.mockImplementation((url: string) =>
      url === "/pubs" ? Promise.resolve(envelope([])) : Promise.reject(notFound()),
    );

    renderDetailPage("/pub/not-a-booth");

    expect(await screen.findByText("주막 목록")).toBeInTheDocument();
  });

  it("uses 12px horizontal padding for menu rows", () => {
    render(
      <ul>
        <BoothMenuItemRow
          item={{
            category: "MAIN",
            description: null,
            id: 3,
            imageUrl: null,
            isSoldOut: false,
            name: "파전",
            options: [],
            price: 10_000,
            separateCharge: false,
          }}
        />
      </ul>,
    );

    expect(screen.getByText("파전").closest("li")).toHaveClass("px-3");
  });

  it("sends an old spot address to the pub that opens there first", async () => {
    httpGet.mockImplementation((url: string) => {
      if (url === "/pubs") {
        return Promise.resolve(
          envelope([spotBooth("edu-home", "DAY2"), spotBooth("edu-kor", "DAY1")]),
        );
      }
      if (url === "/pubs/edu-kor") return Promise.resolve(envelope(detail));
      return Promise.reject(notFound());
    });

    renderDetailPage("/pub/edu-kor-home");

    expect(
      await screen.findByRole("heading", { name: "일렉트로닉 나이트" }),
    ).toBeInTheDocument();
    expect(httpGet).toHaveBeenCalledWith("/pubs/edu-kor");
  });

  it("shows a retry action when PUB-2 fails", async () => {
    httpGet.mockRejectedValue(new Error("network"));

    renderDetailPage("/pub/electronics-eh");

    expect(
      await screen.findByRole(
        "button",
        { name: "페이지 새로고침" },
        { timeout: 3_000 },
      ),
    ).toBeInTheDocument();
  });
});

describe("BoothMenuItemRow", () => {
  it("formats an API price and gives sold-out state precedence", () => {
    const item = {
      category: "MAIN" as const,
      description: "바삭한 김치전",
      id: 1,
      imageUrl: null,
      isSoldOut: false,
      name: "김치전",
      options: [],
      price: 15_000,
      separateCharge: false,
    };
    const { rerender } = render(
      <ul>
        <BoothMenuItemRow item={item} />
      </ul>,
    );

    expect(screen.getByText("15,000원")).toBeInTheDocument();

    rerender(
      <ul>
        <BoothMenuItemRow item={{ ...item, isSoldOut: true }} />
      </ul>,
    );

    expect(screen.getByText("품절")).toBeInTheDocument();
    expect(screen.queryByText("15,000원")).not.toBeInTheDocument();
  });

  it("lists menu options compactly with a signed price", () => {
    render(
      <ul>
        <BoothMenuItemRow
          item={{
            category: "MAIN",
            description: null,
            id: 2,
            imageUrl: null,
            isSoldOut: false,
            name: "짜파게티",
            options: [
              { id: 1, label: "불파게티로 변경", priceDelta: 1_000 },
              { id: 2, label: "메인 메뉴와 함께 주문 시", priceDelta: -1_000 },
            ],
            price: 5_000,
            separateCharge: false,
          }}
        />
      </ul>,
    );

    const options = screen.getByRole("list", { name: "짜파게티 옵션" });
    expect(options).toHaveTextContent("+1,000원 불파게티로 변경");
    expect(options).toHaveTextContent("−1,000원 메인 메뉴와 함께 주문 시");
  });
});
