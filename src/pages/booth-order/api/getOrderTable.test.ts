import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { getOrderTable, isOrderTableNotFound } from "./getOrderTable";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

const menu = (menuId: number, overrides: Record<string, unknown> = {}) => ({
  category: "MAIN",
  description: null,
  imageUrl: null,
  menuId,
  name: `메뉴 ${menuId}`,
  price: 10_000,
  separateCharge: false,
  soldOut: false,
  ...overrides,
});

// PUB-3 응답은 PUB-2 페이로드를 통째로 품고 있어 pub이 두 번 중첩된다.
const tableBody = {
  orderable: true,
  pub: {
    menuBoardImageUrl: "https://example.com/menu.webp",
    menus: [
      menu(1, {
        category: "SIDE",
        name: "상차림비",
        price: 2_000,
        separateCharge: true,
      }),
      menu(2, { category: "DRINK", name: "사이다" }),
      menu(3, { category: "SET", name: "세트" }),
    ],
    pub: {
      area: "PARKING",
      boothCode: "elec-eh",
      colleges: ["IT"],
      departments: ["전자공학부E"],
      description: "전자공학부 주막",
      name: "일렉트로닉 나이트",
      status: "OPEN",
      xRatio: 0.2,
      yRatio: 0.3,
    },
  },
  tableCode: "table-a",
  tableNumber: 3,
};

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const notFound = (code: string) =>
  new AxiosError("failed", undefined, undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data: { success: false, data: null, error: { code, message: code } },
    headers: {},
    status: 404,
    statusText: "",
  });

afterEach(() => {
  vi.clearAllMocks();
});

describe("getOrderTable", () => {
  it("unwraps the nested pub payload and encodes the path", async () => {
    httpGet.mockResolvedValueOnce(envelope(tableBody));

    const table = await getOrderTable("elec eh", "table/a");

    expect(httpGet).toHaveBeenCalledWith("/pubs/elec%20eh/tables/table%2Fa");
    expect(table.booth.name).toBe("일렉트로닉 나이트");
    expect(table.booth.menuBoardImageUrl).toBe("https://example.com/menu.webp");
    expect(table.isOrderable).toBe(true);
    expect(table.tableNumber).toBe(3);
  });

  it("keeps the separate charge out of the menu sections", async () => {
    httpGet.mockResolvedValueOnce(envelope(tableBody));

    const { booth } = await getOrderTable("elec-eh", "table-a");

    expect(booth.separateChargeItem?.name).toBe("상차림비");
    expect(booth.menuSections.map((section) => section.id)).toEqual(["set", "drink"]);
    expect(booth.menuSections.flatMap((section) => section.items)).not.toContainEqual(
      expect.objectContaining({ separateCharge: true }),
    );
  });

  it("maps the menu response fields onto the booth menu shape", async () => {
    httpGet.mockResolvedValueOnce(
      envelope({
        ...tableBody,
        pub: { ...tableBody.pub, menus: [menu(9, { soldOut: true })] },
      }),
    );

    const { booth } = await getOrderTable("elec-eh", "table-a");

    expect(booth.menuSections[0].items[0]).toMatchObject({ id: 9, isSoldOut: true });
  });

  it("treats a missing booth and a missing table the same", async () => {
    httpGet.mockRejectedValueOnce(notFound("PUB002"));
    await expect(getOrderTable("nope", "table-a")).rejects.toSatisfy(
      isOrderTableNotFound,
    );

    httpGet.mockRejectedValueOnce(notFound("PUB003"));
    await expect(getOrderTable("elec-eh", "nope")).rejects.toSatisfy(
      isOrderTableNotFound,
    );

    httpGet.mockRejectedValueOnce(notFound("PUB006"));
    await expect(getOrderTable("elec-eh", "table-a")).rejects.not.toSatisfy(
      isOrderTableNotFound,
    );
  });
});
