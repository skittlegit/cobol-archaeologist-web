"use client";

import { api, BusinessIntentCard } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

const CONFIDENCE: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  High:   { label: "High",   bg: "var(--ok-soft)",   fg: "var(--ok)",   dot: "var(--ok)" },
  Medium: { label: "Medium", bg: "var(--warn-soft)", fg: "var(--warn)", dot: "var(--warn)" },
  Low:    { label: "Low",    bg: "var(--bad-soft)",  fg: "var(--bad)",  dot: "var(--bad)" },
};

export default function FreeformPage() {
  const [code, setCode] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<BusinessIntentCard | null>(null);

  async function handleGenerate() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setCard(null);
    try {
      const result = await api.analyseFreeform(code, "ollama", paragraph || "FREEFORM");
      setCard(result);
    } catch (e) {
      const msg = String(e);
      const friendlyMsg =
        msg.includes("TimeoutError") || msg.includes("timed out")
          ? "Ollama timed out — is it running? (ollama serve)"
          : msg.includes("fetch failed") || msg.includes("ECONNREFUSED") || msg.includes("Failed to fetch")
          ? "Cannot reach Ollama — run: ollama serve"
          : msg.replace(/^Error:\s*/, "");
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  }

  const conf = card ? (CONFIDENCE[card.confidence.level] ?? CONFIDENCE.Medium) : null;

  return (
    <div className="rise space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-ink-3">
        <Link href="/" className="link hover:text-ink">Overview</Link>
        <span className="text-ink-4">/</span>
        <Link href="/blocks" className="link hover:text-ink">Logic Blocks</Link>
        <span className="text-ink-4">/</span>
        <span className="text-ink">Custom code</span>
      </div>

      {/* Header */}
      <header className="border-b border-ink pb-8">
        <p className="eyebrow">§ Freeform</p>
        <h1 className="font-display mt-3 text-5xl md:text-6xl leading-none">
          Analyse custom COBOL
        </h1>
        <p className="mt-4 text-ink-2 max-w-xl">
          Paste any COBOL paragraph and generate an intent card instantly.
          Does not need to be in the corpus.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Input side */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-end justify-between border-b border-ink pb-3">
            <div>
              <p className="eyebrow">§ A</p>
              <h2 className="font-display text-2xl mt-1">Your code</h2>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              placeholder="Paragraph name (optional, e.g. VALIDATE-BALANCE)"
              className="w-full rounded-sm border border-ink/15 bg-card px-4 py-2.5 text-sm font-mono placeholder:text-ink-4 focus:outline-none focus:border-ink focus:ring-2 focus:ring-accent/30 transition"
            />

            <div className="rounded-sm border border-rule bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5 bg-paper-2/60">
                <span className="h-2 w-2 rounded-full bg-[var(--bad)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--warn)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
                <span className="ml-3 font-mono text-xs text-ink-3">paste COBOL here</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={"       VALIDATE-BALANCE.\n           IF WS-BALANCE < ZERO\n               MOVE 'Y' TO WS-OVERDRAWN\n           END-IF."}
                rows={18}
                spellCheck={false}
                className="w-full px-4 py-4 text-[12px] font-mono leading-[1.65] bg-transparent text-ink placeholder:text-ink-4/50 focus:outline-none resize-y"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {error && (
              <span className="text-[11px] text-[var(--bad)] flex-1 truncate" title={error}>
                {error}
              </span>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading || !code.trim()}
              className="group ml-auto inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2 text-xs font-medium hover:bg-ink hover:text-paper hover:border-ink disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  loading ? "bg-accent animate-pulse" : "bg-ok group-hover:bg-paper"
                }`}
              />
              {loading ? "Generating…" : "Generate with Ollama"}
            </button>
          </div>
        </section>

        {/* Card side */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="border-b border-ink pb-3">
            <p className="eyebrow">§ B</p>
            <h2 className="font-display text-2xl mt-1">Intent card</h2>
          </div>

          {!card && !loading && (
            <div className="rounded-sm border border-rule bg-card p-6 text-center">
              <p className="font-display text-xl text-ink-3 italic">No card yet.</p>
              <p className="text-xs text-ink-4 mt-2">Paste code and click Generate.</p>
            </div>
          )}

          {loading && (
            <div className="rounded-sm border border-rule bg-card p-6 text-center">
              <p className="font-display text-xl text-ink-3 italic animate-pulse">Generating…</p>
              <p className="text-xs text-ink-4 mt-2">This can take 30–90 seconds on local hardware.</p>
            </div>
          )}

          {card && conf && (
            <div className="rounded-sm border border-ink bg-card overflow-hidden">
              <div className="border-b border-rule px-5 py-4 bg-paper-2/40 flex items-center justify-between">
                <p className="eyebrow">Inferred intent</p>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ background: conf.bg, color: conf.fg }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: conf.dot }} />
                  {conf.label} confidence
                </span>
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
                      {card.code_evidence.map((e, i) => (
                        <li
                          key={i}
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
    </div>
  );
}
