import { ApiError } from "@/shared/api";

const orderErrorMessages: Record<string, string> = {
  PUB001: "이미 처리된 주문이라 변경할 수 없어요",
  PUB002: "주문할 수 없는 테이블이에요",
  PUB003: "주문할 수 없는 테이블이에요",
  PUB004: "메뉴가 변경되었어요. 새로고침 후 다시 담아주세요",
  PUB006: "지금은 주문을 받지 않는 주막이에요",
  PUB007: "품절된 메뉴가 있어요. 담은 메뉴를 확인해주세요",
  PUB008: "주문 정보를 확인할 수 없어요",
  PUB013: "오늘은 운영하지 않는 주막이에요",
};

const DEFAULT_ORDER_ERROR_MESSAGE = "잠시 후 다시 시도해주세요";

export const getOrderErrorMessage = (error: unknown) =>
  (error instanceof ApiError ? orderErrorMessages[error.code] : undefined) ??
  DEFAULT_ORDER_ERROR_MESSAGE;

export const isUnusableOrder = (error: unknown) =>
  error instanceof ApiError &&
  (error.code === "PUB008" || error.code === "PUB005" || error.code === "PUB003");
