// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // New way
    // You can also pass options to tailwindcss here if needed:
    // '@tailwindcss/postcss': { config: './tailwind.config.js' }, 
    autoprefixer: {},
  },
}