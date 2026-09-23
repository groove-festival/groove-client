import { ApiError } from "@/shared/api";

const DEFAULT_SUBMIT_ERROR_MESSAGE =
  "사연 접수에 실패했어요. 잠시 후 다시 시도해 주세요.";

const submitErrorMessages: ReadonlyMap<string, string> = new Map([
  ["C003", "Google 로그인 후 사연을 접수할 수 있어요."],
  ["SING003", "지금은 사연 모집 기간이 아니에요."],
  ["C001", "입력한 내용을 다시 확인해 주세요."],
  ["C004", "요청 출처가 허용되지 않았어요. 운영 환경 설정을 확인해 주세요."],
]);

export function contestStorySubmitErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? (submitErrorMessages.get(error.code) ?? DEFAULT_SUBMIT_ERROR_MESSAGE)
    : DEFAULT_SUBMIT_ERROR_MESSAGE;
}
