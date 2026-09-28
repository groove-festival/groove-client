import { type AdminOrder, formatAdminLineName } from "./adminOrder";

// 주방 화면은 결제완료(PAID) 주문만 본다. 결제완료가 조리 착수 신호이고
// (FR-1.8), 입금 확인 전 주문을 조리하면 돈을 못 받은 음식이 나간다.
export interface KitchenMenuTotal {
  menuId: number;
  // 옵션을 붙인 이름. 같은 메뉴라도 옵션이 다르면 만드는 법이 달라 따로 센다.
  name: string;
  quantity: number;
}

// 조리 중인 주문 전체에서 아직 나가지 않은 메뉴가 몇 개인지 합친다. 한 번에
// 몰아 굽는 메뉴가 많아 주문 카드를 하나씩 세는 것보다 이 합계를 먼저 본다.
// 많이 밀린 메뉴가 위로 온다.
export const summarizeKitchenMenus = (orders: AdminOrder[]): KitchenMenuTotal[] => {
  const totals = new Map<string, KitchenMenuTotal>();

  for (const order of orders) {
    for (const line of order.lines) {
      // 이미 나간 항목은 더 만들 필요가 없다.
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
