import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: [
      {
        find: /^react-dom$/,
        replacement: path.resolve(__dirname, "../react-dom"),
      },
      {
        find: /^react\/jsx-dev-runtime$/,
        replacement: path.resolve(__dirname, "../react/jsx-dev-runtime.js"),
      },
      {
        find: /^react$/,
        replacement: path.resolve(__dirname, "../react"),
      },
      {
        find: /^shared/,
        replacement: path.resolve(__dirname, "../shared"),
      },
    ],
  },
});
