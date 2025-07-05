/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors - Professional and easy on the eyes
        light: {
          primary: '#2563eb',      // Blue-600
          secondary: '#7c3aed',    // Violet-600
          accent: '#0891b2',       // Cyan-600
          success: '#059669',      // Emerald-600
          warning: '#d97706',      // Amber-600
          error: '#dc2626',        // Red-600
          surface: '#ffffff',      // White
          background: '#f8fafc',   // Slate-50
          text: '#1f2937',         // Gray-800
          'text-secondary': '#6b7280' // Gray-500
        },
        // Dark theme colors (existing)
        dark: {
          primary: '#10b981',      // Emerald-500
          secondary: '#06b6d4',    // Cyan-500
          accent: '#8b5cf6',       // Violet-500
          success: '#10b981',      // Emerald-500
          warning: '#f59e0b',      // Amber-500
          error: '#ef4444',        // Red-500
          surface: '#111827',      // Gray-900
          background: '#000000',   // Black
          text: '#ffffff',         // White
          'text-secondary': '#9ca3af' // Gray-400
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
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
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'display': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '100rem',
        'screen-2xl': '1536px',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};