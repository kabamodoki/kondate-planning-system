/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fdf8f3",
        terra: {
          DEFAULT: "#c97c5d",
          light: "#f0d5c8",
          dark: "#a85e41",
        },
        sage: {
          DEFAULT: "#7b9e87",
          light: "#d4e8dc",
          dark: "#5a7a64",
        },
        blush: {
          DEFAULT: "#d4a5a5",
          light: "#f5e6e6",
        },
        warm: {
          900: "#3d2c1e",
          700: "#6b4f3a",
          500: "#9c8578",
          300: "#c4b5ab",
          100: "#f0ebe6",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans JP'", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(61,44,30,0.08)",
        "card-hover": "0 4px 20px rgba(61,44,30,0.14)",
      },
    },
  },
  plugins: [],
};
