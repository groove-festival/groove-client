import type { Cell, Row, SheetData } from "write-excel-file/browser";

import {
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentMethod,
  adminOrderStatusLabels,
  formatAdminLineName,
} from "./adminOrder";

export interface OrderWorkbookSheet {
  columnWidths: number[];
  data: SheetData;

  hasHeaderRow: boolean;
  name: string;
}

export interface OrderWorkbookContext {
  exportedAt: Date;
  pubName: string;
}

const REVENUE_STATUSES: ReadonlySet<AdminOrderStatus> = new Set(["PAID", "COMPLETED"]);

export const isRevenueOrder = (order: AdminOrder): boolean =>
  REVENUE_STATUSES.has(order.status);

const STATUS_ORDER: AdminOrderStatus[] = [
  "PENDING_DEPOSIT",
  "DEPOSIT_CLAIMED",
  "PAID",
  "COMPLETED",
  "CANCELED",
];

const paymentMethodLabels: Record<AdminPaymentMethod, string> = {
  TRANSFER: "계좌이체",
  CASH: "현금",
};

const WON_FORMAT = "#,##0";

const kstFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(\.\d+)?$/;

export const toKstDateTimeText = (isoTime: string | null): string => {
  if (!isoTime) {
    return "";
  }

  const local = LOCAL_DATE_TIME.exec(isoTime);

  if (local) {
    return `${local[1]} ${local[2]}`;
  }

  const parsed = new Date(isoTime);

  return Number.isNaN(parsed.getTime()) ? isoTime : kstFormatter.format(parsed);
};

const header = (labels: string[]): Row =>
  labels.map((value) => ({
    value,
    fontWeight: "bold",
    backgroundColor: "#E8E8E8",
  }));

const won = (value: number): Cell => ({ value, type: Number, format: WON_FORMAT });

const boldWon = (value: number): Cell => ({
  value,
  type: Number,
  format: WON_FORMAT,
  fontWeight: "bold",
});

const bold = (value: string): Cell => ({ value, fontWeight: "bold" });

const quantityOf = (order: AdminOrder): number =>
  order.lines.reduce((sum, line) => sum + line.quantity, 0);

const sumAmount = (orders: AdminOrder[]): number =>
  orders.reduce((sum, order) => sum + order.totalPrice, 0);

const byOrderedAt = (left: AdminOrder, right: AdminOrder): number =>
  left.orderedAt.localeCompare(right.orderedAt) || left.id - right.id;

const buildSummarySheet = (
  orders: AdminOrder[],
  { exportedAt, pubName }: OrderWorkbookContext,
): OrderWorkbookSheet => {
  const revenueOrders = orders.filter(isRevenueOrder);
  const unpaidOrders = orders.filter(
    (order) => order.status === "PENDING_DEPOSIT" || order.status === "DEPOSIT_CLAIMED",
  );
  const canceledOrders = orders.filter((order) => order.status === "CANCELED");
  const revenueBy = (method: AdminPaymentMethod) =>
    sumAmount(revenueOrders.filter((order) => order.paymentMethod === method));

  const data: SheetData = [
    [bold("주막"), pubName],
    [bold("내려받은 시각"), kstFormatter.format(exportedAt)],
    [bold("매출 기준"), "결제완료·완료 주문 (입금 전·취소 주문은 제외)"],
    [],
    header(["구분", "주문 건수", "금액"]),
    [bold("매출 합계"), revenueOrders.length, boldWon(sumAmount(revenueOrders))],
    [
      "└ 계좌이체",
      revenueOrders.filter((o) => o.paymentMethod === "TRANSFER").length,
      won(revenueBy("TRANSFER")),
    ],
    [
      "└ 현금",
      revenueOrders.filter((o) => o.paymentMethod === "CASH").length,
      won(revenueBy("CASH")),
    ],
    [
      "결제 확인 전 (입금대기·입금확인중)",
      unpaidOrders.length,
      won(sumAmount(unpaidOrders)),
    ],
    ["취소", canceledOrders.length, won(sumAmount(canceledOrders))],
    ["전체 주문", orders.length, won(sumAmount(orders))],
    [],
    header(["상태", "주문 건수", "금액"]),
    ...STATUS_ORDER.map((status): Row => {
      const inStatus = orders.filter((order) => order.status === status);

      return [
        adminOrderStatusLabels[status],
        inStatus.length,
        won(sumAmount(inStatus)),
      ];
    }),
    [],
    ["※ 입금자명은 개인정보예요. 정산이 끝나면 이 파일을 삭제해 주세요."],
  ];

  return { name: "요약", data, columnWidths: [34, 22, 16], hasHeaderRow: false };
};

const buildOrdersSheet = (orders: AdminOrder[]): OrderWorkbookSheet => ({
  name: "주문 내역",
  hasHeaderRow: true,
  columnWidths: [10, 20, 8, 12, 10, 14, 20, 40, 10, 12, 10],
  data: [
    header([
      "주문번호",
      "주문 시각",
      "테이블",
      "상태",
      "결제수단",
      "입금자명",
      "입금자명 제출 시각",
      "주문 메뉴",
      "수량 합계",
      "금액",
      "매출 포함",
    ]),
    ...orders.map((order): Row => [
      order.id,
      toKstDateTimeText(order.orderedAt),
      order.tableNumber,
      adminOrderStatusLabels[order.status],
      paymentMethodLabels[order.paymentMethod],
      order.depositorName ?? "",
      toKstDateTimeText(order.depositorSubmittedAt),
      order.lines
        .map((line) => `${formatAdminLineName(line)} × ${line.quantity}`)
        .join(", "),
      quantityOf(order),
      won(order.totalPrice),
      isRevenueOrder(order) ? "O" : "",
    ]),
  ],
});

