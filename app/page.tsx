"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { Markdown } from "./_components/Markdown";

type Role = "user" | "assistant";

interface Message {
  id: number;
  role: Role;
  text: string;
}

const EXAMPLES = [
  "Explain what a COBOL paragraph does in plain English",
  "What business rules might a late-fee routine encode?",
  "Write a short Python function with docstring and example",
  "Summarise the risks of an undocumented banking system",
];

const CAPABILITIES = [
  {
    title: "Explain legacy code",
    body: "Turn dense COBOL paragraphs into clear, plain-language summaries.",
  },
  {
    title: "Recover business intent",
    body: "Surface the rules — balance checks, fees, KYC — hidden in the logic.",
  },
  {
    title: "Draft documentation",
    body: "Generate readable notes, with formatted code and structured sections.",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
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

      setMessages((m) => [
        ...m,
        { id: ++idRef.current, role: "user", text: prompt },
      ]);
      setInput("");
      setSending(true);

      try {
        const data = await api.prompt(prompt, 512);
        setMessages((m) => [
          ...m,
          {
            id: ++idRef.current,
            role: "assistant",
            text: data.response || "(empty response)",
          },
        ]);
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            id: ++idRef.current,
            role: "assistant",
            text:
              "⚠ Could not reach the model — " +
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
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6"
          aria-live="polite"
        >
          {empty ? (
            <Welcome onPick={(t) => send(t)} />
          ) : (
            <div className="flex flex-col gap-7">
              {messages.map((m) =>
                m.role === "user" ? (
                  <UserMessage key={m.id} text={m.text} />
                ) : (
                  <AssistantMessage key={m.id} text={m.text} />
                ),
              )}
              {sending && <Thinking />}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-bg/60">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-md)] transition-shadow focus-within:border-accent/40 focus-within:shadow-[var(--shadow-lg)]">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Message COBOL Archaeologist…"
              aria-label="Message"
              className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-fg placeholder:text-fg-faint focus:outline-none"
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="accent-grad grid h-10 w-10 shrink-0 place-items-center rounded-xl text-accent-fg shadow-[var(--shadow-sm)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
            >
              {sending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <SendIcon />
              )}
            </button>
          </div>
          <p className="mt-2 px-1 text-center text-xs text-fg-faint">
            Enter to send · Shift+Enter for a new line · responses may be
            inaccurate
          </p>
        </div>
      </div>
    </div>
  );
}

function Welcome({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="flex min-h-[64dvh] flex-col items-center justify-center py-8 text-center">
      <span className="accent-grad mb-6 grid h-16 w-16 place-items-center rounded-2xl text-accent-fg shadow-[var(--shadow-md)]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3c4.97 0 9 3.58 9 8 0 4.42-4.03 8-9 8-1.04 0-2.05-.16-2.97-.45L4 21l1.4-3.6C4.52 16.07 3 14.18 3 11c0-4.42 4.03-8 9-8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 className="text-[1.7rem] font-semibold tracking-tight sm:text-3xl">
        COBOL Archaeologist
      </h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-fg-muted">
        A chat interface to a locally-hosted model that excavates business
        intent from fifty-year-old banking COBOL — explaining paragraphs,
        recovering the rules they encode, and writing them up in clean,
        formatted prose and code.
      </p>

      <div className="mt-9 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {CAPABILITIES.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-border bg-surface p-4 text-left shadow-[var(--shadow-sm)]"
          >
            <p className="text-sm font-semibold">{c.title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
              {c.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs font-medium uppercase tracking-wider text-fg-faint">
        Try asking
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => onPick(ex)}
            className="rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] text-fg-muted shadow-[var(--shadow-sm)] transition-colors hover:border-accent/40 hover:text-fg"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="msg-in flex flex-row-reverse gap-3">
      <div
        className="accent-grad mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-semibold text-accent-fg"
        aria-hidden
      >
        You
      </div>
      <div className="accent-grad max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-tr-md px-4 py-2.5 text-[15px] leading-relaxed text-accent-fg shadow-[var(--shadow-sm)]">
        {text}
      </div>
    </div>
  );
}

function AssistantMessage({ text }: { text: string }) {
  return (
    <div className="msg-in flex flex-row gap-3">
      <div
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-[11px] font-semibold text-fg-muted"
        aria-hidden
      >
        AI
      </div>
      <div className="min-w-0 flex-1 pt-0.5 text-fg">
        <Markdown content={text} />
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="msg-in flex flex-row gap-3">
      <div
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-[11px] font-semibold text-fg-muted"
        aria-hidden
      >
        AI
      </div>
      <div className="flex h-7 items-center">
        <span className="dots flex items-center gap-1.5" aria-label="Thinking">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h13M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
