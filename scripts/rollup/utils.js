import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import path from 'path';
import fs from 'fs';

const packagesPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function getBaseRollupPlugins({ typescript = {} } = {}) {
  return [cjs(), ts(typescript)];
}

export function resolvePkgPath(pkgName, isDist) {
  if (isDist) {
    return `${distPath}/${pkgName}`;
  }
  return `${packagesPath}/${pkgName}`;
}

export function getPackageJson(pkgName) {
  const pkgPath = `${resolvePkgPath(pkgName)}/package.json`;
  const str = fs.readFileSync(pkgPath, 'utf-8');
  return JSON.parse(str);
}
