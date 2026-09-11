import { useMutation } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestVoid } from "@/shared/api";

// AUTH-3. 관리자 세션을 무효화한다. 응답 본문(data)은 쓰지 않는다.
export async function logout(): Promise<void> {
  await requestVoid(() => httpClient.post<ApiEnvelope<unknown>>("/auth/logout"));
}

export function useLogout() {
  return useMutation({ mutationFn: logout });
}
