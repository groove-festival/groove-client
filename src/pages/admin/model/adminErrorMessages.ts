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

// ---- 주막(PUB_ADMIN) 대시보드 ----

export function pubStatusErrorMessage(error: unknown): string {
  return (
    adminAccessErrorMessage(error) ??
    "주막 상태 변경에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function pubAccountErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "C001") {
    return "계좌 정보 형식이 올바르지 않아요. 은행명·계좌번호·예금주를 확인해 주세요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "계좌 저장에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function orderStatusErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "PUB001") {
    return "지금 상태에서는 바꿀 수 없는 주문이에요. 목록을 새로고침해 주세요.";
  }
  if (error instanceof ApiError && error.code === "PUB005") {
    return "존재하지 않는 주문이에요. 목록을 새로고침해 주세요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "주문 상태 변경에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function menuMutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "PUB004") {
    return "이미 삭제된 메뉴예요. 목록을 새로고침해 주세요.";
  }
  if (error instanceof ApiError && error.code === "C001") {
    return "메뉴 이름·분류·가격을 확인해 주세요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "메뉴 저장에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function pubImageUploadErrorMessage(error: unknown): string {
  // 용량 초과는 앱(C413)이 아니라 앞단 nginx 가 먼저 막고, 그 응답은 공통 봉투가
  // 아니라 HTML 이라 code 가 비어 있다 (실서버 확인, 2026-09-25). code 만 보면
  // 일반 실패 문구가 떠서 사용자가 이유를 모른다. status 로도 잡는다.
  if (error instanceof ApiError && (error.code === "C413" || error.status === 413)) {
    return "이미지가 너무 커요. 10MB 보다 작은 파일로 올려 주세요.";
  }
  if (error instanceof ApiError && error.code === "C001") {
    return "JPG·PNG·WebP 이미지만 올릴 수 있어요.";
  }
  if (error instanceof ApiError && error.code === "PUB004") {
    return "이미 삭제된 메뉴예요. 목록을 새로고침해 주세요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "사진 업로드에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function tableCountErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "PUB009") {
    return "이미 주문이 들어온 테이블은 없앨 수 없어요. 개수를 그대로 두거나 늘려 주세요.";
  }
  if (error instanceof ApiError && error.code === "C001") {
    return "테이블 개수가 허용 범위를 벗어났어요.";
  }
  return (
    adminAccessErrorMessage(error) ??
    "테이블 설정에 실패했어요. 잠시 후 다시 시도해 주세요."
  );
}
