"use client";

import { api, BusinessIntentCard } from "@/lib/api";
import { useState } from "react";

export default function InferButton({ blockId }: { blockId: string }) {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<BusinessIntentCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleInfer() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.infer(blockId, "ollama");
      setCard(result);
      // Reload the page to show the new card in the server component
      window.location.reload();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
      <button
        onClick={handleInfer}
        disabled={loading}
        className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        {loading ? "Generating…" : "Re-generate with Ollama"}
      </button>
    </div>
  );
}
