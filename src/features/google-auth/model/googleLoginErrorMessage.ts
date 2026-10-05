import { ApiError } from "@/shared/api";

const DEFAULT_LOGIN_ERROR_MESSAGE =
  "Google 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.";
export const googleLoginErrorMessage = (error: unknown): string =>
  error instanceof ApiError && error.code === "A001"
    ? "Google 인증 정보가 유효하지 않아요. 다시 로그인해 주세요."
    : DEFAULT_LOGIN_ERROR_MESSAGE;
