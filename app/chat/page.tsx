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
  { t: "Explain a paragraph", q: "Explain what a COBOL paragraph does in plain English." },
  { t: "Recover intent", q: "What business rules might a late-fee routine encode?" },
  { t: "Assess risk", q: "Summarise the risks of running an undocumented banking system." },
  { t: "Learn the jargon", q: "What is a COMMAREA in CICS, and why does it matter?" },
];

function Avatar() {
  return (
    <span
      aria-hidden
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-paper shadow-soft-sm"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 5h12M3.4 8h9.2M4.8 11h6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

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
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
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
    <div className="flex min-h-[60vh] flex-col">
      {/* ---------------- conversation ---------------- */}
      <div className="flex-1">
        {empty ? (
          <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
            <h1 className="font-display text-4xl leading-tight md:text-5xl">
              What would you like to <span className="italic text-accent">understand</span>?
            </h1>
            <p className="mt-4 max-w-md text-ink-2">
              Ask a locally-hosted model about any COBOL paragraph, banking rule,
              or legacy routine.
            </p>

            <div className="mt-9 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.t}
                  onClick={() => send(ex.q)}
                  className="card card-hover group p-4 text-left"
                >
                  <p className="font-display text-lg leading-tight">{ex.t}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3 group-hover:text-ink-2">
                    {ex.q}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-7 pb-6 pt-2" aria-live="polite">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-accent-soft px-4 py-2.5 text-[15px] leading-relaxed text-ink">
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3.5">
                  <Avatar />
                  <div className="min-w-0 flex-1 pt-0.5 text-[15px] text-ink-2">
                    <Markdown content={m.text} />
                  </div>
                </div>
              ),
            )}
            {sending && (
              <div className="flex gap-3.5">
                <Avatar />
                <div className="typing flex items-center gap-1.5 pt-3" aria-label="Thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* ---------------- composer ---------------- */}
      <div className="sticky bottom-0 pt-3">
        <div className="composer-fade pointer-events-none absolute inset-x-0 -top-8 h-8" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2 rounded-[1.6rem] border border-rule-strong bg-card p-2 pl-5 shadow-soft transition-colors focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]"
        >
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message COBOL Archaeologist…"
            aria-label="Message"
            className="max-h-[220px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-relaxed placeholder:text-ink-4 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-paper transition-all hover:bg-accent-ink active:scale-95 disabled:opacity-30 disabled:hover:bg-accent"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M8 13V3M8 3L4 7M8 3l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </form>
        <p className="bg-paper pb-2 pt-2 text-center text-[11px] text-ink-4">
          Enter to send · Shift+Enter for a new line · responses may be inaccurate
        </p>
      </div>
    </div>
  );
}
