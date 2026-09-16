import * as Sentry from "@sentry/react";

import { appConfig } from "@/shared/config";

function safeTelemetryUrl(): string {
  return `${window.location.origin}${appConfig.basePath}`;
}

export function initializeSentry(dsn: string): void {
  Sentry.init({
    dsn,
    enabled: true,
    environment: appConfig.environment,
    release: appConfig.telemetry.sentryRelease,
    sendDefaultPii: false,
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data?.url) {
        return {
          ...breadcrumb,
          data: { ...breadcrumb.data, url: safeTelemetryUrl() },
        };
      }

      return breadcrumb;
    },
    beforeSend(event) {
      return {
        ...event,
        user: undefined,
        request: event.request
          ? {
              ...event.request,
              cookies: undefined,
              data: undefined,
              headers: undefined,
              query_string: undefined,
              url: safeTelemetryUrl(),
            }
          : undefined,
      };
    },
  });
}
