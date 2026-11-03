import type { Health } from "@{{ project-name | kebab_case }}/shared";

import { Button } from "@{{ project-name | kebab_case }}/ui/button";
import { useCallback, useEffect, useState } from "react";

const PROJECT_NAME = "{{project-name}}";

type Status =
  | { kind: "loading" }
  | { kind: "ok"; data: Health }
  | { kind: "error"; message: string };

export default function App() {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  const probe = useCallback(async (signal?: AbortSignal) => {
    setStatus({ kind: "loading" });
    try {
      const response = await fetch("/api/health", { signal });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      setStatus({ kind: "ok", data: (await response.json()) as Health });
    } catch (error) {
      if (signal?.aborted) return;
      setStatus({ kind: "error", message: String(error) });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void probe(controller.signal);
    return () => controller.abort();
  }, [probe]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Rust · Axum · Vite · React · Turbo</p>
        <h1 className="text-4xl font-semibold tracking-tight">{PROJECT_NAME}</h1>
        <p className="text-muted-foreground">
          编辑 <code className="rounded bg-muted px-1.5 py-0.5 text-sm">apps/server/src</code> 或{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">apps/web/src</code> 开始开发。
        </p>
      </header>

      <section className="rounded-lg border bg-card p-6 font-mono text-sm">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          GET /api/health
        </p>
        {status.kind === "loading" && <p className="text-muted-foreground">探测中…</p>}
        {status.kind === "error" && <p className="text-red-400">{status.message}</p>}
        {status.kind === "ok" && (
          <pre className="overflow-x-auto">{JSON.stringify(status.data, null, 2)}</pre>
        )}
      </section>

      <div>
        <Button onClick={() => void probe()}>重新探测</Button>
      </div>
    </main>
  );
}
