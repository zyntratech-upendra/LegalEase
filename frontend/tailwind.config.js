/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2F6EA3", // Main Primary Blue
          dark: "#1F4E79",    // Darker Navy (Sidebar)
          light: "#4F8CC9",   // Lighter Blue
        },
        secondary: "#1F4E79", // Matches primary-dark as requested context
        accent: "#6FA9DB",    // Accent Blue (Hover states)
        background: "#F5F7FA",
        surface: "#FFFFFF",
        success: "#2E7D32",
        error: "#C62828",
        text: {
          main: "#1A1A1A",
          secondary: "#5F6B7A",
          muted: "#9AA5B1",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
