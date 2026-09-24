import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { PubOrderBoard } from "./PubOrderBoard";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), patch: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);
const httpPatch = vi.mocked(httpClient.patch);

const orderBody = (over: Record<string, unknown>) => ({
  depositorName: null,
  depositorSubmittedAt: null,
  items: [
    { lineAmount: 15_000, menuId: 4, menuName: "닭발", quantity: 1, unitPrice: 15_000 },
  ],
  orderId: 1,
  orderedAt: new Date().toISOString(),
  paymentMethod: "TRANSFER",
  status: "PENDING_DEPOSIT",
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

  return render(<PubOrderBoard />, { wrapper });
};

const groupSection = (title: string) => screen.findByRole("region", { name: title });

afterEach(() => {
  vi.clearAllMocks();
});

describe("PubOrderBoard", () => {
  it("separates orders awaiting payment confirmation from confirmed ones", async () => {
    respondWith([
      orderBody({ orderId: 1, status: "PENDING_DEPOSIT", tableNumber: 1 }),
      orderBody({
        orderId: 2,
        status: "DEPOSIT_CLAIMED",
        depositorName: "김입금",
        depositorSubmittedAt: new Date().toISOString(),
        tableNumber: 2,
      }),
      orderBody({ orderId: 3, status: "PAID", tableNumber: 3 }),
    ]);
    renderBoard();

    // 묶음 자체는 로딩 중에도 비어 있는 채로 그려지므로 데이터가 붙기를 먼저
    // 기다린 뒤에 묶음별로 확인한다.
    await screen.findByText("김입금");

    const claimed = await groupSection("입금확인중");
    expect(within(claimed).getByText("2번 테이블")).toBeInTheDocument();
    expect(within(claimed).getByText("김입금")).toBeInTheDocument();

    const pending = await groupSection("입금대기");
    expect(within(pending).getByText("1번 테이블")).toBeInTheDocument();
    expect(within(pending).getByText("미제출")).toBeInTheDocument();

    const paid = await groupSection("결제완료 · 조리 중");
    expect(within(paid).getByText("3번 테이블")).toBeInTheDocument();
  });

  it("offers only the transitions PUB-A9 accepts for each status", async () => {
    respondWith([
      orderBody({ orderId: 2, status: "DEPOSIT_CLAIMED", depositorName: "김입금" }),
    ]);
    renderBoard();

    expect(await screen.findByRole("button", { name: "결제완료" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "주문취소" })).toBeInTheDocument();
    // 입금확인중에서 곧바로 서빙완료로 보내지 않는다.
    expect(screen.queryByRole("button", { name: "서빙완료" })).not.toBeInTheDocument();
  });

  it("never offers to mark a deposit as claimed — only the guest can do that", async () => {
    respondWith([orderBody({ orderId: 1, status: "PENDING_DEPOSIT" })]);
    renderBoard();

    await screen.findByText("1번 테이블");
    expect(
      screen.queryByRole("button", { name: "입금확인중으로" }),
    ).not.toBeInTheDocument();
  });

  it("marks a cash order so the administrator checks cash, not the bank book", async () => {
    respondWith([
      orderBody({ orderId: 1, status: "PENDING_DEPOSIT", paymentMethod: "CASH" }),
    ]);
    renderBoard();

    expect(await screen.findByText("현금")).toBeInTheDocument();
    expect(screen.getByText("현금 결제")).toBeInTheDocument();
    // 현금은 입금대기에서 결제완료로 바로 넘긴다 (FR-1.4-5).
    expect(screen.getByRole("button", { name: "결제완료" })).toBeInTheDocument();
  });

  it("raises the order to PAID after the administrator reconciles the deposit", async () => {
    respondWith([
      orderBody({ orderId: 7, status: "DEPOSIT_CLAIMED", depositorName: "김입금" }),
    ]);
    httpPatch.mockResolvedValue({
      data: {
        success: true,
        data: orderBody({ orderId: 7, status: "PAID" }),
        error: null,
      },
      status: 200,
    });
    renderBoard();

    fireEvent.click(await screen.findByRole("button", { name: "결제완료" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/pub/orders/7/status", {
        status: "PAID",
      }),
    );
  });

  it("asks before canceling, since cancellation cannot be undone", async () => {
    respondWith([orderBody({ orderId: 7, status: "PAID" })]);
    renderBoard();

    fireEvent.click(await screen.findByRole("button", { name: "주문취소" }));

    const dialog = await screen.findByRole("dialog", {
      name: "이 주문을 취소할까요?",
    });
    // 확인 전에는 아무것도 보내지 않는다.
    expect(httpPatch).not.toHaveBeenCalled();

    // 카드의 취소 버튼과 다이얼로그의 확인 버튼이 같은 문구라 다이얼로그 안에서 고른다.
    fireEvent.click(within(dialog).getByRole("button", { name: "주문취소" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/pub/orders/7/status", {
        status: "CANCELED",
      }),
    );
  });

  it("folds finished orders away so the working queue stays readable", async () => {
    respondWith([
      orderBody({ orderId: 8, status: "COMPLETED", tableNumber: 8 }),
      orderBody({ orderId: 9, status: "CANCELED", tableNumber: 9 }),
    ]);
    renderBoard();

    const toggle = await screen.findByRole("button", { name: /완료·취소된 주문 2건/ });
    expect(screen.queryByText("8번 테이블")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText("8번 테이블")).toBeInTheDocument();
    expect(screen.getByText("9번 테이블")).toBeInTheDocument();
  });

  it("folds long-unpaid orders without canceling them", async () => {
    const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000).toISOString();
    respondWith([
      orderBody({ orderId: 1, status: "PENDING_DEPOSIT", orderedAt: fortyMinutesAgo }),
    ]);
    renderBoard();

    const toggle = await screen.findByRole("button", {
      name: /30분 넘게 입금이 없는 주문 1건/,
    });
    expect(screen.queryByText("1번 테이블")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText("1번 테이블")).toBeInTheDocument();
  });
});
