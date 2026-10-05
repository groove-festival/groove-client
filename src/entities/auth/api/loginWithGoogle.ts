import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { authQueryKeys } from "./queryKeys";

export interface GoogleLoginResponseBody {
  displayName: string | null;
}

export async function loginWithGoogle(
  idToken: string,
): Promise<GoogleLoginResponseBody> {
  return requestData(() =>
    httpClient.post<ApiEnvelope<GoogleLoginResponseBody>>("/auth/google", {
      idToken,
    }),
  );
}

export function useLoginWithGoogle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
    },
  });
}
