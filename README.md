# {{ project-name }}

基于 axum + React + Vite 的单二进制 Web 应用。前端构建产物在 release 编译期嵌入 Rust 二进制，
生产环境只需要一个可执行文件。

## 快速开始

```bash
bun install
bun run init    # 或用这个：安装依赖 + 从 .env.example 生成 .env
bun run dev
```

- 前端：http://localhost:5173（端口见 `.env` 的 `WEB_PORT`）
- 后端：http://127.0.0.1:3000/api/health（见 `HOST` / `PORT`）

## 构建

```bash
bun run build        # 当前平台
bun run build:win
bun run build:mac
bun run build:linux
```

产物输出到 `dist/`，命名形如 `<name>-<target-triple>[.exe]`。

### 交叉编译

| 脚本          | Windows 宿主                  | macOS 宿主                  | Linux 宿主       |
| ------------- | ----------------------------- | --------------------------- | ---------------- |
| `build:win`   | 原生                          | 不支持（需 mingw，改走 CI） | `cargo-zigbuild` |
| `build:mac`   | **不支持**（缺 Apple SDK）    | 原生 arm64                  | **不支持**       |
| `build:linux` | `cargo-zigbuild`（musl 静态） | `cargo-zigbuild`            | 原生             |

`cargo-zigbuild` 需要额外安装：`cargo install cargo-zigbuild`，并确保 `zig` 在 PATH 中。
需要三平台同时出包时用 `.github/workflows/release.yml`（打 tag 触发）。

## 目录结构

```
apps/server/     axum 服务，src/api/ 下按领域扩展
apps/web/        React + Vite，src/App.tsx 为入口页面
packages/ui/     共享组件
packages/shared/ 与 Rust 对齐的 TS 类型
scripts/         build / clean
```

## 配置

所有环境变量集中在根目录 `.env`，`.env.example` 是文档。密钥放 `.env.local`（不会被提交）。

| 变量       | 默认        | 说明                               |
| ---------- | ----------- | ---------------------------------- |
| `HOST`     | `127.0.0.1` | 后端监听地址，容器内改为 `0.0.0.0` |
| `PORT`     | `3000`      | 后端端口，也是生产 HTTP 端口       |
| `WEB_PORT` | `5173`      | Vite 开发服务器端口                |
| `RUST_LOG` | `info`      | tracing 过滤器                     |

## 用模板创建新项目

```bash
cargo generate --git <this-repo-url> --name my-app
cd my-app
bun run init
```

## License

MIT
