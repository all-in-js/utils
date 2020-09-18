import path from 'path';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

const pkg = process.env.PACKAGE;

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, pkg)
const pkgJson = require(path.resolve(packageDir, 'package.json'))
const resolve = p => path.resolve(packageDir, p)

// ensure TS checks only once for each build
let hasTSChecked = false
const outputConfigs = {
  cjs: {
    file: path.resolve(__dirname, `packages/${pkg}/dist/${pkg}.cjs.js`),
    format: `cjs`
  }
}

const defaultFormats = ['cjs']
const packageFormats = defaultFormats
const packageConfigs = packageFormats.map(format => createConfig(format, outputConfigs[format])) 

export default packageConfigs

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  output.externalLiveBindings = false

  const shouldEmitDeclarations = !hasTSChecked

  const tsPlugin = ts({
    check: !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    tsconfigOverride: {
      compilerOptions: {
        declaration: shouldEmitDeclarations,
      },
      exclude: ['**/__tests__', 'test-dts']
    }
  })
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  const entryFile = `index.ts`

  // the browser builds of @vue/compiler-sfc requires postcss to be available
  // as a global (e.g. http://wzrd.in/standalone/postcss)
  const nodePlugins = [
          require('@rollup/plugin-node-resolve').nodeResolve({
            preferBuiltins: true
          }),
          require('@rollup/plugin-commonjs')({
            sourceMap: false
          })
        ]

  return {
    external: Object.keys(pkgJson.dependencies || {}),
    input: resolve(entryFile),
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    plugins: [
      json({
        namedExports: false
      }),
      tsPlugin,
      ...nodePlugins,
      ...plugins
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    treeshake: {
      moduleSideEffects: false
    }
  }
}
