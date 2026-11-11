/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF8C00',
          gold: '#FFD400',
          amber: '#FFC300',
          orange: '#FF8C00',
          flame: '#FF5F00',
          hover: '#FF5F00',
          light: '#FFF9E6',
          dark: '#FF5F00',
        },
        dark: {
          black: '#090A0F',
          sidebar: '#0B0F17',
          surface: '#111827',
          card: '#181924',
          border: '#27272A',
          muted: '#94A3B8',
        },
        graph: {
          blue: '#2563EB',
          'blue-light': '#3B82F6',
          'blue-cyan': '#60A5FA',
          'blue-dark': '#1D4ED8',
        },
        // Mapped legacy tokens for seamless amber & black compatibility
        forest: {
          DEFAULT: '#0B0F17', // Obsidian Black
          dark: '#05070B',
          deep: '#000000',
          light: '#18181B',
          border: '#27272A',
        },
        ivory: {
          DEFAULT: '#FAFAF9', // Clean Crisp Canvas
          warm: '#FAFAF9',
          cream: '#FFFFFF',
          soft: '#F5F5F4',
          dark: '#E7E5E4',
        },
        sage: {
          DEFAULT: '#FED7AA', // Warm Amber Soft
          light: '#FFF7ED',
          dark: '#FB923C',
        },
        lightgrey: '#F4F4F5',
        charcoal: '#090A0F',
        muted: '#64748B',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        small: ['Roboto', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        serif: ['Poppins', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 10px 30px rgba(0, 0, 0, 0.12)',
        'amber-glow': '0 0 20px rgba(250, 129, 47, 0.25)',
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
