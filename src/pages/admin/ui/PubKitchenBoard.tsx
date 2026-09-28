import { useAdminOrders } from "../api/getAdminOrders";
import { formatOrderTime } from "../lib/formatOrderText";
import { type AdminOrder, partitionAdminOrders } from "../model/adminOrder";
import {
  isLateKitchenOrder,
  minutesSinceOrdered,
  summarizeKitchenMenus,
} from "../model/kitchenQueue";
import { useOrderStatusChange } from "../model/useOrderStatusChange";
import { OrderStatusError } from "./OrderStatusError";

interface KitchenOrderCardProps {
  isPending: boolean;
  now: number;
  onServe: (order: AdminOrder) => void;
  order: AdminOrder;
}

// 조리하는 사람이 멀리서도 읽을 수 있게 테이블 번호와 메뉴를 크게 쓴다. 금액·
// 입금자명은 주방에 필요 없고 개인정보라 싣지 않는다. 취소는 주방에서 누를
// 일이 아니어서 서빙완료 하나만 둔다 — 취소는 주문 내역 화면에서 한다.
const KitchenOrderCard = ({
  isPending,
  now,
  onServe,
  order,
}: KitchenOrderCardProps) => {
  const minutes = minutesSinceOrdered(order, now);
  const isLate = isLateKitchenOrder(order, now);

  return (
    <article
      aria-label={`${order.tableNumber}번 테이블 조리 주문`}
      className={`flex flex-col gap-3 rounded-xl p-4 ${
        isLate ? "bg-[#3a2a12] ring-1 ring-[#ffb020]" : "bg-[#323232]"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-[#fcfcfc]">{order.tableNumber}번</span>
        <span
          className={`text-sm font-semibold ${isLate ? "text-[#ffb020]" : "text-[#a2a2a2]"}`}
        >
          {formatOrderTime(order.orderedAt)}
          {minutes !== null && ` · ${minutes}분 전`}
        </span>
      </div>

      <ul className="flex flex-col gap-1 border-t border-[#4a4a4a] pt-3">
        {order.lines.map((line) => (
          <li
            className="flex justify-between gap-3 text-lg font-semibold text-[#fcfcfc]"
            key={line.menuId}
          >
            <span className="break-keep">{line.name}</span>
            <span className="shrink-0 text-[#00ffff]">× {line.quantity}</span>
          </li>
        ))}
      </ul>

      <button
        className="h-12 rounded-lg bg-[#5d00ff] text-base font-bold text-[#fcfcfc] disabled:opacity-60"
        disabled={isPending}
        onClick={() => onServe(order)}
        type="button"
      >
        서빙완료
      </button>
    </article>
  );
};

// 결제가 확인돼 조리에 들어간 주문만 보여주는 주방용 화면 (FR-1.8). 입금
// 확인과 다른 기기에서 띄워 두는 것을 전제로, 먼저 들어온 주문이 위에 온다.
export const PubKitchenBoard = () => {
  const orders = useAdminOrders();
  const statusChange = useOrderStatusChange();

  const now = orders.dataUpdatedAt;
  const { paid } = partitionAdminOrders(orders.data ?? [], now);
  const menuTotals = summarizeKitchenMenus(paid);

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-[#fcfcfc]">주방 · 조리 대기</h2>
          <span className="text-xs text-[#a2a2a2]">{paid.length}건</span>
        </div>
        <p className="text-xs text-[#a2a2a2]">
          {orders.isPending && "주문을 불러오는 중…"}
          {orders.isError && "주문을 불러오지 못했어요. 5초 뒤 다시 시도해요."}
          {orders.isSuccess &&
            "결제가 확인된 주문만 보여요. 5초마다 자동으로 갱신돼요. 음식이 나가면 서빙완료를 눌러 주세요."}
        </p>
      </div>

      <OrderStatusError statusChange={statusChange} />

      {menuTotals.length > 0 && (
        <section aria-label="만들 메뉴 합계" className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-[#fcfcfc]">만들 메뉴 합계</h3>
          <ul className="flex flex-wrap gap-2">
            {menuTotals.map((menu) => (
              <li
                className="rounded-lg bg-[#1c1c1c] px-3 py-2 text-sm font-semibold text-[#fcfcfc]"
                key={menu.menuId}
              >
                {menu.name} <span className="text-[#00ffff]">{menu.quantity}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {orders.isSuccess && paid.length === 0 ? (
        <p className="rounded-xl bg-[#2c2c2c] p-4 text-sm text-[#7a7a7a]">
          조리할 주문이 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {paid.map((order) => (
            <KitchenOrderCard
              isPending={statusChange.changeStatus.isPending}
              key={order.id}
              now={now}
              onServe={(target) =>
                statusChange.requestStatusChange(target, "COMPLETED")
              }
              order={order}
            />
          ))}
        </div>
      )}
    </section>
  );
};
