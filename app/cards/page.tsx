"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "../_components/PageHeader";
import {
  api,
  type BusinessIntentCard,
  type LogicBlock,
  type Stats,
} from "@/lib/api";

const PAGE_SIZE = 12;

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
      <div className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-10">
        <PageHeader
          eyebrow="Catalogue"
          title="Intent Cards"
          lead="Recovered business intent for each logic block — what it does, why it exists, and the confidence behind it."
          aside={
            stats ? (
              <div className="flex gap-10">
                {[
                  { k: "blocks", v: stats.total_blocks },
                  { k: "cards", v: stats.total_cards },
                ].map((s) => (
                  <div key={s.k}>
                    <p className="font-display num text-3xl">
                      {s.v.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[12px] text-fg-muted">{s.k}</p>
                  </div>
                ))}
              </div>
            ) : undefined
          }
        />

        {/* controls */}
        <div className="mt-10 flex flex-wrap items-end gap-x-8 gap-y-4">
          <form onSubmit={submitSearch} className="min-w-[260px] flex-1">
            <label className="eyebrow mb-2 block">Search blocks</label>
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="variables, code, paragraph…"
              className="w-full border-b border-fg bg-transparent pb-2 text-sm outline-none placeholder:text-fg-faint"
            />
          </form>
          <div>
            <label className="eyebrow mb-2 block">Label</label>
            <select
              value={label}
              onChange={(e) => {
                setLoading(true);
                setPage(1);
                setLabel(e.target.value);
              }}
              className="border-b border-fg bg-transparent pb-2 text-sm outline-none"
            >
              <option value="">all labels</option>
              {stats &&
                Object.entries(stats.label_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([l, c]) => (
                    <option key={l} value={l}>
                      {l.replace(/_/g, " ")} ({c})
                    </option>
                  ))}
            </select>
          </div>
          {(q || label) && (
            <button
              onClick={() => {
                setLoading(true);
                setQ("");
                setQInput("");
                setLabel("");
                setPage(1);
              }}
              className="link pb-2 text-sm text-fg-muted hover:text-fg"
            >
              Clear
            </button>
          )}
        </div>

        {/* list */}
        <div className="mt-12">
          {error ? (
            <p className="py-16 text-center text-sm text-fg-muted">
              Could not load cards — {error}
            </p>
          ) : loading ? (
            <div className="space-y-px">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse border-t border-rule bg-surface-2/40"
                />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <p className="py-16 text-center text-sm text-fg-muted">
              No cards match these filters.
            </p>
          ) : (
            <ul>
              {cards.map((c, i) => (
                <Row
                  key={c.logic_block_id ?? i}
                  card={c}
                  block={c.logic_block_id ? blocks[c.logic_block_id] : undefined}
                  first={i === 0}
                />
              ))}
            </ul>
          )}
        </div>

        {/* pagination */}
        {!loading && !error && cards.length > 0 && (
          <div className="mt-10 flex items-center justify-between border-t border-fg pt-6 text-sm">
            <span className="text-fg-faint">
              {total.toLocaleString()} result{total === 1 ? "" : "s"} · page{" "}
              {page} / {pages}
            </span>
            <div className="flex gap-6">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true);
                  setPage((p) => p - 1);
                }}
                className="link disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                disabled={page >= pages}
                onClick={() => {
                  setLoading(true);
                  setPage((p) => p + 1);
                }}
                className="link disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  card,
  block,
  first,
}: {
  card: BusinessIntentCard;
  block?: LogicBlock;
  first: boolean;
}) {
  const href = card.logic_block_id
    ? `/cards/${encodeURIComponent(card.logic_block_id)}`
    : null;
  const labelTag =
    block?.weak_label && block.weak_label !== "unknown"
      ? block.weak_label.replace(/_/g, " ")
      : null;

  const body = (
    <div
      className={`group flex items-start gap-6 py-7 ${
        first ? "" : "border-t border-rule"
      } ${href ? "transition-colors hover:bg-surface-2" : ""}`}
    >
      <div className="hidden w-40 shrink-0 sm:block">
        <p className="eyebrow">{card.confidence.level} conf.</p>
        {labelTag && (
          <p className="mt-2 text-[12px] text-fg-muted">{labelTag}</p>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-snug">{card.what}</p>
        {card.why && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
            {card.why}
          </p>
        )}
        {card.regulation_sources.length > 0 && (
          <p className="mt-3 text-[12px] text-fg-faint">
            {card.regulation_sources.join(" · ")}
          </p>
        )}
      </div>
      <span className="shrink-0 pt-1 text-sm text-fg-faint transition-transform group-hover:translate-x-1 group-hover:text-fg">
        {href ? "→" : ""}
      </span>
    </div>
  );

  return (
    <li>
      {href ? <Link href={href}>{body}</Link> : body}
    </li>
  );
}
