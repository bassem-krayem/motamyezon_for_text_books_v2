/* global process */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the backend during development so the frontend can use
    // relative `/api/v1` URLs and avoid CORS / hard-coded hosts.
    proxy: {
      "/api": {
        target:
          process.env.VITE_BACKEND_URL ||
          "https://motamayezon-api-4f3d4f53af6f.herokuapp.com",
        changeOrigin: true,
      },
    },
  },
});
