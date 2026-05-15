import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#0f1a2e",
        pulse: "#22d3ee",
        glow: "#60a5fa",
        moss: "#818cf8",
        sand: "#0f172a",
        ember: "#67e8f9",
        cream: "#e2e8f0"
      },
      fontFamily: {
        sans: [
          "Aptos",
          "Trebuchet MS",
          "Segoe UI",
          "Verdana",
          "sans-serif"
        ],
        display: [
          "Georgia",
          "Cambria",
          "Times New Roman",
          "system-ui",
          "serif"
        ]
      },
      boxShadow: {
        soft: "0 28px 80px rgba(2, 6, 23, 0.34)",
        glow: "0 18px 48px rgba(34, 211, 238, 0.16)"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 12% 18%, rgba(34,211,238,0.14), transparent 26%), radial-gradient(circle at 88% 14%, rgba(96,165,250,0.14), transparent 24%), radial-gradient(circle at 50% 82%, rgba(129,140,248,0.14), transparent 28%), linear-gradient(180deg, rgba(2,6,23,0.1), rgba(2,6,23,0))"
      }
    }
  },
  plugins: []
};

export default config;
