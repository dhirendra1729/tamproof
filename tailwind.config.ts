import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paleMint: "#F2F7F4",
        forestCharcoal: "#223326",
        sageGray: "#5A6B5E",
        mutedOlive: "#5A7D5C",
        warmAmber: "#C48B47",
        dangerCrimson: "#D9383A",
        // Crisp UI contrast borders & backgrounds
        panelBorder: "#4A6150",
        panelBorderSubtle: "#7E9685",
        panelHeaderBg: "#E2ECE5",
        innerBoxBg: "#F4F8F5",
        innerBoxBorder: "#BDCEBF",
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      boxShadow: {
        boxOutline: "0 2px 8px rgba(34, 51, 38, 0.08), 0 1px 3px rgba(34, 51, 38, 0.06)",
        cardFrame: "0 4px 16px rgba(34, 51, 38, 0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
