/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Institutional Blue - inspired by French gouv style (though not exact to avoid specific branding issues, just "institutionnel")
        brand: {
          50: '#f4f6fb',
          100: '#e8ecf6',
          200: '#ced8eb',
          300: '#a5bce1',
          400: '#749ad5',
          500: '#4e7ac7',
          600: '#3960ad',
          700: '#2e4d8c',
          800: '#284272',
          900: '#24385d',
          950: '#17243e',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
