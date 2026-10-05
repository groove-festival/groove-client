import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { AdminAccount } from "../model/account";
import { authQueryKeys } from "./queryKeys";

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
    queryKey: authQueryKeys.me(),
    queryFn: getAuthMe,
    staleTime: 0,
  });
}
