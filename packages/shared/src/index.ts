/**
 * 与 Rust 端零成本对齐的类型约定。
 *
 * 约定：Rust 侧结构体一律 `#[derive(Serialize)]` + `#[serde(rename_all = "snake_case")]`
 * 或逐字段 `rename`，保证这里手写的类型即真实线格式。字段改名时两边一起改。
 */

/** `GET /api/health` 的响应体，对应 `apps/server/src/api/health.rs`。 */
export interface Health {
  status: "ok";
  version: string;
  uptime_secs: number;
}

/** `GET /api/info` 的响应体，对应 `apps/server/src/api/health.rs`。 */
export interface Info {
  name: string;
  version: string;
  addr: string;
}

/** 所有错误响应的形状，对应 `apps/server/src/error.rs`。 */
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
