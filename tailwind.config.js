// tailwind.config.js
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
        // --- UPDATED Page Background & Text Colors (Option 2: Warmer Theme) ---
        'page-bg-light': '#FAF8F5',      // Light Mode: Very light, warm off-white (like subtle dough or parchment)
        'page-bg-dark': '#211F1E',       // Dark Mode: Very dark, slightly warm, desaturated charcoal/brown (oven interior/cozy pizzeria)
        
        'page-text-light': '#4A3B31',    // Dark warm brown text for light BG (like your pizza-box-dark)
        'page-text-dark': '#EAE0D5',     // Light warm parchment/off-white text for dark BG

        // Hero paragraph text (can use page-text or be specific for nuance)
        'hero-paragraph-light': '#5D4037', // Slightly less intense dark brown for hero text on light page BG
        'hero-paragraph-dark': '#D7CCC8',  // Soft warm off-white for hero text on dark page BG

        // --- Your existing thematic colors for cards, UI elements, accents ---
        pizza: {
          light: '#FFF8E1',
          DEFAULT: '#FFC107',
          dark: '#2E2317',
        },
        primary: colors.emerald, // Keep as is, or consider if emerald fits the warm pizza theme
        info: colors.sky,        // Keep as is for info states, or consider a warmer alternative if desired
        warning: colors.amber,   // Amber fits well with a warm theme
        brand: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },
        'pizza-dough-light': '#FFF9F0',      // Card background - light mode
        'pizza-oven-dark': '#2A1C12',        // Card background - dark mode
        'pizza-crust': '#A07855',
        'pizza-cheese-melt': '#D4A017',
        'pizza-tomato-red': '#E74C3C',
        'pizza-cheese-yellow': '#F1C40F',
        'pizza-olive-dark': '#3D402D',
        'pizza-parchment': '#FDF5E6',        // Can also be used for page-text-dark if EAE0D5 is too similar/different
        'pizza-box-dark': '#4A3B31',
        'pizza-basil-green': '#2ECC71',
        'pizza-basil-green-darker': '#27AE60',
        'pizza-sky-blue': '#3498DB',         // Keep for specific UI like "View NFT" button if desired for contrast
        'pizza-sky-blue-darker': '#2980B9',
        'pizza-gold-accent': '#FFC107',

        'pizza-slate-light': colors.stone[200], // Switched to stone for warmer disabled/loading bg (#e7e5e4)
        'pizza-slate-dark': colors.stone[700],  // Switched to stone for warmer disabled/loading bg (#44403c)
        
        'pizza-error-light-bg': '#FEE2E2',
        'pizza-error-dark-bg': '#5E2D2B',
        'pizza-success-light-bg': '#D1FAE5',
        'pizza-success-dark-bg': '#2A5237',
        'pizza-info-light-bg': '#DBEAFE',    // If keeping sky-blue, this is fine
        'pizza-info-dark-bg': '#2C3E50',     // If keeping sky-blue, this is fine

        'pizza-hero-text-light': '#4A2C2A', // Already defined, good for warm light bg
        'pizza-hero-text-dark': '#FFF0D9',  // Already defined, good for warm dark bg
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};