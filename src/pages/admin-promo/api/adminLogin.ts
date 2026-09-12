import { useMutation } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { AdminRole } from "../model/adminRole";
import type { AdminLoginFormValues } from "../model/adminLoginForm";

// AUTH-2. 관리자 4종 공용 ID/PW 로그인. 세션은 쿠키로 발급되고(withCredentials),
// 응답 role로 프론트가 대시보드를 가른다.
export interface AdminLoginResponseBody {
  role: AdminRole;
  // 주막 관리자면 담당 주막 ID, 그 외 역할은 null.
  pubId: number | null;
}

export async function adminLogin(
  body: AdminLoginFormValues,
): Promise<AdminLoginResponseBody> {
  return requestData(() =>
    httpClient.post<ApiEnvelope<AdminLoginResponseBody>>("/auth/admin/login", body),
  );
}

export function useAdminLogin() {
  return useMutation({ mutationFn: adminLogin });
}
