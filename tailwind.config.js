/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aerospace: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f8',
          500: '#0e8ce9',
          600: '#0270c7',
          700: '#0359a1',
          800: '#074b85',
          900: '#0c3f6e',
          950: '#082849',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        health: {
          good: '#10b981',
          warning: '#f59e0b',
          critical: '#ef4444',
          severe: '#b91c1c',
        },
        ai: {
          light: '#f5f3ff',
          border: '#ddd6fe',
          primary: '#8b5cf6',
          dark: '#6d28d9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'tech': '0 0 15px rgba(14, 140, 233, 0.15)',
      }
    },
  },
  plugins: [],
}
