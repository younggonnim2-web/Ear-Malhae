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
        soundBar: {
          '0%, 100%': { transform: 'scaleY(0.25)' },
          '50%': { transform: 'scaleY(1)' },
        },
        celebrate: {
          '0%':   { transform: 'scale(0.4)', opacity: '0' },
          '65%':  { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floatUp: {
          '0%':   { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-160px)', opacity: '0' },
        },
        matchPop: {
          '0%':   { transform: 'scale(1)',    backgroundColor: 'rgb(240,253,244)' },
          '25%':  { transform: 'scale(1.22)', backgroundColor: 'rgb(134,239,172)' },
          '55%':  { transform: 'scale(0.93)', backgroundColor: 'rgb(187,247,208)' },
          '78%':  { transform: 'scale(1.07)', backgroundColor: 'rgb(220,252,231)' },
          '100%': { transform: 'scale(1)',    backgroundColor: 'rgb(240,253,244)' },
        },
      },
      animation: {
        flash: 'flash 0.4s ease-in-out',
        speaking: 'speaking 0.6s ease-in-out infinite',
        'sound-bar': 'soundBar 0.7s ease-in-out infinite',
        celebrate: 'celebrate 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'float-up': 'floatUp 1.6s ease-out forwards',
        'match-pop': 'matchPop 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
