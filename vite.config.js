import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  rollupOptions: {
    external: ["react", "react-router", "react-router-dom"],
    output: {
      globals: {
        react: "React",
      },
    },
  },
});
