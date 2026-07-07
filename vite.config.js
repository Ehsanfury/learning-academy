import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@ui": path.resolve(__dirname, "./src/components/ui"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@locales": path.resolve(__dirname, "./src/locales"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@content": path.resolve(__dirname, "./content"),
    },
  },

  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:5001",
        changeOrigin: true,
        ws: true,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["framer-motion", "lucide-react"],
          i18n: ["i18next", "react-i18next"],
        },
      },
    },
  },
});
