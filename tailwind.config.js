module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        display: ["EB Garamond", "serif"],
        body: ["EB Garamond", "serif"]
      },
      colors: {
        "white-15": "#ffffff26",
        "gray-0": "#1f1f1f",
        gm: {
          1: "#191D7E",
          2: "#DAC931",
          3: "#B45FBB",
          4: "#1FAD94",
          5: "#2C1A72",
          6: "#36662A",
          7: "#78365E",
          8: "#4F4B4B",
          9: "#9B1414",
          10: "#77CE58",
          11: "#C07A28",
          12: "#511D71",
          13: "#949494",
          14: "#DB8F8B",
          15: "#318C9F",
          16: "#00AE3B"
        }
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