const buildLinesSheet = (orders: AdminOrder[]): OrderWorkbookSheet => ({
  name: "주문 품목",
  hasHeaderRow: true,
  columnWidths: [10, 20, 8, 12, 20, 10, 8, 12, 10],
  data: [
    header([
      "주문번호",
      "주문 시각",
      "테이블",
      "상태",
      "메뉴",
      "단가",
      "수량",
      "금액",
      "매출 포함",
    ]),
    ...orders.flatMap((order) =>
      order.lines.map((line): Row => [
        order.id,
        toKstDateTimeText(order.orderedAt),
        order.tableNumber,
        adminOrderStatusLabels[order.status],
        formatAdminLineName(line),
        won(line.price),
        line.quantity,
        won(line.price * line.quantity),
        isRevenueOrder(order) ? "O" : "",
      ]),
    ),
  ],
});

interface Tally {
  amount: number;
  orderCount: number;
}

interface MenuTally extends Tally {
  name: string;
  quantity: number;
}

const buildMenuSheet = (revenueOrders: AdminOrder[]): OrderWorkbookSheet => {
  const menus = new Map<number, MenuTally>();

  for (const order of revenueOrders) {
    for (const line of order.lines) {
      const tally = menus.get(line.menuId) ?? {
        name: line.name,
        quantity: 0,
        amount: 0,
        orderCount: 0,
      };

      tally.name = line.name;
      tally.quantity += line.quantity;
      tally.amount += line.price * line.quantity;
      tally.orderCount += 1;
      menus.set(line.menuId, tally);
    }
  }

  const rows = [...menus.values()].sort(
    (left, right) => right.amount - left.amount || right.quantity - left.quantity,
  );

  return {
    name: "메뉴별 판매",
    hasHeaderRow: true,
    columnWidths: [22, 12, 14, 12],
    data: [
      header(["메뉴", "판매 수량", "매출", "주문 건수"]),
      ...rows.map((row): Row => [
        row.name,
        row.quantity,
        won(row.amount),
        row.orderCount,
      ]),
      [
        bold("합계"),
        { value: rows.reduce((sum, row) => sum + row.quantity, 0), fontWeight: "bold" },
        boldWon(rows.reduce((sum, row) => sum + row.amount, 0)),
        { value: revenueOrders.length, fontWeight: "bold" },
      ],
    ],
  };
};

const tallyBy = <Key>(
  orders: AdminOrder[],
  keyOf: (order: AdminOrder) => Key,
): Map<Key, Tally> => {
  const tallies = new Map<Key, Tally>();

  for (const order of orders) {
    const key = keyOf(order);
    const tally = tallies.get(key) ?? { amount: 0, orderCount: 0 };

    tally.amount += order.totalPrice;
    tally.orderCount += 1;
    tallies.set(key, tally);
  }

  return tallies;
};

const buildTableSheet = (revenueOrders: AdminOrder[]): OrderWorkbookSheet => {
  const tables = [...tallyBy(revenueOrders, (order) => order.tableNumber)].sort(
    ([left], [right]) => left - right,
  );

  return {
    name: "테이블별",
    hasHeaderRow: true,
    columnWidths: [10, 12, 14],
    data: [
      header(["테이블", "주문 건수", "매출"]),
      ...tables.map(([table, tally]): Row => [
        table,
        tally.orderCount,
        won(tally.amount),
      ]),
    ],
  };
};

const buildHourlySheet = (revenueOrders: AdminOrder[]): OrderWorkbookSheet => {
  const hours = [
    ...tallyBy(revenueOrders, (order) =>
      toKstDateTimeText(order.orderedAt).slice(0, 13),
    ),
  ].sort(([left], [right]) => left.localeCompare(right));

  return {
    name: "시간대별",
    hasHeaderRow: true,
    columnWidths: [20, 12, 14],
    data: [
      header(["시간대", "주문 건수", "매출"]),
      ...hours.map(([hour, tally]): Row => [
        hour ? `${hour}:00` : "시각 없음",
        tally.orderCount,
        won(tally.amount),
      ]),
    ],
  };
};

export const buildOrderWorkbook = (
  orders: AdminOrder[],
  context: OrderWorkbookContext,
): OrderWorkbookSheet[] => {
  const sorted = [...orders].sort(byOrderedAt);
  const revenueOrders = sorted.filter(isRevenueOrder);

  return [
    buildSummarySheet(sorted, context),
    buildOrdersSheet(sorted),
    buildLinesSheet(sorted),
    buildMenuSheet(revenueOrders),
    buildTableSheet(revenueOrders),
    buildHourlySheet(revenueOrders),
  ];
};

export const orderWorkbookFileName = ({
  exportedAt,
  pubName,
}: OrderWorkbookContext): string => {
  const stamp = kstFormatter
    .format(exportedAt)
    .replace(/[-:]/g, "")
    .replace(" ", "_")
    .slice(0, 13);
  const safeName = pubName.replace(/[\\/:*?"<>|]/g, "").trim() || "주막";

  return `GROOVE_${safeName}_주문내역_${stamp}.xlsx`;
};
