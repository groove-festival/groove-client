import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";

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
    boothCode: "electronics-eh",
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
    boothCode: "electronics-b-design",
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

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
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
      "/pub/electronics-eh",
    );
    expect(httpGet).toHaveBeenCalledWith("/pubs");
  });

  it("opens the selected booth detail route", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
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
