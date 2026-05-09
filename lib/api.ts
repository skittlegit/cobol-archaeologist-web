/**
 * Typed API client — reads NEXT_PUBLIC_API_URL at runtime.
 * Falls back to http://localhost:8000 for local development.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---- shared types -------------------------------------------------------

export interface LogicBlock {
  id: string;
  source_file: string;
  paragraph: string;
  code: string;
  start_line: number;
  end_line: number;
  vars_read: string[];
  vars_written: string[];
  conditions: string[];
  perform_calls: string[];
  file_refs: string[];
  copybooks: string[];
  weak_label: string | null;
  weak_label_confidence: number;
  tags: string[];
}

export interface Confidence {
  level: "High" | "Medium" | "Low";
  justification: string;
}

export interface BusinessIntentCard {
  logic_block_id: string | null;
  what: string;
  why: string;
  code_evidence: string[];
  regulation_link: string | null;
  regulation_sources: string[];
  confidence: Confidence;
}

export interface PagedBlocks {
  total: number;
  page: number;
  size: number;
  items: LogicBlock[];
}

export interface PagedCards {
  total: number;
  page: number;
  size: number;
  items: BusinessIntentCard[];
}

export interface Stats {
  total_blocks: number;
  total_cards: number;
  label_distribution: Record<string, number>;
  top_files: { file: string; count: number }[];
}

export interface RegSearchHit {
  chunk_id: string;
  source: string;
  section: string | null;
  page: number | null;
  text: string;
  score: number;
}

// ---- helpers -------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    // Disable Next.js caching for API calls so data is always fresh
    cache: "no-store",
    // 15 s timeout — handles Render free-tier cold starts gracefully
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---- endpoints -----------------------------------------------------------

export const api = {
  stats: () => apiFetch<Stats>("/stats"),

  blocks: (params: {
    page?: number;
    size?: number;
    label?: string;
    q?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params.page) sp.set("page", String(params.page));
    if (params.size) sp.set("size", String(params.size));
    if (params.label) sp.set("label", params.label);
    if (params.q) sp.set("q", params.q);
    return apiFetch<PagedBlocks>(`/blocks?${sp}`);
  },

  block: (id: string) => apiFetch<LogicBlock>(`/blocks/${encodeURIComponent(id)}`),

  card: (blockId: string) =>
    apiFetch<BusinessIntentCard>(`/cards/${encodeURIComponent(blockId)}`),

  infer: (blockId: string, backend = "ollama") =>
    apiFetch<BusinessIntentCard>(`/infer/${encodeURIComponent(blockId)}`, {
      method: "POST",
      body: JSON.stringify({ backend }),
    }),

  searchRegulations: (q: string, k = 5) =>
    apiFetch<RegSearchHit[]>(
      `/regulations/search?${new URLSearchParams({ q, k: String(k) })}`
    ),
};
