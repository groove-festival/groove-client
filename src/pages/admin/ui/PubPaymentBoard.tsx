import { useState } from "react";

import { useAdminOrders } from "../api/getAdminOrders";
import {
  type AdminOrder,
  isStaleDepositClaim,
  partitionAdminOrders,
} from "../model/adminOrder";
import { useOrderStatusChange } from "../model/useOrderStatusChange";
import { OrderCancelDialog } from "./OrderCancelDialog";
import { OrderStatusError } from "./OrderStatusError";
import { PubOrderCard } from "./PubOrderCard";

interface OrderGroupProps {
  description?: string;
  emptyLabel: string;
  orders: AdminOrder[];
  renderCard: (order: AdminOrder) => React.ReactNode;
  title: string;
}

const OrderGroup = ({
  description,
  emptyLabel,
  orders,
  renderCard,
  title,
}: OrderGroupProps) => (
  // aria-label을 단 section이라 스크린리더가 "입금확인중 주문" 묶음으로 읽고,
  // 테스트도 묶음 단위로 확인할 수 있다.
  <section aria-label={title} className="flex flex-col gap-2">
    <div className="flex items-baseline gap-2">
      <h3 className="text-xs font-bold text-[#fcfcfc]">{title}</h3>
      <span className="text-xs text-[#a2a2a2]">{orders.length}건</span>
    </div>
    {description && <p className="text-[11px] text-[#7a7a7a]">{description}</p>}
    {orders.length === 0 ? (
      <p className="rounded-xl bg-[#2c2c2c] p-3 text-xs text-[#7a7a7a]">{emptyLabel}</p>
    ) : (
      orders.map(renderCard)
    )}
  </section>
);

// 결제 확인 전 주문만 모아 통장과 대조하는 화면이다 (FR-1.8-1, FR-1.8-2).
// 결제완료로 올린 주문은 주방 화면으로 넘어가고, 끝난 주문은 주문 내역에서 본다.
export const PubPaymentBoard = () => {
  const orders = useAdminOrders();
  const statusChange = useOrderStatusChange();
  const [isStaleOpen, setIsStaleOpen] = useState(false);

  // 폴링이 데이터를 받아온 시각을 "지금"으로 쓴다. 렌더 중에 Date.now()를
  // 부르면 리렌더마다 기준이 흔들려 같은 주문이 접혔다 펴졌다 한다. 아직
  // 받아온 적이 없으면 0이라 아무것도 오래된 것으로 치지 않는다.
  const now = orders.dataUpdatedAt;
  const board = partitionAdminOrders(orders.data ?? [], now);

  const renderCard = (order: AdminOrder) => (
    <PubOrderCard
      isHighlighted={isStaleDepositClaim(order, now)}
      isPending={statusChange.changeStatus.isPending}
      key={order.id}
      onChangeStatus={statusChange.requestStatusChange}
      order={order}
    />
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">입금 확인</h2>
        <p className="text-xs text-[#a2a2a2]">
          {orders.isPending && "주문을 불러오는 중…"}
          {orders.isError && "주문을 불러오지 못했어요. 5초 뒤 다시 시도해요."}
          {orders.isSuccess &&
            "5초마다 자동으로 갱신돼요. 입금자명과 금액을 실제 입금 내역과 대조한 뒤 결제완료로 올려 주세요. 결제완료된 주문은 주방 화면으로 넘어가요."}
        </p>
      </div>

      <OrderStatusError statusChange={statusChange} />

      <div className="flex flex-col gap-4">
        <OrderGroup
          description="입금자명을 제출한 주문이에요. 통장 입금 내역과 대조해 주세요."
          emptyLabel="대조할 주문이 없어요."
          orders={board.depositClaimed}
          renderCard={renderCard}
          title="입금확인중"
        />

        <OrderGroup
          description="아직 입금자명을 내지 않은 주문이에요."
          emptyLabel="입금 대기 중인 주문이 없어요."
          orders={board.pendingDeposit}
          renderCard={renderCard}
          title="입금대기"
        />

        {board.stalePendingDeposit.length > 0 && (
          <div className="flex flex-col gap-2">
            <button
              className="flex items-center justify-between rounded-lg bg-[#2c2c2c] px-3 py-2 text-xs text-[#a2a2a2]"
              onClick={() => setIsStaleOpen((open) => !open)}
              type="button"
            >
              <span>
                30분 넘게 입금이 없는 주문 {board.stalePendingDeposit.length}건
              </span>
              <span aria-hidden="true">{isStaleOpen ? "접기" : "펼치기"}</span>
            </button>
            {isStaleOpen && board.stalePendingDeposit.map(renderCard)}
          </div>
        )}
      </div>

      <OrderCancelDialog statusChange={statusChange} />
    </section>
  );
};
