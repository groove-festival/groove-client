/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_TELEMETRY_ENABLED?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_CLARITY_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
