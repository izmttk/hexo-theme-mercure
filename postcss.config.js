// postcss.config.js
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

/**
 * @type {import('postcss-load-config').Config}
 */
module.exports = {
  // from: path.resolve(__dirname, 'src/css/index.css'),
  // to: path.resolve(__dirname, 'source/css/index.css'),
  plugins: [

    require('postcss-import')({
      root: __dirname,
    }),
    require('tailwindcss/nesting'),
    require('tailwindcss')({
      config: path.resolve(__dirname, 'tailwind.config.js'),
    }),
    require('postcss-easing-gradients'),
    require('autoprefixer'),
    // conditional import of css optimization
    !isDev && require('postcss-sort-media-queries'), // if styles have problems, comment this line
    !isDev && require('postcss-variable-compress'),
    !isDev && require('cssnano')({
      preset: 'default',
    }),
  ]
}