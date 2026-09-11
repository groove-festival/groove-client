import { isAxiosError, type AxiosResponse } from "axios";

// 모든 응답은 { success, data, error } 봉투로 감싸진다 (GROOVE API v0.4 §1).
export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
}

// 봉투의 error.code(C001, PLST001 …)나 전송 실패를 그대로 실어 나른다.
// 호출부는 HTTP status가 아니라 code로 분기한다.
export class ApiError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// axios 응답 봉투에서 application data를 꺼낸다. success가 false거나 data가
// 비어 있으면 ApiError로 바꿔 던진다.
export function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  const envelope = response.data;

  if (!envelope?.success || envelope.data == null) {
    throw new ApiError(
      envelope?.error?.code ?? "UNKNOWN",
      envelope?.error?.message ?? "알 수 없는 오류가 발생했습니다.",
      response.status,
    );
  }

  return envelope.data;
}

// 임의의 예외를 ApiError로 정규화한다. axios 에러면 봉투의 error.code와 status를
// 읽고, 그 밖의 경우는 일반 오류 코드로 감싼다.
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError<ApiEnvelope<unknown>>(error)) {
    const envelope = error.response?.data;
    return new ApiError(
      envelope?.error?.code ?? "NETWORK",
      envelope?.error?.message ?? error.message,
      error.response?.status,
    );
  }

  return new ApiError("UNKNOWN", "알 수 없는 오류가 발생했습니다.");
}

// 요청을 보내고 봉투를 풀어 application data를 돌려준다. 성공 경로와 실패 경로
// 모두에서 반환/예외 타입을 일관되게 유지한다 (실패는 전부 ApiError).
export async function requestData<T>(
  send: () => Promise<AxiosResponse<ApiEnvelope<T>>>,
): Promise<T> {
  try {
    return unwrap(await send());
  } catch (error) {
    throw toApiError(error);
  }
}

// data 본문이 없는(void) 응답용. success만 확인하고 실패는 ApiError로 정규화한다.
export async function requestVoid(
  send: () => Promise<AxiosResponse<ApiEnvelope<unknown>>>,
): Promise<void> {
  try {
    const { data } = await send();
    if (data && data.success === false) {
      throw new ApiError(
        data.error?.code ?? "UNKNOWN",
        data.error?.message ?? "알 수 없는 오류가 발생했습니다.",
      );
    }
  } catch (error) {
    throw toApiError(error);
  }
}
