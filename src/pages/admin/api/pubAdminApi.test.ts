import { httpClient } from "@/shared/api";

import { changeOrderStatus } from "./changeOrderStatus";
import { changePubStatus } from "./changePubStatus";
import { createMenu } from "./createMenu";
import { deleteMenu } from "./deleteMenu";
import { getAdminOrders } from "./getAdminOrders";
import { getAdminPub, toAdminPubAccount } from "./getAdminPub";
import { getAdminTables } from "./getAdminTables";
import { setTableCount } from "./setTableCount";
import { updateMenu } from "./updateMenu";
import { updatePubAccount } from "./updatePubAccount";
import { uploadMenuBoardImage } from "./uploadMenuBoardImage";
import { uploadMenuImage } from "./uploadMenuImage";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return {
    ...actual,
    httpClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const httpGet = vi.mocked(httpClient.get);
const httpPost = vi.mocked(httpClient.post);
const httpPut = vi.mocked(httpClient.put);
const httpPatch = vi.mocked(httpClient.patch);
const httpDelete = vi.mocked(httpClient.delete);

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const menuBody = {
  category: "MAIN",
  description: null,
  imageUrl: null,
  menuId: 4,
  name: "닭발",
  price: 15_000,
  separateCharge: false,
  soldOut: false,
};

const orderBody = {
  depositorName: "김입금",
  depositorSubmittedAt: "2026-10-01T20:03:00Z",
  items: [
    { lineAmount: 30_000, menuId: 4, menuName: "닭발", quantity: 2, unitPrice: 15_000 },
  ],
  orderId: 7,
  orderedAt: "2026-10-01T20:00:00Z",
  paymentMethod: "TRANSFER",
  status: "DEPOSIT_CLAIMED",
  tableNumber: 3,
  totalAmount: 30_000,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("getAdminPub", () => {
  it("maps the nested pub block and the menu list", async () => {
    httpGet.mockResolvedValueOnce(
      envelope({
        account: {
          accountHolder: "홍길동",
          accountNumber: "000000-00-000000",
          bankName: "국민",
        },
        menuBoardImageUrl: "https://example.test/board.jpg",
        menus: [menuBody],
        pub: { boothCode: "elec-eh", name: "일렉트로닉 나이트", status: "OPEN" },
      }),
    );

    const pub = await getAdminPub();

    expect(httpGet).toHaveBeenCalledWith("/admin/pub/me");
    expect(pub.booth.boothCode).toBe("elec-eh");
    expect(pub.menuBoardImageUrl).toBe("https://example.test/board.jpg");
    expect(pub.menus).toEqual([
      {
        category: "MAIN",
        description: null,
        id: 4,
        imageUrl: null,
        isSoldOut: false,
        name: "닭발",
        price: 15_000,
        separateCharge: false,
      },
    ]);
  });
});

describe("toAdminPubAccount", () => {
  it("keeps a complete account", () => {
    expect(
      toAdminPubAccount({
        accountHolder: " 홍길동 ",
        accountNumber: " 000000-00-000000 ",
        bankName: " 국민 ",
      }),
    ).toEqual({
      accountHolder: "홍길동",
      accountNumber: "000000-00-000000",
      bankName: "국민",
    });
  });

  it.each([
    ["account 자체가 없을 때", null],
    ["예금주가 빌 때", { accountHolder: "", accountNumber: "1", bankName: "국민" }],
    [
      "계좌번호가 빌 때",
      { accountHolder: "홍", accountNumber: "  ", bankName: "국민" },
    ],
    ["은행명이 없을 때", { accountHolder: "홍", accountNumber: "1", bankName: null }],
  ])("treats a partial account as unregistered — %s", (_label, account) => {
    // 하나라도 비면 손님이 이체할 수 없는 계좌다. 미등록으로 다뤄야 경고가 뜬다.
    expect(toAdminPubAccount(account)).toBeNull();
  });
});

describe("order endpoints", () => {
  it("reads the order list without a status filter", async () => {
    httpGet.mockResolvedValueOnce(envelope([orderBody]));

    const orders = await getAdminOrders();

    expect(httpGet).toHaveBeenCalledWith("/admin/pub/orders");
    expect(orders[0]).toEqual({
      depositorName: "김입금",
      depositorSubmittedAt: "2026-10-01T20:03:00Z",
      id: 7,
      lines: [{ menuId: 4, name: "닭발", price: 15_000, quantity: 2 }],
      orderedAt: "2026-10-01T20:00:00Z",
      paymentMethod: "TRANSFER",
      status: "DEPOSIT_CLAIMED",
      tableNumber: 3,
      totalPrice: 30_000,
    });
  });

  it("treats a missing depositor name as not submitted", async () => {
    httpGet.mockResolvedValueOnce(
      envelope([
        { ...orderBody, depositorName: undefined, depositorSubmittedAt: undefined },
      ]),
    );

    const orders = await getAdminOrders();

    expect(orders[0]).toMatchObject({
      depositorName: null,
      depositorSubmittedAt: null,
    });
  });

  it("sends the new status to the order path", async () => {
    httpPatch.mockResolvedValueOnce(envelope({ ...orderBody, status: "PAID" }));

    const order = await changeOrderStatus({ orderId: 7, status: "PAID" });

    expect(httpPatch).toHaveBeenCalledWith("/admin/pub/orders/7/status", {
      status: "PAID",
    });
    expect(order.status).toBe("PAID");
  });
});

describe("pub settings", () => {
  it("unwraps the status from the response envelope", async () => {
    httpPatch.mockResolvedValueOnce(envelope({ status: "PREPARING" }));

    await expect(changePubStatus("PREPARING")).resolves.toBe("PREPARING");
    expect(httpPatch).toHaveBeenCalledWith("/admin/pub/status", {
      status: "PREPARING",
    });
  });

  it("saves the account and reads it back through the same normalizer", async () => {
    const account = {
      accountHolder: "홍길동",
      accountNumber: "000000-00-000000",
      bankName: "국민",
    };
    httpPut.mockResolvedValueOnce(envelope(account));

    await expect(updatePubAccount(account)).resolves.toEqual(account);
    expect(httpPut).toHaveBeenCalledWith("/admin/pub/account", account);
  });
});

describe("menu endpoints", () => {
  it("creates a menu with its required category", async () => {
    httpPost.mockResolvedValueOnce(envelope(menuBody));

    await createMenu({
      category: "MAIN",
      description: null,
      name: "닭발",
      price: 15_000,
      separateCharge: false,
    });

    expect(httpPost).toHaveBeenCalledWith("/admin/pub/menus", {
      category: "MAIN",
      description: null,
      name: "닭발",
      price: 15_000,
      separateCharge: false,
    });
  });

  it("sends only the changed field so a sold-out toggle keeps the rest", async () => {
    httpPatch.mockResolvedValueOnce(envelope({ ...menuBody, soldOut: true }));

    const menu = await updateMenu({ menuId: 4, requestBody: { soldOut: true } });

    expect(httpPatch).toHaveBeenCalledWith("/admin/pub/menus/4", { soldOut: true });
    expect(menu.isSoldOut).toBe(true);
  });

  it("deletes by menu id", async () => {
    httpDelete.mockResolvedValueOnce(envelope(null));

    await deleteMenu(4);

    expect(httpDelete).toHaveBeenCalledWith("/admin/pub/menus/4");
  });
});

describe("image uploads", () => {
  const imageFile = new File(["x"], "menu.jpg", { type: "image/jpeg" });

  it("posts the menu board image as form data without a manual content type", async () => {
    httpPut.mockResolvedValueOnce(envelope({ imageUrl: "https://example.test/a.jpg" }));

    await expect(uploadMenuBoardImage(imageFile)).resolves.toBe(
      "https://example.test/a.jpg",
    );

    const [url, body, config] = httpPut.mock.calls[0];
    expect(url).toBe("/admin/pub/menu-board-image");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(imageFile);
    // 직접 헤더를 지정하면 boundary가 빠져 서버가 파싱하지 못한다.
    expect(config).toBeUndefined();
  });

  it("puts a per-menu image on the menu path", async () => {
    httpPut.mockResolvedValueOnce(envelope({ imageUrl: "https://example.test/b.jpg" }));

    await uploadMenuImage({ file: imageFile, menuId: 4 });

    expect(httpPut.mock.calls[0][0]).toBe("/admin/pub/menus/4/image");
  });
});

describe("table endpoints", () => {
  const tableBody = {
    orderPath: "/pubs/elec-eh/tables/a1b2c3",
    tableCode: "a1b2c3",
    tableNumber: 1,
  };

  it("reads the table list for QR printing", async () => {
    httpGet.mockResolvedValueOnce(envelope([tableBody]));

    await expect(getAdminTables()).resolves.toEqual([tableBody]);
    expect(httpGet).toHaveBeenCalledWith("/admin/pub/tables");
  });

  it("sends a count rather than one table at a time", async () => {
    httpPut.mockResolvedValueOnce(envelope([tableBody]));

    await setTableCount(12);

    expect(httpPut).toHaveBeenCalledWith("/admin/pub/tables", { count: 12 });
  });
});
