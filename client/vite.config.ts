import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "inject-neutralino",
      transformIndexHtml(html) {
        return html.replace(
          '<body class="dark">',
          '<body class="dark">\n    <script src="/__neutralino_globals.js"></script>'
        );
      },
    },
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  base: "./",
});
