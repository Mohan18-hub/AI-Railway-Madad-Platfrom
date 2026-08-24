import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
<<<<<<< HEAD
import { fileURLToPath, URL } from "node:url";
=======
import path from "path";
>>>>>>> acb48db24904d5815f72d99fa3d96345677e966a

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
<<<<<<< HEAD
      "@": fileURLToPath(new URL("./src", import.meta.url)),
=======
      "@": path.resolve(__dirname, "./src"),
>>>>>>> acb48db24904d5815f72d99fa3d96345677e966a
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
