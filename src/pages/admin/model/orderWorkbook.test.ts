import type { Cell, SheetData } from "write-excel-file/browser";

import { type AdminOrder } from "./adminOrder";
import {
  buildOrderWorkbook,
  orderWorkbookFileName,
  toKstDateTimeText,
} from "./orderWorkbook";

const order = (over: Partial<AdminOrder>): AdminOrder => ({
  depositorName: null,
  depositorSubmittedAt: null,
  id: 1,
  lines: [
    {
      itemId: 1005,
      menuId: 1,
      name: "닭발",
      options: [],
      price: 15_000,
      quantity: 1,
      servedAt: null,
    },
  ],
  orderedAt: "2026-10-01T18:10:00",
  paymentMethod: "TRANSFER",
  status: "PAID",
  tableNumber: 1,
  totalPrice: 15_000,
  ...over,
});

// 셀 스타일을 걷어내고 값만 본다.
const valueOf = (cell: Cell): unknown =>
  cell !== null &&
  typeof cell === "object" &&
  !(cell instanceof Date) &&
  "value" in cell
    ? cell.value
    : cell;

const values = (data: SheetData): unknown[][] => data.map((row) => row.map(valueOf));

const context = {
  exportedAt: new Date("2026-10-01T15:30:00Z"),
  pubName: "컴퓨터학부 주막",
};

const orders: AdminOrder[] = [
  order({
    id: 2,
    orderedAt: "2026-10-01T19:05:00",
    tableNumber: 3,
    status: "COMPLETED",
    paymentMethod: "CASH",
    lines: [
      {
        itemId: 1006,
        menuId: 1,
        name: "닭발",
        options: [],
        price: 15_000,
        quantity: 2,
        servedAt: null,
      },
      {
        itemId: 1007,
        menuId: 2,
        name: "콜라",
        options: [],
        price: 2_000,
        quantity: 1,
        servedAt: null,
      },
    ],
    totalPrice: 32_000,
  }),
  order({
    id: 1,
    depositorName: "김입금",
    depositorSubmittedAt: "2026-10-01T18:11:30",
  }),
  order({ id: 3, status: "CANCELED", tableNumber: 5, totalPrice: 15_000 }),
  order({ id: 4, status: "DEPOSIT_CLAIMED", tableNumber: 1, totalPrice: 15_000 }),
];

const sheet = (name: string) => {
  const found = buildOrderWorkbook(orders, context).find((item) => item.name === name);

  if (!found) {
    throw new Error(`no sheet ${name}`);
  }

  return values(found.data);
};

