"use client";

import { api, RegSearchHit } from "@/lib/api";
import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RegSearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const hits = await api.searchRegulations(query, 8);
      setResults(hits);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Regulation Search</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Semantic search over RBI KYC Master Direction and Basel III framework.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. customer due diligence, capital adequacy, loan provisioning…"
          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
      )}

      {results && results.length === 0 && (
        <p className="text-zinc-500 text-sm">No results found.</p>
      )}

      {results && results.length > 0 && (
        <ul className="space-y-4">
          {results.map((hit) => (
            <li key={hit.chunk_id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-medium">
                    {hit.source}
                  </span>
                  {hit.section && (
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2.5 py-0.5 text-xs">
                      {hit.section}
                    </span>
                  )}
                  {hit.page && (
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2.5 py-0.5 text-xs">
                      p. {hit.page}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-zinc-400 tabular-nums">
                  score {hit.score.toFixed(3)}
                </span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-5">
                {hit.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
