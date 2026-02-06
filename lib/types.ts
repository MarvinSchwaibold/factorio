export type TaskState = "idle" | "working" | "completed" | "needs_approval" | "needs_resolve" | "failed" | "fixing" | "rewriting";
export type WorkflowSide = "left" | "right";

export interface Task {
  id: string;
  label: string;
  status: TaskState;
  subtext?: string;
  requiresApproval?: boolean;
  requiresResolve?: boolean;
  resolveType?: string;
}

export interface SubWorkflowTask {
  id: string;
  label: string;
  status: TaskState;
  subtext?: string;
}

export interface Scenario {
  id: string;
  buttonLabel: string;
  side: WorkflowSide;
  tasks: { label: string; subtext?: string; duration: number; requiresApproval?: boolean; requiresResolve?: boolean; resolveType?: string }[];
}

export interface WorkflowState {
  isRunning: boolean;
  tasks: Task[];
  lineProgress: number;
  awaitingApproval: boolean;
  isCompleted: boolean;
  isCollapsing: boolean;
  completedScenarioLabel: string;
  currentScenarioLabel: string;
  subWorkflowActive: boolean;
  subWorkflowTasks: SubWorkflowTask[];
  subWorkflowCollapsing: boolean;
  resolveTaskIndex: number | null;
  resolveType: string | null;
  insightsApplied?: boolean;
  deepCleanComplete?: boolean;
}
