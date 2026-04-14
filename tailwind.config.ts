import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base palette - neutral luxury
        'base-950': '#0A0A0A',
        'base-900': '#111113',
        'base-850': '#18181B',
        'base-800': '#27272A',
        'base-700': '#3F3F46',
        'base-600': '#52525B',
        'base-500': '#71717A',
        'base-400': '#A1A1AA',
        'base-300': '#D4D4D8',
        'base-200': '#E4E4E7',
        'base-100': '#F4F4F5',

        // Text hierarchy
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1AA',
        'text-muted': '#71717A',

        // Accent - Electric Blue (primary interaction)
        'accent-50': '#F0F9FF',
        'accent-100': '#E0F2FE',
        'accent-300': '#7DD3FC',
        'accent-500': '#3B82F6',
        'accent-600': '#2563EB',
        'accent-700': '#1D4ED8',
        'accent-900': '#0C2340',

        // Semantic colors
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',

        // Surface layers
        'surface-primary': '#111113',
        'surface-secondary': '#18181B',
        'surface-tertiary': '#27272A',
        'surface-hover': '#3F3F46',
      },

      fontSize: {
        // Editorial/luxury typography
        'display-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h1': ['32px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.35', letterSpacing: '0', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'h4': ['18px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0.5px', fontWeight: '500' }],
        'label': ['12px', { lineHeight: '1.4', letterSpacing: '0.5px', fontWeight: '600' }],
      },

      spacing: {
        // 8px grid system
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
        'xxxl': '48px',
        'max': '64px',
      },

      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },

      boxShadow: {
        // Elevation system
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'focus-glow': '0 0 0 3px rgba(59, 130, 246, 0.1), 0 0 0 4px rgba(59, 130, 246, 0.5)',
      },

      transitionDuration: {
        'fast': '150ms',
        'smooth': '200ms',
        'fluid': '300ms',
      },

      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
      },

      fontFamily: {
        'sans': ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
