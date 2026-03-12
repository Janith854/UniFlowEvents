
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        secondary: 'var(--secondary)',
        'bg-base': 'var(--bg-base)',
        'bg-card': 'var(--bg-card)',
        'bg-surface': 'var(--bg-surface)',
        'border-token': 'var(--border)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px var(--primary-glow)',
        'glow-primary-strong': '0 0 30px var(--primary-glow-strong)',
        'glow-secondary': '0 0 15px var(--secondary-glow)',
      }
    },
  },
  plugins: [],
}
