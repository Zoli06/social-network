/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['node_modules/daisyui/dist/**/*.js', 'node_modules/react-daisyui/dist/**/*.{js,jsx,ts,tsx}'],
  plugins: [require('daisyui')],
}