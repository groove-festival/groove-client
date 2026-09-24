import { useCallback, useState } from "react";

import { useChangeOrderStatus } from "../api/changeOrderStatus";
import { useAdminOrders } from "../api/getAdminOrders";
import { orderStatusErrorMessage } from "../model/adminErrorMessages";
import {
  type AdminOrder,
  type AdminOrderStatus,
  adminOrderStatusLabels,
  isStaleDepositClaim,
  partitionAdminOrders,
} from "../model/adminOrder";
import { ConfirmDialog } from "./ConfirmDialog";
import { PubOrderCard } from "./PubOrderCard";

interface PendingCancel {
  order: AdminOrder;
  status: AdminOrderStatus;
}

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

// 결제 확인 전과 결제가 확인돼 조리에 들어간 주문을 갈라 보여준다 (FR-1.8-2).
// 취소는 되돌릴 수 없어 확인 다이얼로그를 세운다.
export const PubOrderBoard = () => {
  const orders = useAdminOrders();
  const changeStatus = useChangeOrderStatus();

  const [pendingCancel, setPendingCancel] = useState<PendingCancel | null>(null);
  const [isStaleOpen, setIsStaleOpen] = useState(false);
  const [isClosedOpen, setIsClosedOpen] = useState(false);

  // 폴링이 데이터를 받아온 시각을 "지금"으로 쓴다. 렌더 중에 Date.now()를
  // 부르면 리렌더마다 기준이 흔들려 같은 주문이 접혔다 펴졌다 한다. 아직
  // 받아온 적이 없으면 0이라 아무것도 오래된 것으로 치지 않는다.
  const now = orders.dataUpdatedAt;
  const board = partitionAdminOrders(orders.data ?? [], now);

  // 5초 폴링 때문에 이 컴포넌트는 계속 다시 그려진다. 인라인 화살표를 그대로
  // 넘기면 ConfirmDialog의 포커스 effect가 매 폴링마다 다시 돌아 사용자의
  // 포커스를 다이얼로그로 끌어당긴다.
  const closeCancelDialog = useCallback(() => setPendingCancel(null), []);

  const onChangeStatus = (order: AdminOrder, status: AdminOrderStatus) => {
    if (status === "CANCELED") {
      setPendingCancel({ order, status });
      return;
    }

    changeStatus.mutate({ orderId: order.id, status });
  };

  const renderCard = (order: AdminOrder) => (
    <PubOrderCard
      isHighlighted={isStaleDepositClaim(order, now)}
      isPending={changeStatus.isPending}
      key={order.id}
      onChangeStatus={onChangeStatus}
      order={order}
    />
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">주문</h2>
        <p className="text-xs text-[#a2a2a2]">
          {orders.isPending && "주문을 불러오는 중…"}
          {orders.isError && "주문을 불러오지 못했어요. 5초 뒤 다시 시도해요."}
          {orders.isSuccess &&
            "5초마다 자동으로 갱신돼요. 입금자명과 금액을 실제 입금 내역과 대조한 뒤 결제완료로 올려 주세요."}
        </p>
      </div>

      {changeStatus.isError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {orderStatusErrorMessage(changeStatus.error)}
        </p>
      )}

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

        <div className="border-t border-[#3a3a3a] pt-4">
          <OrderGroup
            description="결제완료가 조리 착수 신호예요. 서빙이 끝나면 서빙완료로 올려 주세요."
            emptyLabel="조리 중인 주문이 없어요."
            orders={board.paid}
            renderCard={renderCard}
            title="결제완료 · 조리 중"
          />
        </div>

        {board.closed.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-[#3a3a3a] pt-4">
            <button
              className="flex items-center justify-between rounded-lg bg-[#2c2c2c] px-3 py-2 text-xs text-[#a2a2a2]"
              onClick={() => setIsClosedOpen((open) => !open)}
              type="button"
            >
              <span>완료·취소된 주문 {board.closed.length}건</span>
              <span aria-hidden="true">{isClosedOpen ? "접기" : "펼치기"}</span>
            </button>
            {isClosedOpen && board.closed.map(renderCard)}
          </div>
        )}
      </div>

      <ConfirmDialog
        confirmLabel="주문취소"
        danger
        description={
          pendingCancel
            ? `${pendingCancel.order.tableNumber}번 테이블 · ${adminOrderStatusLabels[pendingCancel.order.status]} 주문이에요. 취소하면 되돌릴 수 없어요.`
            : undefined
        }
        onCancel={closeCancelDialog}
        onConfirm={() => {
          if (pendingCancel) {
            changeStatus.mutate({
              orderId: pendingCancel.order.id,
              status: pendingCancel.status,
            });
          }
          setPendingCancel(null);
        }}
        open={pendingCancel !== null}
        title="이 주문을 취소할까요?"
      />
    </section>
  );
};
