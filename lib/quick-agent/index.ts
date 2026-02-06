// ── quick-agent ─────────────────────────────────────────
// Agent-first prototyping framework for Shopify on Quick

export { QuickAgent } from "./runtime";
export { WorkflowEngine, workflow, step, gate } from "./workflow";
export { getToolsForCategories, getAllTools } from "./tools";
export { getMockStore } from "./mock-store";

// Re-export types
export type {
  AgentConfig,
  AgentEvent,
  AgentEventType,
  ToolCategory,
  ToolDefinition,
  RegisteredTool,
  ChatMessage,
  // Commerce
  Product,
  ProductVariant,
  Order,
  OrderLineItem,
  Customer,
  InventoryLevel,
  // Workflow
  WorkflowDef,
  WorkflowStepDef,
  WorkflowContext,
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowStepStatus,
} from "./types";

export type {
  WorkflowEvent,
  WorkflowEventType,
} from "./workflow";
