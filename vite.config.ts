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
        "import.meta.env.VITE_API_URL": JSON.stringify("/api/v1"),
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
                            return "vendor-react";
                        }
                        if (id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
                            return "vendor-redux";
                        }
                        if (id.includes("@dnd-kit")) {
                            return "vendor-dnd";
                        }
                        if (id.includes("i18next")) {
                            return "vendor-i18n";
                        }
                        if (id.includes("formik") || id.includes("yup")) {
                            return "vendor-forms";
                        }
                        if (id.includes("date-fns") || id.includes("axios")) {
                            return "vendor-utils";
                        }
                    }
                },
            },
        },
    },
    server: {
        open: true,
        proxy: {
            "/api": {
                target: "http://localhost:8080/",
                changeOrigin: true,
                secure: false,
            },
            "/uploads": {
                target: "http://localhost:8080/",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
