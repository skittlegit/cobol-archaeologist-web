"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const NAV = [
  { href: "/chat", label: "Chat" },
  { href: "/cards", label: "Intent Cards" },
  { href: "/analyse", label: "Analyse" },
  { href: "/regulations", label: "Regulations" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [model, setModel] = useState<{ name: string | null; loaded: boolean | null }>(
    { name: null, loaded: null },
  );

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
            name: m.path ?? m.model_path ?? "unknown",
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
  const status = checking ? "CONNECTING" : connected ? "ONLINE" : "OFFLINE";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/95">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-5 lg:px-8">
          <Link
            href="/"
            title="Overview"
            className="shrink-0 font-display text-[15px] tracking-tight"
          >
            COBOL·Archaeologist
          </Link>

          <nav className="hidden flex-1 items-center gap-8 md:flex">
            {NAV.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`border-b-2 pb-0.5 text-sm transition-colors ${
                    active
                      ? "border-fg text-fg"
                      : "border-transparent text-fg-muted hover:text-fg"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-2 text-[12px] text-fg-muted sm:flex">
            <span
              className="inline-block h-2 w-2"
              style={{
                background: checking
                  ? "var(--ink-3)"
                  : connected
                    ? "var(--ok)"
                    : "var(--bad)",
              }}
            />
            <span>{status === "ONLINE" ? "Connected" : status === "OFFLINE" ? "Offline" : "Connecting"}</span>
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="link ml-auto text-sm text-fg md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {open && (
          <nav className="border-t border-rule md:hidden">
            <div className="mx-auto max-w-6xl px-5">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-rule py-3 text-sm ${
                    isActive(n.href) ? "text-fg" : "text-fg-muted"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <p className="py-3 text-[12px] text-fg-muted">
                {status === "ONLINE"
                  ? "● Connected"
                  : status === "OFFLINE"
                    ? "● Offline"
                    : "● Connecting"}
              </p>
            </div>
          </nav>
        )}
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
