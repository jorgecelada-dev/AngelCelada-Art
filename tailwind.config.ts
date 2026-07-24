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
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-worksans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "organic-texture":
          "radial-gradient(circle at 20% 20%, rgba(176,141,87,0.08), transparent 40%), radial-gradient(circle at 80% 60%, rgba(124,139,94,0.08), transparent 45%)",
      },
    },
  },
  plugins: [],
};

export default config;
