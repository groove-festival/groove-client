import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import { type PlacedOrder } from "../model/order";
import { getOrderStorageKey } from "../model/orderStorage";
import BoothOrderPage from "./BoothOrderPage";

const BOOTH_ID = "electronics-eh";
const TABLE_CODE = "table-a";
const ORDER_PATH = `/pub/${BOOTH_ID}/${TABLE_CODE}`;

const renderOrderPage = (path = ORDER_PATH) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/pub" element={<div>주막 목록</div>} />
        <Route path="/pub/:boothId/:tableCode" element={<BoothOrderPage />} />
      </Routes>
    </MemoryRouter>,
  );

const getBottomBar = () => screen.getByTestId("order-bottom-bar");

const addFirstMenu = () =>
  fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 늘리기" })[0]);

const placeOrder = () => {
  addFirstMenu();
  fireEvent.click(screen.getByRole("button", { name: "27,000원 주문하기" }));
};

const getTransferDialog = () => screen.getByRole("dialog", { name: "계좌이체 안내" });

const seedOrder = (order: Partial<PlacedOrder>) =>
  window.localStorage.setItem(
    getOrderStorageKey(BOOTH_ID, TABLE_CODE),
    JSON.stringify({
      depositorName: null,
      id: "order-1",
      lines: [
        { menuId: "separate-charge", name: "상차림비", price: 2_000, quantity: 1 },
        { menuId: "set-1", name: "메뉴명", price: 25_000, quantity: 1 },
      ],
      paymentMethod: "TRANSFER",
      status: "PENDING_DEPOSIT",
      totalPrice: 27_000,
      ...order,
    }),
  );

let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
  window.localStorage.clear();
  scrollTo = vi.fn();
  Object.defineProperty(window, "scrollTo", { configurable: true, value: scrollTo });
});

