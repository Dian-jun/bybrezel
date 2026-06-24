import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F5F7",
        ink: "#111827",
        line: "#E5E7EB",
        warm: {
          100: "#F7E5CF",
          200: "#F0C58A",
          300: "#D99A4E",
          400: "#C77B30",
          500: "#A76120"
        }
      },
      borderRadius: {
        "4xl": "2rem"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(17, 24, 39, 0.06)"
      },
      maxWidth: {
        prosewide: "74rem"
      }
    }
  },
  plugins: []
};

export default config;
