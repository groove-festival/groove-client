import { appConfig } from "@/shared/config";

const TABLE_ORDER_PATH_PATTERN = /^\/pub\/([^/]+)\/[^/]+\/?$/;

function maskSensitivePathSegments(pathname: string): string {
  return pathname.replace(TABLE_ORDER_PATH_PATTERN, "/pub/$1/table");
}

export function resolveAnalyticsPagePath(pathname: string): string {
  const normalizedPathname = maskSensitivePathSegments(
    `/${pathname.trim().replace(/^\/+/, "")}`,
  );

  if (appConfig.basePath === "/") {
    return normalizedPathname;
  }

  if (
    normalizedPathname === appConfig.basePath ||
    normalizedPathname.startsWith(`${appConfig.basePath}/`)
  ) {
    return normalizedPathname;
  }

  return `${appConfig.basePath}${normalizedPathname}`;
}
