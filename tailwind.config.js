/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#070B16",
        navy: "#0B1324",
        sanctuary: "#111B2E",
        chapel: "#17243A",
        gold: "#E7C873",
        goldSoft: "#F8E6A6",
        ivory: "#FFFDF4",
        mist: "#AEB9CC",
        ember: "#E06464",
        victory: "#66D9A1",
      },
    },
  },
  plugins: [],
};
