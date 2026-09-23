import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { MemoryRouter, Route, Routes } from "react-router";

import { httpClient } from "@/shared/api";

import { type OrderStatus, type PaymentMethod } from "../model/order";
import { getOrderStorageKey } from "../model/orderStorage";
import BoothOrderPage from "./BoothOrderPage";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return {
    ...actual,
    httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
  };
});

const httpGet = vi.mocked(httpClient.get);
const httpPost = vi.mocked(httpClient.post);
const httpPut = vi.mocked(httpClient.put);

const BOOTH_ID = "elec-eh";
const TABLE_CODE = "table-a";
const ORDER_PATH = `/pub/${BOOTH_ID}/${TABLE_CODE}`;
const ORDER_ID = 1;
const ORDER_TOKEN = "order-token-1";

const createMenus = () => {
  const menu = (
    id: number,
    category: string,
    price: number,
    name = "메뉴명",
    separateCharge = false,
  ) => ({
    category,
    description: "메뉴설명",
    imageUrl: null,
    menuId: id,
    name,
    price,
    separateCharge,
    soldOut: false,
  });

  return [
    menu(14, "SIDE", 2_000, "상차림비", true),
    ...[1, 2, 3].map((id) => menu(id, "SET", 25_000)),
    ...[4, 5, 6, 7].map((id) => menu(id, "MAIN", 15_000)),
    ...[8, 9, 10, 11].map((id) => menu(id, "SIDE", 6_500)),
    ...[12, 13].map((id) => menu(id, "DRINK", 2_000)),
  ];
};

const tableResponse = (orderable = true) => ({
  orderable,
  pub: {
    menuBoardImageUrl: null,
    menus: createMenus(),
    pub: {
      area: "PARKING",
      boothCode: BOOTH_ID,
      colleges: ["IT"],
      departments: ["단대", "학과"],
      description: "부스 설명",
      name: "주막 이름",
      status: orderable ? "OPEN" : "PREPARING",
      xRatio: 0.2,
      yRatio: 0.3,
    },
  },
  tableCode: TABLE_CODE,
  tableNumber: 3,
});

const account = {
  accountHolder: "홍길동",
  accountNumber: "000000-00-000000",
  bankName: "국민",
};

interface OrderOverrides {
  depositorName?: string | null;
  paymentMethod?: PaymentMethod;
  status?: OrderStatus;
}

// 서버가 들고 있는 주문. PUB-4~7 응답이 모두 이 값을 되비춘다.
let currentOrder: ReturnType<typeof createOrderBody> | null = null;

function createOrderBody({
  depositorName = null,
  paymentMethod = "TRANSFER",
  status = "PENDING_DEPOSIT",
}: OrderOverrides = {}) {
  return {
    account,
    depositorName,
    items: [
      { lineAmount: 2_000, menuId: 14, menuName: "상차림비", quantity: 1, unitPrice: 2_000 },
      { lineAmount: 25_000, menuId: 1, menuName: "메뉴명", quantity: 1, unitPrice: 25_000 },
    ],
    orderId: ORDER_ID,
    paymentMethod,
    pubName: "주막 이름",
    status,
    totalAmount: 27_000,
  };
}

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const apiError = (code: string, status: number) =>
  new AxiosError("failed", undefined, undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data: { success: false, data: null, error: { code, message: code } },
    headers: {},
    status,
    statusText: "",
  });

// 주문 토큰만 브라우저에 남고, 주문 본문은 PUB-5로 다시 읽는다.
const seedOrder = (overrides: OrderOverrides = {}) => {
  currentOrder = createOrderBody(overrides);
  window.localStorage.setItem(
    getOrderStorageKey(BOOTH_ID, TABLE_CODE),
    JSON.stringify({ orderId: ORDER_ID, orderToken: ORDER_TOKEN }),
  );
};

