import { type AdminOrder } from "./adminOrder";

export interface TableOrders {
  activeAmount: number;
  activeCount: number;
  canceledCount: number;

  lastOrderedAt: string | null;

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
