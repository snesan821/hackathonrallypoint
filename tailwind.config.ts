import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#fcf9f8',
          bright: '#fcf9f8',
          container: {
            lowest: '#ffffff',
            low: '#f6f3f2',
            DEFAULT: '#f0edec',
            high: '#ebe7e7',
            highest: '#e5e2e1',
          },
          variant: '#e5e2e1',
        },
        'on-surface': {
          DEFAULT: '#1c1b1b',
          variant: '#5a4138',
        },
        primary: {
          DEFAULT: '#a13a00',
          container: '#ca4b00',
        },
        'on-primary': '#ffffff',
        outline: {
          DEFAULT: '#8e7166',
          variant: '#e2bfb2',
        },
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'Newsreader', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.06)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.25s cubic-bezier(0.16,1,0.3,1)',
        'accordion-up': 'accordion-up 0.25s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'spin-slow': 'spin-slow 12s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
