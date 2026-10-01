import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

const tableResponse = (orderable = true, menus: unknown[] = createMenus()) => ({
  orderable,
  pub: {
    menuBoardImageUrl: null,
    menus,
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

interface OrderLineOption {
  label: string;
  priceDelta: number;
}

interface OrderOverrides {
  depositorName?: string | null;
  // 두 번째 줄(메뉴)에 붙은 옵션.
  menuOptions?: OrderLineOption[];
  paymentMethod?: PaymentMethod;
  status?: OrderStatus;
}

// 서버가 들고 있는 주문. PUB-4~7 응답이 모두 이 값을 되비춘다.
let currentOrder: ReturnType<typeof createOrderBody> | null = null;

function createOrderBody({
  depositorName = null,
  menuOptions = [],
  paymentMethod = "TRANSFER",
  status = "PENDING_DEPOSIT",
}: OrderOverrides = {}) {
  return {
    account,
    depositorName,
    items: [
      {
        lineAmount: 2_000,
        menuId: 14,
        menuName: "상차림비",
        quantity: 1,
        unitPrice: 2_000,
      },
      {
        lineAmount: 25_000,
        menuId: 1,
        menuName: "메뉴명",
        options: menuOptions,
        quantity: 1,
        unitPrice: 25_000,
      },
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

// 상차림비는 0개로 시작하므로 손님처럼 직접 담는다. 주문 응답(createOrderBody)도
// 상차림비를 포함한 27,000원이다.
const addSeparateCharge = () =>
  fireEvent.click(screen.getByRole("button", { name: "상차림비 수량 늘리기" }));

const placeOrder = async () => {
  addSeparateCharge();
  addFirstMenu();
  fireEvent.click(screen.getByRole("button", { name: "27,000원 주문하기" }));
  await screen.findByRole("dialog", { name: "계좌이체 안내" });
};

const useTableMenus = (menus: unknown[]) => {
  httpGet.mockImplementation((url: string) =>
    url.includes("/orders/")
      ? Promise.reject(apiError("PUB005", 404))
      : Promise.resolve(envelope(tableResponse(true, menus))),
  );
};

const optionMenus = () => [
  {
    category: "SIDE",
    description: null,
    imageUrl: null,
    menuId: 14,
    name: "상차림비",
    price: 2_000,
    separateCharge: true,
    soldOut: false,
  },
  {
    category: "MAIN",
    description: null,
    imageUrl: null,
    menuId: 30,
    name: "짜파게티",
    options: [
      { optionId: 31, label: "불파게티로 변경", priceDelta: 1_000 },
      { optionId: 32, label: "메인 메뉴와 함께 주문했어요", priceDelta: -1_000 },
    ],
    price: 5_000,
    separateCharge: false,
    soldOut: false,
  },
];

const jointSeparateChargeMenus = () => [
  {
    category: "SIDE",
    description: "1인당 받아요",
    imageUrl: null,
    menuId: 20,
    name: "상차림비 (1인)",
    price: 2_000,
    separateCharge: true,
    soldOut: false,
  },
  {
    category: "SIDE",
    description: "3인 이상은 테이블당 받아요",
    imageUrl: null,
    menuId: 21,
    name: "상차림비 (테이블)",
    price: 5_000,
    separateCharge: true,
    soldOut: false,
  },
  {
    category: "MAIN",
    description: null,
    imageUrl: null,
    menuId: 4,
    name: "닭발",
    price: 15_000,
    separateCharge: false,
    soldOut: false,
  },
];

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
      ? Promise.resolve(
          envelope({ ...tableResponse(), tableCode: url.split("/").at(-1) }),
        )
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

  it("shows the department above the booth name and leaves 8px before the description", async () => {
    await showMenuScreen();

    const boothName = screen.getByRole("heading", { name: "주막 이름" });
    const departments = boothName.previousElementSibling;
    const description = screen.getByText("부스 설명");
    expect(boothName.parentElement).toHaveClass("gap-1.5");
    expect(departments).toHaveTextContent("단대 • 학과");
    expect(departments).toHaveClass("font-medium", "text-[#fcfcfc]");
    expect(boothName).toHaveClass("font-bold", "text-[#fcfcfc]");
    expect(description).toHaveClass("text-base", "leading-[19px]", "font-medium");
    expect(description.parentElement).toHaveClass("gap-2");
  });

  it("moves a shared-spot QR to the table PUB-3 resolved for today", async () => {
    httpGet.mockImplementation((url: string) => {
      if (url.includes("/orders/")) return Promise.reject(apiError("PUB005", 404));
      // 첫째 날 학과가 뽑은 QR(자리 코드)로 둘째 날에 들어오면 서버가 오늘 학과의
      // 같은 번호 테이블로 옮겨 답한다.
      if (url === "/pubs/edu-kor-home/tables/day1-table") {
        return Promise.resolve(envelope({ ...tableResponse(), tableCode: TABLE_CODE }));
      }
      return url === `/pubs/${BOOTH_ID}/tables/${TABLE_CODE}`
        ? Promise.resolve(envelope(tableResponse()))
        : Promise.reject(apiError("PUB002", 404));
    });

    await showMenuScreen("/pub/edu-kor-home/day1-table");

    expect(httpGet).toHaveBeenCalledWith(`/pubs/${BOOTH_ID}/tables/${TABLE_CODE}`);
  });

  it("sends the PUB-3 table code and groups the menus it returns", async () => {
    await showMenuScreen();

    expect(httpGet).toHaveBeenCalledWith(`/pubs/${BOOTH_ID}/tables/${TABLE_CODE}`);
    expect(screen.getByRole("heading", { name: "세트 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "음료" })).toBeInTheDocument();
  });

  it("uses 12px horizontal padding for order menu rows", async () => {
    await showMenuScreen();

    expect(
      screen.getAllByRole("button", { name: "메뉴명 수량 늘리기" })[0].closest("li"),
    ).toHaveClass("px-3");
  });

  it("starts the separate charge at zero and orders without it", async () => {
    await showMenuScreen();

    const separateCharge = screen.getByRole("list", { name: "상차림비" });
    expect(within(separateCharge).getByText("2,000원")).toBeInTheDocument();
    expect(within(separateCharge).getByLabelText("상차림비 수량")).toHaveTextContent(
      "0",
    );
    const separateChargeNotice = screen.getByTestId("separate-charge-notice");
    expect(separateChargeNotice).toHaveTextContent("* 상차림비는 직접 담아 주세요.");
    expect(separateChargeNotice).toHaveTextContent(
      "같은 테이블에서 이미 냈다면 담지 않아도 돼요.",
    );

    // 첫 주문인지는 알 수 없으므로 상차림비 없이도 주문된다.
    addFirstMenu();
    fireEvent.click(screen.getByRole("button", { name: "25,000원 주문하기" }));
    await waitFor(() =>
      expect(httpPost).toHaveBeenCalledWith(
        `/pubs/${BOOTH_ID}/tables/${TABLE_CODE}/orders`,
        { items: [{ menuId: 1, quantity: 1 }] },
        { headers: { "Idempotency-Key": expect.any(String) } },
      ),
    );
  });

  it("keeps the separate charge out of the menu sections", async () => {
    await showMenuScreen();

    // 상차림비가 섹션에도 남으면 수량과 합계가 두 번 잡힌다.
    expect(screen.getAllByRole("list", { name: "상차림비" })).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "상차림비" })).not.toBeInTheDocument();
  });

  it("lets the customer tick menu options once the menu is in the cart", async () => {
    useTableMenus(optionMenus());
    await showMenuScreen();

    // 담기 전에는 옵션을 펼치지 않는다.
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "짜파게티 수량 늘리기" }));
    const options = screen.getByRole("group", { name: "짜파게티 옵션" });
    expect(within(options).getByText("해당되면 체크해 주세요")).toBeInTheDocument();
    expect(
      within(options).getByRole("checkbox", { name: /메인 메뉴와 함께 주문했어요/ }),
    ).toHaveAccessibleName("메인 메뉴와 함께 주문했어요 −1,000원");

    fireEvent.click(within(options).getByRole("checkbox", { name: /불파게티로 변경/ }));
    expect(
      screen.getByRole("button", { name: "6,000원 주문하기" }),
    ).toBeInTheDocument();

    // 체크한 옵션은 담은 수량 전체에 붙는다.
    fireEvent.click(screen.getByRole("button", { name: "짜파게티 수량 늘리기" }));
    fireEvent.click(screen.getByRole("button", { name: "12,000원 주문하기" }));

    await waitFor(() =>
      expect(httpPost).toHaveBeenCalledWith(
        `/pubs/${BOOTH_ID}/tables/${TABLE_CODE}/orders`,
        {
          items: [{ menuId: 30, optionIds: [31], quantity: 2 }],
        },
        { headers: { "Idempotency-Key": expect.any(String) } },
      ),
    );
  });

  it("drops the ticked options when the menu goes back to zero", async () => {
    useTableMenus(optionMenus());
    await showMenuScreen();

    fireEvent.click(screen.getByRole("button", { name: "짜파게티 수량 늘리기" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /불파게티로 변경/ }));
    fireEvent.click(screen.getByRole("button", { name: "짜파게티 수량 줄이기" }));

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "짜파게티 수량 늘리기" }));
    expect(screen.getByRole("checkbox", { name: /불파게티로 변경/ })).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: "5,000원 주문하기" }),
    ).toBeInTheDocument();
  });

  it("lets the customer pick among several separate charges", async () => {
    useTableMenus(jointSeparateChargeMenus());
    await showMenuScreen();

    const separateCharges = screen.getByRole("list", { name: "상차림비" });
    expect(within(separateCharges).getByText("1인당 받아요")).toBeInTheDocument();
    expect(
      within(separateCharges).getByText("3인 이상은 테이블당 받아요"),
    ).toBeInTheDocument();
    expect(
      within(separateCharges).getByLabelText("상차림비 (1인) 수량"),
    ).toHaveTextContent("0");
    expect(
      within(separateCharges).getByRole("button", {
        name: "상차림비 (1인) 수량 줄이기",
      }),
    ).toBeDisabled();
    const notice = screen.getByTestId("separate-charge-notice");
    expect(notice).toHaveTextContent("상차림비는 직접 담아 주세요.");

    // 상차림비를 안 골라도 주문 버튼은 막지 않는다 — 안내만 한다.
    fireEvent.click(screen.getByRole("button", { name: "닭발 수량 늘리기" }));
    expect(screen.getByRole("button", { name: "15,000원 주문하기" })).toBeEnabled();

    fireEvent.click(
      within(separateCharges).getByRole("button", {
        name: "상차림비 (테이블) 수량 늘리기",
      }),
    );
    expect(
      within(separateCharges).getByLabelText("상차림비 (테이블) 수량"),
    ).toHaveTextContent("1");
    fireEvent.click(screen.getByRole("button", { name: "20,000원 주문하기" }));

    await waitFor(() =>
      expect(httpPost).toHaveBeenCalledWith(
        `/pubs/${BOOTH_ID}/tables/${TABLE_CODE}/orders`,
        {
          items: [
            { menuId: 21, quantity: 1 },
            { menuId: 4, quantity: 1 },
          ],
        },
        { headers: { "Idempotency-Key": expect.any(String) } },
      ),
    );
  });

  it("does not open the order button for separate charges alone", async () => {
    useTableMenus(jointSeparateChargeMenus());
    await showMenuScreen();

    fireEvent.click(screen.getByRole("button", { name: "상차림비 (1인) 수량 늘리기" }));

    expect(getBottomBar()).toHaveAttribute("inert");
  });

  it("slides the order button in only while a menu is selected", async () => {
    await showMenuScreen();

    expect(getBottomBar()).toHaveAttribute("inert");
    expect(getBottomBar()).toHaveClass("translate-y-full", "transition-transform");

    addFirstMenu();
    expect(getBottomBar()).not.toHaveAttribute("inert");
    expect(getBottomBar()).toHaveClass("translate-y-0");
    expect(
      screen.getByRole("button", { name: "25,000원 주문하기" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 늘리기" })[5]);
    expect(
      screen.getByRole("button", { name: "40,000원 주문하기" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 줄이기" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 줄이기" })[5]);
    expect(getBottomBar()).toHaveAttribute("inert");
  });

  // 10/1 운영: 이체 안내를 닫으면 같은 메뉴가 담긴 채로 주문하기가 다시 보여
  // 한 번 더 눌러 같은 주문이 두 건 들어갔다.
  it("empties the cart once the order is placed, so closing the transfer guide cannot repeat it", async () => {
    await showMenuScreen();
    await placeOrder();

    fireEvent.click(screen.getByRole("button", { name: "계좌이체 안내 닫기" }));

    expect(getBottomBar()).toHaveAttribute("inert");
    expect(
      screen.getByRole("button", { name: "아직 완료되지 않은 주문이 있어요" }),
    ).toBeInTheDocument();
    expect(httpPost).toHaveBeenCalledTimes(1);
  });

  it("sends a single order when the button is tapped again while it is being placed", async () => {
    let resolveOrder: (value: unknown) => void = () => {};
    httpPost.mockImplementationOnce(
      () => new Promise((resolve) => (resolveOrder = resolve)),
    );
    await showMenuScreen();
    addSeparateCharge();
    addFirstMenu();

    const orderButton = screen.getByRole("button", { name: "27,000원 주문하기" });
    fireEvent.click(orderButton);
    fireEvent.click(orderButton); // 같은 프레임 안의 더블탭
    const pendingButton = await screen.findByRole("button", { name: "주문하는 중…" });
    expect(pendingButton).toBeDisabled();
    fireEvent.click(pendingButton);
    await waitFor(() => expect(httpPost).toHaveBeenCalledTimes(1));

    currentOrder = createOrderBody();
    resolveOrder(envelope({ ...currentOrder, orderToken: ORDER_TOKEN }));
    await screen.findByRole("dialog", { name: "계좌이체 안내" });
    expect(httpPost).toHaveBeenCalledTimes(1);
  });

  it("retries with the same idempotency key when the first try got no response", async () => {
    httpPost.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
    await showMenuScreen();
    addSeparateCharge();
    addFirstMenu();

    fireEvent.click(screen.getByRole("button", { name: "27,000원 주문하기" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "27,000원 주문하기" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "27,000원 주문하기" }));
    await screen.findByRole("dialog", { name: "계좌이체 안내" });

    const keys = httpPost.mock.calls.map(
      ([, , config]) =>
        (config as { headers: Record<string, string> }).headers["Idempotency-Key"],
    );
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
  });

  it("creates the order with menu ids, quantities and an idempotency key", async () => {
    await showMenuScreen();
    await placeOrder();

    expect(httpPost).toHaveBeenCalledWith(
      `/pubs/${BOOTH_ID}/tables/${TABLE_CODE}/orders`,
      {
        items: [
          { menuId: 14, quantity: 1 },
          { menuId: 1, quantity: 1 },
        ],
      },
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
    expect(screen.getByText(/홍길동$/)).toBeInTheDocument();
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
    expect(screen.getByRole("button", { name: "입금자명 수정하기" })).toHaveClass(
      "h-16",
    );

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
    const dialog = screen.getByRole("dialog", { name: "입금자명 수정" });
    fireEvent.change(within(dialog).getByLabelText(/입금자명/), {
      target: { value: "김철수" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "완료" }));

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
    const separateCharge = screen.getByRole("list", { name: "상차림비" });
    expect(within(separateCharge).getByLabelText("상차림비 수량")).toHaveTextContent(
      "0",
    );
  });

  it("lists the chosen options under the menu on the receipt", async () => {
    seedOrder({
      depositorName: "김입금",
      menuOptions: [
        { label: "불파게티로 변경", priceDelta: 1_000 },
        { label: "메인 메뉴와 함께 주문했어요", priceDelta: -1_000 },
      ],
      status: "PAID",
    });
    renderOrderPage();

    await screen.findByRole("heading", { name: "주문이 완료되었어요!" });
    expect(screen.getByText("불파게티로 변경 (+1,000원)")).toBeInTheDocument();
    expect(
      screen.getByText("메인 메뉴와 함께 주문했어요 (−1,000원)"),
    ).toBeInTheDocument();
  });

  it("shows a served cash order with the cash receipt rows", async () => {
    seedOrder({ paymentMethod: "CASH", status: "COMPLETED" });
    renderOrderPage();

    expect(
      await screen.findByRole("heading", { name: "음식이 나왔어요" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("입금자명")).not.toBeInTheDocument();
    expect(screen.queryByText("계좌 번호")).not.toBeInTheDocument();
  });

  it("stops telling a served customer to keep waiting", async () => {
    // PAID(조리 착수)와 COMPLETED(서빙 완료)가 한 화면을 쓰던 탓에, 음식을 받은
    // 손님에게도 "조리 중이에요. 잠시만 기다려주세요."가 계속 떠 있었다.
    seedOrder({ depositorName: "김입금", status: "COMPLETED" });
    renderOrderPage();

    expect(
      await screen.findByRole("heading", { name: "음식이 나왔어요" }),
    ).toBeInTheDocument();
    expect(screen.getByText("맛있게 드세요!")).toBeInTheDocument();
    expect(screen.queryByText(/조리 중이에요/)).not.toBeInTheDocument();
  });

  it("announces a canceled order and drops the token when the notice is closed", async () => {
    seedOrder({ depositorName: "김입금", status: "CANCELED" });
    renderOrderPage();

    const dialog = await screen.findByRole("dialog", { name: "주문 취소 안내" });
    expect(
      within(dialog).getByText("품절 등의 이유로 주문이 취소되었어요."),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "확인했습니다" }));

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

    addSeparateCharge();
    addFirstMenu();
    fireEvent.click(screen.getByRole("button", { name: "27,000원 주문하기" }));

    expect(
      await screen.findByText("품절된 메뉴가 있어요. 담은 메뉴를 확인해주세요"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "27,000원 주문하기" }),
    ).toBeInTheDocument();
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
