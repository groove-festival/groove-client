export type AdminRole =
  "USER" | "PUB_ADMIN" | "STAGE_ADMIN" | "PLAN_ADMIN" | "PROMO_ADMIN" | "SUPER_ADMIN";

export const PROMO_ADMIN_ROLE = "PROMO_ADMIN" satisfies AdminRole;
export const PUB_ADMIN_ROLE = "PUB_ADMIN" satisfies AdminRole;

export interface AdminAccount {
  loggedIn: boolean;
  role: AdminRole | null;
  displayName: string | null;
  pubId: number | null;
}

export function isPromoAdmin(account: AdminAccount | undefined): boolean {
  return account?.loggedIn === true && account.role === PROMO_ADMIN_ROLE;
}

export function isPubAdmin(account: AdminAccount | undefined): boolean {
  return account?.loggedIn === true && account.role === PUB_ADMIN_ROLE;
}

export function isGoogleParticipant(account: AdminAccount | undefined): boolean {
  return account?.loggedIn === true && account.role === "USER";
}
