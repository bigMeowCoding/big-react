import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      "react-hooks": pluginReactHooks,
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
  configPrettier,
];
