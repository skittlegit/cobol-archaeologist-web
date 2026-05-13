"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InferButton({ blockId }: { blockId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInfer() {
    setLoading(true);
    setError(null);
    try {
      await api.infer(blockId, "ollama");
      router.refresh();
    } catch (e) {
      const msg = String(e);
      const friendlyMsg =
        msg.includes("TimeoutError") || msg.includes("timed out") || msg.includes("504")
          ? "Ollama timed out — is it running? (ollama serve)"
          : msg.includes("fetch failed") || msg.includes("ECONNREFUSED") || msg.includes("Failed to fetch")
          ? "Cannot reach Ollama — run: ollama serve"
          : msg.replace(/^Error:\s*/, "");
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span
          role="alert"
          aria-live="polite"
          className="text-[11px] text-[var(--bad)] max-w-[180px] truncate"
          title={error}
        >
          {error}
        </span>
      )}
      <button
        onClick={handleInfer}
        disabled={loading}
        aria-busy={loading}
        className="group inline-flex items-center gap-2 rounded-sm border border-ink/20 px-3 py-1.5 text-xs font-medium hover:bg-ink hover:text-paper hover:border-ink disabled:opacity-50 disabled:cursor-wait transition-colors"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            loading ? "bg-accent animate-pulse" : "bg-ok group-hover:bg-paper"
          }`}
        />
        {loading ? "Generating…" : "Generate with Ollama"}
      </button>
    </div>
  );
}
