import type {
  AgentConfig,
  AgentEvent,
  ChatMessage,
  ToolCallMessage,
  ToolDefinition,
  ToolCategory,
  RegisteredTool,
} from "./types";
import { getToolsForCategories } from "./tools";

// ── SSE line parser ─────────────────────────────────────

async function* parseSSE(
  response: Response
): AsyncGenerator<Record<string, unknown>> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;
      try {
        yield JSON.parse(data);
      } catch {
        // skip malformed chunks
      }
    }
  }
}

// ── QuickAgent ──────────────────────────────────────────

export class QuickAgent {
  readonly config: AgentConfig;
  private history: ChatMessage[] = [];
  private tools: RegisteredTool[] = [];
  private toolMap: Map<string, RegisteredTool> = new Map();
  private baseURL: string;

  constructor(config: AgentConfig) {
    this.config = config;

    // Resolve base URL — Quick proxy at /api/ai
    this.baseURL =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/ai`
        : "/api/ai";

    // Register tools
    if (config.tools && config.tools.length > 0) {
      this.tools = getToolsForCategories(config.tools);
      for (const t of this.tools) {
        this.toolMap.set(t.definition.function.name, t);
      }
    }
  }

  /** Clear conversation history */
  reset() {
    this.history = [];
  }

  /** Get current message history (read-only) */
  getHistory(): readonly ChatMessage[] {
    return this.history;
  }

  /** Get tool definitions for inspection */
  getToolDefinitions(): ToolDefinition[] {
    return this.tools.map((t) => t.definition);
  }

  /**
   * Send a message and stream the response.
   * Handles the full agentic loop: text → tool calls → tool results → text → done.
   */
  async *chat(message: string): AsyncGenerator<AgentEvent> {
    // Add user message
    this.history.push({ role: "user", content: message });

    // Agentic loop — keeps going until model responds with pure text (no tool calls)
    let loopCount = 0;
    const MAX_LOOPS = 10;

    while (loopCount < MAX_LOOPS) {
      loopCount++;

      const messages: ChatMessage[] = [
        { role: "system", content: this.config.instructions },
        ...this.history,
      ];

      const toolDefs =
        this.tools.length > 0
          ? this.tools.map((t) => t.definition)
          : undefined;

      // Call Quick's /api/ai proxy (OpenAI-compatible chat completions)
      let response: Response;
      try {
        response = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: this.config.model,
            messages,
            tools: toolDefs,
            stream: true,
          }),
        });
      } catch (err) {
        yield {
          type: "error",
          error: `Cannot connect to Quick AI proxy. Make sure you're running on Quick (quick serve or deployed).`,
        };
        yield { type: "done" };
        return;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        yield {
          type: "error",
          error: `AI proxy returned ${response.status}: ${errorText}`,
        };
        yield { type: "done" };
        return;
      }

      // Parse streaming response
      let fullText = "";
      const toolCalls = new Map<
        number,
        { id: string; name: string; arguments: string }
      >();

      for await (const chunk of parseSSE(response)) {
        const choices = chunk.choices as Array<{
          delta?: {
            content?: string;
            tool_calls?: Array<{
              index: number;
              id?: string;
              function?: { name?: string; arguments?: string };
            }>;
          };
          finish_reason?: string;
        }>;

        if (!choices || choices.length === 0) continue;
        const delta = choices[0].delta;
        if (!delta) continue;

        // Stream text content
        if (delta.content) {
          fullText += delta.content;
          yield { type: "text", content: delta.content };
        }

        // Accumulate tool call deltas
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCalls.has(tc.index)) {
              toolCalls.set(tc.index, {
                id: tc.id || "",
                name: "",
                arguments: "",
              });
            }
            const existing = toolCalls.get(tc.index)!;
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name = tc.function.name;
            if (tc.function?.arguments)
              existing.arguments += tc.function.arguments;
          }
        }
      }

      // If we got tool calls, execute them and loop
      if (toolCalls.size > 0) {
        // Add assistant message with tool calls to history
        const toolCallMessages: ToolCallMessage[] = Array.from(
          toolCalls.values()
        ).map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: { name: tc.name, arguments: tc.arguments },
        }));

        this.history.push({
          role: "assistant",
          content: fullText || null,
          tool_calls: toolCallMessages,
        });

        // Execute each tool call
        for (const tc of Array.from(toolCalls.values())) {
          let parsedArgs: Record<string, unknown>;
          try {
            parsedArgs = JSON.parse(tc.arguments);
          } catch {
            parsedArgs = {};
          }

          yield { type: "tool_call", toolName: tc.name, toolArgs: parsedArgs };

          const registeredTool = this.toolMap.get(tc.name);
          let result: unknown;

          if (registeredTool) {
            try {
              result = await registeredTool.implementation(parsedArgs);
            } catch (err) {
              result = {
                error: `Tool execution failed: ${err instanceof Error ? err.message : String(err)}`,
              };
            }
          } else {
            result = { error: `Unknown tool: ${tc.name}` };
          }

          yield { type: "tool_result", toolName: tc.name, toolResult: result };

          // Add tool result to history
          this.history.push({
            role: "tool",
            content: JSON.stringify(result),
            tool_call_id: tc.id,
          });
        }

        // Continue the loop — model will respond to tool results
        continue;
      }

      // No tool calls — conversation turn is complete
      if (fullText) {
        this.history.push({ role: "assistant", content: fullText });
      }

      yield { type: "done", content: fullText };
      return;
    }

    // Safety: max loops exceeded
    yield {
      type: "error",
      error: "Agent exceeded maximum tool call iterations",
    };
    yield { type: "done" };
  }

  /**
   * Non-streaming convenience method.
   * Runs the full agent loop and returns the final text response.
   */
  async ask(message: string): Promise<string> {
    let fullText = "";
    for await (const event of this.chat(message)) {
      if (event.type === "text" && event.content) {
        fullText += event.content;
      }
    }
    return fullText;
  }
}
