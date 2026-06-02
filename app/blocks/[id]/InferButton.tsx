"use client";

import { api } from "@/lib/api";
import { useState } from "react";

export default function InferButton({ blockId }: { blockId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInfer() {
    setLoading(true);
    setError(null);
    try {
      await api.infer(blockId, "ollama");
      window.location.reload();
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span className="text-[11px] text-[var(--bad)] max-w-[180px] truncate" title={error}>
          {error}
        </span>
      )}
      <button
        onClick={handleInfer}
        disabled={loading}
        className="group inline-flex items-center gap-2 rounded-lg border border-rule-strong bg-card px-3.5 py-2 text-xs font-medium hover:bg-ink hover:text-paper hover:border-ink disabled:opacity-50 disabled:cursor-wait transition-colors"
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
