import reactPkg from "../../packages/react/package.json";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-babel";
import path from "path";

const pkgPath = path.resolve(__dirname, "../../packages");
const distPath = path.resolve(__dirname, "../../dist");

export default [
  {
    input: `${pkgPath}/react/${reactPkg.module}`,
    output: {
      file: `${distPath}/react.js`,
      format: "es",
    },
    plugins: [resolve(), babel({ babelHelpers: "bundled" })],
  },
];
