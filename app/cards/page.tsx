"use client";

import { useEffect, useState } from "react";
import {
  api,
  type BusinessIntentCard,
  type LogicBlock,
  type Stats,
} from "@/lib/api";

const PAGE_SIZE = 12;

const CONF: Record<string, string> = {
  High: "var(--ok)",
  Medium: "#d97706",
  Low: "var(--bad)",
};

export default function CardsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [cards, setCards] = useState<BusinessIntentCard[]>([]);
  const [blocks, setBlocks] = useState<Record<string, LogicBlock>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [label, setLabel] = useState<string>("");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!label && !q) {
          const res = await api.cards(page, PAGE_SIZE);
          if (cancelled) return;
          setCards(res.items);
          setBlocks({});
          setTotal(res.total);
          setError(null);
        } else {
          const res = await api.blocks({ page, size: PAGE_SIZE, label, q });
          if (cancelled) return;
          setTotal(res.total);
          const bmap: Record<string, LogicBlock> = {};
          res.items.forEach((b) => (bmap[b.id] = b));
          setBlocks(bmap);
          const cs = await Promise.all(
            res.items.map((b) =>
              api.card(b.id).catch(
                (): BusinessIntentCard => ({
                  logic_block_id: b.id,
                  what: "(no intent card generated for this block)",
                  why: "",
                  code_evidence: [],
                  regulation_link: null,
                  regulation_sources: [],
                  confidence: { level: "Low", justification: "" },
                }),
              ),
            ),
          );
          if (cancelled) return;
          setCards(cs);
          setError(null);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
        setCards([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, label, q]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (qInput.trim() === q) return;
    setLoading(true);
    setPage(1);
    setQ(qInput.trim());
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Intent Cards
            </h1>
            <p className="mt-1.5 text-sm text-fg-muted">
              Recovered business intent for each logic block — what it does, why
              it exists, and the confidence behind it.
            </p>
          </div>
          {stats && (
            <div className="flex gap-6">
              {[
                { k: "Blocks", v: stats.total_blocks },
                { k: "Cards", v: stats.total_cards },
                {
                  k: "Labels",
                  v: Object.keys(stats.label_distribution).length,
                },
              ].map((s) => (
                <div key={s.k} className="text-right">
                  <p className="font-mono text-xl font-semibold tabular-nums">
                    {s.v.toLocaleString()}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-fg-faint">
                    {s.k}
                  </p>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <form onSubmit={submitSearch} className="flex-1 min-w-[220px]">
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search logic blocks (variables, code, paragraph)…"
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm shadow-[var(--shadow-sm)] outline-none transition-colors focus:border-accent/40"
            />
          </form>
          <select
            value={label}
            onChange={(e) => {
              setLoading(true);
              setPage(1);
              setLabel(e.target.value);
            }}
            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm shadow-[var(--shadow-sm)] outline-none focus:border-accent/40"
          >
            <option value="">All labels</option>
            {stats &&
              Object.entries(stats.label_distribution)
                .sort(([, a], [, b]) => b - a)
                .map(([l, c]) => (
                  <option key={l} value={l}>
                    {l.replace(/_/g, " ")} ({c})
                  </option>
                ))}
          </select>
          {(q || label) && (
            <button
              onClick={() => {
                setLoading(true);
                setQ("");
                setQInput("");
                setLabel("");
                setPage(1);
              }}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-fg-muted shadow-[var(--shadow-sm)] transition-colors hover:text-fg"
            >
              Clear
            </button>
          )}
        </div>

        {/* grid */}
        {error ? (
          <div className="mt-10 rounded-xl border border-border bg-surface p-6 text-sm text-fg-muted">
            Could not load cards: {error}
          </div>
        ) : loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-border bg-surface-2"
              />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="mt-10 text-center text-sm text-fg-muted">
            No cards match these filters.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((c, i) => (
              <Card
                key={c.logic_block_id ?? i}
                card={c}
                block={
                  c.logic_block_id ? blocks[c.logic_block_id] : undefined
                }
              />
            ))}
          </div>
        )}

        {/* pagination */}
        {!loading && !error && cards.length > 0 && (
          <div className="mt-8 flex items-center justify-between text-sm">
            <span className="text-fg-faint">
              {total.toLocaleString()} result{total === 1 ? "" : "s"} · page{" "}
              {page} / {pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true);
                  setPage((p) => p - 1);
                }}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 transition-colors hover:text-fg disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page >= pages}
                onClick={() => {
                  setLoading(true);
                  setPage((p) => p + 1);
                }}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 transition-colors hover:text-fg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  card,
  block,
}: {
  card: BusinessIntentCard;
  block?: LogicBlock;
}) {
  const [code, setCode] = useState<LogicBlock | null>(block ?? null);
  const [open, setOpen] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const conf = CONF[card.confidence.level] ?? "var(--fg-faint)";

  async function toggleCode() {
    if (!open && !code && card.logic_block_id) {
      setLoadingCode(true);
      try {
        setCode(await api.block(card.logic_block_id));
      } catch {
        /* ignore */
      } finally {
        setLoadingCode(false);
      }
    }
    setOpen((o) => !o);
  }

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            color: conf,
            background: `color-mix(in oklab, ${conf} 14%, transparent)`,
          }}
        >
          {card.confidence.level} confidence
        </span>
        {(block?.weak_label || block?.weak_label === "") &&
          block.weak_label !== "unknown" &&
          block.weak_label && (
            <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fg-muted">
              {block.weak_label.replace(/_/g, " ")}
            </span>
          )}
      </div>

      <h3 className="text-[15px] font-semibold leading-snug">{card.what}</h3>
      {card.why && (
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          {card.why}
        </p>
      )}

      {card.code_evidence.length > 0 && (
        <ul className="mt-3 space-y-1">
          {card.code_evidence.slice(0, 4).map((e, i) => (
            <li
              key={i}
              className="flex gap-2 text-[12px] leading-relaxed text-fg-muted"
            >
              <span className="text-accent">›</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}

      {card.regulation_sources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.regulation_sources.map((r) => (
            <span
              key={r}
              className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-fg-muted"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="truncate font-mono text-[10px] text-fg-faint">
          {card.logic_block_id ?? "—"}
        </span>
        {card.logic_block_id && (
          <button
            onClick={toggleCode}
            className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-fg-muted transition-colors hover:text-fg"
          >
            {loadingCode ? "Loading…" : open ? "Hide code" : "View code"}
          </button>
        )}
      </div>

      {open && code && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-2">
          <div className="border-b border-border px-3 py-1.5 font-mono text-[10px] text-fg-faint">
            {code.source_file.split(/[/\\]/).slice(-1)[0]} · {code.paragraph} ·
            L{code.start_line}–{code.end_line}
          </div>
          <pre className="max-h-72 overflow-auto p-3 text-[12px] leading-relaxed">
            <code className="font-mono">{code.code}</code>
          </pre>
        </div>
      )}
    </article>
  );
}
