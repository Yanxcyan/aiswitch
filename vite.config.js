import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  server: {
    strictPort: true,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
