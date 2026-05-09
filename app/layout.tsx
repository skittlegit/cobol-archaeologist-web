import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "COBOL Archaeologist — Business intent recovered from legacy banking code",
  description:
    "An archival interface for exploring undocumented COBOL programs: logic blocks, inferred business intent, and the regulations they encode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-rule bg-paper/85 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
            <Link href="/" className="group flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-sm border border-rule-strong bg-card text-accent font-display text-lg leading-none transition-transform group-hover:-rotate-6"
              >
                ¶
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-[15px] font-medium">
                  COBOL Archaeologist
                </span>
                <span className="eyebrow mt-1 text-[10px]">Field Notebook · 1959→</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm">
              {[
                { href: "/", label: "Overview", n: "01" },
                { href: "/blocks", label: "Logic Blocks", n: "02" },
                { href: "/search", label: "Regulations", n: "03" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-baseline gap-2 rounded-md px-3 py-2 text-ink-2 hover:text-ink transition-colors"
                >
                  <span className="eyebrow text-[10px] text-ink-4 group-hover:text-accent transition-colors">
                    {l.n}
                  </span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2 text-xs text-ink-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
              </span>
              <span className="num">API connected</span>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 lg:py-16">
            {children}
          </div>
        </main>

        <footer className="mt-24 border-t border-rule bg-paper-2/60">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 grid gap-8 md:grid-cols-3 text-sm">
            <div>
              <p className="eyebrow mb-3">Colophon</p>
              <p className="text-ink-2 leading-relaxed">
                Set in <span className="font-display italic">Fraunces</span>,
                IBM Plex Sans, and IBM Plex Mono. An archival reading-room for
                programs nobody remembers writing.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-3">Sections</p>
              <ul className="space-y-1.5">
                <li><Link className="link text-ink-2 hover:text-ink" href="/">Overview</Link></li>
                <li><Link className="link text-ink-2 hover:text-ink" href="/blocks">Logic Blocks</Link></li>
                <li><Link className="link text-ink-2 hover:text-ink" href="/search">Regulation Search</Link></li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-3">Caveat lector</p>
              <p className="text-ink-3 leading-relaxed">
                Inferred intent is a hypothesis, not a specification. Always
                cross-check against source code and primary regulation.
              </p>
            </div>
          </div>
          <div className="border-t border-rule">
            <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-4">
              <span>© {new Date().getFullYear()} COBOL Archaeologist</span>
              <span className="font-mono">v0.1 · built for legacy systems</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
