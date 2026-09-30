/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        climate: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        monsoon: {
          dark: '#0c1a15',
          forest: '#132e24',
          pine: '#1a4033',
          border: '#234e3f',
          surface: '#11221b',
          card: '#162b23',
          accent: '#c99a3e',
        },
        risk: {
          low: '#16a34a',
          moderate: '#ca8a04',
          elevated: '#ea580c',
          high: '#dc2626',
          critical: '#991b1b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
