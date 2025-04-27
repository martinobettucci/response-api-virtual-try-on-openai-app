/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Poppins', 'sans-serif']
      },
      colors: {
        // Primary color palette
        ivory: {
          50: '#FFFFF8',
          100: '#FFFCF0',
          200: '#FFFAE6',
          300: '#FFF7D9',
          400: '#FFF5CC',
          500: '#FFF2BF'
        },
        gold: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE799',
          300: '#FFDB66',
          400: '#FFCF33',
          500: '#FFC300',
          600: '#CC9C00',
          700: '#997500',
          800: '#664E00',
          900: '#332700'
        },
        navy: {
          50: '#E6ECFA',
          100: '#CCD9F5',
          200: '#99B3EB',
          300: '#668CE0',
          400: '#3366D6',
          500: '#0040CC',
          600: '#0033A3',
          700: '#00267A',
          800: '#001A52',
          900: '#000D29'
        },
        blush: {
          50: '#FEE6F0',
          100: '#FCCCE0',
          200: '#F999C2',
          300: '#F666A3',
          400: '#F33385',
          500: '#F00066',
          600: '#C00052',
          700: '#90003D',
          800: '#600029',
          900: '#300014'
        }
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 3s ease-in-out infinite'
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'elegant': '0 10px 50px -12px rgba(0, 0, 0, 0.1)'
      }
    },
  },
  plugins: [],
};