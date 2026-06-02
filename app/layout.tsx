import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SiteNav } from "./_components/SiteNav";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-rule bg-paper/85 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
            <Link href="/" className="group">
              <span className="font-display text-[1.4rem] font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
                COBOL Archaeologist
              </span>
            </Link>

            <SiteNav />

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
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 grid gap-10 md:grid-cols-12 text-sm">
            <div className="md:col-span-5">
              <p className="font-display text-2xl leading-tight">
                Recovering the rules <em>encoded</em> in fifty years of banking software.
              </p>
              <p className="mt-4 text-ink-3 text-[13px] leading-relaxed max-w-md">
                A research interface that treats undocumented COBOL programs
                as primary sources — extracting logic, inferring intent, and
                citing the regulations that shaped each decision.
              </p>
            </div>
            <div className="md:col-span-3">
              <p className="eyebrow mb-3">Sections</p>
              <ul className="space-y-1.5">
                <li><Link className="link text-ink-2 hover:text-ink" href="/">Overview</Link></li>
                <li><Link className="link text-ink-2 hover:text-ink" href="/blocks">Logic Blocks</Link></li>
                <li><Link className="link text-ink-2 hover:text-ink" href="/search">Regulation Search</Link></li>
                <li><Link className="link text-ink-2 hover:text-ink" href="/chat">Chat</Link></li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <p className="eyebrow mb-3">Methodology</p>
              <p className="text-ink-3 leading-relaxed text-[13px]">
                Static parse → weak supervision → LLM-assisted intent inference.
                Inferred intent is a hypothesis, not a specification. Always
                verify against source code and primary regulation.
              </p>
            </div>
          </div>
          <div className="border-t border-rule">
            <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-ink-4">
              <span className="num">© {new Date().getFullYear()} COBOL Archaeologist · All rights reserved</span>
              <span className="font-mono">v0.1 · for legacy systems research</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
