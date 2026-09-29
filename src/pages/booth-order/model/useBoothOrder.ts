import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { type BoothMenuItem, type BoothOrderDetail } from "@/entities/booth";

import { createOrder } from "../api/createOrder";
import { type OrderRequestTarget, useOrder } from "../api/getOrder";
import { orderQueryKeys } from "../api/queryKeys";
import { updateDepositorName } from "../api/updateDepositorName";
import { updatePaymentMethod } from "../api/updatePaymentMethod";
import { getOrderErrorMessage, isUnusableOrder } from "./orderErrorMessages";
import { getOrderScreen, isAwaitingDepositorName, type PlacedOrder } from "./order";
import { createToast, type ToastState } from "./toast";
import {
  buildOrderLines,
  canPlaceOrder,
  changeQuantity,
  clearOptions,
  createInitialCart,
  getOrderTotal,
  getQuantity,
  hasSelectedMenu,
  hasSelectedSeparateCharge,
  type OrderCart,
  type OrderOptionSelection,
  toCreateOrderItems,
  toggleOption,
} from "./orderCart";
import {
  getOrderStorageKey,
  readStoredOrderRef,
  type StoredOrderRef,
  writeStoredOrderRef,
} from "./orderStorage";

// 장바구니와 주문 상태를 한 흐름으로 관리한다. 주문 본문은 서버가 들고 있고
// (PUB-5 폴링) 브라우저에는 "내 주문"을 증명할 식별자와 토큰만 남긴다.
export const useBoothOrder = (booth: BoothOrderDetail, tableCode: string) => {
  const queryClient = useQueryClient();
  const storageKey = getOrderStorageKey(booth.boothCode, tableCode);
  const [cart, setCart] = useState<OrderCart>(createInitialCart);
  const [selectedOptions, setSelectedOptions] = useState<OrderOptionSelection>({});
  const [orderRef, setOrderRef] = useState<StoredOrderRef | null>(() =>
    readStoredOrderRef(storageKey),
  );
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<ToastState | null>(null);

  const target: OrderRequestTarget | null = orderRef
    ? { boothCode: booth.boothCode, tableCode, ...orderRef }
    : null;
  const orderQuery = useOrder(target);
  const order = orderQuery.data ?? null;

  const resetCart = () => {
    setCart(createInitialCart());
    setSelectedOptions({});
  };

  const saveOrderRef = (nextOrderRef: StoredOrderRef | null) => {
    writeStoredOrderRef(storageKey, nextOrderRef);
    setOrderRef(nextOrderRef);
  };

  // 토큰이 더는 통하지 않으면 붙잡고 있어도 같은 실패만 반복한다.
  const discardOrder = () => {
    if (orderRef) {
      queryClient.removeQueries({
        queryKey: orderQueryKeys.order(booth.boothCode, tableCode, orderRef.orderId),
      });
    }
    saveOrderRef(null);
    setIsTransferDialogOpen(false);
    resetCart();
  };

  // "추가 주문하기"는 결제가 확인된 주문 화면에만 있다. 끝난 주문을 내려놓고
  // 빈 장바구니로 돌아간다.
  const startAdditionalOrder = () => {
    discardOrder();
  };

  // 토큰이 더는 통하지 않는 주문은 저장소에서 지워 다음 진입 때 깨끗하게
  // 시작한다. 이번 렌더는 조회 결과가 비어 있어 주문이 없는 화면이 된다.
  useEffect(() => {
    if (orderQuery.error && isUnusableOrder(orderQuery.error)) {
      writeStoredOrderRef(storageKey, null);
    }
  }, [orderQuery.error, storageKey]);

  const cacheOrder = (nextOrder: PlacedOrder) => {
    queryClient.setQueryData(
      orderQueryKeys.order(booth.boothCode, tableCode, nextOrder.id),
      nextOrder,
    );
  };

  const handleMutationError = (error: unknown) => {
    setErrorToast(createToast(getOrderErrorMessage(error)));

    if (isUnusableOrder(error)) {
      discardOrder();
    }
  };

  const cartLines = buildOrderLines(booth, cart, selectedOptions);

  const placeOrderMutation = useMutation({
    mutationFn: () =>
      createOrder({
        boothCode: booth.boothCode,
        items: toCreateOrderItems(cartLines),
        tableCode,
      }),
    onSuccess: ({ order: createdOrder, orderToken }) => {
      cacheOrder(createdOrder);
      // 새 주문은 아직 입금자명을 내지 않은 이전 주문을 대신한다.
      saveOrderRef({ orderId: createdOrder.id, orderToken });
      setIsTransferDialogOpen(true);
    },
    onError: handleMutationError,
  });

  const depositorNameMutation = useMutation({
    mutationFn: (depositorName: string) =>
      updateDepositorName(target as OrderRequestTarget, depositorName),
    onSuccess: cacheOrder,
    onError: handleMutationError,
  });

  const paymentMethodMutation = useMutation({
    mutationFn: () => updatePaymentMethod(target as OrderRequestTarget, "CASH"),
    onSuccess: cacheOrder,
    onError: handleMutationError,
  });

  return {
    canPlaceOrder: canPlaceOrder(booth, cart),
    cart,
    cartTotal: getOrderTotal(cartLines),
    hasSelectedMenu: hasSelectedMenu(booth, cart),
    hasSelectedSeparateCharge: hasSelectedSeparateCharge(booth, cart),
    selectedOptions,
    errorToast,
    hasIncompleteOrder: isAwaitingDepositorName(order) && !isTransferDialogOpen,
    isPlacingOrder: placeOrderMutation.isPending,
    isSubmittingDepositorName: depositorNameMutation.isPending,
    isTransferDialogOpen,
    order,
    screen: getOrderScreen(order),
    changeItemQuantity: (item: BoothMenuItem, delta: number) => {
      const nextCart = changeQuantity(cart, item, delta);

      setCart(nextCart);
      if (getQuantity(nextCart, item) === 0) {
        setSelectedOptions((current) => clearOptions(current, item));
      }
    },
    toggleItemOption: (item: BoothMenuItem, optionId: number) =>
      setSelectedOptions((current) => toggleOption(current, item, optionId)),
    dismissErrorToast: () => setErrorToast(null),
    placeOrder: () => {
      setErrorToast(null);
      placeOrderMutation.mutate();
    },
    reopenIncompleteOrder: () => setIsTransferDialogOpen(true),
    closeTransferDialog: () => setIsTransferDialogOpen(false),
    submitDepositorName: (depositorName: string) => {
      setErrorToast(null);
      depositorNameMutation.mutate(depositorName, {
        onSuccess: () => {
          setIsTransferDialogOpen(false);
          resetCart();
        },
      });
    },
    // 현금 선언은 상태를 바꾸지 않고 결제수단만 바꾼다 (FR-1.4-6).
    chooseCashPayment: () => {
      setErrorToast(null);
      paymentMethodMutation.mutate(undefined, {
        onSuccess: () => {
          setIsTransferDialogOpen(false);
          resetCart();
        },
      });
    },
    updateDepositorName: (depositorName: string) => {
      setErrorToast(null);
      depositorNameMutation.mutate(depositorName);
    },
    startAdditionalOrder,
    // 취소 안내를 닫으면 토큰까지 버린다. 남겨두면 재진입할 때마다 다시 뜬다.
    // 추가 주문 여부는 그대로 둔다 — 취소된 주문으로는 상차림비를 낸 게 아니다.
    dismissCanceledOrder: () => discardOrder(),
  };
};
