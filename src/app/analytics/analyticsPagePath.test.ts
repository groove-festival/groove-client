import { appConfig } from "@/shared/config";

import { resolveAnalyticsPagePath } from "./analyticsPagePath";

const withBasePath = (pathname: string) =>
  appConfig.basePath === "/" ? pathname : `${appConfig.basePath}${pathname}`;

describe("resolveAnalyticsPagePath", () => {
  it("replaces the table code of a QR order path with a placeholder", () => {
    expect(resolveAnalyticsPagePath("/pub/electronics-eh/Xk92abQ")).toBe(
      withBasePath("/pub/electronics-eh/table"),
    );
  });

  it("keeps booth list and booth detail paths as they are", () => {
    expect(resolveAnalyticsPagePath("/pub")).toBe(withBasePath("/pub"));
    expect(resolveAnalyticsPagePath("/pub/electronics-eh")).toBe(
      withBasePath("/pub/electronics-eh"),
    );
  });
});
