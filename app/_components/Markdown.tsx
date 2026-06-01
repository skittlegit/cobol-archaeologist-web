"use client";

import React, { useState } from "react";

/* ============================================================
   Lightweight, dependency-free Markdown renderer.
   Renders to React elements (no HTML injection) so it is XSS-safe.
   Supports: headings, bold/italic/strike, inline code, links,
   fenced code blocks, blockquotes, ordered/unordered (nested)
   lists, GFM tables, horizontal rules.
   ============================================================ */

let k = 0;
const key = () => k++;

/* ---------- inline ---------- */

function inline(text: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let rest = text;

  while (rest.length) {
    let best: { idx: number; len: number; node: React.ReactNode } | null = null;
    const take = (
      m: RegExpExecArray | null,
      make: (m: RegExpExecArray) => React.ReactNode,
    ) => {
      if (!m) return;
      if (!best || m.index < best.idx)
        best = { idx: m.index, len: m[0].length, node: make(m) };
    };

    take(/`([^`]+)`/.exec(rest), (m) => (
      <code
        key={key()}
        className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]"
      >
        {m[1]}
      </code>
    ));
    take(/\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest), (m) => (
      <a
        key={key()}
        href={m[2]}
        target="_blank"
        rel="noreferrer"
        className="text-accent underline underline-offset-2 hover:opacity-80"
      >
        {inline(m[1])}
      </a>
    ));
    take(/\*\*([\s\S]+?)\*\*/.exec(rest), (m) => (
      <strong key={key()} className="font-semibold">
        {inline(m[1])}
      </strong>
    ));
    take(/~~([\s\S]+?)~~/.exec(rest), (m) => (
      <span key={key()} className="line-through opacity-70">
        {inline(m[1])}
      </span>
    ));
    take(/\*([^*\n]+?)\*/.exec(rest), (m) => (
      <em key={key()}>{inline(m[1])}</em>
    ));

    if (!best) {
      out.push(rest);
      break;
    }
    const b: { idx: number; len: number; node: React.ReactNode } = best;
    if (b.idx > 0) out.push(rest.slice(0, b.idx));
    out.push(b.node);
    rest = rest.slice(b.idx + b.len);
  }
  return out;
}

/* ---------- code block ---------- */

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-3.5 overflow-hidden rounded-xl border border-border bg-surface-2">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code).then(
              () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              },
              () => {},
            );
          }}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-fg-muted transition-colors hover:bg-bg hover:text-fg"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

/* ---------- table ---------- */

function splitRow(row: string): string[] {
  return row
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

function Table({ rows }: { rows: string[] }) {
  const header = splitRow(rows[0]);
  const body = rows.slice(2).map(splitRow);
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {header.map((c, i) => (
              <th
                key={i}
                className="border border-border bg-surface-2 px-3 py-2 text-left font-semibold"
              >
                {inline(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci} className="border border-border px-3 py-2 align-top">
                  {inline(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- list ---------- */

function List({ lines }: { lines: string[] }) {
  const base = lines.reduce(
    (min, l) => Math.min(min, /^(\s*)/.exec(l)![1].length),
    Infinity,
  );
  const ordered = new RegExp(`^\\s{${base}}\\d+[.)]\\s+`).test(lines[0]);
  const itemRe = new RegExp(`^\\s{${base}}([-*+]|\\d+[.)])\\s+`);

  const items: { text: string; sub: string[] }[] = [];
  for (const raw of lines) {
    if (itemRe.test(raw)) {
      items.push({ text: raw.replace(itemRe, ""), sub: [] });
    } else if (items.length) {
      items[items.length - 1].sub.push(raw.slice(base + 2));
    }
  }

  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`my-2.5 space-y-1.5 pl-5 ${
        ordered ? "list-decimal" : "list-disc"
      } marker:text-fg-faint`}
    >
      {items.map((it, i) => (
        <li key={i} className="pl-1 text-[15px] leading-relaxed">
          {inline(it.text)}
          {it.sub.length > 0 && <Blocks src={it.sub.join("\n")} />}
        </li>
      ))}
    </Tag>
  );
}

/* ---------- block parser ---------- */

function Blocks({ src }: { src: string }) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  const heads = [
    "font-display text-[1.5rem] mt-6 mb-2.5 leading-tight",
    "font-display text-[1.25rem] mt-5 mb-2 leading-tight",
    "font-display text-[1.05rem] mt-4 mb-1.5",
    "text-[0.9rem] font-semibold mt-3 mb-1.5",
    "text-[0.8rem] font-semibold uppercase tracking-wide text-fg-muted mt-3 mb-1",
    "text-[0.8rem] font-semibold uppercase tracking-wide text-fg-faint mt-3 mb-1",
  ];

  while (i < lines.length) {
    const line = lines[i];

    const fence = /^```(.*)$/.exec(line.trim());
    if (fence) {
      const lang = fence[1].trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(<CodeBlock key={key()} code={buf.join("\n")} lang={lang} />);
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = h[1].length;
      const Tag = `h${Math.min(lvl, 4)}` as "h1" | "h2" | "h3" | "h4";
      nodes.push(
        <Tag key={key()} className={heads[lvl - 1]}>
          {inline(h[2])}
        </Tag>,
      );
      i++;
      continue;
    }

    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      nodes.push(<hr key={key()} className="my-5 border-border" />);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      nodes.push(
        <blockquote
          key={key()}
          className="my-3 border-l-[3px] border-accent/40 pl-4 text-fg-muted"
        >
          <Blocks src={buf.join("\n")} />
        </blockquote>,
      );
      continue;
    }

    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(lines[i + 1])
    ) {
      const tbl: string[] = [];
      while (
        i < lines.length &&
        lines[i].includes("|") &&
        lines[i].trim() !== ""
      ) {
        tbl.push(lines[i]);
        i++;
      }
      nodes.push(<Table key={key()} rows={tbl} />);
      continue;
    }

    if (/^(\s*)([-*+]|\d+[.)])\s+/.test(line)) {
      const buf: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        (/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))
      ) {
        buf.push(lines[i]);
        i++;
      }
      nodes.push(<List key={key()} lines={buf} />);
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^```/.test(lines[i].trim()) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i]) &&
      !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    nodes.push(
      <p key={key()} className="my-2.5 text-[15px] leading-relaxed">
        {para.map((l, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <br />}
            {inline(l)}
          </React.Fragment>
        ))}
      </p>,
    );
  }

  return <>{nodes}</>;
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <Blocks src={content} />
    </div>
  );
}
