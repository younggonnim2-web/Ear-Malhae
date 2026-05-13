import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1565C0',
      },
      keyframes: {
        flash: {
          '0%': { backgroundColor: 'transparent' },
          '30%': { backgroundColor: '#fca5a5' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        flash: 'flash 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config
