import { type AdminAccount, isGoogleParticipant, isPromoAdmin } from "./account";

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

describe("isGoogleParticipant", () => {
  it("is true only for a logged-in USER", () => {
    expect(isGoogleParticipant(account({ role: "USER" }))).toBe(true);
  });

  it("does not treat guests or administrators as Google participants", () => {
    expect(isGoogleParticipant(account({ loggedIn: false, role: null }))).toBe(false);
    expect(isGoogleParticipant(account({ role: "STAGE_ADMIN" }))).toBe(false);
    expect(isGoogleParticipant(undefined)).toBe(false);
  });
});
