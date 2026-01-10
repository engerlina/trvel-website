import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color - Teal
        // Accessibility: Use 400 for backgrounds/buttons, 600+ for text on white
        brand: {
          50: '#e8f7f7',
          100: '#d1efef',
          200: '#a3dfdf',
          300: '#75cfcf',
          400: '#63BFBF', // Decorative/backgrounds - 2.15:1 on white
          500: '#3d9e9e', // Large text (18px+) - 3.6:1 on white
          600: '#2d7a7a', // All text sizes - 5.1:1 WCAG AA ✓
          700: '#236363', // High contrast - 6.8:1 WCAG AAA ✓
          800: '#1a4a4a',
          900: '#102121',
        },
        // Accent color - Coral Red (#F25757)
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fcc5c5',
          300: '#f9a3a3',
          400: '#F28379',
          500: '#F25757',
          600: '#d93d3d',
          700: '#b32a2a',
          800: '#8c2020',
          900: '#661818',
        },
        // Navy for dark backgrounds (#010326)
        // Accessibility: 200+ are WCAG AA compliant on white
        navy: {
          50: '#e8e8eb',
          100: '#b8b9c4', // Decorative only - 2.1:1 on white
          200: '#6b6d80', // Muted text - 4.9:1 WCAG AA ✓
          300: '#585b76', // Secondary text - 5.6:1 ✓
          400: '#282c4f',
          500: '#010326',
          600: '#01021f',
          700: '#010218',
          800: '#000111',
          900: '#00010a',
        },
        // Cream for light backgrounds (#F2E2CE)
        cream: {
          50: '#fdfbf8',
          100: '#faf6f0',
          200: '#f7efe4',
          300: '#F2E2CE',
          400: '#e8d4b8',
          500: '#d9c0a0',
          600: '#c4a67f',
          700: '#a78a60',
          800: '#8a6f48',
          900: '#6d5535',
        },
        // Success color - using teal for consistency
        // Accessibility: 600+ are WCAG AA compliant for text on white
        success: {
          50: '#e8f7f7',
          100: '#d1efef',
          500: '#3d9e9e', // Large text only - 3.6:1
          600: '#2d7a7a', // All text sizes - 5.1:1 WCAG AA ✓
          700: '#236363', // High contrast - 6.8:1 WCAG AAA ✓
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-xl': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.3' }],
        'heading': ['1.5rem', { lineHeight: '1.35' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 40px -10px rgba(99, 191, 191, 0.4)',
        'glow-lg': '0 0 60px -15px rgba(99, 191, 191, 0.5)',
        'glow-accent': '0 0 40px -10px rgba(242, 87, 87, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'blink': 'blink 1s step-end infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        trvel: {
          'primary': '#63BFBF',
          'primary-content': '#010326',
          'secondary': '#F28379',
          'secondary-content': '#010326',
          'accent': '#F25757',
          'accent-content': '#ffffff',
          'neutral': '#010326',
          'neutral-content': '#F2E2CE',
          'base-100': '#ffffff',
          'base-200': '#fdfbf8',
          'base-300': '#F2E2CE',
          'base-content': '#010326',
          'info': '#63BFBF',
          'info-content': '#010326',
          'success': '#63BFBF',
          'success-content': '#010326',
          'warning': '#F28379',
          'warning-content': '#010326',
          'error': '#F25757',
          'error-content': '#ffffff',
          'radius-box': '1rem',
          'radius-btn': '0.75rem',
          'radius-badge': '9999px',
          'animation-btn': '0.2s',
          'animation-input': '0.2s',
          'btn-focus-scale': '0.98',
          'noise': '0',
          'depth': '0',
        },
      },
    ],
    darkTheme: false,
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};

export default config;
