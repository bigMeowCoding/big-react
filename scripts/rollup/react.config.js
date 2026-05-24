import generatePackageJson from "rollup-plugin-generate-package-json";
import {
  getBaseRollupPlugins,
  getPackageJson,
  resolvePkgPath,
} from "./utils.js";

const reactPkg = getPackageJson("react");
const { name: reactName, module: reactModule } = reactPkg;

export default [
  {
    input: `${resolvePkgPath("react-dom")}/index.js`,
    output: {
      file: `${resolvePkgPath("react-dom", true)}/index.js`,
      format: "umd",
      name: "ReactDOM",
    },
    plugins: [
      ...getBaseRollupPlugins(),
      generatePackageJson({
        inputFolder: resolvePkgPath("react-dom"),
        outputFolder: resolvePkgPath("react-dom", true),
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          main: "index.js",
        }),
      }),
    ],
  },
  {
    input: `${resolvePkgPath(reactName)}/${reactModule}`,
    output: {
      file: `${resolvePkgPath(reactName, true)}/index.js`,
      format: "umd",
      name: "React",
    },
    plugins: [
      ...getBaseRollupPlugins(),
      generatePackageJson({
        inputFolder: resolvePkgPath(reactName),
        outputFolder: resolvePkgPath(reactName, true),
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          main: "index.js",
          exports: {
            ".": "./index.js",
            "./jsx-runtime": "./jsx-runtime.js",
            "./jsx-dev-runtime": "./jsx-runtime.js",
          },
        }),
      }),
    ],
  },
  {
    input: `${resolvePkgPath(reactName)}/jsx-runtime.js`,
    output: [
      {
        file: `${resolvePkgPath(reactName, true)}/jsx-runtime.js`,
        format: "umd",
        name: "JSXRuntime",
      },
      {
        file: `${resolvePkgPath(reactName, true)}/jsx-dev-runtime.js`,
        format: "umd",
        name: "JSXDevRuntime",
      },
    ],
    plugins: getBaseRollupPlugins(),
  },
];
