import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { PubTableOrders } from "./PubTableOrders";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), patch: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

const orderBody = (over: Record<string, unknown>) => ({
  depositorName: "김입금",
  depositorSubmittedAt: null,
  items: [
    {
      lineAmount: 15_000,
      menuId: 4,
      orderItemId: 40,
      menuName: "닭발",
      quantity: 1,
      unitPrice: 15_000,
    },
  ],
  orderId: 1,
  orderedAt: "2026-10-01T18:00:00+09:00",
  paymentMethod: "TRANSFER",
  status: "PAID",
  tableNumber: 1,
  totalAmount: 15_000,
  ...over,
});

const renderTables = (visibleTables: number[] = []) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(
    <PubTableOrders tableNumbers={[1, 2, 3]} visibleTables={visibleTables} />,
    { wrapper },
  );
};

const tableRows = () =>
  within(screen.getByRole("region", { name: "테이블별 주문" }))
    .getAllByRole("button", { expanded: false })
    .map((button) => button.textContent?.match(/^(\d+)번/)?.[1]);

beforeEach(() => {
  httpGet.mockResolvedValue({
    data: {
      success: true,
      data: [
        orderBody({
          orderId: 1,
          tableNumber: 2,
          orderedAt: "2026-10-01T18:00:00+09:00",
        }),
        orderBody({
          orderId: 2,
          tableNumber: 1,
          orderedAt: "2026-10-01T18:40:00+09:00",
        }),
        orderBody({
          orderId: 3,
          tableNumber: 2,
          orderedAt: "2026-10-01T18:20:00+09:00",
          totalAmount: 8_000,
        }),
      ],
      error: null,
    },
    status: 200,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PubTableOrders", () => {
  it("lists every table with its order count and total", async () => {
    renderTables();

    const second = await screen.findByRole("button", { name: /^2번.*2건/ });
    expect(second).toHaveTextContent("2건 · 23,000원");
    expect(screen.getByRole("button", { name: /^3번/ })).toHaveTextContent("주문 없음");
    expect(tableRows()).toEqual(["1", "2", "3"]);
  });

  it("sorts by the oldest last order", async () => {
    renderTables();
    await screen.findByRole("button", { name: /^2번.*2건/ });

    fireEvent.click(screen.getByRole("button", { name: "마지막 주문 오래된 순" }));

    // 2번의 마지막 주문 18:20 이 1번 18:40 보다 오래됐다. 주문 없는 3번은 맨 아래.
    expect(tableRows()).toEqual(["2", "1", "3"]);
  });

  it("opens a table to show its orders, newest first", async () => {
    renderTables();

    fireEvent.click(await screen.findByRole("button", { name: /^2번.*2건/ }));

    const panel = document.getElementById("table-orders-2") as HTMLElement;
    const amounts = within(panel)
      .getAllByText(/^(8,000|15,000)원$/)
      .map((node) => node.textContent);
    expect(amounts).toEqual(["8,000원", "15,000원"]);
  });

  it("shows only the tables the staff member looks after", async () => {
    renderTables([2]);

    await screen.findByRole("button", { name: /^2번/ });
    expect(tableRows()).toEqual(["2"]);
  });
});
