import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { googleAuthQueryKeys } from "./queryKeys";

export type AuthRole =
  "USER" | "PUB_ADMIN" | "STAGE_ADMIN" | "PLAN_ADMIN" | "PROMO_ADMIN";

// AUTH-4. 비로그인이어도 에러가 아니라 loggedIn:false 를 응답한다.
export interface AuthAccount {
  loggedIn: boolean;
  role: AuthRole | null;
  displayName: string | null;
  pubId: number | null;
}

interface AuthMeResponseBody {
  account: AuthAccount;
}

export async function getGoogleAuthMe(): Promise<AuthAccount> {
  const { account } = await requestData<AuthMeResponseBody>(() =>
    httpClient.get<ApiEnvelope<AuthMeResponseBody>>("/auth/me"),
  );

  return account;
}

export function isGoogleParticipant(account: AuthAccount | undefined): boolean {
  return account?.loggedIn === true && account.role === "USER";
}

export function useGoogleAuthMe(enabled = true) {
  return useQuery({
    enabled,
    queryKey: googleAuthQueryKeys.me(),
    queryFn: getGoogleAuthMe,
    staleTime: 0,
  });
}
