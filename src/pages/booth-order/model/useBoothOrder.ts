import { useState } from "react";

import { type BoothMenuItem, type BoothOrderDetail } from "@/entities/booth";

import { getOrderScreen, isAwaitingDepositorName, type PlacedOrder } from "./order";
import {
  buildOrderLines,
  changeQuantity,
  createInitialCart,
  getOrderTotal,
  hasSelectedMenu,
  type OrderCart,
} from "./orderCart";
import { getOrderStorageKey, readStoredOrder, writeStoredOrder } from "./orderStorage";

const createOrderId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `order-${Date.now()}`;

// 장바구니와 주문 상태 전이를 한 흐름으로 관리한다. API 연동 전까지는 주문을
// localStorage 목에 저장해, 결제를 끝내지 않고 나갔다 와도 복구할 수 있게 한다.
export const useBoothOrder = (booth: BoothOrderDetail, tableCode: string) => {
  const storageKey = getOrderStorageKey(booth.boothCode, tableCode);
  const [cart, setCart] = useState<OrderCart>(() => createInitialCart(booth));
  const [order, setOrder] = useState<PlacedOrder | null>(() =>
    readStoredOrder(storageKey),
  );
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const saveOrder = (nextOrder: PlacedOrder | null) => {
    writeStoredOrder(storageKey, nextOrder);
    setOrder(nextOrder);
  };

  const resetCart = () => setCart(createInitialCart(booth));

  const updateOrder = (changes: Partial<PlacedOrder>) => {
    if (order) {
      saveOrder({ ...order, ...changes });
    }
  };

  const cartLines = buildOrderLines(booth, cart);

  return {
    canPlaceOrder: hasSelectedMenu(booth, cart),
    cart,
    cartTotal: getOrderTotal(cartLines),
    hasIncompleteOrder: isAwaitingDepositorName(order) && !isTransferDialogOpen,
    isTransferDialogOpen,
    order,
    screen: getOrderScreen(order),
    changeItemQuantity: (item: BoothMenuItem, delta: number) =>
      setCart((current) => changeQuantity(current, item, delta)),
    // 새 주문은 아직 입금자명을 내지 않은 이전 주문을 대신한다.
    placeOrder: () => {
      saveOrder({
        depositorName: null,
        id: createOrderId(),
        lines: cartLines,
        paymentMethod: "TRANSFER",
        status: "PENDING_DEPOSIT",
        totalPrice: getOrderTotal(cartLines),
      });
      setIsTransferDialogOpen(true);
    },
    reopenIncompleteOrder: () => setIsTransferDialogOpen(true),
    closeTransferDialog: () => setIsTransferDialogOpen(false),
    submitDepositorName: (depositorName: string) => {
      updateOrder({
        depositorName,
        paymentMethod: "TRANSFER",
        status: "DEPOSIT_CLAIMED",
      });
      setIsTransferDialogOpen(false);
      resetCart();
    },
    // 현금 선언은 상태를 바꾸지 않고 결제수단만 바꾼다 (FR-1.4-6).
    chooseCashPayment: () => {
      updateOrder({ paymentMethod: "CASH" });
      setIsTransferDialogOpen(false);
      resetCart();
    },
    updateDepositorName: (depositorName: string) => updateOrder({ depositorName }),
    startAdditionalOrder: () => {
      saveOrder(null);
      resetCart();
    },
  };
};
