/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Text"', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['"SF Pro Display"', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        ink: {
          0: '#ffffff',
          50: '#f5f5f7',
          100: '#e5e5ea',
          200: '#d1d1d6',
          300: '#8e8e93',
          400: '#636366',
          500: '#48484a',
          600: '#3a3a3c',
          700: '#2c2c2e',
          800: '#1c1c1e',
          900: '#0b0b0b'
        },
        accent: {
          DEFAULT: '#0A84FF',
          500: '#0A84FF',
          600: '#0060DF'
        }
      },
      borderRadius: { xl2: '1rem', '3xl': '1.5rem' }
    }
  },
  plugins: []
}
