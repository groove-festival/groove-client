import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/features/google-auth/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
