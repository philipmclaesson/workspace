import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  moduleId: string | null;
  moduleLabel: string | null;
};

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function WorkspaceChat({ open, onClose, moduleId, moduleLabel }: Props) {
  const chatId = moduleId ?? "default";
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    id: chatId,
    transport,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open, chatId]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(
      { text },
      { body: { module: moduleLabel ?? undefined } } as { body: Record<string, unknown> },
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <aside className={`ws-chat ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="ws-chat-head">
        <div>
          <div className="ws-chat-label">AI-TUTOR</div>
          <h2 className="ws-chat-title">{moduleLabel ?? "Psykologi"}</h2>
        </div>
        <button type="button" className="ws-chat-close" onClick={onClose} aria-label="Stäng chatt">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="ws-chat-scroll">
        {messages.length === 0 && (
          <div className="ws-chat-empty">
            <p>Hej! Jag är din AI-tutor. Fråga mig vad som helst om {moduleLabel ?? "psykologi"} — begrepp, samband, exempel eller övningsfrågor.</p>
          </div>
        )}
        {messages.map((m: UIMessage) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          return (
            <div key={m.id} className={`ws-chat-msg is-${m.role}`}>
              {m.role === "assistant" ? (
                <div className="ws-chat-bubble-assistant">{text}</div>
              ) : (
                <div className="ws-chat-bubble-user">{text}</div>
              )}
            </div>
          );
        })}
        {status === "submitted" && (
          <div className="ws-chat-msg is-assistant">
            <div className="ws-chat-bubble-assistant ws-chat-thinking">Tänker…</div>
          </div>
        )}
        {error && (
          <div className="ws-chat-error">Något gick fel. Försök igen.</div>
        )}
      </div>

      <form className="ws-chat-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="ws-chat-input"
          placeholder={`Fråga om ${moduleLabel ?? "psykologi"}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
        />
        <button type="submit" className="ws-chat-send" disabled={isLoading || !input.trim()} aria-label="Skicka">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </aside>
  );
}