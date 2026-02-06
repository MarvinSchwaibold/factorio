"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { ArrowUp } from "lucide-react";
import { ThemeContext } from "@/lib/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function InlineChat() {
  const theme = useContext(ThemeContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMessages, setHasMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setHasMessages(true);

    setTimeout(() => {
      const reply: Message = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "I'm working on that. This is a placeholder response — agent integration coming soon.",
      };
      setMessages((prev) => [...prev, reply]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 600,
        zIndex: 2000,
        fontFamily: theme.fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Messages - show above input when there are messages */}
      {hasMessages && (
        <div
          style={{
            width: "100%",
            maxHeight: 300,
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: "16px 16px 0 0",
            boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.06)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  lineHeight: 1.5,
                  ...(msg.role === "user"
                    ? {
                        background: "#111827",
                        color: "#ffffff",
                        borderBottomRightRadius: 4,
                      }
                    : {
                        background: "#f3f4f6",
                        color: theme.text,
                        borderBottomLeftRadius: 4,
                      }),
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Bar */}
      <div
        style={{
          width: "100%",
          background: "#ffffff",
          borderRadius: hasMessages ? "0 0 16px 16px" : 16,
          boxShadow: hasMessages
            ? "0 4px 24px rgba(0, 0, 0, 0.08)"
            : "0 2px 16px rgba(0, 0, 0, 0.08)",
          padding: "10px 14px",
          borderTop: hasMessages ? `1px solid ${theme.borderDim}` : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Sidekick anything..."
            rows={1}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              resize: "none",
              fontSize: 14,
              lineHeight: 1.5,
              color: theme.text,
              fontFamily: theme.fontFamily,
              maxHeight: 80,
              padding: "4px 0",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? "#111827" : "#e5e7eb",
              border: "none",
              borderRadius: 10,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default",
              flexShrink: 0,
              transition: "background 0.15s ease",
            }}
          >
            <ArrowUp size={16} color="#ffffff" />
          </button>
        </div>
      </div>
    </div>
  );
}
