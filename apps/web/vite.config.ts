import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// .env 统一放在仓库根目录，前后端共用一份。
const rootDir = fileURLToPath(new URL("../..", import.meta.url));

/** 相对本文件解析路径。 */
const local = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/** workspace 包的 npm scope；单独成行，格式化结果不随项目名长度变化。 */
const scope = "@{{ project-name | kebab_case }}";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");
  const apiTarget = `http://127.0.0.1:${env.PORT ?? "3000"}`;

  return {
    envDir: rootDir,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": local("./src"),
        [`${scope}/ui`]: local("../../packages/ui/src"),
        [`${scope}/shared`]: local("../../packages/shared/src/index.ts"),
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
