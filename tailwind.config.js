/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        reveal: {
          '0%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '12.5%': { transform: 'translateX(-5px)' },
          '25%': { transform: 'translateX(5px)' },
          '37.5%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(0)' },
          '62.5%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
          '87.5%': { transform: 'translateX(-5px)' }
        }
      },
      animation: {
        'reveal': 'reveal 1s ease-in-out infinite',
        'shake': 'shake 1s ease-in-out'
      }
    },
  },
  plugins: [],
}