import { appConfig } from "@/shared/config";

import { resolveAnalyticsPagePath } from "./analyticsPagePath";
import { shouldInitializeClarity } from "./clarityPrivacy";
import { initializeClarity } from "./initializeClarity";
import { initializeGoogleAnalytics } from "./initializeGoogleAnalytics";
import { initializeSentry } from "./initializeSentry";

let initialized = false;

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

  if (
    appConfig.telemetry.clarityProjectId &&
    shouldInitializeClarity(window.location.pathname, appConfig.basePath)
  ) {
    initializeClarity(appConfig.telemetry.clarityProjectId);
  }

  if (appConfig.telemetry.sentryDsn) {
    initializeSentry(appConfig.telemetry.sentryDsn);
  }
}
