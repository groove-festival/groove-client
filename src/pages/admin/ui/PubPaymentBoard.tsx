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
  // aria-label을 단 section이라 스크린리더가 "입금확인중 주문" 묶음으로 읽고,
  // 테스트도 묶음 단위로 확인할 수 있다.
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

// 결제 확인 전 주문만 모아 통장과 대조하는 화면이다 (FR-1.8-1, FR-1.8-2).
// 결제완료로 올린 주문은 주방 화면으로 넘어가고, 끝난 주문은 주문 내역에서 본다.
export interface PubPaymentBoardProps {
  // 담당 테이블 필터. 비어 있으면 전체.
  visibleTables: number[];
}

export const PubPaymentBoard = ({ visibleTables }: PubPaymentBoardProps) => {
  const orders = useAdminOrders();
  const statusChange = useOrderStatusChange();
  const [isStaleOpen, setIsStaleOpen] = useState(false);

  // 폴링이 데이터를 받아온 시각을 "지금"으로 쓴다. 렌더 중에 Date.now()를
  // 부르면 리렌더마다 기준이 흔들려 같은 주문이 접혔다 펴졌다 한다. 아직
  // 받아온 적이 없으면 0이라 아무것도 오래된 것으로 치지 않는다.
  const now = orders.dataUpdatedAt;
  const allOrders = orders.data ?? [];
  const board = partitionAdminOrders(
    filterOrdersByTables(allOrders, visibleTables),
    now,
  );
  // 순번은 필터와 상관없이 주막 전체 기준이다. 필터를 바꿔도 같은 주문은 같은 번호다.
  const orderNumbers = numberOrdersByArrival(allOrders);
  // 필터가 걸린 채 비어 있으면 주문이 없는 게 아니라 안 보이는 것일 수 있다.
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
