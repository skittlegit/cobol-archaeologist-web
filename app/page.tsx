import { api, Stats } from "@/lib/api";
import Link from "next/link";

const LABEL_COLORS: Record<string, string> = {
  balance_check: "bg-blue-100 text-blue-800",
  late_fee: "bg-orange-100 text-orange-800",
  kyc_screening: "bg-purple-100 text-purple-800",
  interest_calculation: "bg-green-100 text-green-800",
  loan_eligibility: "bg-yellow-100 text-yellow-800",
  transaction_validation: "bg-red-100 text-red-800",
  fraud_check: "bg-rose-100 text-rose-800",
  payroll: "bg-teal-100 text-teal-800",
  unlabeled: "bg-zinc-100 text-zinc-600",
};

function labelColor(l: string) {
  return LABEL_COLORS[l] ?? "bg-zinc-100 text-zinc-600";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Business intent recovered from real-world COBOL banking programs.
        </p>
      </div>

      {!stats && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          Could not connect to the API. Make sure the Python backend is running on{" "}
          <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}</code>.
        </div>
      )}

      {stats && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Logic Blocks", value: stats.total_blocks.toLocaleString() },
              { label: "Intent Cards", value: stats.total_cards.toLocaleString() },
              {
                label: "Labeled Blocks",
                value: Object.entries(stats.label_distribution)
                  .filter(([k]) => k !== "unlabeled")
                  .reduce((s, [, v]) => s + v, 0)
                  .toLocaleString(),
              },
              { label: "Distinct Labels", value: Object.keys(stats.label_distribution).length },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{kpi.label}</p>
                <p className="mt-1 text-3xl font-bold">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Labels + top files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-4">Label Distribution</h2>
              <ul className="space-y-2">
                {Object.entries(stats.label_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([label, count]) => (
                    <li key={label} className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${labelColor(label)}`}>
                        {label}
                      </span>
                      <div className="flex-1 mx-2 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-400 dark:bg-zinc-500 rounded-full"
                          style={{ width: `${(count / stats.total_blocks) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm tabular-nums text-zinc-500">{count}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-4">Top COBOL Files</h2>
              <ul className="space-y-2">
                {stats.top_files.map((f) => (
                  <li key={f.file} className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs truncate text-zinc-700 dark:text-zinc-300 max-w-[200px]">{f.file}</span>
                    <span className="text-sm tabular-nums text-zinc-500">{f.count} blocks</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex gap-4">
            <Link
              href="/blocks"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
            >
              Browse Blocks →
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Search Regulations →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
