/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        inter: ["Inter"],
      },
      animation: {
        "slow-bg": "background-move 5s linear infinite",
      },
      keyframes: {
        "background-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
      },

    },
    plugins: [require("daisyui")],
  }
};


//
//module.exports = {
//  content: ["./src/**/*.{js,ts,jsx,tsx}"],
//  theme: {
//    extend: {},
//    extend: {
//      fontFamily: {
//        montserrat: ["Montserrat", "sans-serif"],
//      },
//    },
//  },
//  plugins: [],
//  plugins: [require("daisyui")],
//};