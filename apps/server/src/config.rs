use std::env;

use thiserror::Error;

/// 全部运行时配置的唯一来源。
/// 新增变量：在 `from_env` 读取 → 在 `.env` / `.env.example` 补默认值与说明 → 在 README 表格登记。
#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub log_filter: String,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_owned());

        let port = match env::var("PORT") {
            Ok(raw) => raw.parse().map_err(|_| ConfigError::InvalidPort(raw))?,
            Err(_) => 3000,
        };

        let log_filter = env::var("RUST_LOG").unwrap_or_else(|_| "info".to_owned());

        Ok(Self {
            host,
            port,
            log_filter,
        })
    }

    /// `HOST:PORT`，交给 `TcpListener::bind` 解析，支持主机名。
    pub fn addr(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("PORT 必须是 0-65535 之间的整数，实际为 `{0}`")]
    InvalidPort(String),
}

#[cfg(test)]
mod tests {
    use super::Config;

    #[test]
    fn addr_joins_host_and_port() {
        let config = Config {
            host: "0.0.0.0".to_owned(),
            port: 8080,
            log_filter: "info".to_owned(),
        };
        assert_eq!(config.addr(), "0.0.0.0:8080");
    }
}
