import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: ['./video/**/*.{ts,tsx}'],
  theme: {
    colors: {
      brand: colors.sky,
      gray: colors.slate,
      danger: colors.rose,
      white: '#fff',
      transparent: 'transparent',
      inherit: 'inherit',
      currentColor: 'currentColor',
    },
    extend: {
      fontFamily: {
        sans: ["'Rubik'"],
      },
    },
  },
  plugins: [],
} satisfies Config;
