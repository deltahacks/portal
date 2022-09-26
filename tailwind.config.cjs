/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      'main': ['Montserrat', 'ui-sans-serif', 'system-ui'],
      'sub': ['Inter', 'ui-serif', 'Georgia'],
    },
  },
  plugins: [require("daisyui")],
};
