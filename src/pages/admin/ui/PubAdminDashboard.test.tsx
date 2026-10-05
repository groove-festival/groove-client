import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";

import { httpClient } from "@/shared/api";

import { PubAdminDashboard } from "./PubAdminDashboard";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), patch: vi.fn() } };
});

vi.mock("./AdminHeader", () => ({ AdminHeader: () => null }));
vi.mock("./PubPaymentBoard", () => ({ PubPaymentBoard: () => <p>payment-board</p> }));
vi.mock("./PubKitchenBoard", () => ({ PubKitchenBoard: () => <p>kitchen-board</p> }));
vi.mock("./PubOrderHistory", () => ({ PubOrderHistory: () => <p>order-history</p> }));
vi.mock("./PubStatusToggle", () => ({ PubStatusToggle: () => <p>status-toggle</p> }));
vi.mock("./PubAccountForm", () => ({ PubAccountForm: () => null }));
vi.mock("./PubMenuManager", () => ({ PubMenuManager: () => null }));
vi.mock("./PubMenuBoardImageField", () => ({ PubMenuBoardImageField: () => null }));
vi.mock("./PubTableManager", () => ({ PubTableManager: () => null }));

const httpGet = vi.mocked(httpClient.get);

const pubBody = {
  account: null,
  pub: { boothCode: "PUB-A01", name: "컴퓨터학부 주막", pubId: 1, status: "OPEN" },
  menuBoardImageUrl: null,
  menus: [],
};

const orderBody = (orderId: number, status: string) => ({
  depositorName: null,
  depositorSubmittedAt: null,
  items: [],
  orderId,
  orderedAt: new Date().toISOString(),
  paymentMethod: "TRANSFER",
  status,
  tableNumber: orderId,
  totalAmount: 0,
});

const LocationProbe = () => <output>{useLocation().search}</output>;

const renderDashboard = (initialEntry = "/admin") => {
  httpGet.mockImplementation((url: string) =>
    Promise.resolve({
      data: {
        success: true,
        data:
          url === "/admin/pub/orders"
            ? [
                orderBody(1, "DEPOSIT_CLAIMED"),
                orderBody(2, "PAID"),
                orderBody(3, "PAID"),
              ]
            : url === "/admin/pub/tables"
              ? [1, 2, 3].map((n) => ({
                  orderPath: "",
                  tableCode: `t${n}`,
                  tableNumber: n,
                }))
              : pubBody,
        error: null,
      },
      status: 200,
    }),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <PubAdminDashboard />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("PubAdminDashboard", () => {
  it("opens on payment confirmation by default", async () => {
    renderDashboard();

    expect(await screen.findByText("payment-board")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /입금 확인/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("opens the kitchen view straight from the address so a kitchen device can keep it", async () => {
    renderDashboard("/admin?view=kitchen");

    expect(await screen.findByText("kitchen-board")).toBeInTheDocument();
    expect(screen.queryByText("payment-board")).not.toBeInTheDocument();
  });

  it("switches views and records the choice in the address", async () => {
    renderDashboard();

    fireEvent.click(await screen.findByRole("tab", { name: /주막 설정/ }));

    expect(screen.getByText("status-toggle")).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 });
    expect(screen.getByText("?view=settings")).toBeInTheDocument();
  });

  it("shows how many orders wait on each working view", async () => {
    renderDashboard();

    expect(
      await screen.findByRole("tab", { name: /2\s*건\s*주방/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /1\s*건\s*입금 확인/ })).toBeInTheDocument();
  });

  it("narrows the working views to the tables this device looks after", async () => {
    renderDashboard();

    fireEvent.click(await screen.findByRole("button", { name: /담당 테이블/ }));
    const sheet = screen.getByRole("dialog", { name: "담당 테이블" });
    fireEvent.click(await within(sheet).findByRole("button", { name: "2번 테이블" }));
    fireEvent.click(within(sheet).getByRole("button", { name: "1개 테이블 적용" }));

    expect(
      screen.getByRole("button", { name: /담당 테이블:\s*2번/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /1\s*건\s*주방/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /입금 확인/ })).not.toHaveTextContent(/\d/);
    expect(window.localStorage.getItem("groove:pub-admin:tables:PUB-A01")).toBe("[2]");
  });
});
