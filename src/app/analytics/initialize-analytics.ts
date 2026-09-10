import * as Sentry from "@sentry/react";

import { appConfig } from "@/shared/config";

type ClarityCommand = ((...args: unknown[]) => void) & {
  queue?: unknown[][];
};

declare global {
  interface Window {
    clarity?: ClarityCommand;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function resolveAnalyticsPagePath(pathname: string) {
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

function appendScriptOnce(id: string, source: string) {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = source;
  script.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.append(script);
}

function initializeGoogleAnalytics(measurementId: string) {
  if (!/^G-[A-Z0-9]+$/i.test(measurementId)) {
    return;
  }

  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: false,
  });

  appendScriptOnce(
    "groove-google-analytics",
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
  );
}

function initializeClarity(projectId: string) {
  if (!/^[a-z0-9]+$/i.test(projectId)) {
    return;
  }

  if (!window.clarity) {
    const clarity: ClarityCommand = (...args: unknown[]) => {
      clarity.queue ??= [];
      clarity.queue.push(args);
    };
    window.clarity = clarity;
  }

  appendScriptOnce(
    "groove-microsoft-clarity",
    `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`,
  );
}

function safeTelemetryUrl() {
  return `${window.location.origin}${appConfig.basePath}`;
}

function initializeSentry(dsn: string) {
  Sentry.init({
    dsn,
    enabled: true,
    environment: appConfig.environment,
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

export function trackAnalyticsPageView(pathname: string) {
  const measurementId = appConfig.telemetry.googleAnalyticsMeasurementId;

  if (!initialized || !appConfig.telemetry.enabled || !measurementId || !window.gtag) {
    return;
  }

  const pagePath = resolveAnalyticsPagePath(pathname);

  window.gtag("event", "page_view", {
    page_location: `${window.location.origin}${pagePath}`,
    page_path: pagePath,
    page_title: document.title,
  });
}

export function initializeAnalytics() {
  if (initialized || !appConfig.telemetry.enabled) {
    return;
  }

  initialized = true;

  if (appConfig.telemetry.googleAnalyticsMeasurementId) {
    initializeGoogleAnalytics(appConfig.telemetry.googleAnalyticsMeasurementId);
  }

  if (appConfig.telemetry.clarityProjectId) {
    initializeClarity(appConfig.telemetry.clarityProjectId);
  }

  if (appConfig.telemetry.sentryDsn) {
    initializeSentry(appConfig.telemetry.sentryDsn);
  }
}
