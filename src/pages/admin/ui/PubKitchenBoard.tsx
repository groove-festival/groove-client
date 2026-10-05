import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { useChangeOrderItemServed } from "../api/changeOrderItemServed";
import { useAdminOrders } from "../api/getAdminOrders";
import { formatOrderTime } from "../lib/formatOrderText";
import { orderItemServedErrorMessage } from "../model/adminErrorMessages";
import {
  type AdminOrder,
  type AdminOrderLine,
  formatAdminLineName,
  partitionAdminOrders,
} from "../model/adminOrder";
import { summarizeKitchenMenus } from "../model/kitchenQueue";
import {
  KITCHEN_WAIT,
  minutesSince,
  numberOrdersByArrival,
  type WaitTone,
  waitToneOf,
} from "../model/orderTiming";
import { filterOrdersByTables } from "../model/tableFilter";
import { useOrderStatusChange } from "../model/useOrderStatusChange";
import { OrderStatusError } from "./OrderStatusError";
import { WaitChip } from "./WaitChip";

const tableBlockClasses: Record<WaitTone, string> = {
  fresh: "bg-[#3a3a3a] text-[#fcfcfc]",
  waiting: "bg-[#ffb020] text-[#0b0b0b]",
  late: "bg-[#ff5c5c] text-[#0b0b0b]",
};

const KitchenLineName = ({ line }: { line: AdminOrderLine }) => (
  <>
    {line.name}
    {line.options.length > 0 && (
      <span className={line.servedAt ? "" : "text-[#ffd84d]"}>
        {` (${line.options.map((option) => option.label).join(", ")})`}
      </span>
    )}
  </>
);

interface KitchenTicketProps {
  isPending: boolean;
  now: number;
  onServe: (order: AdminOrder) => void;
  onToggleLine: (order: AdminOrder, line: AdminOrderLine) => void;
  order: AdminOrder;
  orderNumber: number | undefined;
}

