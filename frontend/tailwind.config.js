/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          500: "#3b6df5",
          600: "#2d57d6",
          700: "#1f43ad",
        },
      },
    },
  },
  plugins: [],
};
