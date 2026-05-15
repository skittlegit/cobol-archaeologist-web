/**
 * Typed API client — all calls go directly to the local backend.
 * CORS is open on the backend, so the browser can call it straight.
 * Change the single constant below to point elsewhere.
 */

export const API_URL = "http://localhost:8000";

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

export interface PagedCards {
  total: number;
  page: number;
  size: number;
  items: BusinessIntentCard[];
}

export interface PagedBlocks {
  total: number;
  page: number;
  size: number;
  items: LogicBlock[];
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

export interface HealthResp {
  status?: string;
  ok?: boolean;
}

export interface ModelStatusResp {
  path?: string | null;
  model_path?: string | null;
  loaded: boolean;
}

async function j<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = 20000,
): Promise<T> {
  const r = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => r.statusText);
    throw new Error(`API ${path} → ${r.status}: ${t}`);
  }
  return r.json() as Promise<T>;
}

export const api = {
  health: () => j<HealthResp>("/health", undefined, 8000),
  modelStatus: () => j<ModelStatusResp>("/model/status", undefined, 8000),

  stats: () => j<Stats>("/stats"),

  cards: (page = 1, size = 12) =>
    j<PagedCards>(`/cards?page=${page}&size=${size}`),

  card: (blockId: string) =>
    j<BusinessIntentCard>(`/cards/${encodeURIComponent(blockId)}`),

  blocks: (p: { page?: number; size?: number; label?: string; q?: string }) => {
    const sp = new URLSearchParams();
    if (p.page) sp.set("page", String(p.page));
    if (p.size) sp.set("size", String(p.size));
    if (p.label) sp.set("label", p.label);
    if (p.q) sp.set("q", p.q);
    return j<PagedBlocks>(`/blocks?${sp}`);
  },

  block: (id: string) => j<LogicBlock>(`/blocks/${encodeURIComponent(id)}`),

  searchRegulations: (q: string, k = 6) =>
    j<RegSearchHit[]>(
      `/regulations/search?${new URLSearchParams({ q, k: String(k) })}`,
    ),

  prompt: (prompt: string, maxTokens = 512) =>
    j<{ response?: string }>(
      "/prompt",
      { method: "POST", body: JSON.stringify({ prompt, max_tokens: maxTokens }) },
      180000,
    ),
};
