pub mod health;

use axum::Router;

use crate::error::AppError;
use crate::state::AppState;

/// `/api` 下的全部路由。新增领域模块：`pub mod foo;` 后 merge 进这里。
pub fn router() -> Router<AppState> {
    Router::new()
        .merge(health::router())
        // 未匹配的 `/api/*` 走 JSON 404，而不是掉进 SPA fallback 返回 HTML。
        .fallback(unknown_api)
}

async fn unknown_api() -> AppError {
    AppError::NotFound
}
