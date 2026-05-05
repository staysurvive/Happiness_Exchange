/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f5f5f7',
        surface: '#ffffff',
        'surface-soft': 'rgba(255,255,255,0.82)',
        'surface-muted': '#fafafc',
        'text-primary': '#1d1d1f',
        'text-secondary': '#6e6e73',
        'text-tertiary': '#86868b',
        'border-soft': 'rgba(0,0,0,0.08)',
        'border-light': 'rgba(255,255,255,0.65)',
        'accent-blue': '#9fd7ff',
        'accent-purple': '#d6c7ff',
        'accent-pink': '#ffd1dc',
        'accent-orange': '#ffd7a8',
        'accent-green': '#c9f3df',
        'accent-yellow': '#fff0a8',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.06)',
        glass: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 36%, #fff4f8 72%, #fffaf0 100%)',
        'card-blue': 'linear-gradient(135deg, #eef7ff 0%, #ffffff 65%)',
        'card-pink': 'linear-gradient(135deg, #fff1f6 0%, #ffffff 68%)',
        'card-warm': 'linear-gradient(135deg, #fff7e8 0%, #ffffff 70%)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
      maxWidth: {
        page: '1200px',
      },
    },
  },
  plugins: [],
}