const KitchenTicket = ({
  isPending,
  now,
  onServe,
  onToggleLine,
  order,
  orderNumber,
}: KitchenTicketProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const minutes = minutesSince(order.orderedAt, now);
  const tone = waitToneOf(minutes, KITCHEN_WAIT);
  const servedCount = order.lines.filter((line) => line.servedAt).length;
  const detailsId = `kitchen-${order.id}-lines`;

  return (
    <article
      aria-label={`${order.tableNumber}번 테이블 조리 주문`}
      className="flex flex-col rounded-xl bg-[#2c2c2c]"
    >
      <div className="flex items-stretch gap-2.5 p-2">
        <div
          className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-lg ${tableBlockClasses[tone]}`}
        >
          <span className="text-2xl leading-none font-bold tabular-nums">
            {order.tableNumber}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold">번 테이블</span>
        </div>

        <button
          aria-controls={detailsId}
          aria-expanded={isExpanded}
          className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5 text-left"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          type="button"
        >
          <span className="flex w-full items-center gap-1.5 text-[11px] text-[#7a7a7a] tabular-nums">
            {orderNumber !== undefined && (
              <span className="font-semibold">#{orderNumber}</span>
            )}
            <span>{formatOrderTime(order.orderedAt)}</span>
            <WaitChip minutes={minutes} tone={tone} />
            {servedCount > 0 && (
              <span className="shrink-0 font-semibold whitespace-nowrap text-[#5fe0a8]">
                {servedCount}/{order.lines.length} 나감
              </span>
            )}
            <ChevronDown
              aria-hidden="true"
              className={`ml-auto shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              size={16}
            />
          </span>
          <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-[15px] leading-snug font-semibold">
            {order.lines.map((line) => (
              <span
                className={`break-keep ${
                  line.servedAt ? "text-[#6a6a6a] line-through" : "text-[#fcfcfc]"
                }`}
                key={line.itemId}
              >
                <KitchenLineName line={line} />{" "}
                <span className={line.servedAt ? "" : "text-[#00ffff]"}>
                  ×{line.quantity}
                </span>
              </span>
            ))}
          </span>
        </button>

        <button
          className="w-[72px] shrink-0 rounded-lg bg-[#5d00ff] text-sm font-bold text-[#fcfcfc] disabled:opacity-60"
          disabled={isPending}
          onClick={() => onServe(order)}
          type="button"
        >
          서빙완료
        </button>
      </div>

      {isExpanded && (
        <ul
          aria-label="메뉴별 서빙 체크"
          className="flex flex-col border-t border-[#3a3a3a] px-2 py-1.5"
          id={detailsId}
        >
          {order.lines.map((line) => {
            const isServed = line.servedAt !== null;

            return (
              <li className="flex items-center gap-2 py-1 pl-1" key={line.itemId}>
                <span
                  className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                    isServed ? "text-[#6a6a6a] line-through" : "text-[#fcfcfc]"
                  }`}
                >
                  <KitchenLineName line={line} /> ×{line.quantity}
                </span>
                {isServed && line.servedAt && (
                  <span className="shrink-0 text-[11px] text-[#7a7a7a] tabular-nums">
                    {formatOrderTime(line.servedAt)}
                  </span>
                )}
                <button
                  aria-label={`${formatAdminLineName(line)} ${isServed ? "서빙 체크 해제" : "서빙 체크"}`}
                  aria-pressed={isServed}
                  className={`flex h-9 w-[72px] shrink-0 items-center justify-center gap-1 rounded-lg text-xs font-bold ${
                    isServed
                      ? "bg-[#1f3a2f] text-[#5fe0a8]"
                      : "border border-[#5d00ff] text-[#c4a6ff]"
                  }`}
                  onClick={() => onToggleLine(order, line)}
                  type="button"
                >
                  {isServed ? (
                    <>
                      <Check aria-hidden="true" size={14} strokeWidth={3} />
                      나감
                    </>
                  ) : (
                    "서빙"
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
};

export interface PubKitchenBoardProps {
  visibleTables: number[];
}

export const PubKitchenBoard = ({ visibleTables }: PubKitchenBoardProps) => {
  const orders = useAdminOrders();
  const statusChange = useOrderStatusChange();
  const itemServed = useChangeOrderItemServed();

  const now = orders.dataUpdatedAt;
  const allOrders = orders.data ?? [];
  const { paid } = partitionAdminOrders(
    filterOrdersByTables(allOrders, visibleTables),
    now,
  );
  const orderNumbers = numberOrdersByArrival(allOrders);
  const menuTotals = summarizeKitchenMenus(paid);

  return (
    <section aria-label="주방" className="flex flex-col gap-4">
      <p className="px-1 text-xs leading-relaxed text-[#a2a2a2]">
        {orders.isPending && "주문을 불러오는 중…"}
        {orders.isError && "주문을 불러오지 못했어요. 5초 뒤 다시 시도해요."}
        {orders.isSuccess &&
          "결제가 확인된 주문만 보여요. 나눠서 나를 땐 주문을 눌러 메뉴별로 체크하세요. 노랑 10분·빨강 20분."}
      </p>

      <OrderStatusError statusChange={statusChange} />
      {itemServed.isError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {orderItemServedErrorMessage(itemServed.error)}
        </p>
      )}

      {menuTotals.length > 0 && (
        <section aria-label="만들 메뉴 합계" className="flex flex-col gap-1.5">
          <h3 className="px-1 text-sm font-bold text-[#fcfcfc]">
            만들 메뉴 합계{" "}
            <span className="text-[11px] font-normal text-[#7a7a7a]">나간 것 제외</span>
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {menuTotals.map((menu) => (
              <li
                className="rounded-lg bg-[#262626] px-2.5 py-1.5 text-sm font-semibold text-[#fcfcfc]"
                key={`${menu.menuId}:${menu.name}`}
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
            {visibleTables.length > 0
              ? "담당 테이블에는 조리할 주문이 없어요."
              : "조리할 주문이 없어요."}
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
                onToggleLine={(target, line) =>
                  itemServed.mutate({
                    itemId: line.itemId,
                    orderId: target.id,
                    served: line.servedAt === null,
                  })
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
