import generatePackageJson from 'rollup-plugin-generate-package-json';
import {
  resolvePkgPath,
  getPackageJson,
  getBaseRollupPlugins,
} from './utils.js';

const pkgJson = getPackageJson('react');
const { name, module } = pkgJson;

export default [
  {
    input: `${resolvePkgPath(name)}/${module}`,
    output: {
      file: resolvePkgPath(name, true) + '/index.js',
      name: 'index.js',
      format: 'umd',
    },
    plugins: [
      ...getBaseRollupPlugins(),
      generatePackageJson({
        inputFolder: resolvePkgPath(name),
        outputFolder: resolvePkgPath(name, true),
        baseContents: ({ name, version, description }) => ({
          name,
          version,
          description,
          main: 'index.js',
        }),
      }),
    ],
  },
  {
    input: `${resolvePkgPath(name)}/src/jsx.ts`,
    output: {
      file: resolvePkgPath(name, true) + '/jsx.runtime.js',
      name: 'jsx.runtime.js',
      format: 'umd',
    },
    plugins: getBaseRollupPlugins(),
  },
];
