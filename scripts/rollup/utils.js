import cjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesPath = path.resolve(__dirname, "../../packages");
const distPath = path.resolve(__dirname, "../../dist/node_modules");

const workspacePackages = [
  ["shared", path.join(packagesPath, "shared")],
  ["react-dom", path.join(packagesPath, "react-dom")],
  ["react-reconciler", path.join(packagesPath, "react-reconciler")],
  ["react", path.join(packagesPath, "react")],
];

function resolveWorkspaceId(source) {
  for (const [pkg, dir] of workspacePackages) {
    if (source === pkg) {
      const entry = path.join(dir, "index.js");
      return fs.existsSync(entry) ? entry : dir;
    }
    if (source.startsWith(`${pkg}/`)) {
      const subpath = source.slice(pkg.length + 1);
      const candidates = [
        path.join(dir, subpath),
        `${path.join(dir, subpath)}.js`,
        `${path.join(dir, subpath)}.jsx`,
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }
  return null;
}

function workspaceResolve() {
  return {
    name: "workspace-resolve",
    resolveId(source) {
      return resolveWorkspaceId(source);
    },
  };
}

export function getBaseRollupPlugins() {
  return [
    workspaceResolve(),
    resolve({ extensions: [".js", ".jsx"] }),
    cjs(),
  ];
}

export function resolvePkgPath(pkgName, isDist) {
  if (isDist) {
    return `${distPath}/${pkgName}`;
  }
  return `${packagesPath}/${pkgName}`;
}

export function getPackageJson(pkgName) {
  const pkgPath = `${resolvePkgPath(pkgName)}/package.json`;
  const str = fs.readFileSync(pkgPath, "utf-8");
  return JSON.parse(str);
}
