/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    // './pages/**/*.{ts,tsx}', // Removed reference to pages directory
    './components/**/*.{ts,tsx}',
    // include CSS files for @apply directives
    './app/**/*.{ts,tsx,css}',
    // './src/**/*.{ts,tsx}', // Removed reference to src directory
  ],
  // ensure custom animation utilities are generated
  safelist: ['animate-gradient-flow'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        border: "#1E1E1E",
        input: "#1E1E1E",
        ring: "rgba(139, 92, 246, 0.5)",
        background: "#121212",
        foreground: "#FFFFFF",
        dark: {
          background: "#121212",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#8B5CF6",
          foreground: "#FFFFFF",
          hover: "#7C3AED",
        },
        secondary: {
          DEFAULT: "#222222",
          foreground: "#FFFFFF",
          hover: "#2D2D2D",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          foreground: "#FFFFFF",
          hover: "#7C3AED",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#CCCCCC",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        card: "#1A1A1A",
        'card-foreground': "#FFFFFF",
        'zinc-850': "#1F1F1F", // Custom color for alternating table rows
      },
      borderRadius: {
        lg: "0.625rem",
        md: "calc(0.625rem - 2px)",
        sm: "calc(0.625rem - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        DEFAULT: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-flow": "gradient-flow 3s ease infinite",
      },
    },
  },
  plugins: [
    require('tw-animate-css')
  ],
} 