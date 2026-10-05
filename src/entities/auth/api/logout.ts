import { useMutation } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestVoid } from "@/shared/api";

export async function logout(): Promise<void> {
  await requestVoid(() => httpClient.post<ApiEnvelope<unknown>>("/auth/logout"));
}

export function useLogout() {
  return useMutation({ mutationFn: logout });
}
