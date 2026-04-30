import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde5ff",
          200: "#c3d0ff",
          300: "#9cb1ff",
          400: "#7289ff",
          500: "#4f63f5",
          600: "#3a46e8",
          700: "#2f38cc",
          800: "#2a32a4",
          900: "#282f81",
          950: "#191c4d",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body:    ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
