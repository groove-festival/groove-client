import * as Sentry from "@sentry/react";

export type TelemetryParameterValue = boolean | number | string;

export interface TelemetryParameters {
  readonly [key: string]: TelemetryParameterValue;
}

// 제품 화면은 이 경계에 개인정보가 아닌, 미리 정의된 값만 넘긴다. GA는
// 집계 분석에 파라미터를 쓰고 Clarity는 같은 이름의 Smart Event로 세션을
// 찾는다. Sentry breadcrumb는 이후 오류가 발생했을 때 직전 사용자 단계를
// 복원하되 동일한 안전한 파라미터만 보관한다.
export function trackTelemetryEvent(
  eventName: string,
  parameters: TelemetryParameters = {},
): void {
  window.gtag?.("event", eventName, parameters);
  window.clarity?.("event", eventName);

  if (Sentry.getClient()) {
    Sentry.addBreadcrumb({
      category: "product.analytics",
      data: parameters,
      level: "info",
      message: eventName,
    });
  }
}
