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

  it("redirects PUB002 to the booth list", async () => {
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
    httpGet.mockRejectedValueOnce(axiosError);

    renderDetailPage("/pub/not-a-booth");

    expect(await screen.findByText("주막 목록")).toBeInTheDocument();
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
});
