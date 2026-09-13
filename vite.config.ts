import { defineConfig } from "vite";

export default defineConfig({
  root: "examples/basic",
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
});
