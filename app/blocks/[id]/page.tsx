import { api, BusinessIntentCard, LogicBlock } from "@/lib/api";
import Link from "next/link";
import InferButton from "./InferButton";

interface Props {
  params: Promise<{ id: string }>;
}

const CONFIDENCE: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  High:   { label: "High",   bg: "var(--ok-soft)",   fg: "var(--ok)",   dot: "var(--ok)" },
  Medium: { label: "Medium", bg: "var(--warn-soft)", fg: "var(--warn)", dot: "var(--warn)" },
  Low:    { label: "Low",    bg: "var(--bad-soft)",  fg: "var(--bad)",  dot: "var(--bad)" },
};

const LABEL_HUE: Record<string, string> = {
  balance_check: "#1f3a52",
  late_fee: "#8a5a00",
  kyc_screening: "#5a2a4d",
  interest_calculation: "#1f4d3a",
  loan_eligibility: "#6b4f00",
  transaction_validation: "#7a1d1d",
  fraud_check: "#b8593e",
  payroll: "#1f5d5a",
};

export default async function BlockDetailPage({ params }: Props) {
  const { id } = await params;
  const blockId = decodeURIComponent(id);

  let block: LogicBlock | null = null;
  let card: BusinessIntentCard | null = null;
  let blockError = "";
  let cardError = "";

  try {
    block = await api.block(blockId);
  } catch (e) {
    blockError = String(e);
  }

  if (block) {
    try {
      card = await api.card(blockId);
    } catch {
      cardError = "No intent card generated yet.";
    }
  }

  if (blockError) {
    return (
      <div className="rise space-y-6 max-w-3xl">
        <Link href="/blocks" className="eyebrow link inline-flex items-center gap-2">
          ← Back to catalogue
        </Link>
        <div className="rounded-sm border border-bad/30 bg-[var(--bad-soft)] p-6">
          <p className="eyebrow text-[var(--bad)] mb-2">Block not found</p>
          <p className="text-sm text-ink-2">{blockError}</p>
        </div>
      </div>
    );
  }

  if (!block) return null;

  const filePath = block.source_file.split(/[/\\]/).slice(-2).join("/");
  const lineCount = block.end_line - block.start_line + 1;
  const labelHue = block.weak_label ? LABEL_HUE[block.weak_label] ?? "var(--ink-3)" : "var(--ink-4)";

  const sections = [
    { label: "Variables Read",    items: block.vars_read },
    { label: "Variables Written", items: block.vars_written },
    { label: "Conditions",        items: block.conditions },
    { label: "PERFORM Calls",     items: block.perform_calls },
    { label: "File References",   items: block.file_refs },
    { label: "Copybooks",         items: block.copybooks },
  ].filter((s) => s.items.length > 0);

  return (
    <article className="rise space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-ink-3">
        <Link href="/" className="link hover:text-ink">Overview</Link>
        <span className="text-ink-4">/</span>
        <Link href="/blocks" className="link hover:text-ink">Logic Blocks</Link>
        <span className="text-ink-4">/</span>
        <span className="font-mono text-ink truncate">{block.paragraph}</span>
      </div>

      {/* Title block */}
      <header className="grid lg:grid-cols-12 gap-8 border-b border-ink pb-10">
        <div className="lg:col-span-8">
          <p className="eyebrow">Folio · {block.id.slice(0, 8)}</p>
          <h1 className="font-display mt-3 text-5xl md:text-6xl leading-[0.95] break-words">
            {block.paragraph}
          </h1>
          {block.weak_label && (
            <div className="mt-6 inline-flex items-center gap-2.5 text-sm" style={{ color: labelHue }}>
              <span className="h-2 w-2 rounded-full" style={{ background: labelHue }} />
              <span className="font-medium">{block.weak_label.replace(/_/g, " ")}</span>
              {block.weak_label_confidence > 0 && (
                <span className="num text-ink-4">
                  · {(block.weak_label_confidence * 100).toFixed(0)}% confidence
                </span>
              )}
            </div>
          )}
        </div>

        <dl className="lg:col-span-4 grid grid-cols-2 gap-px bg-rule self-end">
          {[
            { k: "Source",    v: filePath, mono: true },
            { k: "Lines",     v: `${block.start_line}–${block.end_line}`, mono: true },
            { k: "Length",    v: `${lineCount} ln`, mono: false },
            { k: "Tags",      v: block.tags.length ? block.tags.length : "—" },
          ].map((m) => (
            <div key={m.k} className="bg-paper p-4">
              <dt className="eyebrow">{m.k}</dt>
              <dd className={`mt-1.5 text-sm truncate ${m.mono ? "font-mono" : "num"}`}>
                {m.v}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* Two-column body */}
      <div className="grid gap-12 lg:grid-cols-12">
        {/* COBOL source */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-end justify-between border-b border-ink pb-3">
            <div>
              <p className="eyebrow">§ A</p>
              <h2 className="font-display text-2xl mt-1">The source</h2>
            </div>
            <p className="eyebrow">{lineCount} lines · COBOL</p>
          </div>

          <div className="rounded-sm border border-rule bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5 bg-paper-2/60">
              <span className="h-2 w-2 rounded-full bg-[var(--bad)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--warn)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
              <span className="ml-3 font-mono text-xs text-ink-3 truncate">{filePath}</span>
            </div>
            <pre className="grid grid-cols-[auto_1fr] text-[12px] font-mono leading-[1.65] text-ink overflow-x-auto">
              <span aria-hidden className="select-none px-3 py-4 border-r border-rule bg-paper-2/40 text-ink-4 text-right">
                {block.code.split("\n").map((_, i) => (
                  <span key={i} className="block num">{block.start_line + i}</span>
                ))}
              </span>
              <code className="px-4 py-4 whitespace-pre">{block.code}</code>
            </pre>
          </div>
        </section>

        {/* Intent card */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="flex items-end justify-between border-b border-ink pb-3">
            <div>
              <p className="eyebrow">§ B</p>
              <h2 className="font-display text-2xl mt-1">Intent card</h2>
            </div>
            <InferButton blockId={blockId} />
          </div>

          {!card && cardError && (
            <div className="rounded-sm border border-rule bg-card p-6 text-center">
              <p className="font-display text-xl text-ink-3 italic">No card yet.</p>
              <p className="text-xs text-ink-4 mt-2">
                Use <span className="font-mono">Generate</span> to draft one with the LLM.
              </p>
            </div>
          )}

          {card && (
            <div className="rounded-sm border border-ink bg-card overflow-hidden">
              <div className="border-b border-rule px-5 py-4 bg-paper-2/40 flex items-center justify-between">
                <p className="eyebrow">Inferred intent</p>
                {(() => {
                  const c = CONFIDENCE[card.confidence.level] ?? CONFIDENCE.Medium;
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ background: c.bg, color: c.fg }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
                      {c.label} confidence
                    </span>
                  );
                })()}
              </div>

              <div className="p-5 space-y-6">
                <div>
                  <p className="eyebrow mb-2">What it does</p>
                  <p className="font-display text-xl leading-snug text-ink">{card.what}</p>
                </div>

                <div>
                  <p className="eyebrow mb-2">Why it exists</p>
                  <p className="text-sm text-ink-2 leading-relaxed">{card.why}</p>
                </div>

                {card.code_evidence.length > 0 && (
                  <div>
                    <p className="eyebrow mb-2">Code evidence</p>
                    <ul className="space-y-1.5">
                      {card.code_evidence.map((e) => (
                        <li
                          key={e}
                          className="font-mono text-[12px] text-ink-2 px-2.5 py-1.5 bg-paper-2/60 border-l-2 border-accent"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(card.regulation_link || card.regulation_sources.length > 0) && (
                  <div className="border-t border-rule pt-5">
                    <p className="eyebrow mb-2">Regulatory anchor</p>
                    {card.regulation_link && (
                      <p className="text-sm text-ink leading-relaxed mb-3 font-display italic">
                        {card.regulation_link}
                      </p>
                    )}
                    {card.regulation_sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {card.regulation_sources.map((s) => (
                          <span
                            key={s}
                            className="rounded-sm border border-accent/30 bg-accent-soft text-accent-ink px-2 py-0.5 text-[11px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {card.confidence.justification && (
                  <p className="text-xs text-ink-3 italic border-t border-rule pt-4">
                    <span className="eyebrow not-italic mr-2">Note</span>
                    {card.confidence.justification}
                  </p>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Static analysis grid */}
      {sections.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-ink pb-3">
            <div>
              <p className="eyebrow">§ C</p>
              <h2 className="font-display text-2xl mt-1">Static analysis</h2>
            </div>
            <p className="hidden sm:block eyebrow">Extracted from the parser</p>
          </div>

          <div className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3 border border-rule">
            {sections.map((s) => (
              <div key={s.label} className="bg-paper p-5">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="eyebrow">{s.label}</p>
                  <p className="num text-xs text-ink-4">{s.items.length}</p>
                </div>
                <ul className="space-y-1">
                  {s.items.map((item) => (
                    <li
                      key={item}
                      className="font-mono text-[12px] text-ink-2 truncate"
                      title={item}
                    >
                      <span className="text-ink-4 mr-1.5">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pt-8 border-t border-rule">
        <Link href="/blocks" className="eyebrow link hover:text-accent">
          ← Return to catalogue
        </Link>
      </div>
    </article>
  );
}
