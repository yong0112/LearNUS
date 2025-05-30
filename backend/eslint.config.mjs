// backend/eslint.config.mjs
import eslintPluginNode from "eslint-plugin-node";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        ...globals.node, // Includes require, module, process, etc.
        ...globals.commonjs, // Explicitly include CommonJS globals
      },
    },
    plugins: {
      node: eslintPluginNode,
      import: eslintPluginImport,
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
      "no-console": "warn",
      "node/no-unsupported-features/es-syntax": "off",
      "node/no-missing-require": "error",
      "import/no-unresolved": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      eqeqeq: ["error", "always"],
      curly: "error",
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js"],
        },
      },
    },
  },
];
