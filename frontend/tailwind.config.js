/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Tailwind v3 CSS-variable pattern ──
           Colors are stored as bare RGB channels (no rgb() wrapper)
           so that opacity modifiers like bg-primary/20 work correctly. */

        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover:   "rgb(var(--color-primary-hover) / <alpha-value>)",
          foreground: "#FFFFFF",
        },
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground:  "rgb(var(--color-foreground) / <alpha-value>)",
        surface:     "rgb(var(--color-surface) / <alpha-value>)",
        accent:      "rgb(var(--color-accent) / <alpha-value>)",

        /* Legacy aliases — existing components use bg-navy-dark, text-ice,
           bg-sky, etc. Keep them wired so nothing breaks. */
        navy: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          dark:    "rgb(var(--color-background) / <alpha-value>)",
          light:   "rgb(var(--color-surface) / <alpha-value>)",
        },
        steel: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
        },
        ice: {
          DEFAULT: "rgb(var(--color-foreground) / <alpha-value>)",
        },
        
        /* Semantic text shades for Tailwind classes */
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",

        /* ── The Magic Aliases ──
           To safely remove hardcoded colors across the app without 
           doing risky search-and-replace in 50+ files, we intercept 
           the standard Tailwind palette and route it to our CSS variables. */
        white: "rgb(var(--color-foreground) / <alpha-value>)",
        black: "rgb(var(--color-background) / <alpha-value>)",
        
        // Map cool colors to Accent
        sky: { DEFAULT: "rgb(var(--color-accent) / <alpha-value>)", 400: "rgb(var(--color-accent) / <alpha-value>)", 500: "rgb(var(--color-accent) / <alpha-value>)", 600: "rgb(var(--color-accent) / <alpha-value>)" },
        blue: { DEFAULT: "rgb(var(--color-accent) / <alpha-value>)", 400: "rgb(var(--color-accent) / <alpha-value>)", 500: "rgb(var(--color-accent) / <alpha-value>)", 600: "rgb(var(--color-accent) / <alpha-value>)" },
        
        // Map purple/indigo to Primary
        purple: { DEFAULT: "rgb(var(--color-primary) / <alpha-value>)", 400: "rgb(var(--color-primary) / <alpha-value>)", 500: "rgb(var(--color-primary) / <alpha-value>)" },
        indigo: { DEFAULT: "rgb(var(--color-primary) / <alpha-value>)", 400: "rgb(var(--color-primary) / <alpha-value>)", 500: "rgb(var(--color-primary) / <alpha-value>)", 600: "rgb(var(--color-primary) / <alpha-value>)" },

        // Map orange to Warning
        orange: { DEFAULT: "rgb(var(--color-warning) / <alpha-value>)", 400: "rgb(var(--color-warning) / <alpha-value>)", 500: "rgb(var(--color-warning) / <alpha-value>)", 600: "rgb(var(--color-warning) / <alpha-value>)" },

        // Map grays to Surface/Text-Secondary
        slate: { 800: "rgb(var(--color-surface) / <alpha-value>)", 900: "rgb(var(--color-background) / <alpha-value>)" },
        gray: { 400: "rgb(var(--color-text-muted) / <alpha-value>)", 700: "rgb(var(--color-border-rgb) / <alpha-value>)", 800: "rgb(var(--color-surface) / <alpha-value>)", 900: "rgb(var(--color-background) / <alpha-value>)" },
        zinc: { 800: "rgb(var(--color-surface) / <alpha-value>)", 900: "rgb(var(--color-background) / <alpha-value>)" },
        
        card: {
          DEFAULT: "rgb(var(--color-surface) / 0.4)",
          foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--color-border-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
