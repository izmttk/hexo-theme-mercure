// tailwind.config.js
const plugin = require('tailwindcss/plugin')
const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

const gray = colors.gray;
const primary = colors.blue;
const secondary = colors.pink;
/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // prefix: 'tw-',
  // important: true,
  darkMode: 'class',
  content: {
    relative: true,
    files: [
      './layout/**/*.ejs',
      './src/**/*.{css,js}',
    ]
  },
  theme: {
    fontFamily:{
      sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      mono: ['Fira Code VF', ...defaultTheme.fontFamily.mono],
    },
    extend: {
      colors: {
        gray: gray,
        primary: primary,
        secondary: secondary,
        background: {
          DEFAULT: '#f5f5fa',
          light: '#f5f5fa',
          dark: gray[900],
        },
        text: {
          primary: {
            DEFAULT: gray[900],
            light: gray[900],
            dark: gray[300],
          },
          secondary: {
            DEFAULT: gray[600],
            light: gray[600],
            dark: gray[400],
          },
          disabled: {
            DEFAULT: gray[400],
            light: gray[400],
            dark: gray[600],
          }
        },
        plate: {
          DEFAULT: colors.white,
          light: colors.white,
          dark: gray[800],
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('@tailwindcss/typography')({
      target: 'modern',
    }),
    // add a "ring-highlight" utility
    // which sets a top border highlight using box-shadow
    // thus conflicting with any other ring utilities
    // shadow utilities are not affected
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.ring-highlight': {
          'box-shadow': [
            `inset 0 1px 0 0 var(--tw-ring-color)`,
            `var(--tw-shadow, 0 0 #0000)`,
          ].join(', ')
        }
      })
    })
  ],
}
