import tailwindScrollbar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Serif"', "Georgia", "Times New Roman", "serif"],
        mono: ["Ubuntu Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [tailwindScrollbar()],
};
