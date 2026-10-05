import { type AdminOrder, formatAdminLineName } from "./adminOrder";

export interface KitchenMenuTotal {
  menuId: number;

  name: string;
  quantity: number;
}

export const summarizeKitchenMenus = (orders: AdminOrder[]): KitchenMenuTotal[] => {
  const totals = new Map<string, KitchenMenuTotal>();

  for (const order of orders) {
    for (const line of order.lines) {
      if (line.servedAt) {
        continue;
      }

      const name = formatAdminLineName(line);
      const key = `${line.menuId}:${name}`;
      const total = totals.get(key);

      if (total) {
        total.quantity += line.quantity;
      } else {
        totals.set(key, { menuId: line.menuId, name, quantity: line.quantity });
      }
    }
  }

  return [...totals.values()].sort(
    (left, right) =>
      right.quantity - left.quantity || left.name.localeCompare(right.name, "ko"),
  );
};
