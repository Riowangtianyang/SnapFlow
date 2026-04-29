export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#EEF2FF',
        },
        accent: {
          DEFAULT: '#F97316',
          light: '#FFF7ED',
        },
        surface: '#FFFFFF',
        background: '#FAFAFA',
        border: '#E5E5E5',
        'text-primary': '#0A0A0A',
        'text-secondary': '#525252',
        'text-muted': '#A3A3A3',
        success: '#10B981',
        'success-bg': '#ECFDF5',
        warning: '#F59E0B',
        'warning-bg': '#FFFBEB',
        nav: '#0A0A0A',
        'nav-border': '#262626',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Syne', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'button': '10px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 10px 40px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
}
