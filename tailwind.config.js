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
        // --- Neutral Page Background & Text Colors (to make page less brown) ---
        'page-bg-light': colors.slate[100],      // Example: #f1f5f9 (Light Mode Page BG)
        'page-bg-dark': colors.slate[900],       // Example: #0f172a (Dark Mode Page BG)
        'page-text-light': colors.slate[800],    // Example: #1e293b (Default text on light page BG)
        'page-text-dark': colors.slate[200],     // Example: #e2e8f0 (Default text on dark page BG)

        // --- Core Thematic Palette for Pizza Elements ---
        pizza: {
          light: '#FFF8E1',     // Very light creamy for highlights or specific pizza elements
          DEFAULT: '#FFC107',    // Main "pizza cheese" yellow/orange, also used for pizza-gold-accent
          dark: '#2E2317',      // Dark, rich brown for specific pizza elements
        },

        // --- General UI Colors from your setup ---
        primary: colors.emerald,
        info: colors.sky,
        warning: colors.amber,
        brand: {                 // Your main brand orange
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },

        // --- Specific Thematic Colors for App Container, Cards, Text, UI states ---
        'pizza-dough-light': '#FFF9F0',      // Card background - light mode (creamy off-white)
        'pizza-oven-dark': '#2A1C12',        // Card background - dark mode (warm dark brown)
        'pizza-crust': '#A07855',            // Borders, accents
        'pizza-cheese-melt': '#D4A017',      // Dark mode borders, accents (rich gold/brown)
        'pizza-tomato-red': '#E74C3C',       // Headings, errors (vibrant red)
        'pizza-cheese-yellow': '#F1C40F',    // Dark mode headings, highlights (vibrant yellow)
        
        // Text colors for use on thematic backgrounds (e.g., inside cards)
        'pizza-olive-dark': '#3D402D',       // Body text on light thematic backgrounds
        'pizza-parchment': '#FDF5E6',        // Body text on dark thematic backgrounds (light, warm off-white)
        
        'pizza-box-dark': '#4A3B31',         // For inner elements in dark mode (e.g., attribute pills bg)
        'pizza-hero-text-light': '#4A2C2A',  // Dark brown for hero text on light page BG (if page bg is very light)
        'pizza-hero-text-dark': '#FFF0D9',   // Warm off-white for hero text on dark page BG

        // Accent & State Colors
        'pizza-basil-green': '#2ECC71',
        'pizza-basil-green-darker': '#27AE60',
        'pizza-sky-blue': '#3498DB',         // For info messages, specific buttons
        'pizza-sky-blue-darker': '#2980B9',
        'pizza-gold-accent': '#FFC107',      // Same as pizza.DEFAULT, for semantic clarity if needed

        // UI State Backgrounds (Loading, Disabled, Messages)
        'pizza-slate-light': colors.slate[200], // For loading/disabled states in light mode (e.g., #e2e8f0)
        'pizza-slate-dark': colors.slate[700],  // For loading/disabled states in dark mode (e.g., #334155)
        
        'pizza-error-light-bg': '#FEE2E2',   // Tailwind's red-100
        'pizza-error-dark-bg': '#5E2D2B',    // Custom dark red
        'pizza-success-light-bg': '#D1FAE5', // Tailwind's green-100
        'pizza-success-dark-bg': '#2A5237',  // Custom dark green
        'pizza-info-light-bg': '#DBEAFE',    // Tailwind's blue-100
        'pizza-info-dark-bg': '#2C3E50',     // Custom dark blue
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.08)',
        // You can add more thematic shadows here if needed
        // e.g., 'pizza-glow-light': '0 0 20px 0px theme(colors.pizza.DEFAULT)',
        //       'pizza-glow-dark': '0 0 20px 0px theme(colors.pizza-cheese-yellow)',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // Example: if you wanted to add official plugins
  ],
};