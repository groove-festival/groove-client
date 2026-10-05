import path from "node:path";
import { fileURLToPath } from "node:url";

import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const sourceRoot = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ mode }) => {
  const buildEnvironment = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const sentryAuthToken = buildEnvironment.SENTRY_AUTH_TOKEN;
  const sentryOrganization = buildEnvironment.SENTRY_ORG;
  const sentryProject = buildEnvironment.SENTRY_PROJECT;
  const sentryRelease =
    buildEnvironment.SENTRY_RELEASE ??
    buildEnvironment.VERCEL_GIT_COMMIT_SHA ??
    buildEnvironment.GITHUB_SHA;
  const canUploadSentrySourceMaps = Boolean(
    sentryAuthToken && sentryOrganization && sentryProject && sentryRelease,
  );

  return {
    base: "/groove/",
    build: {
      sourcemap: canUploadSentrySourceMaps ? ("hidden" as const) : false,
    },
    define: {
      "import.meta.env.VITE_SENTRY_RELEASE": JSON.stringify(sentryRelease ?? ""),
    },
    plugins: [
      react(),
      tailwindcss(),
      canUploadSentrySourceMaps &&
        sentryVitePlugin({
          authToken: sentryAuthToken,
          org: sentryOrganization,
          project: sentryProject,
          release: { name: sentryRelease },
          sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
        }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(sourceRoot),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./tests/setup-tests.ts",
      exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    },
  };
});
