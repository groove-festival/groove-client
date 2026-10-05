import type { AdminRole } from "@/entities/auth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { AdminLoginFormValues } from "../model/adminLoginForm";

export interface AdminLoginResponseBody {
  role: AdminRole;

  pubId: number | null;
}

export async function adminLogin(
  body: AdminLoginFormValues,
): Promise<AdminLoginResponseBody> {
  return requestData(() =>
    httpClient.post<ApiEnvelope<AdminLoginResponseBody>>("/auth/admin/login", body),
  );
}
