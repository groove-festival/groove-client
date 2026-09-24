import { httpClient } from "@/shared/api";

import { createOrder } from "./createOrder";
import { getOrder, type OrderRequestTarget } from "./getOrder";
import { updateDepositorName } from "./updateDepositorName";
import { updatePaymentMethod } from "./updatePaymentMethod";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);
const httpPost = vi.mocked(httpClient.post);
const httpPut = vi.mocked(httpClient.put);

const target: OrderRequestTarget = {
  boothCode: "elec-eh",
  orderId: 7,
  orderToken: "token-7",
  tableCode: "table-a",
};

const orderBody = {
  account: {
    accountHolder: "홍길동",
    accountNumber: "000000-00-000000",
    bankName: "국민",
  },
  depositorName: "김입금",
  items: [
    { lineAmount: 30_000, menuId: 4, menuName: "닭발", quantity: 2, unitPrice: 15_000 },
  ],
  orderId: 7,
  paymentMethod: "TRANSFER",
  pubName: "일렉트로닉 나이트",
  status: "DEPOSIT_CLAIMED",
  totalAmount: 30_000,
};

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const tokenHeader = { headers: { "X-Order-Token": "token-7" } };

afterEach(() => {
  vi.clearAllMocks();
});

describe("toPlacedOrder mapping", () => {
  it("renames the server account fields and flattens the order items", async () => {
    httpGet.mockResolvedValueOnce(envelope(orderBody));

    const order = await getOrder(target);

    expect(order.account).toEqual({
      accountNumber: "000000-00-000000",
      bank: "국민",
      holder: "홍길동",
    });
    expect(order.lines).toEqual([
      { menuId: 4, name: "닭발", price: 15_000, quantity: 2 },
    ]);
    expect(order).toMatchObject({
      id: 7,
      pubName: "일렉트로닉 나이트",
      totalPrice: 30_000,
    });
  });

  it("treats a missing depositor name as not submitted", async () => {
    httpGet.mockResolvedValueOnce(
      envelope({ ...orderBody, depositorName: undefined, status: "PENDING_DEPOSIT" }),
    );

    await expect(getOrder(target)).resolves.toMatchObject({ depositorName: null });
  });
});

describe("createOrder", () => {
  it("sends the items with an idempotency key and returns the order token", async () => {
    httpPost.mockResolvedValueOnce(
      envelope({ ...orderBody, orderToken: "token-7", status: "PENDING_DEPOSIT" }),
    );

    const created = await createOrder({
      boothCode: "elec-eh",
      items: [{ menuId: 4, quantity: 2 }],
      tableCode: "table-a",
    });

    const [url, body, config] = httpPost.mock.calls[0];
    expect(url).toBe("/pubs/elec-eh/tables/table-a/orders");
    expect(body).toEqual({ items: [{ menuId: 4, quantity: 2 }] });
    expect(config?.headers?.["Idempotency-Key"]).toEqual(expect.any(String));
    expect(created.orderToken).toBe("token-7");
    expect(created.order.status).toBe("PENDING_DEPOSIT");
  });

  it("reuses a caller supplied idempotency key so a double tap replays the order", async () => {
    httpPost.mockResolvedValue(envelope({ ...orderBody, orderToken: "token-7" }));

    await createOrder({
      boothCode: "elec-eh",
      idempotencyKey: "fixed-key",
      items: [{ menuId: 4, quantity: 1 }],
      tableCode: "table-a",
    });
    await createOrder({
      boothCode: "elec-eh",
      idempotencyKey: "fixed-key",
      items: [{ menuId: 4, quantity: 1 }],
      tableCode: "table-a",
    });

    expect(httpPost.mock.calls[0][2]?.headers).toEqual({
      "Idempotency-Key": "fixed-key",
    });
    expect(httpPost.mock.calls[1][2]?.headers).toEqual({
      "Idempotency-Key": "fixed-key",
    });
  });
});

describe("order token protected updates", () => {
  it("submits the depositor name with the order token", async () => {
    httpPut.mockResolvedValueOnce(envelope(orderBody));

    const order = await updateDepositorName(target, "김입금");

    expect(httpPut).toHaveBeenCalledWith(
      "/pubs/elec-eh/tables/table-a/orders/7/depositor-name",
      { depositorName: "김입금" },
      tokenHeader,
    );
    expect(order.status).toBe("DEPOSIT_CLAIMED");
  });

  it("declares cash without changing the order status", async () => {
    httpPut.mockResolvedValueOnce(
      envelope({ ...orderBody, paymentMethod: "CASH", status: "PENDING_DEPOSIT" }),
    );

    const order = await updatePaymentMethod(target, "CASH");

    expect(httpPut).toHaveBeenCalledWith(
      "/pubs/elec-eh/tables/table-a/orders/7/payment-method",
      { paymentMethod: "CASH" },
      tokenHeader,
    );
    expect(order).toMatchObject({ paymentMethod: "CASH", status: "PENDING_DEPOSIT" });
  });

  it("reads the order state with the order token", async () => {
    httpGet.mockResolvedValueOnce(envelope(orderBody));

    await getOrder(target);

    expect(httpGet).toHaveBeenCalledWith(
      "/pubs/elec-eh/tables/table-a/orders/7",
      tokenHeader,
    );
  });
});
