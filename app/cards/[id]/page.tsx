"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  api,
  friendlyError,
  type BusinessIntentCard,
  type LogicBlock,
} from "@/lib/api";
import { CodePanel, IntentCardView } from "../../_components/IntentCard";

export default function CardDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(
    Array.isArray(params.id) ? params.id[0] : params.id,
  );

  const [block, setBlock] = useState<LogicBlock | null>(null);
  const [card, setCard] = useState<BusinessIntentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [noCard, setNoCard] = useState(false);

  const [inferring, setInferring] = useState(false);
  const [inferError, setInferError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const b = await api.block(id);
        if (cancelled) return;
        setBlock(b);
        setBlockError(null);
        try {
          const c = await api.card(id);
          if (!cancelled) {
            setCard(c);
            setNoCard(false);
          }
        } catch {
          if (!cancelled) {
            setCard(null);
            setNoCard(true);
          }
        }
      } catch (e) {
        if (!cancelled) setBlockError(friendlyError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function reinfer() {
    if (inferring) return;
    setInferring(true);
    setInferError(null);
    try {
      const c = await api.infer(id);
      setCard(c);
      setNoCard(false);
    } catch (e) {
      setInferError(friendlyError(e));
    } finally {
      setInferring(false);
    }
  }

  const fileName = block?.source_file.split(/[/\\]/).slice(-1)[0] ?? "";

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-10">
        <Link
          href="/cards"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
        >
          ← Intent Cards
        </Link>

        {loading ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="h-96 animate-pulse border border-rule bg-surface-2" />
            <div className="h-96 animate-pulse border border-rule bg-surface-2" />
          </div>
        ) : blockError ? (
          <div className="mt-6 border border-rule bg-surface p-6 text-sm text-fg-muted">
            Could not load this block: {blockError}
          </div>
        ) : (
          block && (
            <>
              <header className="mt-6 border-b border-rule pb-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-fg-faint">
                      {block.id}
                    </p>
                    <h1 className="font-display mt-2 text-3xl">
                      {block.paragraph}
                    </h1>
                    <p className="mt-1.5 font-mono text-xs text-fg-muted">
                      {fileName} · L{block.start_line}–{block.end_line}
                      {block.weak_label && block.weak_label !== "unknown" && (
                        <span className="ml-2 rounded bg-surface-2 px-2 py-0.5 uppercase tracking-wider">
                          {block.weak_label.replace(/_/g, " ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {inferError && (
                      <span
                        className="max-w-[220px] truncate text-xs text-[var(--bad)]"
                        title={inferError}
                      >
                        {inferError}
                      </span>
                    )}
                    <button
                      onClick={reinfer}
                      disabled={inferring}
                      className="inline-flex items-center gap-2 border border-fg px-4 py-2 text-sm hover:enabled:bg-fg hover:enabled:text-paper disabled:opacity-50"
                    >
                      {inferring && (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      )}
                      {inferring
                        ? "Generating…"
                        : noCard
                          ? "Generate with model"
                          : "Re-infer"}
                    </button>
                  </div>
                </div>
              </header>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section>
                  <div className="mb-4 flex items-baseline gap-3 border-b border-rule pb-2">
                    <span className="eyebrow">A</span>
                    <h2 className="font-display text-xl">The source</h2>
                  </div>
                  <CodePanel
                    code={block.code}
                    title={fileName}
                    startLine={block.start_line}
                  />
                  <BlockFacts block={block} />
                </section>

                <section>
                  <div className="mb-4 flex items-baseline gap-3 border-b border-rule pb-2">
                    <span className="eyebrow">B</span>
                    <h2 className="font-display text-xl">Intent card</h2>
                  </div>
                  {card ? (
                    <IntentCardView card={card} />
                  ) : (
                    <div className="flex flex-col items-center justify-center border border-dashed border-rule p-10 text-center">
                      <p className="text-sm font-medium text-fg-muted">
                        No intent card yet
                      </p>
                      <p className="mt-1 text-xs text-fg-faint">
                        Use “Generate with model” to create one.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

function BlockFacts({ block }: { block: LogicBlock }) {
  const sections = [
    { label: "Variables read", items: block.vars_read },
    { label: "Variables written", items: block.vars_written },
    { label: "Conditions", items: block.conditions },
    { label: "PERFORM calls", items: block.perform_calls },
    { label: "File references", items: block.file_refs },
    { label: "Copybooks", items: block.copybooks },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {sections.map((s) => (
        <div
          key={s.label}
          className="border border-rule p-4"
        >
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-fg-faint">
            {s.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {s.items.map((it) => (
              <span
                key={it}
                className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-muted"
              >
                {it}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
