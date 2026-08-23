import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    // Ensure only one React instance is resolved across all packages
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    proxy: {
      "/api/problems": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api/resume": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api/interview": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api/communication": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api/company": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/analyze-resume": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/job-recommendations": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
})
