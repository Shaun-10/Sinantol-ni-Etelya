/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brandGreen: '#0aa000',
        darkGreen: '#1f5b26',
        brandYellow: '#f3df3f',
        softWhite: '#f5f5f5'
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Baloo 2', 'sans-serif']
      },
      boxShadow: {
        card: '6px 8px 0 rgba(35, 128, 41, 0.25)',
        textGlow: '3px 3px 0 #f3df3f'
      }
    }
  },
  plugins: []
};
