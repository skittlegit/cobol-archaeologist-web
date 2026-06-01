"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Stats } from "@/lib/api";

/* TEAM — fill in real details when ready. */
const TEAM: { name: string; role: string }[] = [
  { name: "Team Member 1", role: "role — tba" },
  { name: "Team Member 2", role: "role — tba" },
  { name: "Team Member 3", role: "role — tba" },
  { name: "Team Member 4", role: "role — tba" },
  { name: "Team Member 5", role: "role — tba" },
];

const ENTRIES = [
  ["/chat", "Chat", "Ask the model to read and explain any COBOL in plain language."],
  ["/cards", "Intent Cards", "Browse recovered business intent for every logic block in the corpus."],
  ["/analyse", "Analyse", "Paste a paragraph and generate an intent card on the spot."],
  ["/regulations", "Regulations", "Search the primary regulation the code was written to obey."],
];

const PIPELINE = [
  ["01", "Excavate", "Parse programs; cut paragraphs into self-contained logic blocks — reads, writes, conditions, PERFORM calls."],
  ["02", "Classify", "Weak-supervision labels per block: balance check, KYC screen, late fee — from variables and copybooks."],
  ["03", "Interpret", "A local model writes the intent card: what it does, why it exists, a confidence to trust or override."],
  ["04", "Anchor", "Cross-reference recovered intent against primary regulation via semantic search."],
];

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let off = false;
    api.stats().then((s) => !off && setStats(s)).catch(() => {});
    return () => {
      off = true;
    };
  }, []);

  const figures: [string, string][] = [
    ["logic blocks", stats ? stats.total_blocks.toLocaleString() : "—"],
    ["intent cards", stats ? stats.total_cards.toLocaleString() : "—"],
    [
      "distinct labels",
      stats ? String(Object.keys(stats.label_distribution).length) : "—",
    ],
    [
      "source files",
      stats?.top_files?.length ? `${stats.top_files.length}+` : "—",
    ],
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-10">
        <div className="rise space-y-24">
          {/* hero */}
          <section className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="eyebrow">An archival research interface</p>
              <h1 className="font-display mt-6 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.12]">
                The business intent hidden in legacy code.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-fg-muted">
                COBOL Archaeologist excavates fifty-year-old banking programs
                and recovers the rules they encode — balance checks, fee
                schedules, KYC screens — and links each one back to the
                regulation it once obeyed.
              </p>
              <Link
                href="/chat"
                className="mt-9 inline-block border border-fg px-5 py-3 text-sm invert-hover"
              >
                Open the chat →
              </Link>
            </div>
            <aside className="space-y-6 border-t border-rule pt-6 text-sm text-fg-muted lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div>
                <p className="eyebrow mb-2">Method</p>
                <p className="leading-relaxed">
                  Static parsing → weak labelling → model-assisted intent
                  inference → regulation anchoring.
                </p>
              </div>
              <div>
                <p className="eyebrow mb-2">Caution</p>
                <p className="leading-relaxed">
                  Inferred intent is a hypothesis, not a specification. Verify
                  against source and regulation.
                </p>
              </div>
            </aside>
          </section>

          {/* figures */}
          <section>
            <p className="eyebrow mb-8">The corpus</p>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {figures.map(([k, v]) => (
                <div key={k}>
                  <p className="font-display num text-4xl lg:text-5xl">{v}</p>
                  <p className="mt-2 text-[13px] text-fg-muted">{k}</p>
                </div>
              ))}
            </div>
          </section>

          {/* where to begin */}
          <section>
            <p className="eyebrow mb-8">Where to begin</p>
            <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
              {ENTRIES.map(([href, t, d]) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col bg-paper p-8 transition-colors hover:bg-surface-2"
                >
                  <span className="font-display text-2xl">{t}</span>
                  <span className="mt-3 flex-1 text-[14px] leading-relaxed text-fg-muted">
                    {d}
                  </span>
                  <span className="mt-6 text-sm text-fg-faint transition-transform group-hover:translate-x-1 group-hover:text-fg">
                    Enter →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* how it works */}
          <section>
            <p className="eyebrow mb-8">How a block becomes an intent card</p>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {PIPELINE.map(([n, t, d]) => (
                <div key={n} className="border-t-2 border-fg pt-5">
                  <p className="eyebrow">{n}</p>
                  <p className="font-display mt-3 text-xl">{t}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
                    {d}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* team */}
          <section>
            <p className="eyebrow mb-8">The team — five people</p>
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map((m, i) => (
                <div
                  key={m.name}
                  className="flex items-baseline gap-4 border-t border-rule pt-4"
                >
                  <span className="num text-[13px] text-fg-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-lg">{m.name}</p>
                    <p className="mt-0.5 text-[13px] text-fg-muted">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* footer */}
          <footer className="border-t border-fg pt-8 text-[13px] text-fg-faint">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span>COBOL Archaeologist — legacy intent · banking</span>
              <span>Next.js · FastAPI · local model · vector search</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