const renderOrderPage = (path = ORDER_PATH) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/pub" element={<div>주막 목록</div>} />
          <Route path="/pub/:boothId" element={<div>주막 정보</div>} />
          <Route path="/pub/:boothId/:tableCode" element={<BoothOrderPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const showMenuScreen = async (path = ORDER_PATH) => {
  const view = renderOrderPage(path);
  await screen.findByRole("heading", { name: "주막 이름" });
  return view;
};

const getBottomBar = () => screen.getByTestId("order-bottom-bar");

const addFirstMenu = () =>
  fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 늘리기" })[0]);

const placeOrder = async () => {
  addFirstMenu();
  fireEvent.click(screen.getByRole("button", { name: "27,000원 주문하기" }));
  await screen.findByRole("dialog", { name: "계좌이체 안내" });
};

const getTransferDialog = () => screen.getByRole("dialog", { name: "계좌이체 안내" });

let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  currentOrder = null;
  scrollTo = vi.fn();
  Object.defineProperty(window, "scrollTo", { configurable: true, value: scrollTo });

  httpGet.mockImplementation((url: string) => {
    if (url.includes("/orders/")) {
      return currentOrder
        ? Promise.resolve(envelope(currentOrder))
        : Promise.reject(apiError("PUB005", 404));
    }

    // 같은 주막의 다른 테이블도 유효하다. 배너가 테이블별로 갈리는지 보려면
    // 테이블 코드가 달라도 PUB-3이 성공해야 한다.
    return url.startsWith(`/pubs/${BOOTH_ID}/tables/`)
      ? Promise.resolve(envelope(tableResponse()))
      : Promise.reject(apiError("PUB002", 404));
  });

  httpPost.mockImplementation(() => {
    currentOrder = createOrderBody();
    return Promise.resolve(envelope({ ...currentOrder, orderToken: ORDER_TOKEN }));
  });

  httpPut.mockImplementation((url: string, body: unknown) => {
    const payload = body as { depositorName?: string; paymentMethod?: PaymentMethod };
    currentOrder = url.includes("depositor-name")
      ? createOrderBody({
          depositorName: payload.depositorName ?? null,
          status: "DEPOSIT_CLAIMED",
        })
      : createOrderBody({ paymentMethod: payload.paymentMethod ?? "CASH" });
    return Promise.resolve(envelope(currentOrder));
  });
});

