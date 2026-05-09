import { api, Stats } from "@/lib/api";
import Link from "next/link";

const LABEL_META: Record<string, { hue: string; gloss: string }> = {
  balance_check:          { hue: "#1f4a6b", gloss: "Verifies funds before debit." },
  late_fee:               { hue: "#8a5a00", gloss: "Penalises overdue obligations." },
  kyc_screening:          { hue: "#5a1f0a", gloss: "Identifies the customer." },
  interest_calculation:   { hue: "#2f5d3a", gloss: "Accrues time-value of money." },
  loan_eligibility:       { hue: "#6b4f00", gloss: "Decides who may borrow." },
  transaction_validation: { hue: "#7a1d1d", gloss: "Guards the ledger from bad input." },
  fraud_check:            { hue: "#9a3412", gloss: "Flags unusual behaviour." },
  payroll:                { hue: "#1f5d5a", gloss: "Pays the people." },
  unlabeled:              { hue: "#9a9384", gloss: "Awaiting classification." },
};

function meta(l: string) {
  return LABEL_META[l] ?? { hue: "#6b6557", gloss: "—" };
}

async function getStats(): Promise<Stats | null> {
  try {
    return await api.stats();
  } catch {
    return null;
  }
}

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="rise space-y-16">
      {/* ----- Masthead ----- */}
      <section className="relative">
        <div className="flex items-center gap-3 text-ink-3">
          <span className="eyebrow">Vol. I · Issue 01</span>
          <span className="h-px flex-1 bg-rule" />
          <span className="eyebrow">Mainframe Banking · India</span>
        </div>

        <h1 className="font-display mt-6 text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-medium">
          The business intent
          <br />
          <span className="italic text-accent">hidden in legacy code.</span>
        </h1>

        <div className="mt-8 grid md:grid-cols-12 gap-8 items-start">
          <p className="md:col-span-7 text-lg text-ink-2 leading-relaxed max-w-2xl">
            COBOL Archaeologist excavates fifty-year-old banking programs and
            recovers the rules they encode — the balance checks, the fee
            schedules, the KYC screens — and links each fragment back to the
            regulations it once obeyed.
          </p>
          <div className="md:col-span-5 md:pl-8 md:border-l border-rule space-y-3 text-sm text-ink-3">
            <p>
              <span className="eyebrow block mb-1">Method</span>
              Static parsing → weak labelling → LLM-assisted intent inference,
              cross-referenced with primary regulatory sources.
            </p>
            <p>
              <span className="eyebrow block mb-1">Corpus</span>
              Real-world banking COBOL: ledger postings, interest accrual,
              KYC screening, payroll, late-fee assessment.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/blocks"
            className="group inline-flex items-center gap-3 rounded-sm bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-accent-ink transition-colors"
          >
            <span className="eyebrow text-[10px] text-paper/60">02</span>
            Browse the catalogue
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/search"
            className="group inline-flex items-center gap-3 rounded-sm border border-ink/20 px-5 py-3 text-sm font-medium hover:border-ink transition-colors"
          >
            <span className="eyebrow text-[10px]">03</span>
            Search regulations
          </Link>
        </div>
      </section>

      {!stats && (
        <section className="rounded-sm border border-bad/30 bg-[var(--bad-soft)] p-6">
          <p className="eyebrow text-[var(--bad)] mb-2">Connection error</p>
          <p className="text-sm text-ink-2">
            Could not reach the API. Make sure the Python backend is running on{" "}
            <code className="font-mono px-1.5 py-0.5 rounded bg-card border border-rule">
              {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
            </code>
            .
          </p>
        </section>
      )}

      {stats && (
        <>
          {/* ----- Ledger figures ----- */}
          <section>
            <SectionHeading number="§ 01" title="The corpus, in figures" />
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 border-t border-b border-rule">
              {[
                { label: "Logic Blocks",    value: stats.total_blocks, hint: "extracted paragraphs" },
                { label: "Intent Cards",    value: stats.total_cards,  hint: "what · why · evidence" },
                {
                  label: "Labelled Blocks",
                  value: Object.entries(stats.label_distribution).filter(([k]) => k !== "unlabeled").reduce((s, [, v]) => s + v, 0),
                  hint: "weak supervision",
                },
                { label: "Distinct Labels", value: Object.keys(stats.label_distribution).length, hint: "business categories" },
              ].map((kpi, i) => (
                <div
                  key={kpi.label}
                  className={`relative px-6 py-7 ${i > 0 ? "lg:border-l border-rule" : ""} ${
                    i === 1 ? "border-l border-rule lg:border-l" : ""
                  } ${i >= 2 ? "border-t lg:border-t-0 border-rule" : ""}`}
                >
                  <p className="eyebrow">{kpi.label}</p>
                  <p className="font-display num mt-3 text-5xl lg:text-6xl font-medium leading-none tracking-tight">
                    {kpi.value.toLocaleString()}
                  </p>
                  <p className="mt-3 text-xs text-ink-3">{kpi.hint}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ----- Distribution + Files ----- */}
          <section className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading number="§ 02" title="Distribution by intent" subtitle="Across all logic blocks" />
              <ul className="mt-8 divide-y divide-rule border-t border-b border-rule">
                {Object.entries(stats.label_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([label, count], i) => {
                    const pct = (count / stats.total_blocks) * 100;
                    const m = meta(label);
                    return (
                      <li key={label} className="group grid grid-cols-12 items-center gap-4 py-4">
                        <span className="col-span-1 eyebrow num text-ink-4">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="col-span-5 sm:col-span-4">
                          <p className="font-display text-lg leading-none">
                            {label.replace(/_/g, " ")}
                          </p>
                          <p className="mt-1 text-xs text-ink-3 hidden sm:block">{m.gloss}</p>
                        </div>
                        <div className="col-span-4 sm:col-span-5 h-[3px] bg-rule relative overflow-hidden">
                          <span
                            className="absolute inset-y-0 left-0 transition-[width] duration-700"
                            style={{ width: `${pct}%`, background: m.hue }}
                          />
                        </div>
                        <span className="col-span-2 sm:col-span-2 text-right num text-sm">
                          <span className="font-medium">{count.toLocaleString()}</span>
                          <span className="text-ink-4 ml-2 text-xs">{pct.toFixed(1)}%</span>
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <SectionHeading number="§ 03" title="Top files in the dig" subtitle="By block density" />
              <ol className="mt-8 space-y-1">
                {stats.top_files.map((f, i) => (
                  <li
                    key={f.file}
                    className="group flex items-baseline gap-4 py-3 border-b border-dashed border-rule hover:border-ink-3 transition-colors"
                  >
                    <span className="eyebrow num text-ink-4 w-8 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-sm flex-1 truncate text-ink-2 group-hover:text-ink">
                      {f.file.split(/[/\\]/).slice(-1)[0]}
                    </span>
                    <span className="num text-sm tabular-nums text-ink-3">
                      <span className="text-ink font-medium">{f.count}</span>
                      <span className="ml-1.5 text-ink-4">blocks</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ----- Pull quote ----- */}
          <section className="relative py-10 px-2 sm:px-10 border-y border-rule">
            <span aria-hidden className="absolute -top-6 left-6 font-display text-9xl leading-none text-accent/25 select-none">“</span>
            <blockquote className="font-display text-2xl md:text-3xl leading-snug max-w-3xl text-ink-2">
              Every <em>IF</em> in a fifty-year-old paragraph was once a
              regulatory clause, a customer complaint, or a 2 a.m. patch
              someone signed off on a fax.
            </blockquote>
            <p className="eyebrow mt-6">— from the foreword</p>
          </section>

          {/* ----- Method ----- */}
          <section>
            <SectionHeading number="§ 04" title="How a block becomes an intent card" />
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { n: "i.",   t: "Excavate", d: "Parse the program. Cut paragraphs into self-contained logic blocks. Record reads, writes, conditions, performs." },
                { n: "ii.",  t: "Classify", d: "Apply weakly-supervised labels — balance check, KYC screen, late fee — based on variables, conditions, and copybooks." },
                { n: "iii.", t: "Interpret", d: "Generate an intent card: the what, the why, the regulatory anchor — with a confidence the analyst can trust or override." },
              ].map((s) => (
                <li key={s.t} className="border-t border-ink pt-5">
                  <span className="eyebrow">{s.n}</span>
                  <h3 className="font-display text-2xl mt-2">{s.t}</h3>
                  <p className="text-sm text-ink-2 mt-3 leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}

function SectionHeading({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-ink pb-3">
      <div>
        <p className="eyebrow">{number}</p>
        <h2 className="font-display mt-1 text-3xl md:text-4xl leading-none">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="hidden sm:block text-sm text-ink-3 italic font-display">
          {subtitle}
        </p>
      )}
    </div>
  );
}
