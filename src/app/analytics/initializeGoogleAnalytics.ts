import { appendAnalyticsScriptOnce } from "./appendAnalyticsScript";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initializeGoogleAnalytics(measurementId: string): void {
  if (!/^G-[A-Z0-9]+$/i.test(measurementId)) {
    return;
  }

  window.dataLayer ??= [];
  window.gtag ??= function () {
    // gtag.js ignores rest-parameter arrays; it requires an Arguments command.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: false,
  });

  appendAnalyticsScriptOnce(
    "groove-google-analytics",
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
  );
}
