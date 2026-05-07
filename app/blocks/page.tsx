"use client";

import { api, PagedBlocks } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LABEL_COLORS: Record<string, string> = {
  balance_check: "bg-blue-100 text-blue-800",
  late_fee: "bg-orange-100 text-orange-800",
  kyc_screening: "bg-purple-100 text-purple-800",
  interest_calculation: "bg-green-100 text-green-800",
  loan_eligibility: "bg-yellow-100 text-yellow-800",
  transaction_validation: "bg-red-100 text-red-800",
  fraud_check: "bg-rose-100 text-rose-800",
  payroll: "bg-teal-100 text-teal-800",
};

function labelColor(l: string | null) {
  if (!l) return "bg-zinc-100 text-zinc-500";
  return LABEL_COLORS[l] ?? "bg-zinc-100 text-zinc-600";
}

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
      const result = await api.blocks({ page, size: PAGE_SIZE, q: q || undefined, label: label || undefined });
      setData(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [page, q, label]);

  useEffect(() => { load(); }, [load]);

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

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logic Blocks</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          {data ? `${data.total.toLocaleString()} blocks` : "Loading…"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={pushSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search paragraph or code…"
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          <option value="">All labels</option>
          {Object.keys(LABEL_COLORS).map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
      )}

      {loading && (
        <div className="text-zinc-400 text-sm animate-pulse">Loading…</div>
      )}

      {!loading && data && (
        <>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Paragraph</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 hidden md:table-cell">File</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Label</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">Lines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.items.map((block) => (
                  <tr key={block.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/blocks/${encodeURIComponent(block.id)}`}
                        className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {block.paragraph}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-zinc-500 truncate max-w-[200px]">
                      {block.source_file.split(/[/\\]/).slice(-2).join("/")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${labelColor(block.weak_label)}`}>
                        {block.weak_label ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-zinc-500 tabular-nums">
                      {block.start_line}–{block.end_line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2 justify-end text-sm">
            <button
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-zinc-500">Page {page} / {totalPages}</span>
            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function BlocksPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm animate-pulse">Loading blocks…</div>}>
      <BlocksContent />
    </Suspense>
  );
}
