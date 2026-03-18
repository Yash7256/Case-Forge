import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
      },
      boxShadow: {
        glass: "0 16px 60px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [animate],
};

export default config;
