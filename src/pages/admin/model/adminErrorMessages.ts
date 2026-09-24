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

export function stageScheduleErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "SING011") {
    return "시작 시각은 종료 시각보다 앞서야 해요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "일정 저장에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function toggleVoteStatusErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "SING010") {
    return "오픈하려면 종료까지 남은 시간(분)을 입력해야 해요.";
  }
  if (error instanceof ApiError && error.code === "SING013") {
    return "아직 참가팀이 정해지지 않은 경기예요.";
  }
  if (error instanceof ApiError && error.code === "SING004") {
    return "존재하지 않는 경기예요. 목록을 새로고침해 주세요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "경기 상태 변경에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function submitVoteResultErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "SING012") {
    return "참가팀 전원에게 1위부터 순위를 빠짐없이, 중복 없이 매겨야 해요.";
  }
  if (error instanceof ApiError && error.code === "SING013") {
    return "아직 참가팀이 정해지지 않은 경기예요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "결과 저장에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function deleteStoryErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "SING005") {
    return "이미 삭제된 사연이에요. 목록을 새로고침해 주세요.";
  }
  return (
    adminAccessErrorMessage(error) ?? "삭제에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}
