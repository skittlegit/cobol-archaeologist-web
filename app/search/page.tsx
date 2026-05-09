"use client";

import { api, RegSearchHit } from "@/lib/api";
import { useState } from "react";

const SUGGESTIONS = [
  "customer due diligence",
  "capital adequacy ratio",
  "loan provisioning",
  "high-value transaction",
  "politically exposed person",
  "credit risk weights",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RegSearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState("");

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    try {
      const hits = await api.searchRegulations(q, 8);
      setResults(hits);
      setSearched(q);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rise space-y-12">
      {/* Header */}
      <header className="grid lg:grid-cols-12 gap-6 items-end border-b border-ink pb-6">
        <div className="lg:col-span-8">
          <p className="eyebrow">§ 03 · The references</p>
          <h1 className="font-display mt-2 text-5xl md:text-6xl leading-none">
            Regulation Search
          </h1>
          <p className="mt-4 text-ink-2 max-w-xl">
            Semantic search across the{" "}
            <em className="font-display">RBI KYC Master Direction</em> and the{" "}
            <em className="font-display">Basel III</em> framework. Ask in plain
            English; the index returns the most relevant clauses.
          </p>
        </div>
        <div className="lg:col-span-4 lg:text-right space-y-1">
          <p className="eyebrow">Sources indexed</p>
          <p className="font-display text-2xl">RBI · Basel III</p>
          <p className="text-xs text-ink-3 num">vector index · cosine similarity</p>
        </div>
      </header>

      {/* Search */}
      <section className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="relative"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="eyebrow absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                Q.
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask the archive…"
                className="w-full rounded-sm border border-ink/15 bg-card pl-14 pr-4 py-4 text-lg font-display placeholder:text-ink-4 placeholder:italic focus:outline-none focus:border-ink focus:ring-2 focus:ring-accent/30 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-sm bg-ink text-paper px-7 py-4 text-sm font-medium hover:bg-accent-ink disabled:opacity-40 transition-colors"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="eyebrow mr-1">Try</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => runSearch(s)}
              className="italic font-display rounded-full px-3 py-1 border border-rule-strong text-ink-2 hover:border-ink hover:text-ink transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-sm border border-bad/30 bg-[var(--bad-soft)] p-4 text-sm text-ink-2">
          <span className="eyebrow text-[var(--bad)] mr-2">Error</span> {error}
        </div>
      )}

      {/* Results */}
      {results && results.length === 0 && (
        <div className="py-16 text-center border-y border-rule">
          <p className="font-display text-3xl text-ink-3 italic">No matches in the archive.</p>
          <p className="text-sm text-ink-4 mt-2">Try a broader phrasing.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <section className="space-y-1">
          <div className="flex items-end justify-between border-b border-ink pb-3">
            <p className="eyebrow">
              {results.length} passages · for &ldquo;{searched}&rdquo;
            </p>
            <p className="hidden sm:block eyebrow">Ranked by relevance</p>
          </div>
          <ol className="divide-y divide-rule">
            {results.map((hit, i) => {
              const score = Math.max(0, Math.min(1, hit.score));
              return (
                <li key={hit.chunk_id} className="py-6 grid lg:grid-cols-12 gap-6">
                  <aside className="lg:col-span-3 space-y-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display num text-4xl text-accent leading-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-display text-base leading-tight">
                          {hit.source}
                        </p>
                        {hit.section && (
                          <p className="font-mono text-[11px] text-ink-3 mt-0.5">
                            {hit.section}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="eyebrow">Relevance</span>
                        <span className="num text-ink-2">{score.toFixed(3)}</span>
                      </div>
                      <div className="h-[2px] bg-rule overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>

                    {hit.page && (
                      <p className="text-[11px] text-ink-3">
                        <span className="eyebrow mr-1">p.</span>
                        <span className="num">{hit.page}</span>
                      </p>
                    )}
                  </aside>

                  <div className="lg:col-span-9">
                    <p className="font-display text-[1.0625rem] leading-relaxed text-ink-2">
                      {hit.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {!results && !loading && (
        <section className="border-t border-rule pt-10 grid md:grid-cols-3 gap-8 text-sm">
          {[
            { t: "Plain English", d: "No SQL, no operators. Describe the rule, the screen, or the threshold you're after." },
            { t: "Cited results",  d: "Each hit returns its source document, section, and page — ready to link from an intent card." },
            { t: "Relevance-ranked", d: "Cosine similarity over a sentence-embedding index. Top eight passages, every time." },
          ].map((f) => (
            <div key={f.t} className="border-t border-ink pt-4">
              <p className="font-display text-xl">{f.t}</p>
              <p className="text-ink-2 mt-2 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
