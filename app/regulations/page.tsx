"use client";

import { useEffect, useState } from "react";
import { api, type RegSearchHit } from "@/lib/api";
import { PageHeader } from "../_components/PageHeader";

const EXAMPLES = [
  "KYC customer due diligence",
  "interest calculation on overdue accounts",
  "transaction monitoring and fraud",
  "loan eligibility criteria",
  "record retention requirements",
  "periodic KYC updation",
];

const TOPICS = [
  {
    title: "Know Your Customer",
    body: "Identification, due diligence, periodic updation and the CKYCR registry.",
  },
  {
    title: "AML & Monitoring",
    body: "Transaction monitoring, suspicious activity, and fraud-control obligations.",
  },
  {
    title: "Credit & Interest",
    body: "Eligibility, accrual on overdue balances, and fair-lending conduct.",
  },
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

  const showIntro = !searched && !loading && !error;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-10">
        <PageHeader
          eyebrow="§ Regulatory corpus"
          title="Regulations"
          lead="Semantic search over primary regulatory sources — the rules legacy banking code was written to obey. Queries are matched by meaning, not keywords."
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(qInput);
          }}
          className="mt-10 flex items-end gap-6"
        >
          <div className="flex-1">
            <label className="eyebrow mb-2 block">Search by meaning</label>
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="e.g. periodic KYC updation"
              className="w-full border-b border-fg bg-transparent pb-2 text-sm outline-none placeholder:text-fg-faint"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !qInput.trim()}
            className="border border-fg px-5 py-2.5 text-sm hover:enabled:bg-fg hover:enabled:text-paper disabled:opacity-40"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* ---------- intro / empty state ---------- */}
        {showIntro && (
          <div className="mt-10 space-y-12">
            <section>
              <p className="eyebrow">Popular queries</p>
              <ul className="mt-4 divide-y divide-rule border-y border-rule">
                {EXAMPLES.map((ex) => (
                  <li key={ex}>
                    <button
                      onClick={() => run(ex)}
                      className="group flex w-full items-center gap-4 py-3 text-left"
                    >
                      <span className="text-accent transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                      <span className="text-[15px] text-fg-muted group-hover:text-fg">
                        {ex}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="eyebrow">What you can explore</p>
              <div className="mt-5 grid gap-x-10 gap-y-7 sm:grid-cols-3">
                {TOPICS.map((t) => (
                  <div key={t.title} className="border-t border-fg pt-4">
                    <p className="font-display text-xl">{t.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="eyebrow">How the search works</p>
              <div className="mt-5 grid gap-x-10 gap-y-7 sm:grid-cols-3">
                {[
                  {
                    n: "i.",
                    t: "Embed the query",
                    d: "Your phrase is turned into a vector that captures its meaning.",
                  },
                  {
                    n: "ii.",
                    t: "Rank passages",
                    d: "Regulatory chunks are scored by semantic similarity.",
                  },
                  {
                    n: "iii.",
                    t: "Return sources",
                    d: "The closest passages come back with source, page and score.",
                  },
                ].map((s) => (
                  <div key={s.n}>
                    <span className="eyebrow text-accent">{s.n}</span>
                    <p className="font-display mt-2 text-lg">{s.t}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                      {s.d}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-rule bg-surface p-6 text-sm text-fg-muted">
            Search failed: {error}
          </div>
        )}

        {loading && (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-rule bg-surface-2"
              />
            ))}
          </div>
        )}

        {!loading && searched && hits.length === 0 && !error && (
          <div className="mt-10 rounded-2xl border border-dashed border-rule bg-surface/60 p-10 text-center">
            <p className="text-sm font-medium text-fg-muted">
              No matching passages found
            </p>
            <p className="mt-1 text-xs text-fg-faint">
              Try a broader phrase or one of the popular queries above.
            </p>
          </div>
        )}

        {!loading && hits.length > 0 && (
          <div className="mt-6 space-y-3 pb-6">
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
    <article className="rounded-2xl border border-rule bg-surface p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
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
              className="block h-full bg-accent"
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
