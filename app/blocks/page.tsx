"use client";

import { api, PagedBlocks } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LABELS = [
  "balance_check",
  "late_fee",
  "kyc_screening",
  "interest_calculation",
  "loan_eligibility",
  "transaction_validation",
  "fraud_check",
  "payroll",
];

const LABEL_HUE: Record<string, string> = {
  balance_check: "#1f4a6b",
  late_fee: "#8a5a00",
  kyc_screening: "#5a1f0a",
  interest_calculation: "#2f5d3a",
  loan_eligibility: "#6b4f00",
  transaction_validation: "#7a1d1d",
  fraud_check: "#9a3412",
  payroll: "#1f5d5a",
};

const PAGE_SIZE = 25;

function BlocksContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [data, setData] = useState<PagedBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Number(sp.get("page") ?? 1);
  const q = sp.get("q") ?? "";
  const label = sp.get("label") ?? "";

  const [search, setSearch] = useState(q);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.blocks({
        page,
        size: PAGE_SIZE,
        q: q || undefined,
        label: label || undefined,
      });
      setData(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [page, q, label]);

  useEffect(() => {
    load();
  }, [load]);

  function pushSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (label) params.set("label", label);
    params.set("page", "1");
    router.push(`/blocks?${params}`);
  }

  function setLabel(l: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (l) params.set("label", l);
    params.set("page", "1");
    router.push(`/blocks?${params}`);
  }

  function goPage(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (label) params.set("label", label);
    params.set("page", String(p));
    router.push(`/blocks?${params}`);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="rise space-y-10">
      {/* Header */}
      <header className="grid lg:grid-cols-12 gap-6 items-end border-b border-ink pb-6">
        <div className="lg:col-span-7">
          <p className="eyebrow">§ 02 · The catalogue</p>
          <h1 className="font-display mt-2 text-5xl md:text-6xl leading-none">
            Logic Blocks
          </h1>
          <p className="mt-4 text-ink-2 max-w-xl">
            Self-contained paragraphs of COBOL, indexed by file and labelled by
            inferred business intent. Click any entry to read its source and
            generated intent card.
          </p>
        </div>
        <div className="lg:col-span-5 lg:text-right">
          <p className="eyebrow">Total in corpus</p>
          <p className="font-display num text-5xl md:text-6xl leading-none mt-2">
            {data ? data.total.toLocaleString() : <span className="text-ink-4">—</span>}
          </p>
        </div>
      </header>

      {/* Filter rail */}
      <section className="space-y-4">
        <form onSubmit={pushSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="eyebrow absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              Find
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="paragraph name, code fragment, variable…"
              className="w-full rounded-sm border border-ink/15 bg-card pl-16 pr-4 py-3 text-sm placeholder:text-ink-4 focus:outline-none focus:border-ink focus:ring-2 focus:ring-accent/30 transition"
            />
          </div>
          <button
            type="submit"
            className="rounded-sm bg-ink text-paper px-6 py-3 text-sm font-medium hover:bg-accent-ink transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="eyebrow mr-2">Filter by intent</span>
          <button
            onClick={() => setLabel("")}
            className={`rounded-full px-3 py-1 border transition-colors ${
              !label
                ? "bg-ink text-paper border-ink"
                : "border-rule-strong text-ink-2 hover:border-ink"
            }`}
          >
            All
          </button>
          {LABELS.map((l) => {
            const active = label === l;
            return (
              <button
                key={l}
                onClick={() => setLabel(l)}
                style={
                  active
                    ? { background: LABEL_HUE[l], color: "var(--paper)", borderColor: LABEL_HUE[l] }
                    : { borderColor: "var(--rule-strong)" }
                }
                className="rounded-full px-3 py-1 border text-ink-2 hover:border-ink transition-colors"
              >
                {l.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="rounded-sm border border-bad/30 bg-[var(--bad-soft)] p-4 text-sm text-ink-2">
          <span className="eyebrow text-[var(--bad)] mr-2">Error</span> {error}
        </div>
      )}

      {/* Table */}
      <section>
        {loading && !data && (
          <ul className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="h-14 shimmer rounded-sm" />
            ))}
          </ul>
        )}

        {data && (
          <div>
            <div className="hidden md:grid grid-cols-12 gap-4 px-2 pb-3 border-b border-ink eyebrow">
              <span className="col-span-1">№</span>
              <span className="col-span-4">Paragraph</span>
              <span className="col-span-4">Source file</span>
              <span className="col-span-2">Intent</span>
              <span className="col-span-1 text-right">Lines</span>
            </div>
            <ul className="divide-y divide-rule">
              {data.items.map((block, i) => {
                const idx = (page - 1) * PAGE_SIZE + i + 1;
                const file = block.source_file.split(/[/\\]/).slice(-1)[0];
                return (
                  <li key={block.id} className="group">
                    <Link
                      href={`/blocks/${encodeURIComponent(block.id)}`}
                      className="grid md:grid-cols-12 gap-2 md:gap-4 px-2 py-4 items-center hover:bg-paper-2/60 transition-colors"
                    >
                      <span className="md:col-span-1 eyebrow num text-ink-4">
                        {String(idx).padStart(3, "0")}
                      </span>
                      <span className="md:col-span-4 font-display text-lg leading-tight text-ink group-hover:text-accent-ink transition-colors">
                        {block.paragraph}
                      </span>
                      <span className="md:col-span-4 font-mono text-xs text-ink-3 truncate">
                        {file}
                      </span>
                      <span className="md:col-span-2">
                        {block.weak_label ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs"
                            style={{ color: LABEL_HUE[block.weak_label] ?? "var(--ink-3)" }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: LABEL_HUE[block.weak_label] ?? "var(--ink-3)" }}
                            />
                            {block.weak_label.replace(/_/g, " ")}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-4 italic">unlabelled</span>
                        )}
                      </span>
                      <span className="md:col-span-1 md:text-right num text-xs text-ink-3">
                        {block.start_line}–{block.end_line}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {data.items.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-display text-3xl text-ink-3 italic">Nothing found.</p>
                <p className="text-sm text-ink-4 mt-2">
                  Try a broader query or clear the active filter.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Pagination */}
      {data && data.items.length > 0 && (
        <nav className="flex items-center justify-between border-t border-rule pt-6">
          <p className="text-sm text-ink-3">
            <span className="eyebrow mr-2">Folio</span>
            <span className="num">{page}</span>
            <span className="mx-2 text-ink-4">/</span>
            <span className="num">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              className="rounded-sm border border-ink/20 px-4 py-2 text-sm hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-sm border border-ink/20 px-4 py-2 text-sm hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink transition-colors"
            >
              Next →
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function BlocksPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <div className="h-12 w-64 shimmer rounded-sm" />
          <div className="h-4 w-96 shimmer rounded-sm" />
        </div>
      }
    >
      <BlocksContent />
    </Suspense>
  );
}
