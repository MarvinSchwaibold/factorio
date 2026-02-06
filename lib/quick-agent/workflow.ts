import type {
  WorkflowDef,
  WorkflowStepDef,
  WorkflowContext,
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowStepStatus,
} from "./types";
import type { QuickAgent } from "./runtime";

// ── Workflow builder helpers ────────────────────────────

export function workflow(
  id: string,
  label: string,
  steps: WorkflowStepDef[]
): WorkflowDef {
  return { id, label, steps };
}

export function step(
  id: string,
  label: string,
  action: (ctx: WorkflowContext) => Promise<unknown>
): WorkflowStepDef {
  return { id, label, type: "action", action };
}

export function gate(
  id: string,
  label: string,
  gateType: "approval" | "resolve",
  message?: string | ((ctx: WorkflowContext) => string)
): WorkflowStepDef {
  return { id, label, type: "gate", gateType, gateMessage: message };
}

// ── Workflow events ─────────────────────────────────────

export type WorkflowEventType =
  | "workflow:started"
  | "workflow:step:started"
  | "workflow:step:completed"
  | "workflow:step:failed"
  | "workflow:gate"
  | "workflow:completed"
  | "workflow:failed";

export interface WorkflowEvent {
  type: WorkflowEventType;
  workflowId: string;
  stepId?: string;
  stepLabel?: string;
  stepIndex?: number;
  totalSteps?: number;
  gateType?: "approval" | "resolve";
  gateMessage?: string;
  result?: unknown;
  error?: string;
}

// ── Workflow Engine ─────────────────────────────────────

type WorkflowListener = (event: WorkflowEvent) => void;

export class WorkflowEngine {
  private definitions: Map<string, WorkflowDef> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();
  private listeners: Set<WorkflowListener> = new Set();
  private gateResolvers: Map<string, (approved: boolean) => void> = new Map();
  private agent: QuickAgent;

  constructor(agent: QuickAgent) {
    this.agent = agent;
  }

  /** Register a workflow definition */
  register(def: WorkflowDef) {
    this.definitions.set(def.id, def);
  }

  /** Listen to workflow events */
  on(listener: WorkflowListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: WorkflowEvent) {
    Array.from(this.listeners).forEach((listener) => listener(event));
  }

  /** Get a running workflow instance */
  getInstance(id: string): WorkflowInstance | undefined {
    return this.instances.get(id);
  }

  /** Start a workflow by definition ID */
  async start(
    definitionId: string,
    input: Record<string, unknown> = {}
  ): Promise<WorkflowInstance> {
    const def = this.definitions.get(definitionId);
    if (!def) throw new Error(`Workflow "${definitionId}" not found`);

    const instanceId = `${definitionId}-${Date.now()}`;
    const instance: WorkflowInstance = {
      id: instanceId,
      definitionId,
      label: def.label,
      status: "running",
      currentStepIndex: 0,
      steps: def.steps.map((s) => ({
        id: s.id,
        label: s.label,
        status: "pending",
      })),
      context: {
        input,
        results: {},
        agent: {
          think: async (prompt: string) => {
            return this.agent.ask(prompt);
          },
        },
      },
    };

    this.instances.set(instanceId, instance);

    this.emit({
      type: "workflow:started",
      workflowId: instanceId,
      totalSteps: def.steps.length,
    });

    // Execute steps sequentially
    this.executeSteps(instanceId, def);

    return instance;
  }

  /** Approve or reject a gate */
  resolveGate(workflowId: string, approved: boolean) {
    const resolver = this.gateResolvers.get(workflowId);
    if (resolver) {
      resolver(approved);
      this.gateResolvers.delete(workflowId);
    }
  }

  private async executeSteps(instanceId: string, def: WorkflowDef) {
    const instance = this.instances.get(instanceId)!;

    for (let i = 0; i < def.steps.length; i++) {
      instance.currentStepIndex = i;
      const stepDef = def.steps[i];
      const stepInstance = instance.steps[i];

      if (stepDef.type === "gate") {
        // Gate — pause and wait for approval
        stepInstance.status = "awaiting_gate";

        const message =
          typeof stepDef.gateMessage === "function"
            ? stepDef.gateMessage(instance.context)
            : stepDef.gateMessage || `Approve: ${stepDef.label}?`;

        this.emit({
          type: "workflow:gate",
          workflowId: instanceId,
          stepId: stepDef.id,
          stepLabel: stepDef.label,
          stepIndex: i,
          totalSteps: def.steps.length,
          gateType: stepDef.gateType,
          gateMessage: message,
        });

        // Wait for resolution
        const approved = await new Promise<boolean>((resolve) => {
          this.gateResolvers.set(instanceId, resolve);
        });

        if (!approved) {
          stepInstance.status = "failed";
          instance.status = "failed";
          this.emit({
            type: "workflow:failed",
            workflowId: instanceId,
            stepId: stepDef.id,
            error: "Gate rejected by user",
          });
          return;
        }

        stepInstance.status = "completed";
        this.emit({
          type: "workflow:step:completed",
          workflowId: instanceId,
          stepId: stepDef.id,
          stepLabel: stepDef.label,
          stepIndex: i,
          totalSteps: def.steps.length,
        });
      } else {
        // Action step — execute
        stepInstance.status = "running";
        this.emit({
          type: "workflow:step:started",
          workflowId: instanceId,
          stepId: stepDef.id,
          stepLabel: stepDef.label,
          stepIndex: i,
          totalSteps: def.steps.length,
        });

        try {
          const result = stepDef.action
            ? await stepDef.action(instance.context)
            : null;
          stepInstance.result = result;
          stepInstance.status = "completed";
          instance.context.results[stepDef.id] = result;

          this.emit({
            type: "workflow:step:completed",
            workflowId: instanceId,
            stepId: stepDef.id,
            stepLabel: stepDef.label,
            stepIndex: i,
            totalSteps: def.steps.length,
            result,
          });
        } catch (err) {
          stepInstance.status = "failed";
          instance.status = "failed";
          this.emit({
            type: "workflow:step:failed",
            workflowId: instanceId,
            stepId: stepDef.id,
            stepLabel: stepDef.label,
            error:
              err instanceof Error ? err.message : String(err),
          });
          return;
        }
      }
    }

    // All steps complete
    instance.status = "completed";
    this.emit({
      type: "workflow:completed",
      workflowId: instanceId,
    });
  }
}
