import { isAxiosError, type AxiosResponse } from "axios";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
}

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

export async function requestData<T>(
  send: () => Promise<AxiosResponse<ApiEnvelope<T>>>,
): Promise<T> {
  try {
    return unwrap(await send());
  } catch (error) {
    throw toApiError(error);
  }
}

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
