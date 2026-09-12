import { type AdminAccount, isPromoAdmin } from "./adminRole";

const account = (over: Partial<AdminAccount>): AdminAccount => ({
  loggedIn: true,
  role: "PROMO_ADMIN",
  displayName: null,
  pubId: null,
  ...over,
});

describe("isPromoAdmin", () => {
  it("is true only for a logged-in PROMO_ADMIN", () => {
    expect(isPromoAdmin(account({}))).toBe(true);
  });

  it("is false for other roles", () => {
    expect(isPromoAdmin(account({ role: "PUB_ADMIN" }))).toBe(false);
    expect(isPromoAdmin(account({ role: "USER" }))).toBe(false);
  });

  it("is false when not logged in or undefined", () => {
    expect(isPromoAdmin(account({ loggedIn: false, role: null }))).toBe(false);
    expect(isPromoAdmin(undefined)).toBe(false);
  });
});
