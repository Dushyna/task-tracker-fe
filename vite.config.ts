import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
      "process.env.VITE_API_BASE_URL": JSON.stringify("/api/v1"),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify("/api/v1"),
      "process.env.VITE_API_URL": JSON.stringify("/api/v1"),
      "import.meta.env.VITE_API_URL": JSON.stringify("/api/v1")
  },
  server: {
    open: true,

    proxy: {
      "/api": {
        target: "http://localhost:8080/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
