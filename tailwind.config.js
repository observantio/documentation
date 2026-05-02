import tailwindScrollbar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Ubuntu Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          '"Courier New"',
          "monospace",
        ],
        mono: ["Ubuntu Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [tailwindScrollbar()],
};
