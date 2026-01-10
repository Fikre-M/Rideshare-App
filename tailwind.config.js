/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
          contrastText: '#ffffff',
        },
        secondary: {
          DEFAULT: '#9c27b0',
          light: '#ba68c8',
          dark: '#7b1fa2',
          contrastText: '#ffffff',
        },
        error: {
          DEFAULT: '#d32f2f',
          light: '#ef5350',
          dark: '#c62828',
          contrastText: '#ffffff',
        },
        warning: {
          DEFAULT: '#ed6c02',
          light: '#ff9800',
          dark: '#e65100',
          contrastText: '#ffffff',
        },
        info: {
          DEFAULT: '#0288d1',
          light: '#03a9f4',
          dark: '#01579b',
          contrastText: '#ffffff',
        },
        success: {
          DEFAULT: '#2e7d32',
          light: '#4caf50',
          dark: '#1b5e20',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'elevation-1': '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12)',
        'elevation-4': '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)',
        'elevation-8': '0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
      },
      transitionDuration: {
        'shortest': 150,
        'shorter': 200,
        'short': 250,
        'standard': 300,
        'complex': 375,
        'enteringScreen': 225,
        'leavingScreen': 195,
      },
      zIndex: {
        'app-bar': 1100,
        'drawer': 1200,
        'modal': 1300,
        'snackbar': 1400,
        'tooltip': 1500,
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
  corePlugins: {
    preflight: true,
  },
}
