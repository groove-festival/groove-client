import {
  detectRestrictedInAppBrowser,
  isSafariUserAgent,
} from "./detectRestrictedInAppBrowser";

describe("detectRestrictedInAppBrowser", () => {
  it.each([
    ["Instagram", "instagram"],
    ["Mozilla/5.0 Instagram 352.0.0.0 Mobile", "instagram"],
    ["Everytime/7.2.1 Android WebView", "everytime"],
    ["mozilla/5.0 everytime ios", "everytime"],
  ] as const)("detects %s", (userAgent, expected) => {
    expect(detectRestrictedInAppBrowser(userAgent)).toBe(expected);
  });

  it.each([
    "Mozilla/5.0 Chrome/140.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 Version/18.0 Mobile Safari/604.1",
    "",
  ])("keeps a regular browser unrestricted: %s", (userAgent) => {
    expect(detectRestrictedInAppBrowser(userAgent)).toBeNull();
  });
});

describe("isSafariUserAgent", () => {
  it("detects regular Safari", () => {
    expect(
      isSafariUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(true);
  });

  it.each([
    "Mozilla/5.0 Chrome/140.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 CriOS/140.0.0.0 Mobile Safari/604.1",
    "Mozilla/5.0 Instagram 352.0.0.0 Mobile Safari/604.1",
    "Everytime/7.2.1 iOS Safari/604.1",
  ])("does not treat another browser as Safari: %s", (userAgent) => {
    expect(isSafariUserAgent(userAgent)).toBe(false);
  });
});
