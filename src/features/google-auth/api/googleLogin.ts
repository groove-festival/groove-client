import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { googleAuthQueryKeys } from "./queryKeys";

export interface GoogleLoginRequestBody {
  idToken: string;
}

export interface GoogleLoginResponseBody {
  loggedIn: boolean;
  role: "USER";
  displayName: string | null;
}

// AUTH-1. Google Identity Services 가 발급한 ID 토큰을 서버가 검증하고,
// 성공하면 세션 쿠키를 발급한다.
export async function googleLogin(
  body: GoogleLoginRequestBody,
): Promise<GoogleLoginResponseBody> {
  return requestData(() =>
    httpClient.post<ApiEnvelope<GoogleLoginResponseBody>>("/auth/google", body),
  );
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: googleAuthQueryKeys.me() }),
  });
}
