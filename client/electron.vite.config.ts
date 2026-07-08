import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";
import { resolve } from "node:path";

export default defineConfig({
  main: {
    build: {
      externalizeDeps: true
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts"),
          overlay: resolve(__dirname, "src/preload/overlay.ts")
        }
      },
      externalizeDeps: true
    }
  },
  renderer: {
    root: "src/renderer",
    base: "./",
    resolve: {
      alias: {
        "@": resolve(__dirname, "src/renderer/src")
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
          overlay: resolve(__dirname, "src/renderer/overlay.html")
        }
      }
    },
    plugins: [react(), tailwindcss()]
  }
});
