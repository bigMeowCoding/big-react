import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxDev: true,
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "react/jsx-runtime": fileURLToPath(
        new URL("../react/jsx-runtime.js", import.meta.url),
      ),
      "react/jsx-dev-runtime": fileURLToPath(
        new URL("../react/jsx-runtime.js", import.meta.url),
      ),
      react: fileURLToPath(new URL("../react", import.meta.url)),
      "react-dom": fileURLToPath(new URL("../react-dom", import.meta.url)),
    },
  },
});
