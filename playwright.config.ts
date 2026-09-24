import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173/groove/",
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    trace: "on-first-retry",
    viewport: { width: 390, height: 844 },
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "pnpm preview --port 5173 --strictPort",
    url: "http://localhost:5173/groove/",
    reuseExistingServer: !process.env.CI,
  },
});
