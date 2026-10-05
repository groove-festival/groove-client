import { useState } from "react";

import { useAdminOrders } from "../api/getAdminOrders";
import { type AdminOrder, partitionAdminOrders } from "../model/adminOrder";
import { numberOrdersByArrival, PAYMENT_WAIT } from "../model/orderTiming";
import { filterOrdersByTables } from "../model/tableFilter";
import { useOrderStatusChange } from "../model/useOrderStatusChange";
import { OrderCancelDialog } from "./OrderCancelDialog";
import { OrderStatusError } from "./OrderStatusError";
import { PubOrderRow } from "./PubOrderRow";

interface OrderGroupProps {
  description: string;
  emptyLabel: string;
  orders: AdminOrder[];
  renderRow: (order: AdminOrder) => React.ReactNode;
  title: string;
}

const OrderGroup = ({
  description,
  emptyLabel,
  orders,
  renderRow,
  title,
}: OrderGroupProps) => (
  <section aria-label={title} className="flex flex-col gap-1.5">
    <div className="flex items-baseline gap-2 px-1">
      <h3 className="text-sm font-bold text-[#fcfcfc]">{title}</h3>
      <span className="text-xs font-semibold text-[#00ffff]">{orders.length}건</span>
      <span className="ml-auto text-[11px] text-[#7a7a7a]">{description}</span>
    </div>
    {orders.length === 0 ? (
      <p className="rounded-xl bg-[#262626] px-3 py-2.5 text-xs text-[#7a7a7a]">
        {emptyLabel}
      </p>
    ) : (
      <div className="flex flex-col gap-1.5">{orders.map(renderRow)}</div>
    )}
  </section>
);

export interface PubPaymentBoardProps {
  visibleTables: number[];
}

export const PubPaymentBoard = ({ visibleTables }: PubPaymentBoardProps) => {
  const orders = useAdminOrders();
  const statusChange = useOrderStatusChange();
  const [isStaleOpen, setIsStaleOpen] = useState(false);

  const now = orders.dataUpdatedAt;
  const allOrders = orders.data ?? [];
  const board = partitionAdminOrders(
    filterOrdersByTables(allOrders, visibleTables),
    now,
  );

  const orderNumbers = numberOrdersByArrival(allOrders);

  const scope = visibleTables.length > 0 ? "담당 테이블에는 " : "";

  const renderRow = (order: AdminOrder) => (
    <PubOrderRow
      isPending={statusChange.changeStatus.isPending}
      key={order.id}
      now={now}
      onChangeStatus={statusChange.requestStatusChange}
      order={order}
      orderNumber={orderNumbers.get(order.id)}
      waitThresholds={PAYMENT_WAIT}
    />
  );

  return (
    <section aria-label="입금 확인" className="flex flex-col gap-4">
      <p className="px-1 text-xs leading-relaxed text-[#a2a2a2]">
        {orders.isPending && "주문을 불러오는 중…"}
        {orders.isError && "주문을 불러오지 못했어요. 5초 뒤 다시 시도해요."}
        {orders.isSuccess &&
          "통장 입금 내역과 대조한 뒤 결제완료를 누르면 주방으로 넘어가요. 행을 누르면 메뉴·취소가 보여요."}
      </p>

      <OrderStatusError statusChange={statusChange} />

      <OrderGroup
        description="먼저 들어온 순 ↓"
        emptyLabel={`${scope}대조할 주문이 없어요.`}
        orders={board.depositClaimed}
        renderRow={renderRow}
        title="입금확인중"
      />

      <OrderGroup
        description="입금자명 미제출 · 현금"
        emptyLabel={`${scope}입금 대기 중인 주문이 없어요.`}
        orders={board.pendingDeposit}
        renderRow={renderRow}
        title="입금대기"
      />

      {board.stalePendingDeposit.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <button
            aria-expanded={isStaleOpen}
            className="flex items-center justify-between rounded-xl bg-[#262626] px-3 py-2.5 text-xs text-[#a2a2a2]"
            onClick={() => setIsStaleOpen((open) => !open)}
            type="button"
          >
            <span>30분 넘게 입금이 없는 주문 {board.stalePendingDeposit.length}건</span>
            <span aria-hidden="true">{isStaleOpen ? "접기" : "펼치기"}</span>
          </button>
          {isStaleOpen && board.stalePendingDeposit.map(renderRow)}
        </div>
      )}

      <OrderCancelDialog statusChange={statusChange} />
    </section>
  );
};
