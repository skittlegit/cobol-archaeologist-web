import { api, BusinessIntentCard, LogicBlock } from "@/lib/api";
import Link from "next/link";
import InferButton from "./InferButton";

interface Props {
  params: Promise<{ id: string }>;
}

const CONFIDENCE_COLORS = {
  High: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-red-100 text-red-800",
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
      <div className="space-y-4">
        <Link href="/blocks" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">← Back to blocks</Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{blockError}</div>
      </div>
    );
  }

  if (!block) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/blocks" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">← Back to blocks</Link>
          <h1 className="mt-2 text-2xl font-bold font-mono">{block.paragraph}</h1>
          <p className="text-zinc-500 text-sm mt-1 font-mono">
            {block.source_file.split(/[/\\]/).slice(-2).join("/")} · lines {block.start_line}–{block.end_line}
          </p>
        </div>
        {block.weak_label && (
          <span className="mt-8 shrink-0 rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium">
            {block.weak_label}
          </span>
        )}
      </div>

      {/* COBOL Code */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
          COBOL Source
        </div>
        <pre className="p-4 text-xs font-mono overflow-x-auto text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
          {block.code}
        </pre>
      </div>

      {/* Static Analysis */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Variables Read", items: block.vars_read },
          { label: "Variables Written", items: block.vars_written },
          { label: "Conditions", items: block.conditions },
          { label: "PERFORM Calls", items: block.perform_calls },
          { label: "File References", items: block.file_refs },
          { label: "Copybooks", items: block.copybooks },
        ]
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <div key={section.label} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">{section.label}</p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item} className="font-mono text-xs text-zinc-700 dark:text-zinc-300 truncate">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {/* Business Intent Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Business Intent Card</span>
          <InferButton blockId={blockId} />
        </div>

        {cardError && !card && (
          <div className="p-4 text-zinc-500 text-sm">{cardError} Use the button above to generate one.</div>
        )}

        {card && (
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">What</p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{card.what}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Why</p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{card.why}</p>
              </div>
            </div>

            {card.code_evidence.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Code Evidence</p>
                <div className="flex flex-wrap gap-2">
                  {card.code_evidence.map((e) => (
                    <code key={e} className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-700 dark:text-zinc-300">{e}</code>
                  ))}
                </div>
              </div>
            )}

            {(card.regulation_link || card.regulation_sources.length > 0) && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Regulation</p>
                {card.regulation_link && (
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-1">{card.regulation_link}</p>
                )}
                {card.regulation_sources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {card.regulation_sources.map((s) => (
                      <span key={s} className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CONFIDENCE_COLORS[card.confidence.level]}`}>
                {card.confidence.level} confidence
              </span>
              {card.confidence.justification && (
                <span className="text-xs text-zinc-500">{card.confidence.justification}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
