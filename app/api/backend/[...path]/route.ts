/**
 * Catch-all proxy route — forwards all /api/backend/* requests to the
 * Python Render backend. Client components call this instead of Render
 * directly, which avoids CORS issues and NEXT_PUBLIC env-var baking.
 */
import { NextRequest, NextResponse } from "next/server";

const RENDER_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function proxy(
  req: NextRequest,
  params: { path: string[] },
  method: string,
  body?: BodyInit
) {
  const path = params.path.join("/");
  const search = req.nextUrl.search;
  const url = `${RENDER_BASE}/${path}${search}`;

  const upstream = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

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
