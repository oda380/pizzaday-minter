// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // If you have an index.html in the root (common with Vite)
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all JS/JSX/TS/TSX files in your src folder
  ],
  theme: {
    extend: {
      // You can extend the default Tailwind theme here
      // For example, to add custom fonts or colors:
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Example: add a custom brand color
        // 'brand-pizza': '#FFD700',
      },
    },
  },
  plugins: [
    // You can add Tailwind plugins here if needed
    // require('@tailwindcss/forms'),
  ],
}