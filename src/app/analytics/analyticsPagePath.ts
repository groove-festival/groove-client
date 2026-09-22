import { appConfig } from "@/shared/config";

// 테이블 QR 주문 경로의 테이블 코드는 추측을 막기 위한 비공개 값이므로
// 분석 데이터에는 고정된 자리표시자로 바꿔 보낸다.
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
