/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#2C2C2C",
        text: "#E3E3E3",
        border: "#4B4B4B",
        available: "#222222",
        unavailable: "#28272C",
        "discord-blue": "#738ADB",
      },
    },
  },
  plugins: [],
};