describe("BoothOrderPage", () => {
  it("renders the order header without the menu button or home link", async () => {
    await showMenuScreen();

    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "GROOVE 홈" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "GROOVE" })).toBeInTheDocument();
  });

  it("sends the PUB-3 table code and groups the menus it returns", async () => {
    await showMenuScreen();

    expect(httpGet).toHaveBeenCalledWith(`/pubs/${BOOTH_ID}/tables/${TABLE_CODE}`);
    expect(screen.getByRole("heading", { name: "세트 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "음료" })).toBeInTheDocument();
  });

  it("starts the separate charge at one and keeps it from going below one", async () => {
    await showMenuScreen();

    const separateCharge = screen.getByRole("list", { name: "상차림비" });
    expect(within(separateCharge).getByText("2,000원")).toBeInTheDocument();
    expect(within(separateCharge).getByLabelText("상차림비 수량")).toHaveTextContent("1");
    expect(
      within(separateCharge).getByRole("button", { name: "상차림비 수량 줄이기" }),
    ).toBeDisabled();
  });

  it("keeps the separate charge out of the menu sections", async () => {
    await showMenuScreen();

    // 상차림비가 섹션에도 남으면 수량과 합계가 두 번 잡힌다.
    expect(screen.getAllByRole("list", { name: "상차림비" })).toHaveLength(1);
    expect(
      screen.queryByRole("heading", { name: "상차림비" }),
    ).not.toBeInTheDocument();
  });

  it("slides the order button in only while a menu is selected", async () => {
    await showMenuScreen();

    expect(getBottomBar()).toHaveAttribute("inert");
    expect(getBottomBar()).toHaveClass("translate-y-full", "transition-transform");

    addFirstMenu();
    expect(getBottomBar()).not.toHaveAttribute("inert");
    expect(getBottomBar()).toHaveClass("translate-y-0");
    expect(screen.getByRole("button", { name: "27,000원 주문하기" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 늘리기" })[5]);
    expect(screen.getByRole("button", { name: "42,000원 주문하기" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 줄이기" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 줄이기" })[5]);
    expect(getBottomBar()).toHaveAttribute("inert");
  });

  it("creates the order with menu ids, quantities and an idempotency key", async () => {
    await showMenuScreen();
    await placeOrder();

    expect(httpPost).toHaveBeenCalledWith(
      `/pubs/${BOOTH_ID}/tables/${TABLE_CODE}/orders`,
      { items: [{ menuId: 14, quantity: 1 }, { menuId: 1, quantity: 1 }] },
      { headers: { "Idempotency-Key": expect.any(String) } },
    );
  });

  it("requires a depositor name before completing a transfer", async () => {
    await showMenuScreen();
    await placeOrder();

    const dialog = getTransferDialog();
    const submitButton = within(dialog).getByRole("button", { name: "이체 완료" });
    expect(within(dialog).getByText("국민 000000-00-000000")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/입금자명/), {
      target: { value: "   " },
    });
    expect(submitButton).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/입금자명/), {
      target: { value: " 홍길동 " },
    });
    expect(submitButton).toBeEnabled();
  });

  it("moves a transfer order to deposit checking with the depositor and account", async () => {
    await showMenuScreen();
    await placeOrder();
    scrollTo.mockClear();

    const dialog = getTransferDialog();
    fireEvent.change(within(dialog).getByLabelText(/입금자명/), {
      target: { value: "김입금" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "이체 완료" }));

    expect(
      await screen.findByRole("heading", { name: "입금 확인 중" }),
    ).toBeInTheDocument();
    expect(httpPut).toHaveBeenCalledWith(
      `/pubs/${BOOTH_ID}/tables/${TABLE_CODE}/orders/${ORDER_ID}/depositor-name`,
      { depositorName: "김입금" },
      { headers: { "X-Order-Token": ORDER_TOKEN } },
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("입금자명")).toBeInTheDocument();
    expect(screen.getByText("김입금")).toBeInTheDocument();
    expect(screen.getByText("계좌 번호")).toBeInTheDocument();
    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("27,000원")).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  it("places the status actions at the end of the page instead of floating", async () => {
    seedOrder({ depositorName: "김입금", status: "DEPOSIT_CLAIMED" });
    const depositView = renderOrderPage();

    await screen.findByRole("button", { name: "입금자명 수정하기" });
    expect(screen.queryByTestId("order-bottom-bar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "입금자명 수정하기" }).closest(".fixed"),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "입금자명 수정하기" })).toHaveClass("h-16");

    depositView.unmount();
    seedOrder({ depositorName: "김입금", status: "PAID" });
    renderOrderPage();

    await screen.findByRole("button", { name: "추가 주문하기" });
    expect(screen.queryByTestId("order-bottom-bar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "추가 주문하기" }).closest(".fixed"),
    ).toBeNull();
  });

  it("lets the customer edit and resubmit the depositor name", async () => {
    seedOrder({ depositorName: "홍길동", status: "DEPOSIT_CLAIMED" });
    renderOrderPage();

    fireEvent.click(await screen.findByRole("button", { name: "입금자명 수정하기" }));
    const dialog = screen.getByRole("dialog", { name: "입금자명을 수정하시겠어요?" });
    fireEvent.change(within(dialog).getByLabelText(/입금자명/), {
      target: { value: "김철수" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "수정" }));

    expect(await screen.findByText("김철수")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the cash guide with only the booth, menus and total", async () => {
    await showMenuScreen();
    await placeOrder();

    fireEvent.click(
      within(getTransferDialog()).getByRole("button", {
        name: "현금으로 결제하겠습니다",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "현금 준비 안내" }),
    ).toBeInTheDocument();
    expect(httpPut).toHaveBeenCalledWith(
      `/pubs/${BOOTH_ID}/tables/${TABLE_CODE}/orders/${ORDER_ID}/payment-method`,
      { paymentMethod: "CASH" },
      { headers: { "X-Order-Token": ORDER_TOKEN } },
    );
    expect(screen.getByText("주막명")).toBeInTheDocument();
    expect(screen.getByText("결제 금액")).toBeInTheDocument();
    expect(screen.queryByText("입금자명")).not.toBeInTheDocument();
    expect(screen.queryByText("계좌 번호")).not.toBeInTheDocument();
  });

  it("restores an unfinished transfer order from the banner after leaving", async () => {
    const firstVisit = await showMenuScreen();
    await placeOrder();
    fireEvent.click(
      within(getTransferDialog()).getByRole("button", { name: "계좌이체 안내 닫기" }),
    );

    expect(
      screen.getByRole("button", { name: "아직 완료되지 않은 주문이 있어요" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "GROOVE" }).closest("header")).toHaveStyle({
      top: "46px",
    });

    firstVisit.unmount();
    renderOrderPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "아직 완료되지 않은 주문이 있어요" }),
    );
    expect(getTransferDialog()).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "아직 완료되지 않은 주문이 있어요" }),
    ).not.toBeInTheDocument();
  });

  it("does not show the banner for another table", async () => {
    seedOrder();
    await showMenuScreen(`/pub/${BOOTH_ID}/table-b`);

    expect(
      screen.queryByRole("button", { name: "아직 완료되지 않은 주문이 있어요" }),
    ).not.toBeInTheDocument();
  });

  it("returns to an empty menu from a completed order", async () => {
    seedOrder({ depositorName: "김입금", status: "PAID" });
    renderOrderPage();

    expect(
      await screen.findByRole("heading", { name: "주문이 완료되었어요!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("입금자명")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "추가 주문하기" }));

    expect(screen.getByRole("heading", { name: "주막 이름" })).toBeInTheDocument();
    expect(getBottomBar()).toHaveAttribute("inert");
    expect(
      window.localStorage.getItem(getOrderStorageKey(BOOTH_ID, TABLE_CODE)),
    ).toBeNull();
  });

  it("shows a completed cash order with the cash receipt rows", async () => {
    seedOrder({ paymentMethod: "CASH", status: "COMPLETED" });
    renderOrderPage();

    expect(
      await screen.findByRole("heading", { name: "주문이 완료되었어요!" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("입금자명")).not.toBeInTheDocument();
    expect(screen.queryByText("계좌 번호")).not.toBeInTheDocument();
  });

  it("announces a canceled order and drops the token when the notice is closed", async () => {
    seedOrder({ depositorName: "김입금", status: "CANCELED" });
    renderOrderPage();

    const dialog = await screen.findByRole("dialog", { name: "주문 취소 안내" });
    expect(
      within(dialog).getByText("내 주문이 취소되었어요."),
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "주문 취소 안내 닫기" }),
    );

    // 토큰을 남기면 재진입할 때마다 같은 안내가 다시 뜬다.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "주막 이름" })).toBeInTheDocument();
    expect(
      window.localStorage.getItem(getOrderStorageKey(BOOTH_ID, TABLE_CODE)),
    ).toBeNull();
  });

  it("shows why an order failed and keeps the cart", async () => {
    await showMenuScreen();
    httpPost.mockRejectedValueOnce(apiError("PUB007", 409));

    addFirstMenu();
    fireEvent.click(screen.getByRole("button", { name: "27,000원 주문하기" }));

    expect(
      await screen.findByText("품절된 메뉴가 있어요. 담은 메뉴를 확인해주세요"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "27,000원 주문하기" })).toBeInTheDocument();
  });

  it("copies the account number from the transfer dialog", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    await showMenuScreen();
    await placeOrder();

    fireEvent.click(
      within(getTransferDialog()).getByRole("button", { name: "계좌번호 복사" }),
    );

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("000000-00-000000"));
    expect(await screen.findByText("계좌번호를 복사했어요")).toBeInTheDocument();
  });

  it("shows a copy toast from the receipt and hides it after a moment", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    seedOrder({ depositorName: "김입금", status: "DEPOSIT_CLAIMED" });
    renderOrderPage();

    fireEvent.click(await screen.findByRole("button", { name: "계좌번호 복사" }));
    expect(await screen.findByText("계좌번호를 복사했어요")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(screen.queryByText("계좌번호를 복사했어요")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("sends a preparing booth to the read-only booth page", async () => {
    httpGet.mockResolvedValueOnce(envelope(tableResponse(false)));
    renderOrderPage();

    expect(await screen.findByText("주막 정보")).toBeInTheDocument();
  });

  it("redirects an unknown booth or table to the booth list", async () => {
    renderOrderPage("/pub/not-a-booth/table-a");

    expect(await screen.findByText("주막 목록")).toBeInTheDocument();
  });
});
