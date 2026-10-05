import * as Sentry from "@sentry/react";

export type TelemetryParameterValue = boolean | number | string;

export interface TelemetryParameters {
  readonly [key: string]: TelemetryParameterValue;
}

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
