"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconOverview, IconBlocks, IconRegulations, IconChat } from "./icons";

const NAV = [
  { href: "/", label: "Overview", Icon: IconOverview },
  { href: "/blocks", label: "Logic Blocks", Icon: IconBlocks },
  { href: "/search", label: "Regulations", Icon: IconRegulations },
  { href: "/chat", label: "Chat", Icon: IconChat },
];

export function SiteNav() {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 text-sm md:flex">
      {NAV.map(({ href, label, Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`group inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
              active ? "bg-paper-2 text-ink" : "text-ink-2 hover:bg-paper-2/70 hover:text-ink"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] ${
                active ? "text-accent" : "text-ink-4 group-hover:text-ink-2"
              }`}
            />
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
