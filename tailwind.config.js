import colors from 'tailwindcss/colors';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        pizza: {
          light: '#FFF8E1', // This definition allows Tailwind to generate .bg-pizza-light
          DEFAULT: '#FFC107',
          dark: '#2E2317',
        },
        primary: colors.emerald,
        info: colors.sky,
        warning: colors.amber,
        brand: {
          DEFAULT: '#f97316',
          dark: '#ea580c'
        },
        'pizza-dough-light': '#FFF9F0',      // Main light theme card bg
        'pizza-oven-dark': '#2A1C12',        // Main dark theme card bg (a bit darker than previous)
        'pizza-crust': '#A07855',            // Borders, accents
        'pizza-cheese-melt': '#D4A017',      // Dark mode borders, accents
        'pizza-tomato-red': '#E74C3C',       // Headings, errors, important text (slightly brighter red)
        'pizza-cheese-yellow': '#F1C40F',    // Dark mode headings, highlights, warnings (brighter yellow)
        'pizza-olive-dark': '#3D402D',       // Body text light mode (darker olive)
        'pizza-parchment': '#FDF5E6',        // Inner elements light mode (like old lace)
        'pizza-box-dark': '#4A3B31',         // Inner elements dark mode
        'pizza-basil-green': '#2ECC71',      // Success, mint button (brighter green)
        'pizza-basil-green-darker': '#27AE60',
        'pizza-sky-blue': '#3498DB',         // Info messages, view button
        'pizza-sky-blue-darker': '#2980B9',
        'pizza-slate-light': '#E2E8F0',      // For loading spinners, disabled states in light mode
        'pizza-slate-dark': '#475569',       // For loading spinners, disabled states in dark mode
        'pizza-error-light-bg': '#FADBD8',   // Background for light mode error messages
        'pizza-error-dark-bg': '#5E2D2B',    // Background for dark mode error messages
        'pizza-success-light-bg': '#D5F5E3', // Background for light mode success messages
        'pizza-success-dark-bg': '#2A5237',  // Background for dark mode success messages
        'pizza-info-light-bg': '#D6EAF8',    // Background for light mode info messages
        'pizza-info-dark-bg': '#2C3E50',     // Background for dark mode info messages
        'pizza-sky-light': '#F0F9FF',        // Page background - light mode (very light blue)
        'pizza-night-dark': '#1A1D24',       // Page background - dark mode (deep, desaturated blue/grey)
        'pizza-dough-light': '#FFF9F0',      // Card background - light mode (creamy off-white)
        'pizza-oven-dark': '#2A1C12',        // Card background - dark mode (warm dark brown)
        'pizza-crust': '#A07855',            // Borders, accents - light mode
        'pizza-cheese-melt': '#D4A017',      // Borders, accents - dark mode
        'pizza-tomato-red': '#E74C3C',       // Headings, accents (vibrant red)
        'pizza-cheese-yellow': '#F1C40F',    // Dark mode headings, accents (vibrant yellow)
        'pizza-olive-dark': '#3D402D',       // Body text - light mode
        'pizza-parchment': '#FDF5E6',        // Body text - dark mode (light, warm off-white)
        'pizza-gold-accent': '#FFC107',      // Brighter gold for special highlights
        'pizza-hero-text-light': '#4A2C2A',  // Darker, rich brown for hero text on light bg
        'pizza-hero-text-dark': '#FFF0D9',   // Warm off-white for hero text on dark bg
        'page-bg-light-dough': '#FFFBF0',     // A very light, warm, creamy beige (like fresh dough)
        'page-bg-dark-brick': '#4A2C2A',
      }
    }
  },
  plugins: []
}
