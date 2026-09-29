import { useLayoutEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router";

import { BoothDetailHeader, type BoothOrderDetail } from "@/entities/booth";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";
import { FestivalHeader } from "@/widgets/festival-header";

import { isOrderTableNotFound, useOrderTable } from "../api/getOrderTable";
import { INCOMPLETE_ORDER_BANNER_HEIGHT } from "../config/layout";
import { formatWon } from "../lib/formatWon";
import { getMinimumQuantity, getQuantity, isOptionSelected } from "../model/orderCart";
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
    hasSelectedMenu,
    hasSelectedSeparateCharge,
    isAdditionalOrder,
    isPlacingOrder,
    isTransferDialogOpen,
    order,
    placeOrder,
    reopenIncompleteOrder,
    screen,
    selectedOptions,
    startAdditionalOrder,
    submitDepositorName,
    toggleItemOption,
    updateDepositorName,
  } = useBoothOrder(booth, tableCode);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const separateChargeRef = useRef<HTMLDivElement>(null);
  const bannerOffset = hasIncompleteOrder ? INCOMPLETE_ORDER_BANNER_HEIGHT : 0;
  const hasMultipleSeparateCharges = booth.separateChargeItems.length > 1;
  // 메뉴를 담았는데 상차림비를 안 골랐으면 주문 버튼을 띄운 채 상차림비로
  // 안내한다. 버튼을 숨기면 손님은 왜 주문이 안 되는지 알 수 없다.
  const isBottomBarVisible = hasSelectedMenu;

  const handleBottomBarClick = () => {
    if (canPlaceOrder) {
      placeOrder();
      return;
    }

    separateChargeRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "center",
    });
  };

  const getBottomBarLabel = () => {
    if (isPlacingOrder) {
      return "주문하는 중…";
    }

    return hasSelectedSeparateCharge
      ? `${formatWon(cartTotal)} 주문하기`
      : "상차림비를 선택해 주세요";
  };

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
          className={`px-4 ${isBottomBarVisible ? "pb-[89px]" : ""}`}
          style={{ paddingTop: 100 + bannerOffset }}
        >
          <BoothDetailHeader booth={booth} />

          <div className="mt-12 flex flex-col gap-10">
            {booth.separateChargeItems.length > 0 && (
              <div className="flex flex-col gap-3" ref={separateChargeRef}>
                {isAdditionalOrder && (
                  <p className="px-2 text-sm leading-[17px] font-semibold text-[#cfcfcf]">
                    추가 주문이라 상차림비는 빼 두었어요. 일행이 늘었다면 담아 주세요.
                  </p>
                )}
                {hasMultipleSeparateCharges && !hasSelectedSeparateCharge && (
                  <p
                    className={`px-2 text-sm leading-[17px] font-semibold ${
                      hasSelectedMenu ? "text-[#cfff04]" : "text-[#cfcfcf]"
                    }`}
                  >
                    해당하는 상차림비를 선택해 주세요
                  </p>
                )}
                <ul
                  aria-label="상차림비"
                  className="rounded-3xl border border-[#fcfcfc]"
                >
                  {booth.separateChargeItems.map((item) => (
                    <OrderMenuItemRow
                      className="border-b border-[#767676] last:border-b-0"
                      isOptionSelected={(optionId) =>
                        isOptionSelected(selectedOptions, item, optionId)
                      }
                      item={item}
                      key={item.id}
                      minimumQuantity={getMinimumQuantity(
                        booth,
                        item,
                        isAdditionalOrder,
                      )}
                      onChangeQuantity={changeItemQuantity}
                      onToggleOption={toggleItemOption}
                      quantity={getQuantity(cart, item)}
                      showDescription
                    />
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-12">
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
            isVisible={isBottomBarVisible}
            label={getBottomBarLabel()}
            onClick={handleBottomBarClick}
          />
        </main>
      )}

      {screen === "depositClaimed" && order && (
        <main className="px-4 pt-[100px] pb-6">
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
        <main className="px-4 pt-[100px] pb-12">
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
        <main className="px-4 pt-[100px] pb-6">
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
        <main className="px-4 pt-[100px] pb-6">
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

  const { booth, isOrderable, tableCode: resolvedTableCode } = tableQuery.data;

  // 공유 자리의 이전 QR로 들어오면 PUB-3이 오늘 운영하는 주막/테이블을 돌려준다.
  // URL도 정규 주소로 바꿔 장바구니와 주문 상태가 올바른 주막에 묶이게 한다.
  if (booth.boothCode !== boothId || resolvedTableCode !== tableCode) {
    return (
      <Navigate
        replace
        to={`/pub/${encodeURIComponent(booth.boothCode)}/${encodeURIComponent(resolvedTableCode)}`}
      />
    );
  }

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
