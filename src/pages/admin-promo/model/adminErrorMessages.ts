import { ApiError } from "@/shared/api";

const ACCESS_ERROR_MESSAGE = "권한이 없어요. 다시 로그인해 주세요.";

function adminAccessErrorMessage(error: unknown): string | null {
  return error instanceof ApiError && (error.code === "C003" || error.code === "C004")
    ? ACCESS_ERROR_MESSAGE
    : null;
}

export function songRequestMutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "PLST002") {
    return "이미 삭제된 신청이에요. 목록을 새로고침해 주세요.";
  }
  return (
    adminAccessErrorMessage(error) ?? "처리에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function displayOrderErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "PLST008") {
    return "선정된 곡 전체가 순서에 포함돼야 해요. 목록을 새로고침한 뒤 다시 시도해 주세요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "순서 저장에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function phaseOverrideErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "C001") {
    return "단계 값이 올바르지 않아요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "단계 변경에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}
