import { defineConfig } from "vite";

export default defineConfig({
  root: "examples/basic",
  esbuild: {
    jsxFactory: "Tsuki.createElement",
    jsxFragment: "Tsuki.Fragment",
  },
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
});
