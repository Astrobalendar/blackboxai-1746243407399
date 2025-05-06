/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}" // Ensure all source files are scanned
  ],
  theme: {
    extend: {}, // Add custom theme extensions here if needed
  },
  plugins: [], // Add TailwindCSS plugins here if required
};
