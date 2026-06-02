import { api, Stats } from "@/lib/api";
import Link from "next/link";
import {
  IconArrow,
  IconBlocks,
  IconChat,
  IconDoc,
  IconLayers,
  IconScale,
  IconSpark,
} from "./_components/icons";

const LABEL_META: Record<string, { hue: string; gloss: string }> = {
  balance_check:          { hue: "#1f3a52", gloss: "Verifies funds before debit." },
  late_fee:               { hue: "#8a5a00", gloss: "Penalises overdue obligations." },
  kyc_screening:          { hue: "#5a2a4d", gloss: "Identifies the customer." },
  interest_calculation:   { hue: "#1f4d3a", gloss: "Accrues time-value of money." },
  loan_eligibility:       { hue: "#6b4f00", gloss: "Decides who may borrow." },
  transaction_validation: { hue: "#7a1d1d", gloss: "Guards the ledger from bad input." },
  fraud_check:            { hue: "#b8593e", gloss: "Flags unusual behaviour." },
  payroll:                { hue: "#1f5d5a", gloss: "Pays the people." },
  unlabeled:              { hue: "#a39b8e", gloss: "Awaiting classification." },
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
    <div className="rise space-y-20">
      {/* ----- Hero ----- */}
      <section className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="chip chip-accent">
            <IconSpark className="h-3.5 w-3.5" />
            Business intent, recovered from legacy code
          </span>

          <h1 className="font-display mt-6 text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.02] tracking-[-0.02em]">
            Read the logic buried in{" "}
            <span className="text-accent">fifty-year-old</span> banking code.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            COBOL Archaeologist parses undocumented programs, recovers what each
            routine actually does, and links it back to the regulation it was
            built to obey — with the evidence to prove it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/chat" className="btn btn-accent btn-lg group">
              <IconChat className="h-[18px] w-[18px]" />
              Start a conversation
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/blocks" className="btn btn-secondary btn-lg">
              <IconBlocks className="h-[18px] w-[18px]" />
              Browse the catalogue
            </Link>
          </div>
        </div>

        {/* product preview */}
        <div className="lg:col-span-5">
          <HeroPreview />
        </div>
      </section>

      {!stats && (
        <section className="card p-6">
          <p className="eyebrow text-[var(--bad)] mb-2">Connection error</p>
          <p className="text-sm text-ink-2">
            Could not reach the API. Make sure the Python backend is running on{" "}
            <code className="font-mono px-1.5 py-0.5 rounded bg-paper-2 border border-rule">
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
            <SectionHeading icon={<IconSpark className="h-5 w-5" />} number="The corpus" title="In figures" />
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Logic Blocks",    value: stats.total_blocks, hint: "extracted paragraphs" },
                { label: "Intent Cards",    value: stats.total_cards,  hint: "what · why · evidence" },
                {
                  label: "Labelled Blocks",
                  value: Object.entries(stats.label_distribution).filter(([k]) => k !== "unlabeled").reduce((s, [, v]) => s + v, 0),
                  hint: "weak supervision",
                },
                { label: "Distinct Labels", value: Object.keys(stats.label_distribution).length, hint: "business categories" },
              ].map((kpi) => (
                <div key={kpi.label} className="card card-hover p-6">
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
          <section className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading icon={<IconLayers className="h-5 w-5" />} number="Distribution by intent" title="Across all blocks" />
              <div className="card mt-8 p-6">
                <ul className="divide-y divide-rule">
                  {Object.entries(stats.label_distribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([label, count], i) => {
                      const pct = (count / stats.total_blocks) * 100;
                      const m = meta(label);
                      return (
                        <li key={label} className={`group grid grid-cols-12 items-center gap-4 py-4 ${i === 0 ? "pt-0" : ""}`}>
                          <span className="col-span-1 eyebrow num text-ink-4">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="col-span-5 sm:col-span-4">
                            <p className="font-display text-lg leading-none">
                              {label.replace(/_/g, " ")}
                            </p>
                            <p className="mt-1 text-xs text-ink-3 hidden sm:block">{m.gloss}</p>
                          </div>
                          <div className="col-span-4 sm:col-span-5 h-2 rounded-full bg-paper-2 relative overflow-hidden">
                            <span
                              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
                              style={{ width: `${pct}%`, background: m.hue }}
                            />
                          </div>
                          <span className="col-span-2 text-right num text-sm">
                            <span className="font-medium">{count.toLocaleString()}</span>
                            <span className="text-ink-4 ml-2 text-xs">{pct.toFixed(1)}%</span>
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5">
              <SectionHeading icon={<IconDoc className="h-5 w-5" />} number="Top files" title="By block density" />
              <div className="card mt-8 p-4">
                <ol className="divide-y divide-rule">
                  {stats.top_files.map((f, i) => (
                    <li
                      key={f.file}
                      className="group flex items-baseline gap-4 px-2 py-3"
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
            </div>
          </section>

          {/* ----- Method ----- */}
          <section>
            <SectionHeading icon={<IconScale className="h-5 w-5" />} number="The method" title="How a block becomes an intent card" />
            <ol className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                { Icon: IconLayers, n: "01", t: "Excavate", d: "Parse the program. Cut paragraphs into self-contained logic blocks. Record reads, writes, conditions, performs." },
                { Icon: IconSpark,  n: "02", t: "Classify", d: "Apply weakly-supervised labels — balance check, KYC screen, late fee — based on variables, conditions, and copybooks." },
                { Icon: IconDoc,    n: "03", t: "Interpret", d: "Generate an intent card: the what, the why, the regulatory anchor — with a confidence the analyst can trust or override." },
              ].map((s) => (
                <li key={s.t} className="card card-hover p-6">
                  <div className="flex items-center justify-between">
                    <span className="icon-tile"><s.Icon className="h-5 w-5" /></span>
                    <span className="eyebrow num text-ink-4">{s.n}</span>
                  </div>
                  <h3 className="font-display text-2xl mt-5">{s.t}</h3>
                  <p className="text-sm text-ink-2 mt-2.5 leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="card overflow-hidden shadow-[0_1px_2px_rgba(26,24,22,0.05),0_28px_56px_-28px_rgba(26,24,22,0.35)]">
      <div className="flex items-center gap-2 border-b border-rule bg-paper-2/50 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-[var(--bad)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--warn)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
        <span className="ml-2 font-mono text-[11px] text-ink-3">ACCTVAL.cbl · 1000-VALIDATE</span>
      </div>
      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Inferred intent</p>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ background: "var(--ok-soft)", color: "var(--ok)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ok)" }} />
            High confidence
          </span>
        </div>
        <p className="font-display text-2xl leading-snug">
          Rejects a debit that would overdraw the account.
        </p>
        <p className="text-sm leading-relaxed text-ink-2">
          Guards the ledger against insufficient-funds withdrawals before posting
          a debit.
        </p>
        <div className="rounded-lg border-l-2 border-accent bg-paper-2/60 px-3 py-2 font-mono text-[12px] text-ink-2">
          IF WS-ACCT-BALANCE &lt; WS-WITHDRAW-AMT
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-rule pt-4">
          <span className="chip chip-accent">RBI · §4.2</span>
          <span className="chip">balance check</span>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  number,
  title,
}: {
  icon?: React.ReactNode;
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-rule-strong pb-3">
      {icon && <span className="icon-tile h-9 w-9">{icon}</span>}
      <div>
        <p className="eyebrow">{number}</p>
        <h2 className="font-display text-2xl md:text-3xl leading-none mt-0.5">{title}</h2>
      </div>
    </div>
  );
}
