import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { authQueryKeys } from "./queryKeys";

// AUTH-1. Google Identity Services로 받은 ID 토큰을 서버로 보내 검증받고
// 세션을 발급받는다 (가요제 참여자 전용). 응답은 표시 이름만 내려주고,
// role 등 로그인 상태는 이후 AUTH-4(/auth/me)로 조회한다 (백엔드팀 확인,
// 2026-09-23).
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
