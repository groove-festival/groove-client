import { useLayoutEffect, useState } from "react";
import { Navigate, useParams } from "react-router";

import { BoothDetailHeader, type BoothOrderDetail } from "@/entities/booth";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";
import { FestivalHeader } from "@/widgets/festival-header";

import { isOrderTableNotFound, useOrderTable } from "../api/getOrderTable";
import { INCOMPLETE_ORDER_BANNER_HEIGHT } from "../config/layout";
import { formatWon } from "../lib/formatWon";
import { getQuantity } from "../model/orderCart";
import { useBoothOrder } from "../model/useBoothOrder";
import { BankTransferDialog } from "./BankTransferDialog";
import { DepositorNameEditDialog } from "./DepositorNameEditDialog";
import { IncompleteOrderBanner } from "./IncompleteOrderBanner";
import { OrderActionButton } from "./OrderActionButton";
import { OrderBottomBar } from "./OrderBottomBar";
import { OrderCanceledDialog } from "./OrderCanceledDialog";
import { OrderMenuItemRow } from "./OrderMenuItemRow";
import { OrderMenuSection } from "./OrderMenuSection";
import { OrderReceipt } from "./OrderReceipt";
import { OrderStatusScreen } from "./OrderStatusScreen";
import { OrderToast } from "./OrderToast";

// 디자인의 진행바 채움 폭(361px 트랙 안 354px 중 183px).
const DEPOSIT_PENDING_PROGRESS = 183 / 354;

