/* 执行
 * npx tailwindcss-cli@latest build -o ./source/css/tailwind.css
 * 以更新TailWind CSS 文件
 */
module.exports = {
  // prefix: 'tw-',
  mode: 'jit',
  // important: true,
  darkMode: 'class',
  purge: [
    './layout/**/*.ejs',
    './style/**/*.css',
    './source/**/*.css',
    './source/**/*.js'
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.blue.300'),
              '&:hover': {
                  color: theme('colors.blue.300'),
              },
            },
            svg: {
              color: theme('colors.gray.100')
            },
            h1: {
              color: theme('colors.gray.300'),
            },
            h2: {
              color: theme('colors.gray.300'),
            },
            h3: {
              color: theme('colors.gray.300'),
            },
            h4: {
              color: theme('colors.gray.300'),
            },
            h5: {
              color: theme('colors.gray.300'),
            },
            h6: {
              color: theme('colors.gray.300'),
            },
            strong: {
              color: theme('colors.gray.300'),
            },
            pre: {
              backgroundColor: theme('colors.gray.900'),
            },
            code: {
              color: theme('colors.gray.300'),
              backgroundColor: theme('colors.gray.900'),
            },
            figcaption: {
              color: theme('colors.gray.500'),
            },
            blockquote: {
              color: theme('colors.gray.400'),
              borderLeftColor: theme('colors.gray.600'),
            },
            hr: {
              borderColor: theme('colors.gray.600'),
            },
            thead: {
              color: theme('colors.gray.300'),
              borderBottomColor: theme('colors.gray.600'),
            },
            tbody: {
              tr: {
                borderBottomColor: theme('colors.gray.700'),
              }
            },
            'ul > li::before': {
              backgroundColor: theme('colors.gray.600'),
            }
          },
        },
      }),
    },
  },
  variants: {
    extend: {
      typography: ['dark'],
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography')
  ],
}
