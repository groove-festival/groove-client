// 관리자 4종 공용 로그인의 역할. 로그인 응답의 role로 프론트가 대시보드를
// 가른다. GROOVE PLAYLIST 운영 API(/admin/promo/*)는 PROMO_ADMIN 전용이다.
export type AdminRole =
  "USER" | "PUB_ADMIN" | "STAGE_ADMIN" | "PLAN_ADMIN" | "PROMO_ADMIN";

export const PROMO_ADMIN_ROLE = "PROMO_ADMIN" satisfies AdminRole;

// /auth/me 의 account 블록. 비로그인이면 role·displayName·pubId가 null이다.
export interface AdminAccount {
  loggedIn: boolean;
  role: AdminRole | null;
  displayName: string | null;
  pubId: number | null;
}

export function isPromoAdmin(account: AdminAccount | undefined): boolean {
  return account?.loggedIn === true && account.role === PROMO_ADMIN_ROLE;
}
