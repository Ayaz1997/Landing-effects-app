import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        studio: {
          950: "#000000",
          900: "#050505",
          800: "#0a0a0a",
          700: "#111111",
          600: "#1a1a1a",
          500: "#222222",
        },
        accent: {
          DEFAULT: "#00fff2", // Cyber Cyan
          glow: "rgba(0, 255, 242, 0.4)",
        }
      },
      fontFamily: {
        mono: ["var(--font-dm-mono)", "monospace"],
      },
    },
  },
  plugins: [animate],
};
export default config;
