import type { BusinessIntentCard } from "@/lib/api";

const CONF: Record<string, string> = {
  High: "var(--ok)",
  Medium: "#d97706",
  Low: "var(--bad)",
};

export function IntentCardView({ card }: { card: BusinessIntentCard }) {
  const conf = CONF[card.confidence.level] ?? "var(--fg-faint)";

  return (
    <div className="overflow-hidden rounded-2xl border border-rule bg-surface shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3 border-b border-rule px-5 py-3.5">
        <span className="text-xs font-medium uppercase tracking-wider text-fg-faint">
          Inferred intent
        </span>
        <span
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider"
          style={{ color: conf }}
        >
          <span
            className="inline-block h-1.5 w-1.5"
            style={{ background: conf }}
          />
          {card.confidence.level}
        </span>
      </div>

      <div className="space-y-6 p-5">
        <section>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-fg-faint">
            What it does
          </p>
          <p className="font-display text-xl leading-snug">{card.what}</p>
        </section>

        {card.why && (
          <section>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-fg-faint">
              Why it exists
            </p>
            <p className="text-[13px] leading-relaxed text-fg-muted">
              {card.why}
            </p>
          </section>
        )}

        {card.code_evidence.length > 0 && (
          <section>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-fg-faint">
              Code evidence
            </p>
            <ul className="space-y-1.5">
              {card.code_evidence.map((e, i) => (
                <li
                  key={i}
                  className="border-l-2 border-accent bg-surface-2 px-3 py-1.5 font-mono text-[12px] leading-relaxed text-fg-muted"
                >
                  {e}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(card.regulation_link || card.regulation_sources.length > 0) && (
          <section className="border-t border-rule pt-5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-fg-faint">
              Regulatory anchor
            </p>
            {card.regulation_link && (
              <p className="mb-3 text-[13px] italic leading-relaxed text-fg">
                {card.regulation_link}
              </p>
            )}
            {card.regulation_sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {card.regulation_sources.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-accent/30 bg-accent-soft px-2 py-0.5 text-[11px] text-accent"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        {card.confidence.justification && (
          <p className="border-t border-rule pt-4 text-[11px] leading-relaxed text-fg-faint">
            {card.confidence.justification}
          </p>
        )}
      </div>
    </div>
  );
}

export function CodePanel({
  code,
  title,
  startLine = 1,
}: {
  code: string;
  title: string;
  startLine?: number;
}) {
  const lines = code.split("\n");
  return (
    <div className="overflow-hidden rounded-2xl border border-rule bg-surface-2 shadow-[var(--shadow-sm)]">
      <div className="border-b border-rule px-4 py-2.5">
        <span className="truncate font-mono text-[11px] text-fg-faint">
          {title}
        </span>
      </div>
      <pre className="grid grid-cols-[auto_1fr] overflow-x-auto text-[12px] leading-[1.65]">
        <span
          aria-hidden
          className="select-none border-r border-rule px-3 py-4 text-right font-mono text-fg-faint"
        >
          {lines.map((_, i) => (
            <span key={i} className="block">
              {startLine + i}
            </span>
          ))}
        </span>
        <code className="whitespace-pre px-4 py-4 font-mono">{code}</code>
      </pre>
    </div>
  );
}
