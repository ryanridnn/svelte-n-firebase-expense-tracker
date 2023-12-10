export default {
  content: ["./index.html", "./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        "app-bg": {
          100: "#122121", // bg color,
          200: "#031916", // date bg
          300: "#203737", // modal bg
          400: "#365252", // input bg
          500: "#6A8B87", // bar bg
          600: "#1C3230", // toggler bg
          700: "#8E93A8", // border bg
        },
        "app-theme": {
          yellow: "#F7E987",
          green: "#6FF3B4",
          red: "#F66565",

          // accents
          "red-accent": "#FF9797",
        },
        "app-text": {
          dark: "#122121",
          light: "#FFFFFF",
          "grey-100": "#BACAC9",
        },
        "app-input": {
          "bg-focus": "#365252",
          "outline-focus": "#BCC7C7",
          "bg-normal": "#2E4848",
          "outline-normal": "#648787",
        },
      },
    },
  },
  plugins: [],
};