const BoothOrderContent = ({
  booth,
  tableCode,
}: {
  booth: BoothOrderDetail;
  tableCode: string;
}) => {
  const {
    canPlaceOrder,
    cart,
    cartTotal,
    changeItemQuantity,
    chooseCashPayment,
    closeTransferDialog,
    dismissCanceledOrder,
    dismissErrorToast,
    errorToast,
    hasIncompleteOrder,
    isPlacingOrder,
    isTransferDialogOpen,
    order,
    placeOrder,
    reopenIncompleteOrder,
    screen,
    startAdditionalOrder,
    submitDepositorName,
    updateDepositorName,
  } = useBoothOrder(booth, tableCode);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const bannerOffset = hasIncompleteOrder ? INCOMPLETE_ORDER_BANNER_HEIGHT : 0;

  // 주문 경로는 RootLayout 밖에 있어 경로 변경 시 스크롤 초기화를 받지 못한다.
  // 같은 경로 안에서 주문 단계가 바뀌면 새 화면을 맨 위부터 보여준다.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screen]);

  return (
    <div
      className="relative min-h-dvh bg-[#1c1c1c] text-[#fcfcfc]"
      data-clarity-mask="true"
    >
      {hasIncompleteOrder && <IncompleteOrderBanner onOpen={reopenIncompleteOrder} />}
      {/* 디자인팀 논의 전 임시 결정: 주문 흐름에서는 전체 메뉴와 로고 홈 링크를 막는다. */}
      <FestivalHeader
        isLogoLinked={false}
        showMenuButton={false}
        topOffset={bannerOffset}
      />

      {(screen === "menu" || screen === "canceled") && (
        <main
          className={`px-4 ${canPlaceOrder ? "pb-[89px]" : ""}`}
          style={{ paddingTop: 100 + bannerOffset }}
        >
          <BoothDetailHeader booth={booth} />

          <div className="mt-12 flex flex-col gap-10">
            {booth.separateChargeItem && (
              <ul aria-label="상차림비">
                <OrderMenuItemRow
                  className="rounded-3xl border border-[#fcfcfc]"
                  item={booth.separateChargeItem}
                  onChangeQuantity={changeItemQuantity}
                  quantity={getQuantity(cart, booth.separateChargeItem)}
                />
              </ul>
            )}
            <div className="flex flex-col gap-12">
              {booth.menuSections.map((section) => (
                <OrderMenuSection
                  cart={cart}
                  key={section.id}
                  onChangeQuantity={changeItemQuantity}
                  section={section}
                />
              ))}
            </div>
          </div>

          <OrderBottomBar
            isVisible={canPlaceOrder}
            label={isPlacingOrder ? "주문하는 중…" : `${formatWon(cartTotal)} 주문하기`}
            onClick={placeOrder}
          />
        </main>
      )}

      {screen === "depositClaimed" && order && (
        <main className="px-4 pt-32 pb-6">
          <OrderStatusScreen
            progress={DEPOSIT_PENDING_PROGRESS}
            subtitle="곧 조리가 시작 돼요. 조금만 기다려주세요."
            title="입금 확인 중"
          >
            <OrderReceipt
              account={order.account}
              boothName={booth.name}
              canCopyAccountNumber
              order={order}
            />
          </OrderStatusScreen>
          <div className="mt-12 flex flex-col gap-3">
            <ul className="list-disc pl-[18px] text-xs leading-[14px] text-[#a2a2a2]">
              <li>직원이 입금 확인을 완료하기 전까지 수정 및 재제출이 가능해요</li>
            </ul>
            <OrderActionButton
              label="입금자명 수정하기"
              onClick={() => setIsEditDialogOpen(true)}
            />
          </div>
        </main>
      )}

      {screen === "cashPending" && order && (
        <main className="px-4 pt-32 pb-12">
          <OrderStatusScreen
            progress={DEPOSIT_PENDING_PROGRESS}
            subtitle="직원이 자리로 가고 있어요. 조금만 기다려 주세요."
            title="현금 준비 안내"
          >
            <OrderReceipt account={order.account} boothName={booth.name} order={order} />
          </OrderStatusScreen>
        </main>
      )}

      {screen === "completed" && order && (
        <main className="px-4 pt-32 pb-6">
          <OrderStatusScreen
            progress={1}
            subtitle="조리 중이에요. 잠시만 기다려주세요."
            title="주문이 완료되었어요!"
          >
            <OrderReceipt account={order.account} boothName={booth.name} order={order} />
          </OrderStatusScreen>
          <div className="mt-12">
            <OrderActionButton label="추가 주문하기" onClick={startAdditionalOrder} />
          </div>
        </main>
      )}

      {screen === "canceled" && <OrderCanceledDialog onClose={dismissCanceledOrder} />}

      {isTransferDialogOpen && order && (
        <BankTransferDialog
          account={order.account}
          onChooseCash={chooseCashPayment}
          onClose={closeTransferDialog}
          onSubmitDepositorName={submitDepositorName}
        />
      )}

      {isEditDialogOpen && order && (
        <DepositorNameEditDialog
          initialDepositorName={order.depositorName ?? ""}
          onCancel={() => setIsEditDialogOpen(false)}
          onSubmit={(depositorName) => {
            updateDepositorName(depositorName);
            setIsEditDialogOpen(false);
          }}
        />
      )}

      <OrderToast onDismiss={dismissErrorToast} toast={errorToast} />
    </div>
  );
};

export default function BoothOrderPage() {
  const { boothId, tableCode } = useParams<{ boothId: string; tableCode: string }>();
  const tableQuery = useOrderTable(boothId, tableCode);

  // 없는 부스·없는 테이블은 구분해 안내하지 않는다 (테이블 추측 공격 방어).
  if (
    !boothId ||
    !tableCode ||
    (tableQuery.isError && isOrderTableNotFound(tableQuery.error))
  ) {
    return <Navigate replace to="/pub" />;
  }

  if (tableQuery.isPending) {
    return <LoadingFallback />;
  }

  if (tableQuery.isError) {
    return <NetworkErrorFallback onReload={() => void tableQuery.refetch()} />;
  }

  const { booth, isOrderable } = tableQuery.data;

  // 준비중이면 주문 UI 대신 같은 내용을 읽기 전용으로 보여주는 주막 정보
  // 페이지로 보낸다 (PUB-3 orderable=false).
  if (!isOrderable) {
    return <Navigate replace to={`/pub/${encodeURIComponent(boothId)}`} />;
  }

  // 주막·테이블이 바뀌면 장바구니와 주문 상태를 새로 읽는다.
  return (
    <BoothOrderContent
      booth={booth}
      key={`${booth.boothCode}:${tableCode}`}
      tableCode={tableCode}
    />
  );
}
