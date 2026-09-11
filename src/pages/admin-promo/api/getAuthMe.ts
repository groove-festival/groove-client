import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { AdminAccount } from "../model/adminRole";
import { adminPromoQueryKeys } from "./queryKeys";

// AUTH-4. 새로고침·재진입 시 로그인 상태 복원용. 비로그인이어도 에러가 아니라
// loggedIn:false 를 응답한다.
interface AuthMeResponseBody {
  account: AdminAccount;
}

export async function getAuthMe(): Promise<AdminAccount> {
  const { account } = await requestData<AuthMeResponseBody>(() =>
    httpClient.get<ApiEnvelope<AuthMeResponseBody>>("/auth/me"),
  );

  return account;
}

export function useAuthMe() {
  return useQuery({
    queryKey: adminPromoQueryKeys.authMe(),
    queryFn: getAuthMe,
    staleTime: 0,
  });
}
