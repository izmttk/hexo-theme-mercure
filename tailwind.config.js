/* 执行
 * npx tailwindcss-cli@latest build -o ./source/css/tailwind.css
 * 以更新TailWind CSS 文件
 */
module.exports = {
  // prefix: 'tw-',
  // important: true,
  darkMode: 'class',
  content: [
    './layout/**/*.ejs',
    './style/**/*.css',
    './source/**/*.css',
    './source/**/*.js'
  ],
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography')({
      target: 'legacy', // :where 选择器不支持Webkit < 88
    }),
  ],
}
