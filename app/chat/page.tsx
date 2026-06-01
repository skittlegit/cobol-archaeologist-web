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
  "Explain what a COBOL paragraph does in plain English",
  "What business rules might a late-fee routine encode?",
  "Write a short Python function with a docstring and example",
  "Summarise the risks of an undocumented banking system",
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
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-10"
          aria-live="polite"
        >
          {empty ? (
            <div className="rise py-10">
              <p className="eyebrow">Conversation</p>
              <h1 className="font-display mt-5 text-3xl leading-snug">
                Ask the model to read fifty-year-old code.
              </h1>
              <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-fg-muted">
                A session with a locally-hosted model that recovers business
                intent from legacy banking COBOL — explaining paragraphs and
                surfacing the rules they encode.
              </p>
              <p className="eyebrow mb-1 mt-12">Try one</p>
              <ul>
                {EXAMPLES.map((ex) => (
                  <li key={ex} className="border-t border-rule">
                    <button
                      onClick={() => send(ex)}
                      className="group flex w-full items-center gap-4 py-4 text-left text-[14px]"
                    >
                      <span className="text-fg-faint group-hover:text-fg">
                        →
                      </span>
                      <span className="text-fg-muted group-hover:text-fg">
                        {ex}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="msg-in">
                    <p className="text-[13px] leading-relaxed">
                      <span className="select-none text-fg-faint">
                        you&nbsp;&gt;{" "}
                      </span>
                      <span className="whitespace-pre-wrap">{m.text}</span>
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="msg-in">
                    <p className="eyebrow mb-2.5">
                      cobol·archaeologist&nbsp;&gt;
                    </p>
                    <div className="border-l border-rule pl-4 text-fg">
                      <Markdown content={m.text} />
                    </div>
                  </div>
                ),
              )}
              {sending && (
                <div className="msg-in">
                  <p className="eyebrow mb-2.5">cobol·archaeologist&nbsp;&gt;</p>
                  <span
                    className="dots ml-1 flex items-center gap-1.5"
                    aria-label="Thinking"
                  >
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-fg bg-paper">
        <div className="mx-auto w-full max-w-6xl px-6 py-5 lg:px-10">
          <div className="flex items-end gap-3 border border-fg px-3 py-2 focus-within:bg-surface-2">
            <span className="select-none pt-2.5 text-[13px] text-fg-faint">
              &gt;
            </span>
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="type a message…"
              aria-label="Message"
              className="max-h-[200px] flex-1 resize-none bg-transparent py-2 text-[14px] leading-relaxed text-fg placeholder:text-fg-faint focus:outline-none"
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              className="shrink-0 self-stretch border-l border-fg px-4 text-[12px] tracking-wider text-fg hover:enabled:bg-fg hover:enabled:text-paper disabled:opacity-40"
            >
              {sending ? "…" : "[ SEND ]"}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] tracking-wider text-fg-faint">
            ENTER TO SEND · SHIFT+ENTER NEWLINE · OUTPUT MAY BE INACCURATE
          </p>
        </div>
      </div>
    </div>
  );
}