describe("buildOrderWorkbook", () => {
  it("builds the settlement sheets in reading order", () => {
    expect(buildOrderWorkbook(orders, context).map((item) => item.name)).toEqual([
      "요약",
      "주문 내역",
      "주문 품목",
      "메뉴별 판매",
      "테이블별",
      "시간대별",
    ]);
  });

  it("sums revenue from confirmed payments only, split by payment method", () => {
    const summary = sheet("요약");
    const row = (label: string) => summary.find((cells) => cells[0] === label);

    expect(summary[1]).toEqual(["내려받은 시각", "2026-10-02 00:30:00"]);
    expect(row("매출 합계")).toEqual(["매출 합계", 2, 47_000]);
    expect(row("└ 계좌이체")).toEqual(["└ 계좌이체", 1, 15_000]);
    expect(row("└ 현금")).toEqual(["└ 현금", 1, 32_000]);
    expect(row("결제 확인 전 (입금대기·입금확인중)")).toEqual([
      "결제 확인 전 (입금대기·입금확인중)",
      1,
      15_000,
    ]);
    expect(row("취소")).toEqual(["취소", 1, 15_000]);
    expect(row("전체 주문")).toEqual(["전체 주문", 4, 77_000]);
  });

  it("lists every order in time order with depositor and revenue flag", () => {
    const rows = sheet("주문 내역");

    expect(rows[0][0]).toBe("주문번호");
    expect(rows.slice(1).map((cells) => cells[0])).toEqual([1, 3, 4, 2]);
    expect(rows[1]).toEqual([
      1,
      "2026-10-01 18:10:00",
      1,
      "결제완료",
      "계좌이체",
      "김입금",
      "2026-10-01 18:11:30",
      "닭발 × 1",
      1,
      15_000,
      "O",
    ]);
    expect(rows[2][10]).toBe("");
  });

  it("writes one row per ordered menu", () => {
    const rows = sheet("주문 품목");

    // 주문 4건의 품목 5줄 + 머리글
    expect(rows).toHaveLength(6);
    expect(rows.at(-1)).toEqual([
      2,
      "2026-10-01 19:05:00",
      3,
      "완료",
      "콜라",
      2_000,
      1,
      2_000,
      "O",
    ]);
  });

  it("writes the ticked options next to the menu name", () => {
    const optionOrder = order({
      id: 9,
      lines: [
        {
          itemId: 1009,
          menuId: 30,
          name: "짜파게티",
          options: [
            { label: "불파게티로 변경", priceDelta: 1_000 },
            { label: "메인 메뉴와 함께 주문했어요", priceDelta: -1_000 },
          ],
          price: 5_000,
          quantity: 2,
          servedAt: null,
        },
      ],
      totalPrice: 10_000,
    });
    const sheets = buildOrderWorkbook([optionOrder], context);
    const rowsOf = (name: string) =>
      values(sheets.find((item) => item.name === name)?.data ?? []);

    expect(rowsOf("주문 내역")[1][7]).toBe(
      "짜파게티 (불파게티로 변경, 메인 메뉴와 함께 주문했어요) × 2",
    );
    expect(rowsOf("주문 품목")[1][4]).toBe(
      "짜파게티 (불파게티로 변경, 메인 메뉴와 함께 주문했어요)",
    );
    // 메뉴별 판매는 옵션과 상관없이 메뉴 단위로 모은다.
    expect(rowsOf("메뉴별 판매")[1]).toEqual(["짜파게티", 2, 10_000, 1]);
  });

  it("aggregates sales by menu, table and hour from revenue orders", () => {
    expect(sheet("메뉴별 판매")).toEqual([
      ["메뉴", "판매 수량", "매출", "주문 건수"],
      ["닭발", 3, 45_000, 2],
      ["콜라", 1, 2_000, 1],
      ["합계", 4, 47_000, 2],
    ]);
    expect(sheet("테이블별")).toEqual([
      ["테이블", "주문 건수", "매출"],
      [1, 1, 15_000],
      [3, 1, 32_000],
    ]);
    expect(sheet("시간대별")).toEqual([
      ["시간대", "주문 건수", "매출"],
      ["2026-10-01 18:00", 1, 15_000],
      ["2026-10-01 19:00", 1, 32_000],
    ]);
  });
});

describe("toKstDateTimeText", () => {
  it("keeps the server's KST wall time regardless of the device time zone", () => {
    expect(toKstDateTimeText("2026-10-01T18:10:00")).toBe("2026-10-01 18:10:00");
    expect(toKstDateTimeText("2026-10-01T18:10:00.123")).toBe("2026-10-01 18:10:00");
  });

  it("converts offset times to KST", () => {
    expect(toKstDateTimeText("2026-10-01T09:10:00Z")).toBe("2026-10-01 18:10:00");
  });

  it("leaves missing times empty", () => {
    expect(toKstDateTimeText(null)).toBe("");
  });
});

describe("orderWorkbookFileName", () => {
  it("stamps the KST export time and strips characters files cannot hold", () => {
    expect(orderWorkbookFileName({ ...context, pubName: "컴퓨터/학부:주막?" })).toBe(
      "GROOVE_컴퓨터학부주막_주문내역_20261002_0030.xlsx",
    );
  });
});
