// rollup.config.js
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const terser = require('@rollup/plugin-terser');
const progress = require('rollup-plugin-progress');
const replace = require('@rollup/plugin-replace');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

/**
 * @type {import('rollup').RollupOptions}
 */
 module.exports = {
  input: path.resolve(__dirname, 'src/js/index.js'),
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      preventAssignment: true,
    }),
    commonjs(),
    nodePolyfills(),
    nodeResolve({
      rootDir: __dirname, // This is needed for nodeResolve to work properly
      preferBuiltins: false,
      exportConditions: ['browser', 'production', 'import', 'default'],
    }),
    // conditional import of terser
    isDev ? null : terser({
      module: true,
      toplevel: true,
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
    }),
    progress(),
  ],
  output: {
    // file: 'bundle.js',
    dir: path.resolve(__dirname, 'source/js/build'),
    name: 'bundle',
    format: 'esm',
    // assetFileNames: '[name]-[hash][extname]',
    // chunkFileNames: '[name]-[hash].js',
    inlineDynamicImports: false,
  }
};