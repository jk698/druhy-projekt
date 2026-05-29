import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          soft: "#262626",
          mute: "#737373",
        },
        paper: {
          DEFAULT: "#ffffff",
          soft: "#f5f5f4",
        },
        brand: {
          DEFAULT: "#00bc7d",
          dark: "#00a06a",
          soft: "#e7f9f1",
        },
        accent: {
          a: "#00a06a",
          b: "#2563eb",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "70ch",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
