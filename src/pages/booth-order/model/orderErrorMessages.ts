import { ApiError } from "@/shared/api";

// 주문 흐름에서 손님에게 보여줄 실패 문구. 코드는 API 명세 §1.4·§5 기준이다.
// 없는 부스(PUB002)와 없는 테이블(PUB003)은 구분해 안내하지 않는다.
const orderErrorMessages: Record<string, string> = {
  PUB001: "이미 처리된 주문이라 변경할 수 없어요",
  PUB002: "주문할 수 없는 테이블이에요",
  PUB003: "주문할 수 없는 테이블이에요",
  PUB004: "메뉴가 변경되었어요. 새로고침 후 다시 담아주세요",
  PUB006: "지금은 주문을 받지 않는 주막이에요",
  PUB007: "품절된 메뉴가 있어요. 담은 메뉴를 확인해주세요",
  PUB008: "주문 정보를 확인할 수 없어요",
};

const DEFAULT_ORDER_ERROR_MESSAGE = "잠시 후 다시 시도해주세요";

export const getOrderErrorMessage = (error: unknown) =>
  (error instanceof ApiError ? orderErrorMessages[error.code] : undefined) ??
  DEFAULT_ORDER_ERROR_MESSAGE;

// 토큰이 더는 통하지 않는 주문은 저장소에서 지운다. 남겨두면 재진입할 때마다
// 같은 실패를 반복한다.
export const isUnusableOrder = (error: unknown) =>
  error instanceof ApiError &&
  (error.code === "PUB008" || error.code === "PUB005" || error.code === "PUB003");
