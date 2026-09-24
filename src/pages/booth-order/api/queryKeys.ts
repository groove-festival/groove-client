export const orderQueryKeys = {
  all: () => ["pub-order"] as const,
  tables: () => [...orderQueryKeys.all(), "table"] as const,
  table: (boothCode: string, tableCode: string) =>
    [...orderQueryKeys.tables(), boothCode, tableCode] as const,
  orders: () => [...orderQueryKeys.all(), "order"] as const,
  order: (boothCode: string, tableCode: string, orderId: number) =>
    [...orderQueryKeys.orders(), boothCode, tableCode, orderId] as const,
};
