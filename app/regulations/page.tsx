"use client";

import { useEffect, useState } from "react";
import { api, type RegSearchHit } from "@/lib/api";

const EXAMPLES = [
  "KYC customer due diligence",
  "interest calculation on overdue accounts",
  "transaction monitoring and fraud",
  "loan eligibility criteria",
];

export default function RegulationsPage() {
  const [qInput, setQInput] = useState("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<RegSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.searchRegulations(query, 8);
        if (cancelled) return;
        setHits(res);
        setError(null);
        setSearched(true);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Search failed");
        setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  function run(term: string) {
    const t = term.trim();
    if (!t) return;
    setQInput(t);
    setLoading(true);
    setQuery(t);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 lg:px-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Regulations
          </h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            Semantic search over primary regulatory sources — the rules legacy
            banking code was written to obey.
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(qInput);
          }}
          className="mt-6 flex gap-2"
        >
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search regulations…"
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-[var(--shadow-sm)] outline-none transition-colors focus:border-accent/40"
          />
          <button
            type="submit"
            disabled={loading || !qInput.trim()}
            className="accent-grad rounded-xl px-5 text-sm font-medium text-accent-fg shadow-[var(--shadow-sm)] transition-all hover:brightness-110 disabled:opacity-40"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {!searched && !loading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => run(ex)}
                className="rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] text-fg-muted shadow-[var(--shadow-sm)] transition-colors hover:border-accent/40 hover:text-fg"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-border bg-surface p-6 text-sm text-fg-muted">
            Search failed: {error}
          </div>
        )}

        {loading && (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-border bg-surface-2"
              />
            ))}
          </div>
        )}

        {!loading && searched && hits.length === 0 && !error && (
          <div className="mt-10 text-center text-sm text-fg-muted">
            No matching passages found.
          </div>
        )}

        {!loading && hits.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wider text-fg-faint">
              {hits.length} passages · best matches first
            </p>
            {hits.map((h) => (
              <Hit key={h.chunk_id} hit={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Hit({ hit }: { hit: RegSearchHit }) {
  const [open, setOpen] = useState(false);
  const long = hit.text.length > 420;
  const pct = Math.round(Math.max(0, Math.min(1, hit.score)) * 100);

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-sm font-semibold">{hit.source}</span>
        {hit.section && (
          <span className="text-xs text-fg-muted">§ {hit.section}</span>
        )}
        {hit.page != null && (
          <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-fg-muted">
            p. {hit.page}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2">
            <span
              className="accent-grad block h-full"
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="font-mono text-[10px] text-fg-faint">
            {pct}% match
          </span>
        </span>
      </div>
      <p
        className={`text-[13px] leading-relaxed text-fg-muted ${
          !open && long ? "line-clamp-4" : ""
        }`}
      >
        {hit.text}
      </p>
      {long && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-xs font-medium text-accent hover:opacity-80"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </article>
  );
}
