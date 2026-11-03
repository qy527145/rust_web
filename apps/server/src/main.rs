use std::sync::Arc;
use std::time::Instant;

use tokio::net::TcpListener;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

mod api;
mod app;
mod config;
mod embed;
mod error;
mod state;

use config::Config;
use state::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    load_dotenv();

    let config = Config::from_env()?;
    init_tracing(&config.log_filter);

    let listener = TcpListener::bind(config.addr()).await?;
    let local_addr = listener.local_addr()?;

    tracing::info!(addr = %local_addr, "listening");
    tracing::info!(
        version = env!("CARGO_PKG_VERSION"),
        "{} started",
        env!("CARGO_PKG_NAME")
    );

    let state = AppState {
        config: Arc::new(config),
        started_at: Instant::now(),
    };

    axum::serve(listener, app::router(state))
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("shutdown complete");
    Ok(())
}

/// 从当前目录向上查找 `.env`。找不到时静默使用默认值，便于直接运行发布产物。
fn load_dotenv() {
    for candidate in [".env", "../.env", "../../.env"] {
        if dotenvy::from_filename(candidate).is_ok() {
            return;
        }
    }
}

fn init_tracing(filter: &str) {
    let env_filter = tracing_subscriber::EnvFilter::try_new(filter)
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info"));

    tracing_subscriber::registry()
        .with(env_filter)
        .with(tracing_subscriber::fmt::layer().compact())
        .init();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        let _ = tokio::signal::ctrl_c().await;
    };

    #[cfg(unix)]
    let terminate = async {
        if let Ok(mut signal) =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        {
            signal.recv().await;
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {}
        () = terminate => {}
    }

    tracing::info!("shutdown signal received");
}
