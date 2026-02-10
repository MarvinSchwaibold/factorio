"use client";

import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { ArrowUp, Loader2, Wrench, RotateCcw } from "lucide-react";
import { ThemeContext } from "@/lib/theme";
import { Button } from "@/components/Button";
import { QuickAgent } from "@/lib/quick-agent";
import { sidekickConfig } from "@/lib/quick-agent/config";
import { useChat, type ChatMessage } from "@/hooks/useChat";

// ── Tool call pill ──────────────────────────────────────

function ToolCallPill({
  tool,
}: {
  tool: { name: string; args: Record<string, unknown>; result?: unknown };
}) {
  const theme = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(false);
  const label = tool.name.replace(/_/g, " ");

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 8px",
          borderRadius: 6,
          border: `1px solid ${theme.border}`,
          background: tool.result ? "#f0fdf4" : "#fefce8",
          fontSize: 11,
          fontFamily: "var(--font-geist-mono), monospace",
          color: theme.text,
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        <Wrench size={10} />
        {label}
        {!tool.result && (
          <Loader2
            size={10}
            style={{ animation: "spin 1s linear infinite" }}
          />
        )}
      </button>
      {expanded && tool.result != null && (
        <pre
          style={{
            marginTop: 4,
            padding: "6px 8px",
            borderRadius: 6,
            background: theme.cardBgHover,
            border: `1px solid ${theme.border}`,
            fontSize: 10,
            lineHeight: 1.4,
            maxHeight: 120,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "var(--font-geist-mono), monospace",
            color: "#4b5563",
          }}
        >
          {JSON.stringify(tool.result, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Message bubble ──────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const theme = useContext(ThemeContext);
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 4,
      }}
    >
      {/* Tool calls (shown above assistant text) */}
      {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: "90%",
          }}
        >
          {msg.toolCalls.map((tc, i) => (
            <ToolCallPill key={`${tc.name}-${i}`} tool={tc} />
          ))}
        </div>
      )}

      {/* Message content */}
      {msg.content && (
        <div
          style={{
            maxWidth: "85%",
            padding: "8px 12px",
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            ...(isUser
              ? {
                  background: "#111827",
                  color: "#ffffff",
                  borderBottomRightRadius: 4,
                }
              : {
                  background: theme.cardBgHover,
                  color: theme.text,
                  borderBottomLeftRadius: 4,
                }),
          }}
        >
          {msg.content}
          {msg.isStreaming && (
            <span
              style={{
                display: "inline-block",
                width: 5,
                height: 14,
                background: "#6b7280",
                marginLeft: 2,
                verticalAlign: "text-bottom",
                animation: "blink 1s step-end infinite",
              }}
            />
          )}
        </div>
      )}

      {/* Streaming with no content yet (thinking) */}
      {!isUser && !msg.content && msg.isStreaming && (!msg.toolCalls || msg.toolCalls.length === 0) && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "#f3f4f6",
            fontSize: 13,
            color: "#9ca3af",
            borderBottomLeftRadius: 4,
          }}
        >
          <Loader2
            size={14}
            style={{
              animation: "spin 1s linear infinite",
              display: "inline-block",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────

export function InlineChat({ sidebarWidth = 0, embedded = false }: { sidebarWidth?: number; embedded?: boolean }) {
  const theme = useContext(ThemeContext);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize agent (singleton)
  const agent = useMemo(() => new QuickAgent(sidekickConfig), []);
  const { messages, send, isStreaming, activeTools, error, reset } =
    useChat(agent);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>

      <div
        style={embedded ? {
          width: "100%",
          fontFamily: theme.fontFamily,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        } : {
          position: "fixed",
          bottom: 20,
          left: `calc(50% + ${sidebarWidth / 2}px)`,
          transform: "translateX(-50%)",
          transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
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
        {/* Messages */}
        {hasMessages && (
          <div
            style={{
              width: "100%",
              maxHeight: 400,
              overflowY: "auto",
              background: theme.cardBg,
              borderRadius: "16px 16px 0 0",
              boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.06)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Reset button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={reset}
                disabled={isStreaming}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 6,
                  border: `1px solid ${theme.border}`,
                  background: "transparent",
                  fontSize: 11,
                  color: theme.textDim,
                  cursor: isStreaming ? "default" : "pointer",
                  opacity: isStreaming ? 0.5 : 1,
                }}
              >
                <RotateCcw size={10} />
                Reset
              </button>
            </div>

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Error display */}
            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  fontSize: 12,
                  color: "#991b1b",
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Active tools indicator */}
        {activeTools.length > 0 && (
          <div
            style={{
              width: "100%",
              padding: "4px 16px",
              background: "#fffbeb",
              borderTop: hasMessages ? "1px solid #fef3c7" : "none",
              fontSize: 11,
              color: "#92400e",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Loader2
              size={10}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Running: {activeTools.map((t) => t.replace(/_/g, " ")).join(", ")}
          </div>
        )}

        {/* Input Bar */}
        <div
          style={{
            width: "100%",
            background: theme.cardBg,
            borderRadius: hasMessages ? "0 0 16px 16px" : 16,
            boxShadow: hasMessages
              ? "0 4px 24px rgba(0, 0, 0, 0.08)"
              : "0 2px 16px rgba(0, 0, 0, 0.08)",
            padding: "10px 14px",
            borderTop:
              hasMessages || activeTools.length > 0
                ? `1px solid ${theme.borderDim}`
                : "none",
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
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              size="sm"
              style={{
                width: 32,
                height: 32,
                padding: 0,
                flexShrink: 0,
              }}
            >
              {isStreaming ? (
                <Loader2
                  size={16}
                  color="#ffffff"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <ArrowUp size={16} color="#ffffff" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
