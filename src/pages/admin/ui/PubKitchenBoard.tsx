import { useAdminOrders } from "../api/getAdminOrders";
import { formatOrderTime } from "../lib/formatOrderText";
import { type AdminOrder, partitionAdminOrders } from "../model/adminOrder";
import { summarizeKitchenMenus } from "../model/kitchenQueue";
import {
  KITCHEN_WAIT,
  minutesSince,
  numberOrdersByArrival,
  type WaitTone,
  waitToneOf,
} from "../model/orderTiming";
import { useOrderStatusChange } from "../model/useOrderStatusChange";
import { OrderStatusError } from "./OrderStatusError";
import { WaitChip } from "./WaitChip";

// 테이블 번호 칸의 색이 곧 대기 시간이다. 주방에서 멀리서도 빨간 칸부터 집는다.
const tableBlockClasses: Record<WaitTone, string> = {
  fresh: "bg-[#3a3a3a] text-[#fcfcfc]",
  waiting: "bg-[#ffb020] text-[#0b0b0b]",
  late: "bg-[#ff5c5c] text-[#0b0b0b]",
};

interface KitchenTicketProps {
  isPending: boolean;
  now: number;
  onServe: (order: AdminOrder) => void;
  order: AdminOrder;
  orderNumber: number | undefined;
}

// 조리 주문 한 건을 한 줄짜리 티켓으로. 왼쪽 테이블 번호, 가운데 만들 메뉴,
// 오른쪽 서빙완료. 금액·입금자명은 주방에 필요 없고 개인정보라 싣지 않는다.
// 취소는 주방에서 누를 일이 아니라 주문 내역 화면에만 둔다.
const KitchenTicket = ({
  isPending,
  now,
  onServe,
  order,
  orderNumber,
}: KitchenTicketProps) => {
  const minutes = minutesSince(order.orderedAt, now);
  const tone = waitToneOf(minutes, KITCHEN_WAIT);

  return (
    <article
      aria-label={`${order.tableNumber}번 테이블 조리 주문`}
      className="flex items-stretch gap-2.5 rounded-xl bg-[#2c2c2c] p-2"
    >
      <div
        className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-lg ${tableBlockClasses[tone]}`}
      >
        <span className="text-2xl leading-none font-bold tabular-nums">
          {order.tableNumber}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold">번 테이블</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
        <div className="flex items-center gap-1.5 text-[11px] text-[#7a7a7a] tabular-nums">
          {orderNumber !== undefined && (
            <span className="font-semibold">#{orderNumber}</span>
          )}
          <span>{formatOrderTime(order.orderedAt)}</span>
          <WaitChip minutes={minutes} tone={tone} />
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-[15px] leading-snug font-semibold text-[#fcfcfc]">
          {order.lines.map((line) => (
            <li className="break-keep" key={line.menuId}>
              {line.name} <span className="text-[#00ffff]">×{line.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="w-[72px] shrink-0 rounded-lg bg-[#5d00ff] text-sm font-bold text-[#fcfcfc] disabled:opacity-60"
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
  const allOrders = orders.data ?? [];
  const { paid } = partitionAdminOrders(allOrders, now);
  const orderNumbers = numberOrdersByArrival(allOrders);
  const menuTotals = summarizeKitchenMenus(paid);

  return (
    <section aria-label="주방" className="flex flex-col gap-4">
      <p className="px-1 text-xs leading-relaxed text-[#a2a2a2]">
        {orders.isPending && "주문을 불러오는 중…"}
        {orders.isError && "주문을 불러오지 못했어요. 5초 뒤 다시 시도해요."}
        {orders.isSuccess &&
          "결제가 확인된 주문만 보여요. 테이블 칸이 노랑(10분)·빨강(20분)이면 오래 기다린 주문이에요."}
      </p>

      <OrderStatusError statusChange={statusChange} />

      {menuTotals.length > 0 && (
        <section aria-label="만들 메뉴 합계" className="flex flex-col gap-1.5">
          <h3 className="px-1 text-sm font-bold text-[#fcfcfc]">만들 메뉴 합계</h3>
          <ul className="flex flex-wrap gap-1.5">
            {menuTotals.map((menu) => (
              <li
                className="rounded-lg bg-[#262626] px-2.5 py-1.5 text-sm font-semibold text-[#fcfcfc]"
                key={menu.menuId}
              >
                {menu.name} <span className="text-[#00ffff]">{menu.quantity}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="조리 대기" className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-2 px-1">
          <h3 className="text-sm font-bold text-[#fcfcfc]">조리 대기</h3>
          <span className="text-xs font-semibold text-[#00ffff]">{paid.length}건</span>
          <span className="ml-auto text-[11px] text-[#7a7a7a]">먼저 들어온 순 ↓</span>
        </div>
        {orders.isSuccess && paid.length === 0 ? (
          <p className="rounded-xl bg-[#262626] px-3 py-4 text-sm text-[#7a7a7a]">
            조리할 주문이 없어요.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {paid.map((order) => (
              <KitchenTicket
                isPending={statusChange.changeStatus.isPending}
                key={order.id}
                now={now}
                onServe={(target) =>
                  statusChange.requestStatusChange(target, "COMPLETED")
                }
                order={order}
                orderNumber={orderNumbers.get(order.id)}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
};
