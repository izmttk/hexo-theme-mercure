/* 执行
 * npx tailwindcss-cli@latest build -o ./source/css/tailwind.css
 * 以更新TailWind CSS 文件
 */
module.exports = {
  // prefix: 'tw-',
  important: true,
  purge: [
    './layout/**/*.ejs',
    './source/_pre/*.css'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        '68': '17rem',
      },
      height: {
        'header': '400px',
        '6.5': '1.625rem',
        '88': '22rem',
      },
      lineHeight: {
        '6.5': '1.625rem',
        '16': '4rem'
      },
      margin: {
        '1.25': '0.3125rem'
      },
      ringWidth: {
        '6': '6px'
      },
      transitionProperty: {
        'height': 'height'
      },
      zIndex: {
        'max': '9999'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
