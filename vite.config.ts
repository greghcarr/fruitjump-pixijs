import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: '/fruitjump-pixijs/',
  server: {
    port: 8080,
    open: true,
  },
});
