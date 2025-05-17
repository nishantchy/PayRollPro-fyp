/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elegant Purple Palette
        "royal-purple": "#8E44AD",
        "deep-slate": "#2C3E50",
        "golden-amber": "#F39C12",
        "light-neutral": "#F8F9FA",

        // Standard utility mapping
        purple: {
          primary: "#8E44AD", // Royal Purple
        },
        slate: {
          secondary: "#2C3E50", // Deep Slate
        },
        amber: {
          accent: "#F39C12", // Golden Amber
        },
        neutral: {
          light: "#F8F9FA", // Light Neutral
        },
      },
    },
  },
  plugins: [],
};