describe("BoothOrderPage", () => {
  it("renders the order header without the menu button or home link", () => {
    renderOrderPage();

    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "GROOVE 홈" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "GROOVE" })).toBeInTheDocument();
  });

  it("starts the separate charge at one and keeps it from going below one", () => {
    renderOrderPage();

    const separateCharge = screen.getByRole("list", { name: "상차림비" });
    expect(within(separateCharge).getByText("2,000원")).toBeInTheDocument();
    expect(within(separateCharge).getByLabelText("상차림비 수량")).toHaveTextContent(
      "1",
    );
    expect(
      within(separateCharge).getByRole("button", { name: "상차림비 수량 줄이기" }),
    ).toBeDisabled();
  });

  it("slides the order button in only while a menu is selected", () => {
    renderOrderPage();

    expect(getBottomBar()).toHaveAttribute("inert");
    expect(getBottomBar()).toHaveClass("translate-y-full", "transition-transform");

    addFirstMenu();
    expect(getBottomBar()).not.toHaveAttribute("inert");
    expect(getBottomBar()).toHaveClass("translate-y-0");
    expect(
      screen.getByRole("button", { name: "27,000원 주문하기" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 늘리기" })[5]);
    expect(
      screen.getByRole("button", { name: "42,000원 주문하기" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 줄이기" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "메뉴명 수량 줄이기" })[5]);
    expect(getBottomBar()).toHaveAttribute("inert");
  });

  it("requires a depositor name before completing a transfer", () => {
    renderOrderPage();
    placeOrder();

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

  it("moves a transfer order to deposit checking with the depositor and account", () => {
    renderOrderPage();
    placeOrder();
    scrollTo.mockClear();

    const dialog = getTransferDialog();
    fireEvent.change(within(dialog).getByLabelText(/입금자명/), {
      target: { value: "김입금" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "이체 완료" }));

    expect(screen.getByRole("heading", { name: "입금 확인 중" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("입금자명")).toBeInTheDocument();
    expect(screen.getByText("김입금")).toBeInTheDocument();
    expect(screen.getByText("계좌 번호")).toBeInTheDocument();
    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("27,000원")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "계좌번호 복사" })).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  it("places the status actions at the end of the page instead of floating", () => {
    seedOrder({ depositorName: "김입금", status: "DEPOSIT_CLAIMED" });
    const depositView = renderOrderPage();

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

    expect(screen.queryByTestId("order-bottom-bar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "추가 주문하기" }).closest(".fixed"),
    ).toBeNull();
  });

  it("lets the customer edit and resubmit the depositor name", () => {
    seedOrder({ depositorName: "홍길동", status: "DEPOSIT_CLAIMED" });
    renderOrderPage();

    fireEvent.click(screen.getByRole("button", { name: "입금자명 수정하기" }));
    const dialog = screen.getByRole("dialog", { name: "입금자명을 수정하시겠어요?" });
    fireEvent.change(within(dialog).getByLabelText(/입금자명/), {
      target: { value: "김철수" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "수정" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("김철수")).toBeInTheDocument();
  });

  it("shows the cash guide with only the booth, menus and total", () => {
    renderOrderPage();
    placeOrder();

    fireEvent.click(
      within(getTransferDialog()).getByRole("button", {
        name: "현금으로 결제하겠습니다",
      }),
    );

    expect(screen.getByRole("heading", { name: "현금 준비 안내" })).toBeInTheDocument();
    expect(screen.getByText("주막명")).toBeInTheDocument();
    expect(screen.getByText("주문 메뉴")).toBeInTheDocument();
    expect(screen.getByText("결제 금액")).toBeInTheDocument();
    expect(screen.queryByText("입금자명")).not.toBeInTheDocument();
    expect(screen.queryByText("계좌 번호")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-bottom-bar")).not.toBeInTheDocument();
  });

  it("restores an unfinished transfer order from the banner after leaving", () => {
    const firstVisit = renderOrderPage();
    placeOrder();
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
      screen.getByRole("button", { name: "아직 완료되지 않은 주문이 있어요" }),
    );
    expect(getTransferDialog()).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "아직 완료되지 않은 주문이 있어요" }),
    ).not.toBeInTheDocument();
  });

  it("does not show the banner for another table", () => {
    seedOrder({});
    renderOrderPage(`/pub/${BOOTH_ID}/table-b`);

    expect(
      screen.queryByRole("button", { name: "아직 완료되지 않은 주문이 있어요" }),
    ).not.toBeInTheDocument();
  });

  it("returns to an empty menu from a completed order", () => {
    seedOrder({ depositorName: "김입금", status: "PAID" });
    renderOrderPage();

    expect(
      screen.getByRole("heading", { name: "주문이 완료되었어요!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("입금자명")).toBeInTheDocument();
    expect(screen.queryByText("주문자명")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "추가 주문하기" }));

    expect(screen.getByRole("heading", { name: "주막 이름" })).toBeInTheDocument();
    expect(getBottomBar()).toHaveAttribute("inert");
    expect(
      window.localStorage.getItem(getOrderStorageKey(BOOTH_ID, TABLE_CODE)),
    ).toBeNull();
  });

  it("shows a completed cash order with the cash receipt rows", () => {
    seedOrder({ paymentMethod: "CASH", status: "COMPLETED" });
    renderOrderPage();

    expect(
      screen.getByRole("heading", { name: "주문이 완료되었어요!" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("입금자명")).not.toBeInTheDocument();
    expect(screen.queryByText("계좌 번호")).not.toBeInTheDocument();
  });

  it("copies the account number from the transfer dialog", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderOrderPage();
    placeOrder();

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

    fireEvent.click(screen.getByRole("button", { name: "계좌번호 복사" }));
    expect(await screen.findByText("계좌번호를 복사했어요")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(screen.queryByText("계좌번호를 복사했어요")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("redirects an unknown booth to the booth list", () => {
    renderOrderPage("/pub/not-a-booth/table-a");

    expect(screen.getByText("주막 목록")).toBeInTheDocument();
  });
});
