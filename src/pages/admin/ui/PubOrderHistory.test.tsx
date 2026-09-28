import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { downloadOrderWorkbook } from "../lib/downloadOrderWorkbook";
import { PubOrderHistory } from "./PubOrderHistory";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), patch: vi.fn() } };
});

vi.mock("../lib/downloadOrderWorkbook", () => ({
  downloadOrderWorkbook: vi.fn(),
}));

const httpGet = vi.mocked(httpClient.get);
const httpPatch = vi.mocked(httpClient.patch);
const download = vi.mocked(downloadOrderWorkbook);

const orderBody = (over: Record<string, unknown>) => ({
  depositorName: null,
  depositorSubmittedAt: null,
  items: [
    { lineAmount: 15_000, menuId: 4, menuName: "닭발", quantity: 1, unitPrice: 15_000 },
  ],
  orderId: 1,
  orderedAt: "2026-10-01T18:00:00",
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

const renderHistory = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<PubOrderHistory pubName="컴퓨터학부 주막" />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("PubOrderHistory", () => {
  it("counts only confirmed payments as revenue", async () => {
    respondWith([
      orderBody({ orderId: 1, status: "PAID", totalAmount: 15_000 }),
      orderBody({ orderId: 2, status: "COMPLETED", totalAmount: 20_000 }),
      orderBody({ orderId: 3, status: "DEPOSIT_CLAIMED", totalAmount: 7_000 }),
      orderBody({ orderId: 4, status: "CANCELED", totalAmount: 9_000 }),
    ]);
    renderHistory();

    const revenue = (await screen.findByText("매출")).parentElement as HTMLElement;
    expect(within(revenue).getByText("35,000원")).toBeInTheDocument();
    expect(within(revenue).getByText("2건")).toBeInTheDocument();

    const unpaid = screen.getByText("결제 확인 전").parentElement as HTMLElement;
    expect(within(unpaid).getByText("7,000원")).toBeInTheDocument();
  });

  it("filters the list by status", async () => {
    respondWith([
      orderBody({ orderId: 8, status: "COMPLETED", tableNumber: 8 }),
      orderBody({ orderId: 9, status: "CANCELED", tableNumber: 9 }),
    ]);
    renderHistory();

    expect(await screen.findByText("8번 테이블")).toBeInTheDocument();
    expect(screen.getByText("9번 테이블")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByText("8번 테이블")).not.toBeInTheDocument();
    expect(screen.getByText("9번 테이블")).toBeInTheDocument();
  });

  it("lets the administrator cancel a paid order after confirming", async () => {
    respondWith([orderBody({ orderId: 7, status: "PAID" })]);
    httpPatch.mockResolvedValue({
      data: {
        success: true,
        data: orderBody({ orderId: 7, status: "CANCELED" }),
        error: null,
      },
      status: 200,
    });
    renderHistory();

    fireEvent.click(await screen.findByRole("button", { name: "주문취소" }));
    const dialog = await screen.findByRole("dialog", { name: "이 주문을 취소할까요?" });
    expect(httpPatch).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "주문취소" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/pub/orders/7/status", {
        status: "CANCELED",
      }),
    );
  });

  it("refetches the orders and downloads a workbook named after the pub", async () => {
    respondWith([orderBody({ orderId: 1, status: "PAID" })]);
    renderHistory();

    const button = await screen.findByRole("button", { name: "엑셀 내려받기" });
    await waitFor(() => expect(button).toBeEnabled());
    const callsBefore = httpGet.mock.calls.length;

    fireEvent.click(button);

    await waitFor(() => expect(download).toHaveBeenCalledTimes(1));
    expect(httpGet.mock.calls.length).toBeGreaterThan(callsBefore);

    const [sheets, fileName] = download.mock.calls[0];
    expect(sheets.map((sheet) => sheet.name)).toEqual([
      "요약",
      "주문 내역",
      "주문 품목",
      "메뉴별 판매",
      "테이블별",
      "시간대별",
    ]);
    expect(fileName).toMatch(/^GROOVE_컴퓨터학부 주막_주문내역_\d{8}_\d{4}\.xlsx$/);
  });

  it("tells the administrator when the workbook could not be made", async () => {
    respondWith([orderBody({ orderId: 1, status: "PAID" })]);
    download.mockRejectedValueOnce(new Error("boom"));
    renderHistory();

    const button = await screen.findByRole("button", { name: "엑셀 내려받기" });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);

    expect(
      await screen.findByText(
        "엑셀 파일을 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.",
      ),
    ).toBeInTheDocument();
  });
});
