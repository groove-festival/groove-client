import { type AdminOrder } from "./adminOrder";

// 테이블별로 묶은 주문. 서빙 직원이 "이 테이블이 뭘 시켰고 언제 마지막으로
// 시켰는지"를 한 번에 보는 용도다. 첫 주문인지 추가 주문인지는 직원이 테이블을
// 보고 판단하므로 여기서 가르지 않는다.
export interface TableOrders {
  // 취소를 뺀 주문의 합계.
  activeAmount: number;
  activeCount: number;
  canceledCount: number;
  // 취소를 뺀 가장 최근 주문 시각. 주문이 없거나 다 취소됐으면 null.
  lastOrderedAt: string | null;
  // 최신 주문이 위.
  orders: AdminOrder[];
  tableNumber: number;
}

export type TableSort = "number" | "oldestLastOrder";

export const tableSortLabels: Record<TableSort, string> = {
  number: "테이블 번호순",
  oldestLastOrder: "마지막 주문 오래된 순",
};

const byNewest = (left: AdminOrder, right: AdminOrder) =>
  right.orderedAt.localeCompare(left.orderedAt) || right.id - left.id;

// 등록된 테이블은 주문이 없어도 보인다. 테이블을 줄인 뒤 남은 옛 주문의 번호도
// 빠뜨리지 않도록 주문에 나온 번호를 함께 합친다.
export const groupOrdersByTable = (
  orders: AdminOrder[],
  tableNumbers: number[],
  sort: TableSort,
): TableOrders[] => {
  const numbers = new Set([
    ...tableNumbers,
    ...orders.map((order) => order.tableNumber),
  ]);

  const tables = [...numbers].map((tableNumber): TableOrders => {
    const tableOrders = orders
      .filter((order) => order.tableNumber === tableNumber)
      .sort(byNewest);
    const active = tableOrders.filter((order) => order.status !== "CANCELED");

    return {
      activeAmount: active.reduce((sum, order) => sum + order.totalPrice, 0),
      activeCount: active.length,
      canceledCount: tableOrders.length - active.length,
      lastOrderedAt: active[0]?.orderedAt ?? null,
      orders: tableOrders,
      tableNumber,
    };
  });

  const byNumber = (left: TableOrders, right: TableOrders) =>
    left.tableNumber - right.tableNumber;

  if (sort === "number") {
    return tables.sort(byNumber);
  }

  // 마지막 주문이 오래된 테이블이 위 — 한참 주문이 없던 테이블(식사를 마쳤거나
  // 일행이 바뀌었을 수 있는)을 먼저 살핀다. 주문이 없는 테이블은 맨 아래.
  return tables.sort((left, right) => {
    if (left.lastOrderedAt === null || right.lastOrderedAt === null) {
      return (
        Number(left.lastOrderedAt === null) - Number(right.lastOrderedAt === null) ||
        byNumber(left, right)
      );
    }

    return (
      left.lastOrderedAt.localeCompare(right.lastOrderedAt) || byNumber(left, right)
    );
  });
};
