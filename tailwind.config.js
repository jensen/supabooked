/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "unavailable-pattern": "url('/images/unavailable.svg')",
      },
      colors: {
        background: "#2C2C2C",
        text: "#E3E3E3",
        border: "#4B4B4B",
        available: "#222222",
        unavailable: "#23212D",
        "discord-blue": "#738ADB",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
  plugins: [],
};
