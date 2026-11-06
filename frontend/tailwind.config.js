/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#244C35',
          dark: '#153B2A',
          deep: '#0F2B1E',
          light: '#2E5D42',
          border: '#336148',
        },
        ivory: {
          DEFAULT: '#F7F3E9',
          warm: '#F7F3E9',
          cream: '#FFFDF7',
          soft: '#FBF9F2',
          dark: '#EBE5D6',
        },
        sage: {
          DEFAULT: '#DCE8D9',
          light: '#EDF4EB',
          dark: '#B8CEB3',
        },
        lightgrey: '#F2F3EF',
        charcoal: '#202820',
        muted: '#737B72',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(21, 59, 42, 0.05)',
        'card-hover': '0 8px 24px rgba(21, 59, 42, 0.08)',
        'dropdown': '0 10px 30px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
