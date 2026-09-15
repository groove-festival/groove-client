import path from "node:path";
import { fileURLToPath } from "node:url";

import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const sourceRoot = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ mode }) => {
  // Vite는 config 평가 전에 .env 파일을 process.env에 자동 주입하지 않는다.
  // 로컬 production 검증과 CI 환경변수를 모두 지원하되 아래 네 키만 읽는다.
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
      // 소스맵 업로드 자격 증명이 모두 있을 때만 생성한다. 업로드 후에는
      // filesToDeleteAfterUpload로 dist에서 제거해 원본 소스를 공개하지 않는다.
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
