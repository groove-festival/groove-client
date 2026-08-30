import { normalizeBasePath } from "@/shared/lib/routing";

function optionalEnv(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export const appConfig = Object.freeze({
  apiBaseUrl: optionalEnv(import.meta.env.VITE_API_BASE_URL),
  basePath: normalizeBasePath(import.meta.env.BASE_URL),
  environment: import.meta.env.MODE,
  telemetry: Object.freeze({
    enabled: import.meta.env.PROD && import.meta.env.VITE_TELEMETRY_ENABLED === "true",
    clarityProjectId: optionalEnv(import.meta.env.VITE_CLARITY_PROJECT_ID),
    googleAnalyticsMeasurementId: optionalEnv(import.meta.env.VITE_GA_MEASUREMENT_ID),
    sentryDsn: optionalEnv(import.meta.env.VITE_SENTRY_DSN),
  }),
});
