import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F1E8",
        clay: "#C97C5D",
        sage: "#7C8B5E",
        charcoal: "#2B2B28",
        gold: "#B08D57",
        // Solo para los botones principales (más rojizo/quemado que
        // "clay", que se queda para acentos de texto y etiquetas): con
        // el fondo ya lleno de crema/beige/dorado, un naranja tan
        // suave como clay se hundía en vez de destacar.
        terracota: "#A6432C",
        "terracota-oscuro": "#7C3320",
      },
      fontFamily: {
        serif: ["var(--font-heading)", "Georgia", "serif"],
        sans: ["var(--font-body)", "Georgia", "serif"],
      },
      backgroundImage: {
        "organic-texture":
          "radial-gradient(circle at 20% 20%, rgba(176,141,87,0.08), transparent 40%), radial-gradient(circle at 80% 60%, rgba(124,139,94,0.08), transparent 45%)",
      },
      keyframes: {
        "entrada-subida": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "entrada-suave": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "entrada-izquierda": {
          "0%": { opacity: "0", transform: "translateX(-48px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "entrada-derecha": {
          "0%": { opacity: "0", transform: "translateX(48px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "entrada-subida": "entrada-subida 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "entrada-suave": "entrada-suave 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "entrada-izquierda": "entrada-izquierda 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "entrada-derecha": "entrada-derecha 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
