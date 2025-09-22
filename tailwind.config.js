// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#074799",
        primaryDark: "#032959",
        secondary: "#009990",
        white: "#FFFFFF",
        black: "#000000",
        gradient: "#e2e8f0",
      },
      boxShadow: {
        custom: "0px 5px 20px 0px rgb(69 67 96 / 10%)",
      },
      fontFamily: {
        arabic: ["Alexandria", "sans-serif"],
      },
      // Add responsive breakpoints if needed
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
