import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { PubKitchenBoard } from "./PubKitchenBoard";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), patch: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);
const httpPatch = vi.mocked(httpClient.patch);

const orderBody = (over: Record<string, unknown>) => ({
  depositorName: "김입금",
  depositorSubmittedAt: null,
  items: [
    { lineAmount: 15_000, menuId: 4, menuName: "닭발", quantity: 1, unitPrice: 15_000 },
  ],
  orderId: 1,
  orderedAt: new Date().toISOString(),
  paymentMethod: "TRANSFER",
  status: "PAID",
  tableNumber: 1,
  totalAmount: 15_000,
  ...over,
});

const respondWith = (orders: unknown[]) => {
  httpGet.mockResolvedValue({
    data: { success: true, data: orders, error: null },
    status: 200,
  });
};

const renderBoard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<PubKitchenBoard />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("PubKitchenBoard", () => {
  it("shows only orders whose payment is confirmed", async () => {
    respondWith([
      orderBody({ orderId: 1, status: "PENDING_DEPOSIT", tableNumber: 1 }),
      orderBody({ orderId: 2, status: "DEPOSIT_CLAIMED", tableNumber: 2 }),
      orderBody({ orderId: 3, status: "PAID", tableNumber: 3 }),
      orderBody({ orderId: 4, status: "COMPLETED", tableNumber: 4 }),
    ]);
    renderBoard();

    expect(
      await screen.findByRole("article", { name: "3번 테이블 조리 주문" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("totals the menus still to cook across paid orders", async () => {
    respondWith([
      orderBody({
        orderId: 1,
        items: [
          {
            lineAmount: 30_000,
            menuId: 4,
            menuName: "닭발",
            quantity: 2,
            unitPrice: 15_000,
          },
          {
            lineAmount: 2_000,
            menuId: 9,
            menuName: "콜라",
            quantity: 1,
            unitPrice: 2_000,
          },
        ],
      }),
      orderBody({
        orderId: 2,
        items: [
          {
            lineAmount: 15_000,
            menuId: 4,
            menuName: "닭발",
            quantity: 1,
            unitPrice: 15_000,
          },
        ],
      }),
    ]);
    renderBoard();

    const totals = await screen.findByRole("region", { name: "만들 메뉴 합계" });
    const items = within(totals).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("닭발 3");
    expect(items[1]).toHaveTextContent("콜라 1");
  });

  it("keeps depositor names and amounts off the kitchen screen", async () => {
    respondWith([orderBody({ orderId: 1 })]);
    renderBoard();

    await screen.findByRole("article");
    expect(screen.queryByText("김입금")).not.toBeInTheDocument();
    expect(screen.queryByText("15,000원")).not.toBeInTheDocument();
    // 취소는 주문 내역 화면에서 한다.
    expect(screen.queryByRole("button", { name: "주문취소" })).not.toBeInTheDocument();
  });

  it("marks the order served", async () => {
    respondWith([orderBody({ orderId: 7 })]);
    httpPatch.mockResolvedValue({
      data: {
        success: true,
        data: orderBody({ orderId: 7, status: "COMPLETED" }),
        error: null,
      },
      status: 200,
    });
    renderBoard();

    fireEvent.click(await screen.findByRole("button", { name: "서빙완료" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/pub/orders/7/status", {
        status: "COMPLETED",
      }),
    );
  });

  it("says so when there is nothing to cook", async () => {
    respondWith([orderBody({ orderId: 1, status: "PENDING_DEPOSIT" })]);
    renderBoard();

    expect(await screen.findByText("조리할 주문이 없어요.")).toBeInTheDocument();
  });
});
