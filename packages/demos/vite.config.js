import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^react-dom$/,
        replacement: path.resolve(__dirname, "../react-dom"),
      },
      {
        find: /^react$/,
        replacement: path.resolve(__dirname, "../react"),
      },
    ],
  },
});
