/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // FarmSafe palette — "green" tokens are actually trust-blue hues,
        // "amber" tokens are the safety-orange accent. Ported verbatim from
        // website/frontend/src/index.css's @theme block.
        green: {
          50: "#eef4fd",
          100: "#dbe7fb",
          200: "#b6cef6",
          300: "#85adf0",
          400: "#4f83e6",
          500: "#2c5fdb",
          600: "#2148c9",
          700: "#1d4ed8",
          800: "#1a3a99",
          900: "#172d73",
        },
        emerald: {
          50: "#eef2fd",
          100: "#dbe3fb",
          300: "#8fa8ee",
          400: "#5c7de3",
          500: "#3457d4",
          600: "#2740b0",
          700: "#22368e",
        },
        lime: {
          50: "#eef6fb",
          100: "#d9ecf6",
          300: "#7fbfe0",
          600: "#2e8bb3",
        },
        teal: {
          700: "#1e5c8a",
        },
        amber: {
          50: "#fff3ea",
          100: "#ffe1c7",
          200: "#ffc794",
          300: "#ffa75c",
          400: "#f97316",
          500: "#dc5f0c",
          600: "#b74d0a",
          700: "#953f0b",
        },
      },
    },
  },
  plugins: [],
};
