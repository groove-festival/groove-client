import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { type BoothMenuItem, type BoothOrderDetail } from "@/entities/booth";

import { ApiError } from "@/shared/api";

import { createIdempotencyKey, createOrder } from "../api/createOrder";
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
  const [hasStorageError, setHasStorageError] = useState(false);

  const pendingOrderKey = useRef<string | null>(null);

  const target: OrderRequestTarget | null = orderRef
    ? { boothCode: booth.boothCode, tableCode, ...orderRef }
    : null;
  const orderQuery = useOrder(target);
  const unusableOrder = isUnusableOrder(orderQuery.error);
  const order = unusableOrder ? null : (orderQuery.data ?? null);
  const restorationStatus =
    target && !unusableOrder && !order
      ? orderQuery.isError
        ? "failed"
        : "loading"
      : order
        ? "ready"
        : "none";
  const canSubmitOrder =
    restorationStatus !== "loading" &&
    restorationStatus !== "failed" &&
    canPlaceOrder(booth, cart);

  const requireOrderTarget = (): OrderRequestTarget => {
    if (!target || unusableOrder) {
      throw new ApiError("PUB008", "주문 정보를 확인할 수 없어요");
    }
    return target;
  };

  const resetCart = () => {
    setCart(createInitialCart());
    setSelectedOptions({});
  };

  const saveOrderRef = (nextOrderRef: StoredOrderRef | null) => {
    setHasStorageError(!writeStoredOrderRef(storageKey, nextOrderRef));
    setOrderRef(nextOrderRef);
  };

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

  const startAdditionalOrder = () => {
    discardOrder();
  };

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
    mutationFn: (idempotencyKey: string) =>
      createOrder({
        boothCode: booth.boothCode,
        idempotencyKey,
        items: toCreateOrderItems(cartLines),
        tableCode,
      }),
    onSuccess: ({ order: createdOrder, orderToken }) => {
      pendingOrderKey.current = null;
      cacheOrder(createdOrder);

      saveOrderRef({ orderId: createdOrder.id, orderToken });
      setIsTransferDialogOpen(true);

      resetCart();
    },
    onError: (error) => {
      if (!(error instanceof ApiError) || error.status !== undefined) {
        pendingOrderKey.current = null;
      }
      handleMutationError(error);
    },
  });

  const depositorNameMutation = useMutation({
    mutationFn: async (depositorName: string) =>
      updateDepositorName(requireOrderTarget(), depositorName),
    onSuccess: cacheOrder,
    onError: handleMutationError,
  });

  const paymentMethodMutation = useMutation({
    mutationFn: async () => updatePaymentMethod(requireOrderTarget(), "CASH"),
    onSuccess: cacheOrder,
    onError: handleMutationError,
  });

  return {
    canPlaceOrder: canSubmitOrder,
    cart,
    cartTotal: getOrderTotal(cartLines),
    hasSelectedMenu: hasSelectedMenu(booth, cart),
    hasSelectedSeparateCharge: hasSelectedSeparateCharge(booth, cart),
    selectedOptions,
    errorToast,
    hasStorageError,
    restorationStatus,
    retryOrderRestoration: () => void orderQuery.refetch(),
    retryOrderStorage: () =>
      setHasStorageError(!writeStoredOrderRef(storageKey, orderRef)),
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
      if (placeOrderMutation.isPending || !canSubmitOrder) return;
      setErrorToast(null);
      pendingOrderKey.current ??= createIdempotencyKey();
      placeOrderMutation.mutate(pendingOrderKey.current);
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

    dismissCanceledOrder: () => discardOrder(),
  };
};
