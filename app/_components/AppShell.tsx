"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const NAV = [
  { href: "/", label: "Chat", icon: ChatIcon },
  { href: "/cards", label: "Intent Cards", icon: CardsIcon },
  { href: "/regulations", label: "Regulations", icon: RegIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [model, setModel] = useState<{
    name: string | null;
    loaded: boolean | null;
  }>({ name: null, loaded: null });

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const h = await api.health();
        if (!off) setHealthOk(h.status === "ok" || h.ok === true);
      } catch {
        if (!off) setHealthOk(false);
      }
      try {
        const m = await api.modelStatus();
        if (!off)
          setModel({
            name: m.path ?? m.model_path ?? "unknown model",
            loaded: m.loaded,
          });
      } catch {
        if (!off) setModel({ name: null, loaded: false });
      }
    })();
    return () => {
      off = true;
    };
  }, []);

  const connected = healthOk === true && model.loaded === true;
  const checking = healthOk === null && model.name === null;

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* ---------- sidebar ---------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <span className="accent-grad grid h-9 w-9 place-items-center rounded-xl text-accent-fg shadow-[var(--shadow-sm)]">
            <LogoIcon />
          </span>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold tracking-tight">
              COBOL Archaeologist
            </p>
            <p className="text-[11px] text-fg-faint">Legacy intent · banking</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div
            className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 px-3 py-2.5"
            title={model.name ?? undefined}
          >
            <span className="relative inline-flex h-2 w-2 shrink-0">
              {connected && (
                <span
                  className="pulse absolute inset-0 rounded-full"
                  style={{ background: "var(--ok)" }}
                />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{
                  background: checking
                    ? "var(--fg-faint)"
                    : connected
                      ? "var(--ok)"
                      : "var(--bad)",
                }}
              />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-medium">
                {checking
                  ? "Connecting…"
                  : connected
                    ? "Connected"
                    : "Disconnected"}
              </p>
              <p className="truncate font-mono text-[10px] text-fg-faint">
                {model.name
                  ? model.name.split(/[/\\]/).slice(-1)[0]
                  : "model status unavailable"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* ---------- main ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-fg-muted"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span className="text-sm font-semibold">COBOL Archaeologist</span>
        </div>

        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

/* ---------------- icons ---------------- */

function LogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c4.97 0 9 3.58 9 8 0 4.42-4.03 8-9 8-1.04 0-2.05-.16-2.97-.45L4 21l1.4-3.6C4.52 16.07 3 14.18 3 11c0-4.42 4.03-8 9-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CardsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="4"
        width="18"
        height="7"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="3"
        y="13"
        width="18"
        height="7"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}
function RegIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3h7l5 5v13a0 0 0 0 1 0 0H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5M9 13h6M9 17h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
