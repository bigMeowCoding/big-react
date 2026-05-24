import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packages = path.resolve(__dirname, "packages");

export default defineConfig({
  resolve: {
    alias: {
      shared: path.join(packages, "shared"),
      react: path.join(packages, "react"),
      "react-dom": path.join(packages, "react-dom"),
      "react-reconciler": path.join(packages, "react-reconciler"),
    },
  },
  test: {
    environment: "node",
    include: ["packages/**/__tests__/**/*.{test,spec}.js"],
  },
});
