"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { QuickAgent } from "@/lib/quick-agent";
import type { AgentEvent } from "@/lib/quick-agent";

// ── Types ───────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: { name: string; args: Record<string, unknown>; result?: unknown }[];
  isStreaming?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  send: (text: string) => void;
  isStreaming: boolean;
  activeTools: string[];
  error: string | null;
  reset: () => void;
}

// ── Hook ────────────────────────────────────────────────

export function useChat(agent: QuickAgent | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setMessages([]);
    setIsStreaming(false);
    setActiveTools([]);
    setError(null);
    agent?.reset();
  }, [agent]);

  const send = useCallback(
    async (text: string) => {
      if (!agent || !text.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setError(null);
      abortRef.current = false;

      const assistantId = `asst-${Date.now()}`;
      let assistantContent = "";
      const toolCalls: ChatMessage["toolCalls"] = [];

      // Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          isStreaming: true,
          toolCalls: [],
        },
      ]);

      try {
        for await (const event of agent.chat(text.trim())) {
          if (abortRef.current) break;

          switch (event.type) {
            case "text":
              assistantContent += event.content || "";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
              break;

            case "tool_call":
              if (event.toolName) {
                setActiveTools((prev) => [...prev, event.toolName!]);
                toolCalls.push({
                  name: event.toolName,
                  args: event.toolArgs || {},
                });
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, toolCalls: [...toolCalls] }
                      : m
                  )
                );
              }
              break;

            case "tool_result":
              if (event.toolName) {
                setActiveTools((prev) =>
                  prev.filter((t) => t !== event.toolName)
                );
                const tc = toolCalls.find(
                  (t) => t.name === event.toolName && !t.result
                );
                if (tc) tc.result = event.toolResult;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, toolCalls: [...toolCalls] }
                      : m
                  )
                );
              }
              break;

            case "error":
              setError(event.error || "Unknown error");
              break;

            case "done":
              break;
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to connect to agent"
        );
      }

      // Finalize the assistant message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, isStreaming: false, toolCalls: [...toolCalls] }
            : m
        )
      );
      setIsStreaming(false);
      setActiveTools([]);
    },
    [agent, isStreaming]
  );

  return { messages, send, isStreaming, activeTools, error, reset };
}
