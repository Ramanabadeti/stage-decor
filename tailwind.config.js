module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FDFBF7",
        cream: "#F6F0E6",
        linen: "#EFE6D8",
        blush: "#EBD9D2",
        rose: "#B08278",
        gold: "#B8954F",
        goldlight: "#D4B87A",
        ink: "#3A332D",
        muted: "#7A6F63",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body: ["Jost", "'Helvetica Neue'", "Arial", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.3em",
      },
      boxShadow: {
        soft: "0 20px 60px -25px rgba(58, 51, 45, 0.28)",
        card: "0 10px 40px -20px rgba(58, 51, 45, 0.35)",
      },
    },
  },
  plugins: [],
};
