module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    // require('postcss-nested'),
    require('postcss-easing-gradients'),
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}