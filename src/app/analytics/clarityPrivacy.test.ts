import { shouldInitializeClarity } from "./clarityPrivacy";

describe("shouldInitializeClarity", () => {
  it("allows public pages under the configured base path", () => {
    expect(shouldInitializeClarity("/groove/", "/groove")).toBe(true);
    expect(shouldInitializeClarity("/groove/playlist", "/groove")).toBe(true);
  });

  it("blocks the admin page and its descendants", () => {
    expect(shouldInitializeClarity("/groove/admin", "/groove")).toBe(false);
    expect(shouldInitializeClarity("/groove/admin/songs", "/groove")).toBe(false);
  });

  it("handles an application mounted at the domain root", () => {
    expect(shouldInitializeClarity("/admin", "/")).toBe(false);
    expect(shouldInitializeClarity("/playlist", "/")).toBe(true);
  });
});
