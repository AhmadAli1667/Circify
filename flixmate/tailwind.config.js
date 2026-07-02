/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        surface: '#121212',
        primary: '#E50914',
        text: '#FFFFFF',
        muted: '#A3A3A3'
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
}
