import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const sourceRoot = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  base: "/groove/",
  plugins: [react(), tailwindcss()],
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
});
