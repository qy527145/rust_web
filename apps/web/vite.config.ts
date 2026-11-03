import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// .env 统一放在仓库根目录，前后端共用一份。
const rootDir = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");
  const apiTarget = `http://127.0.0.1:${env.PORT ?? "3000"}`;

  return {
    envDir: rootDir,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@{{ project-name | kebab_case }}/ui": fileURLToPath(
          new URL("../../packages/ui/src", import.meta.url),
        ),
        "@{{ project-name | kebab_case }}/shared": fileURLToPath(
          new URL("../../packages/shared/src/index.ts", import.meta.url),
        ),
      },
    },
    server: {
      port: Number(env.WEB_PORT ?? 5173),
      strictPort: true,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Vite 8 只接受函数形式的 manualChunks。
          manualChunks(id) {
            if (id.includes("node_modules/react")) return "react";
          },
        },
      },
    },
  };
});
