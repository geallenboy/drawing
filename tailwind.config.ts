import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",

  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [nextui({
    themes: {
      light: {
        layout: {}, // light theme layout tokens
        colors: {
          primary: {
            DEFAULT: "#5253A3"
          }
        }, // light theme colors
      },
      dark: {
        layout: {}, // dark theme layout tokens
        colors: {

        }, // dark theme colors
      },
      // ... custom themes
    },
  })],
} satisfies Config;
