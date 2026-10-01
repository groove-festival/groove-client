export type RestrictedInAppBrowser = "instagram" | "everytime";

const RESTRICTED_IN_APP_BROWSER_PATTERNS: ReadonlyArray<{
  browser: RestrictedInAppBrowser;
  pattern: RegExp;
}> = [
  { browser: "instagram", pattern: /instagram/i },
  { browser: "everytime", pattern: /everytime/i },
];
const NON_SAFARI_BROWSER_PATTERN =
  /(?:Chrome|Chromium|CriOS|Edg|EdgiOS|OPR|OPiOS|FxiOS|Instagram|Everytime)/i;

export const detectRestrictedInAppBrowser = (
  userAgent: string,
): RestrictedInAppBrowser | null =>
  RESTRICTED_IN_APP_BROWSER_PATTERNS.find(({ pattern }) => pattern.test(userAgent))
    ?.browser ?? null;

export const getRestrictedInAppBrowser = (): RestrictedInAppBrowser | null =>
  typeof navigator === "undefined"
    ? null
    : detectRestrictedInAppBrowser(navigator.userAgent);

export const isSafariUserAgent = (userAgent: string): boolean =>
  /Safari/i.test(userAgent) && !NON_SAFARI_BROWSER_PATTERN.test(userAgent);

export const getIsSafariBrowser = (): boolean =>
  typeof navigator !== "undefined" && isSafariUserAgent(navigator.userAgent);
