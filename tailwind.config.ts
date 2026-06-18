import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem" },
      screens: { "2xl": "1200px" },
    },
    extend: {
      fontFamily: {
        sans: ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      colors: {
        edel: {
          orange: "#ea580c",
          "orange-light": "#f97316",
          "orange-dark": "#c2410c",
          "orange-soft": "#ffedd5",
          red: "#ef4444",
        },
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        fg: "var(--text)",
        "fg-muted": "var(--text-muted)",
        "fg-soft": "var(--text-soft)",
        brand: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          soft: "var(--primary-soft)",
          contrast: "var(--primary-contrast)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
        },
        border: "var(--border)",
        "border-light": "var(--border-light)",
        ring: "var(--ring)",
        // legacy shadcn aliases (mapped for compatibility)
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text)",
        },
        muted: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-muted)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        background: "var(--bg)",
        foreground: "var(--text)",
        destructive: {
          DEFAULT: "var(--accent)",
          foreground: "#ffffff",
        },
        input: "var(--border)",
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(146, 64, 14, 0.06)",
        "soft-md": "0 2px 8px rgba(26, 26, 46, 0.07)",
        "soft-lg": "0 4px 16px rgba(26, 26, 46, 0.09)",
        "soft-xl": "0 6px 24px rgba(26, 26, 46, 0.11)",
        modal: "0 8px 32px rgba(26, 26, 46, 0.16)",
        "glow-primary": "0 3px 10px rgba(234, 88, 12, 0.2)",
        "glow-accent": "0 3px 10px rgba(239, 68, 68, 0.18)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        float: "float 6s ease-in-out infinite",
      },
      transitionTimingFunction: {
        edel: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
