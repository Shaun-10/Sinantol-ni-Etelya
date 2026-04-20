/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Rider app specific colors
        'rider-bg': '#e7e7e7',
        'rider-hero': '#f4e964',
        'rider-border': '#c8c8c8',
        'rider-text': '#1f3021',
        'rider-text-main': '#0f641e',
        'rider-text-muted': '#56635a',
        'rider-text-gray': '#a0a0a0',
        'rider-text-dark-gray': '#9c9c9c',
        'rider-field-border': '#7acb80',
        'rider-field-bg': '#dcdcdc',
        'rider-field-text': '#2f3630',
        'rider-btn-border': '#e8b83f',
        'rider-btn-bg': '#f4e34a',
        'rider-btn-text': '#0b6a1d',
        'rider-btn-yellow': '#f2e24e',
        'rider-badge-bg': '#f5efb8',
        'rider-badge-text': '#e58f10',
        'rider-card-bg': '#d5d5d5',
        'rider-item-bg': '#d6d6d6',
        'rider-next-stop-border': '#efcd43',
        'rider-next-stop-label': '#d9b93f',
        'rider-next-stop-bg': '#ececec',
        'rider-next-stop-green': '#0b6720',
        'rider-pill-yellow': '#f4e84f',
        'rider-pill-yellow-text': '#5d5e26',
        'rider-pill-green': '#d0f257',
        'rider-pill-green-text': '#337014',
        'rider-pill-red': '#ff9f9f',
        'rider-pill-red-text': '#c11f1f',
        'rider-green-bold': '#145f1f',
        'rider-green-dark': '#115f1e',
        'rider-icon-circle': '#f0e24e',
        'rider-history-bg': '#d8d8d8',
        'rider-details-card': '#d7d7d7',
        'rider-details-heading': '#0c631f',
        'rider-details-total': '#116220',
        'rider-amount-green': '#116321',
        'rider-total-bg': '#d9dfd9',
        'rider-total-border': '#27a842',
        'rider-logout-bg': '#ef8e8e',
        'rider-logout-text': '#ff1d1d',
        'rider-nav-bg': '#efefef',
        'rider-nav-active': '#ebbf2a',
        // Admin and original colors
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
        textGlow: '3px 3px 0 #f3df3f',
        'rider-btn': '0 2px 7px rgba(216, 154, 10, 0.45)',
        'rider-badge': '0 6px 16px rgba(0, 0, 0, 0.2)'
      },
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '6.5': '26px',
        '7.5': '30px',
        '8.5': '34px',
        '9': '36px'
      }
    }
  },
  plugins: []
};
