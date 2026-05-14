import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mintlify design tokens
        primary: '#00d4a4',   // alias → brand-green
        ink:     '#0a0a0a',
        steel:   '#5a5a5c',
        muted:   '#8a8a8d',
        canvas:  '#ffffff',
        surface: '#f7f7f7',
        hairline:'#e5e5e5',
        brand: {
          green:    '#00d4a4',
          'green-dim': '#e6faf6',
        },
      },
      keyframes: {
        flash: {
          '0%': { backgroundColor: 'transparent' },
          '30%': { backgroundColor: '#fca5a5' },
          '100%': { backgroundColor: 'transparent' },
        },
        speaking: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        },
      },
      animation: {
        flash: 'flash 0.4s ease-in-out',
        speaking: 'speaking 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
