import { appConfig } from "@/shared/config";

export function resolveAnalyticsPagePath(pathname: string): string {
  const normalizedPathname = `/${pathname.trim().replace(/^\/+/, "")}`;

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
