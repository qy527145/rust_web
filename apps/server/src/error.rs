use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

/// 处理函数统一返回 `Result<T, AppError>`。
/// 响应体固定为 `{"error": {"code": "...", "message": "..."}}`，前端可依赖这个形状。
///
/// 模板里没有业务路由，`BadRequest` / `NotFound` 暂无构造点，因此显式允许 `dead_code`；
/// 新增业务模块后请删掉这行 allow。
#[allow(dead_code)]
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("not found")]
    NotFound,

    #[error("{0}")]
    BadRequest(String),

    #[error(transparent)]
    Internal(#[from] anyhow::Error),
}

pub type AppResult<T> = Result<T, AppError>;

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            Self::NotFound => (StatusCode::NOT_FOUND, "not_found", self.to_string()),
            Self::BadRequest(message) => (StatusCode::BAD_REQUEST, "bad_request", message),
            // 内部错误不把细节返回给客户端，只写日志。
            Self::Internal(err) => {
                tracing::error!(error = %err, "internal error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "internal",
                    "internal server error".to_owned(),
                )
            }
        };

        (
            status,
            Json(json!({ "error": { "code": code, "message": message } })),
        )
            .into_response()
    }
}
