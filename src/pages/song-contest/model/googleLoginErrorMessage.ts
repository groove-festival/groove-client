import { ApiError } from "@/shared/api";

const DEFAULT_LOGIN_ERROR_MESSAGE =
  "Google 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.";

const loginErrorMessages: ReadonlyMap<string, string> = new Map([
  ["A001", "Google 인증 정보가 유효하지 않아요. 다시 로그인해 주세요."],
]);

export function googleLoginErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? (loginErrorMessages.get(error.code) ?? DEFAULT_LOGIN_ERROR_MESSAGE)
    : DEFAULT_LOGIN_ERROR_MESSAGE;
}
