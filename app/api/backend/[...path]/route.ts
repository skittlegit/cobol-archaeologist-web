/**
 * Catch-all proxy route — forwards all /api/backend/* requests to the
 * local Python API backend. Client components call this instead of the API
 * directly, which avoids CORS issues and NEXT_PUBLIC env-var baking.
 */
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Infer/analyse endpoints can take minutes on local hardware — use a long timeout
const INFER_TIMEOUT_MS = 200_000;
const DEFAULT_TIMEOUT_MS = 20_000;

async function proxy(
  req: NextRequest,
  params: { path: string[] },
  method: string,
  body?: BodyInit
) {
  const path = params.path.join("/");
  const search = req.nextUrl.search;
  const url = `${API_BASE}/${path}${search}`;
  const isLongRunning = path.startsWith("infer/") || path === "analyse";
  const timeoutMs = isLongRunning ? INFER_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isTimeout = msg.includes("TimeoutError") || msg.includes("timed out") || (e as {name?: string}).name === "TimeoutError";
    return NextResponse.json(
      { detail: isTimeout ? `Request timed out after ${timeoutMs / 1000}s — Ollama may still be running` : `Upstream error: ${msg}` },
      { status: 504 },
    );
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolved = await params;
  return proxy(req, resolved, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolved = await params;
  const body = await req.text();
  return proxy(req, resolved, "POST", body);
}
