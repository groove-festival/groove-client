import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { AxiosError } from "axios";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import AdminPage from "./AdminPage";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), post: vi.fn() } };
});
vi.mock("./AdminLoginForm", () => ({
  AdminLoginForm: () => <div>login-form</div>,
}));
vi.mock("./PromoAdminDashboard", () => ({
  PromoAdminDashboard: () => <div>promo-dashboard</div>,
}));
vi.mock("./StageAdminDashboard", () => ({
  StageAdminDashboard: () => <div>stage-dashboard</div>,
}));
vi.mock("./PubAdminDashboard", () => ({
  PubAdminDashboard: () => <div>pub-dashboard</div>,
}));
vi.mock("./UnsupportedRoleNotice", () => ({
  UnsupportedRoleNotice: () => <div>unsupported-role</div>,
}));

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
  return render(<AdminPage />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("AdminPage", () => {
  it("shows the login form when not logged in", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: { account: account({}) }, error: null },
      status: 200,
    });
    renderPage();

    expect(await screen.findByText("login-form")).toBeInTheDocument();
  });

  it("shows the promo dashboard for PROMO_ADMIN", async () => {
    httpGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: { account: account({ loggedIn: true, role: "PROMO_ADMIN" }) },
        error: null,
      },
      status: 200,
    });
    renderPage();

    expect(await screen.findByText("promo-dashboard")).toBeInTheDocument();
  });

  it("shows the stage dashboard for STAGE_ADMIN", async () => {
    httpGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: { account: account({ loggedIn: true, role: "STAGE_ADMIN" }) },
        error: null,
      },
      status: 200,
    });
    renderPage();

    expect(await screen.findByText("stage-dashboard")).toBeInTheDocument();
  });

  it("shows the pub dashboard for PUB_ADMIN", async () => {
    httpGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: { account: account({ loggedIn: true, role: "PUB_ADMIN", pubId: 3 }) },
        error: null,
      },
      status: 200,
    });
    renderPage();

    expect(await screen.findByText("pub-dashboard")).toBeInTheDocument();
  });

  it("shows an unsupported-role notice for roles without a dashboard", async () => {
    httpGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: { account: account({ loggedIn: true, role: "PLAN_ADMIN" }) },
        error: null,
      },
      status: 200,
    });
    renderPage();

    expect(await screen.findByText("unsupported-role")).toBeInTheDocument();
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
