import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const noReactComponentType = {
  selector:
    "TSTypeReference[typeName.type='TSQualifiedName'][typeName.left.name='React'][typeName.right.name=/^(FC|FunctionComponent)$/]",
  message:
    "Annotate the destructured props parameter directly instead of using React.FC.",
};

export default tseslint.config(
  {
    ignores: ["dist", "coverage", "node_modules", "playwright-report", "test-results"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        { format: ["PascalCase"], selector: "typeLike" },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              importNames: ["FC", "FunctionComponent"],
              message:
                "Annotate the destructured props parameter directly instead of using React.FC.",
              name: "react",
            },
          ],
        },
      ],
      "no-restricted-syntax": ["error", noReactComponentType],
      "react-refresh/only-export-components": ["error", { allowConstantExport: true }],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        noReactComponentType,
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Default exports are reserved for page components and their slice public APIs.",
        },
      ],
    },
  },
  {
    files: ["src/pages/**/ui/**/*Page.tsx"],
    rules: {
      "no-restricted-syntax": ["error", noReactComponentType],
    },
  },
);
