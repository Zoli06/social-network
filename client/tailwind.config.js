/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['node_modules/daisyui/dist/**/*.js', 'node_modules/react-daisyui/dist/**/*.{js,jsx,ts,tsx}', 'src/**/*.{js,jsx,ts,tsx}'],
  plugins: [require('daisyui')],
  // XXX: in case if you want to modify config especially breakpoints take a look the TODO in UserFriends.tsx and do that first
  // Default breakpoints hardcoded there
  // Definitely not a best practice :P
}
