import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 3000,
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: [
      { find: "react/jsx-dev-runtime", replacement: path.resolve(__dirname, "../react/src/jsx-dev-runtime.js") },
      { find: "react/jsx-runtime", replacement: path.resolve(__dirname, "../react/src/jsx-dev-runtime.js") },
      { find: "react-dom/hostConfig", replacement: path.resolve(__dirname, "../react-dom/src/hostConfig.js") },
      { find: "react", replacement: path.resolve(__dirname, "../react") },
      { find: "react-dom", replacement: path.resolve(__dirname, "../react-dom") },
    ],
  },
});
