import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { AxiosError } from "axios";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import AdminPromoPage from "./AdminPromoPage";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), post: vi.fn() } };
});
vi.mock("./PhaseOverridePanel", () => ({
  PhaseOverridePanel: () => <div>phase-panel</div>,
}));
vi.mock("./DisplayOrderEditor", () => ({
  DisplayOrderEditor: () => <div>order-editor</div>,
}));
vi.mock("./SongRequestList", () => ({ SongRequestList: () => <div>song-list</div> }));

const httpGet = vi.mocked(httpClient.get);

const account = (over: Record<string, unknown>) => ({
  loggedIn: false,
  role: null,
  displayName: null,
  pubId: null,
  ...over,
});

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminPromoPage />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("AdminPromoPage", () => {
  it("shows the login form when not authenticated as a promo admin", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: { account: account({}) }, error: null },
      status: 200,
    });
    renderPage();

    expect(await screen.findByRole("button", { name: "로그인" })).toBeInTheDocument();
    expect(screen.queryByText("phase-panel")).not.toBeInTheDocument();
  });

  it("shows the dashboard for a promo admin", async () => {
    httpGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: { account: account({ loggedIn: true, role: "PROMO_ADMIN" }) },
        error: null,
      },
      status: 200,
    });
    renderPage();

    expect(await screen.findByText("phase-panel")).toBeInTheDocument();
    expect(screen.getByText("order-editor")).toBeInTheDocument();
    expect(screen.getByText("song-list")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
  });

  it("offers a retry when the session check fails", async () => {
    httpGet.mockRejectedValueOnce(new AxiosError("network", "ERR_NETWORK"));
    renderPage();

    expect(
      await screen.findByText("로그인 상태를 확인하지 못했어요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });
});
