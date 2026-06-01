"use client";

import { useState } from "react";
import { api, friendlyError, type BusinessIntentCard } from "@/lib/api";
import { IntentCardView } from "../_components/IntentCard";
import { PageHeader } from "../_components/PageHeader";

const SAMPLE = `       VALIDATE-BALANCE.
           IF WS-ACCT-BALANCE < WS-WITHDRAW-AMT
               MOVE 'Y' TO WS-INSUFFICIENT-FUNDS
               MOVE 'DEBIT REJECTED' TO WS-MSG
           ELSE
               SUBTRACT WS-WITHDRAW-AMT FROM WS-ACCT-BALANCE
           END-IF.`;

export default function AnalysePage() {
  const [code, setCode] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [backend, setBackend] = useState("ollama");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<BusinessIntentCard | null>(null);

  async function analyse() {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    setCard(null);
    try {
      const result = await api.analyse(code, {
        paragraph: paragraph || "FREEFORM",
        backend,
      });
      setCard(result);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-10">
        <PageHeader
          eyebrow="§ Freeform"
          title="Analyse COBOL"
          lead="Paste any COBOL paragraph on the left and generate an intent card on the right. It does not need to be in the corpus."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* ---- input side ---- */}
          <section className="flex flex-col">
            <div className="mb-3 flex items-baseline gap-3 border-b border-rule pb-2">
              <span className="eyebrow">A</span>
              <h2 className="font-display text-xl">Your code</h2>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div className="min-w-[180px] flex-1">
                <label className="eyebrow mb-2 block">Paragraph (optional)</label>
                <input
                  value={paragraph}
                  onChange={(e) => setParagraph(e.target.value)}
                  placeholder="e.g. 1000-VALIDATE"
                  className="w-full border-b border-fg bg-transparent pb-2 font-mono text-sm outline-none placeholder:text-fg-faint"
                />
              </div>
              <div className="w-32">
                <label className="eyebrow mb-2 block">Backend</label>
                <input
                  value={backend}
                  onChange={(e) => setBackend(e.target.value)}
                  placeholder="ollama"
                  title="Inference backend the API should use"
                  className="w-full border-b border-fg bg-transparent pb-2 font-mono text-sm outline-none placeholder:text-fg-faint"
                />
              </div>
            </div>

            <div className="mt-4 border border-fg">
              <div className="flex items-center justify-between border-b border-rule px-4 py-2.5">
                <span className="eyebrow">paste COBOL</span>
                <button
                  onClick={() => setCode(SAMPLE)}
                  className="link text-[12px] text-fg-muted hover:text-fg"
                >
                  Insert sample
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={SAMPLE}
                rows={18}
                spellCheck={false}
                className="w-full resize-y bg-transparent px-4 py-4 font-mono text-[12.5px] leading-[1.7] text-fg placeholder:text-fg-faint/60 focus:outline-none"
              />
            </div>

            <div className="mt-3 flex items-center gap-3">
              {error && (
                <span
                  className="flex-1 truncate text-xs text-[var(--bad)]"
                  title={error}
                >
                  {error}
                </span>
              )}
              <button
                onClick={analyse}
                disabled={loading || !code.trim()}
                className="ml-auto inline-flex items-center gap-2 border border-fg px-5 py-2.5 text-sm hover:enabled:bg-fg hover:enabled:text-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {loading ? "Generating…" : "Generate intent card"}
              </button>
            </div>
          </section>

          {/* ---- output side ---- */}
          <section className="flex flex-col">
            <div className="mb-3 flex items-baseline gap-3 border-b border-rule pb-2">
              <span className="eyebrow">B</span>
              <h2 className="font-display text-xl">Intent card</h2>
            </div>

            {card ? (
              <IntentCardView card={card} />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center border border-dashed border-rule p-12 text-center">
                {loading ? (
                  <>
                    <span className="dots mb-3 flex items-center gap-1.5">
                      <span />
                      <span />
                      <span />
                    </span>
                    <p className="text-sm text-fg-muted">
                      Generating — this can take 30–90s on local hardware.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-fg-muted">
                      No card yet
                    </p>
                    <p className="mt-1 text-xs text-fg-faint">
                      Paste code and click Generate.
                    </p>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
