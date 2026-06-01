"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { Markdown } from "../_components/Markdown";

type Role = "user" | "assistant";
interface Message {
  id: number;
  role: Role;
  text: string;
}

const EXAMPLES = [
  "explain what a COBOL paragraph does in plain English",
  "what business rules might a late-fee routine encode?",
  "summarise the risks of an undocumented banking system",
  "what is a COMMAREA and why does it matter?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const empty = messages.length === 0 && !sending;

  const send = useCallback(
    async (text?: string) => {
      const prompt = (text ?? input).trim();
      if (!prompt || sending) return;
      setMessages((m) => [...m, { id: ++idRef.current, role: "user", text: prompt }]);
      setInput("");
      setSending(true);
      try {
        const data = await api.prompt(prompt, 512);
        setMessages((m) => [
          ...m,
          { id: ++idRef.current, role: "assistant", text: data.response || "(empty response)" },
        ]);
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            id: ++idRef.current,
            role: "assistant",
            text:
              "Could not reach the model — " +
              (err instanceof Error ? err.message : "unknown error") +
              `. Is the backend running at \`${API_URL}\`?`,
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [input, sending],
  );

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="rise space-y-12">
      {/* Header */}
      <header className="grid items-end gap-6 border-b border-ink pb-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow">§ 04 · The conversation</p>
          <h1 className="font-display mt-2 text-5xl leading-none md:text-6xl">Chat</h1>
          <p className="mt-4 max-w-xl text-ink-2">
            A direct line to a locally-hosted model that reads{" "}
            <em className="font-display">fifty-year-old banking COBOL</em> —
            explaining paragraphs and surfacing the rules they encode, in plain
            English.
          </p>
        </div>
        <div className="space-y-1 lg:col-span-4 lg:text-right">
          <p className="eyebrow">Model</p>
          <p className="font-display text-2xl">Local · GGUF</p>
          <p className="num text-xs text-ink-3">on-prem inference</p>
        </div>
      </header>

      {/* Conversation */}
      {empty ? (
        <section className="space-y-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { t: "Explain legacy code", d: "Turn dense COBOL paragraphs into clear, plain-language summaries." },
              { t: "Recover business intent", d: "Surface the rules — balance checks, fees, KYC — hidden in the logic." },
              { t: "Draft documentation", d: "Generate readable notes, with formatted code and structured sections." },
            ].map((c) => (
              <div key={c.t} className="border-t border-ink pt-4">
                <p className="font-display text-xl">{c.t}</p>
                <p className="mt-2 leading-relaxed text-ink-2">{c.d}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="eyebrow mr-1">Try</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => send(ex)}
                className="rounded-full border border-rule-strong px-3 py-1 font-display italic text-ink-2 transition-colors hover:border-ink hover:text-ink"
              >
                {ex}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-8" aria-live="polite">
          {messages.map((m) =>
            m.role === "user" ? (
              <article key={m.id} className="grid gap-4 lg:grid-cols-12">
                <aside className="lg:col-span-3">
                  <p className="eyebrow">You asked</p>
                </aside>
                <div className="lg:col-span-9">
                  <p className="font-display text-2xl leading-snug">{m.text}</p>
                </div>
              </article>
            ) : (
              <article key={m.id} className="grid gap-4 border-t border-rule pt-8 lg:grid-cols-12">
                <aside className="lg:col-span-3">
                  <p className="eyebrow">COBOL Archaeologist</p>
                </aside>
                <div className="lg:col-span-9 text-ink-2">
                  <Markdown content={m.text} />
                </div>
              </article>
            ),
          )}
          {sending && (
            <article className="grid gap-4 border-t border-rule pt-8 lg:grid-cols-12">
              <aside className="lg:col-span-3">
                <p className="eyebrow">COBOL Archaeologist</p>
              </aside>
              <div className="lg:col-span-9">
                <p className="font-display text-xl italic text-ink-3">Reading the code…</p>
              </div>
            </article>
          )}
          <div ref={endRef} />
        </section>
      )}

      {/* Composer */}
      <section className="sticky bottom-6 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex flex-col gap-3 border border-ink/15 bg-card/90 p-3 backdrop-blur-md sm:flex-row sm:items-end"
        >
          <div className="relative flex-1">
            <span className="eyebrow pointer-events-none absolute left-4 top-4">Q.</span>
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask the archive…"
              aria-label="Message"
              className="max-h-[200px] w-full resize-none bg-transparent py-3 pl-12 pr-2 font-display text-lg placeholder:italic placeholder:text-ink-4 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-sm bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent-ink disabled:opacity-40"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-ink-4">
          Enter to send · Shift+Enter for a new line · responses may be inaccurate
        </p>
      </section>
    </div>
  );
}
