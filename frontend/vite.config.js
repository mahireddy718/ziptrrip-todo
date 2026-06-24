import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// This is a MULTI-PAGE app (not an SPA): two real HTML entry points,
// each booting an independent React tree. Navigation between them
// happens via normal <a href="..."> links, which trigger a full
// page load/reload - there is no client-side router involved.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"), // Todos list page
        todo: resolve(__dirname, "todo.html"), // Single todo detail page
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* calls to the Express backend during development
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
