import { useLayoutEffect, useState } from "react";
import { Navigate, useParams } from "react-router";

import { BoothDetailHeader, type BoothOrderDetail } from "@/entities/booth";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";
import { FestivalHeader } from "@/widgets/festival-header";

import { isOrderTableNotFound, useOrderTable } from "../api/getOrderTable";
import { INCOMPLETE_ORDER_BANNER_HEIGHT } from "../config/layout";
import { formatWon } from "../lib/formatWon";
import { getQuantity, isOptionSelected } from "../model/orderCart";
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
import { OrderStorageNotice } from "./OrderStorageNotice";
import { OrderToast } from "./OrderToast";

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
    hasStorageError,
    hasSelectedMenu,
    isPlacingOrder,
    isTransferDialogOpen,
    order,
    placeOrder,
    reopenIncompleteOrder,
    restorationStatus,
    retryOrderRestoration,
    retryOrderStorage,
    screen,
    selectedOptions,
    startAdditionalOrder,
    submitDepositorName,
    toggleItemOption,
    updateDepositorName,
  } = useBoothOrder(booth, tableCode);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const bannerOffset = hasIncompleteOrder ? INCOMPLETE_ORDER_BANNER_HEIGHT : 0;
  const isBottomBarVisible = hasSelectedMenu;
  const hasVisibleStorageNotice = hasStorageError && !isTransferDialogOpen;
  const contentTopOffset = hasVisibleStorageNotice ? 0 : 100 + bannerOffset;
  const storageNotice = hasStorageError ? (
    <OrderStorageNotice onRetry={retryOrderStorage} />
  ) : undefined;

  const handleBottomBarClick = () => {
    if (canPlaceOrder) {
      placeOrder();
    }
  };

  const getBottomBarLabel = () =>
    isPlacingOrder ? "주문하는 중…" : `${formatWon(cartTotal)} 주문하기`;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screen]);

  if (restorationStatus === "loading") {
    return <LoadingFallback />;
  }

  if (restorationStatus === "failed") {
    return <NetworkErrorFallback onReload={retryOrderRestoration} />;
  }

  return (
    <div
      className="relative min-h-dvh bg-[#1c1c1c] text-[#fcfcfc]"
      data-clarity-mask="true"
    >
      {hasIncompleteOrder && <IncompleteOrderBanner onOpen={reopenIncompleteOrder} />}

      <FestivalHeader
        isLogoLinked={false}
        showMenuButton={false}
        topOffset={bannerOffset}
      />

      {hasVisibleStorageNotice && (
        <div className="px-4 pb-6" style={{ paddingTop: 100 + bannerOffset }}>
          {storageNotice}
        </div>
      )}

      {(screen === "menu" || screen === "canceled") && (
        <main
          className={`px-4 ${isBottomBarVisible ? "pb-[89px]" : ""}`}
          style={{ paddingTop: contentTopOffset }}
        >
          <BoothDetailHeader booth={booth} />

          <hr className="mt-6 border-t border-[#565656]" />

          <div className="mt-6 flex flex-col gap-8">
            {booth.separateChargeItems.length > 0 && (
              <div className="flex flex-col gap-4">
                <p
                  className="px-2 text-sm leading-[17px] font-semibold text-[#cfcfcf]"
                  data-testid="separate-charge-notice"
                >
                  * 상차림비는 직접 담아 주세요.
                  <br />
                  같은 테이블에서 이미 냈다면 담지 않아도 돼요.
                </p>
                <ul
                  aria-label="상차림비"
                  className="rounded-3xl border border-[#fcfcfc]"
                >
                  {booth.separateChargeItems.map((item) => (
                    <OrderMenuItemRow
                      className="border-b border-[#767676] last:border-b-0"
                      insetClassName="pr-3 pl-5"
                      isOptionSelected={(optionId) =>
                        isOptionSelected(selectedOptions, item, optionId)
                      }
                      item={item}
                      key={item.id}
                      onChangeQuantity={changeItemQuantity}
                      onToggleOption={toggleItemOption}
                      quantity={getQuantity(cart, item)}
                      showDescription
                    />
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-8">
              {booth.menuSections.map((section) => (
                <OrderMenuSection
                  cart={cart}
                  key={section.id}
                  onChangeQuantity={changeItemQuantity}
                  onToggleOption={toggleItemOption}
                  section={section}
                  selectedOptions={selectedOptions}
                />
              ))}
            </div>
          </div>

          <OrderBottomBar
            isDisabled={isPlacingOrder}
            isVisible={isBottomBarVisible}
            label={getBottomBarLabel()}
            onClick={handleBottomBarClick}
          />
        </main>
      )}

      {screen === "depositClaimed" && order && (
        <main className="px-4 pb-6" style={{ paddingTop: contentTopOffset }}>
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
              <li>직원이 입금 확인을 완료하기 전까지 입금자명 수정이 가능해요</li>
            </ul>
            <OrderActionButton
              label="입금자명 수정하기"
              onClick={() => setIsEditDialogOpen(true)}
            />
          </div>
        </main>
      )}

      {screen === "cashPending" && order && (
        <main className="px-4 pb-12" style={{ paddingTop: contentTopOffset }}>
          <OrderStatusScreen
            progress={DEPOSIT_PENDING_PROGRESS}
            subtitle="직원이 자리로 가고 있어요. 조금만 기다려 주세요."
            title="현금 준비 안내"
          >
            <OrderReceipt
              account={order.account}
              boothName={booth.name}
              order={order}
            />
          </OrderStatusScreen>
        </main>
      )}

      {screen === "completed" && order && (
        <main className="px-4 pb-6" style={{ paddingTop: contentTopOffset }}>
          <OrderStatusScreen
            progress={1}
            subtitle="조리 중이에요. 잠시만 기다려주세요."
            title="주문이 완료되었어요!"
          >
            <OrderReceipt
              account={order.account}
              boothName={booth.name}
              order={order}
            />
          </OrderStatusScreen>
          <div className="mt-12">
            <OrderActionButton label="추가 주문하기" onClick={startAdditionalOrder} />
          </div>
        </main>
      )}

      {screen === "served" && order && (
        <main className="px-4 pb-6" style={{ paddingTop: contentTopOffset }}>
          <OrderStatusScreen
            progress={1}
            subtitle="맛있게 드세요!"
            title="음식이 나왔어요"
          >
            <OrderReceipt
              account={order.account}
              boothName={booth.name}
              order={order}
            />
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
          notice={storageNotice}
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

  const { booth, isOrderable, tableCode: resolvedTableCode } = tableQuery.data;

  if (booth.boothCode !== boothId || resolvedTableCode !== tableCode) {
    return (
      <Navigate
        replace
        to={`/pub/${encodeURIComponent(booth.boothCode)}/${encodeURIComponent(resolvedTableCode)}`}
      />
    );
  }

  if (!isOrderable) {
    return <Navigate replace to={`/pub/${encodeURIComponent(boothId)}`} />;
  }

  return (
    <BoothOrderContent
      booth={booth}
      key={`${booth.boothCode}:${tableCode}`}
      tableCode={tableCode}
    />
  );
}
