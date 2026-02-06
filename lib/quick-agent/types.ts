// ── Agent Configuration ─────────────────────────────────

export interface AgentConfig {
  name: string;
  model: string;
  instructions: string;
  tools?: ToolCategory[];
  gates?: GateConfig;
}

export type ToolCategory =
  | "orders"
  | "products"
  | "inventory"
  | "customers"
  | "analytics"
  | "marketing";

export interface GateConfig {
  approval?: boolean;
  costThreshold?: number;
}

// ── Agent Events (streaming) ────────────────────────────

export type AgentEventType =
  | "text"
  | "tool_call"
  | "tool_result"
  | "approval_needed"
  | "error"
  | "done";

export interface AgentEvent {
  type: AgentEventType;
  content?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  error?: string;
}

// ── Chat Messages ───────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCallMessage[];
  tool_call_id?: string;
}

export interface ToolCallMessage {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

// ── Tool Definitions ────────────────────────────────────

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export type ToolImplementation = (
  args: Record<string, unknown>
) => Promise<unknown>;

export interface RegisteredTool {
  definition: ToolDefinition;
  implementation: ToolImplementation;
}

// ── Commerce Objects (Shopify) ──────────────────────────

export interface Product {
  id: string;
  title: string;
  description: string;
  status: "active" | "draft" | "archived";
  vendor: string;
  productType: string;
  tags: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  sku: string;
  inventoryQuantity: number;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  financialStatus: "pending" | "paid" | "refunded" | "partially_refunded";
  fulfillmentStatus: "unfulfilled" | "fulfilled" | "partial";
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  currency: string;
  lineItems: OrderLineItem[];
  customer: { id: string; email: string; firstName: string; lastName: string };
  tags: string[];
}

export interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  variantTitle: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  ordersCount: number;
  totalSpent: string;
  tags: string[];
  createdAt: string;
  lastOrderAt: string | null;
  state: "enabled" | "disabled" | "invited";
}

export interface InventoryLevel {
  inventoryItemId: string;
  locationId: string;
  locationName: string;
  available: number;
  sku: string;
  productTitle: string;
  variantTitle: string;
}

// ── Workflow Types ──────────────────────────────────────

export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "awaiting_gate";

export interface WorkflowDef {
  id: string;
  label: string;
  steps: WorkflowStepDef[];
}

export interface WorkflowStepDef {
  id: string;
  label: string;
  type: "action" | "gate";
  gateType?: "approval" | "resolve";
  gateMessage?: string | ((ctx: WorkflowContext) => string);
  action?: (ctx: WorkflowContext) => Promise<unknown>;
}

export interface WorkflowContext {
  input: Record<string, unknown>;
  results: Record<string, unknown>;
  agent: { think: (prompt: string) => Promise<string> };
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  label: string;
  status: "running" | "completed" | "failed" | "paused";
  currentStepIndex: number;
  steps: WorkflowStepInstance[];
  context: WorkflowContext;
}

export interface WorkflowStepInstance {
  id: string;
  label: string;
  status: WorkflowStepStatus;
  result?: unknown;
}
