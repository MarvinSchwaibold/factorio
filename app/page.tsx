"use client";

import { useState, useRef, useCallback, createContext, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TaskState = "idle" | "working" | "completed" | "needs_approval" | "needs_resolve" | "failed" | "fixing" | "rewriting";
type WorkflowSide = "left" | "right";

// Theme definition (retro only)
const theme = {
  // Main colors
  background: "#0d0f0d",
  accent: "#5eead4",
  accentRgb: "94, 234, 212",
  text: "#5eead4",
  textMuted: "rgba(94, 234, 212, 0.7)",
  textDim: "rgba(94, 234, 212, 0.4)",
  // Borders
  border: "rgba(94, 234, 212, 0.4)",
  borderLight: "rgba(94, 234, 212, 0.3)",
  borderDim: "rgba(94, 234, 212, 0.15)",
  // Backgrounds
  cardBg: "rgba(94, 234, 212, 0.02)",
  cardBgHover: "rgba(94, 234, 212, 0.08)",
  buttonBg: "rgba(94, 234, 212, 0.1)",
  buttonBgHover: "rgba(94, 234, 212, 0.15)",
  inputBg: "rgba(0, 0, 0, 0.3)",
  // States
  success: "#10b981",
  successBg: "rgba(16, 185, 129, 0.08)",
  warning: "#e07020",
  warningText: "#f0a050",
  warningBg: "rgba(224, 112, 32, 0.08)",
  warningBorder: "rgba(224, 112, 32, 0.5)",
  error: "#ef4444",
  errorBg: "rgba(239, 68, 68, 0.08)",
  // Grid
  gridPattern: "linear-gradient(rgba(94, 234, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 234, 212, 0.03) 1px, transparent 1px)",
  // Component specific
  connectionLine: "rgba(94, 234, 212, 0.3)",
  connectionLineDim: "rgba(94, 234, 212, 0.2)",
  dot: "#5eead4",
  dotDim: "rgba(94, 234, 212, 0.3)",
  // Shadows
  shadow: "none",
  glowAccent: "0 0 6px #5eead4",
  glowSuccess: "0 0 6px rgba(16, 185, 129, 0.6)",
  glowWarning: "0 0 6px rgba(224, 112, 32, 0.6)",
  // Typography
  fontFamily: "monospace",
  borderRadius: "0px",
  labelStyle: "uppercase" as const,
};

type Theme = typeof theme;
const ThemeContext = createContext<Theme>(theme);

interface Task {
  id: string;
  label: string;
  status: TaskState;
  subtext?: string;
  requiresApproval?: boolean;
  requiresResolve?: boolean;
  resolveType?: string;
}

interface SubWorkflowTask {
  id: string;
  label: string;
  status: TaskState;
  subtext?: string;
}

interface Scenario {
  id: string;
  buttonLabel: string;
  side: WorkflowSide;
  tasks: { label: string; subtext?: string; duration: number; requiresApproval?: boolean; requiresResolve?: boolean; resolveType?: string }[];
}

const scenarios: Scenario[] = [
  {
    id: "email-campaign",
    buttonLabel: "Send Email Campaign",
    side: "right",
    tasks: [
      { label: "[CRAFTING EMAIL COPY]", subtext: "Generating content", duration: 2000 },
      { label: "[REVIEW EMAIL COPY]", subtext: "AI generated draft", duration: 0, requiresResolve: true, resolveType: "email_copy" },
      { label: "[CREATING EMAIL LAYOUT]", subtext: "Designing template", duration: 2000 },
      { label: "[SEGMENTING AUDIENCE]", subtext: "Analyzing customers", duration: 1800 },
      { label: "[REVIEW AUDIENCE]", subtext: "2,847 recipients selected", duration: 0, requiresApproval: true },
      { label: "[SCHEDULING DELIVERY]", subtext: "Optimizing send time", duration: 1500 },
      { label: "[SEND CAMPAIGN]", subtext: "Ready to dispatch 2,847 emails", duration: 0, requiresApproval: true },
    ]
  },
  {
    id: "analyze-sales",
    buttonLabel: "Analyze Sales Data",
    side: "left",
    tasks: [
      { label: "[FETCHING SALES DATA]", subtext: "Connecting to Shopify", duration: 1500 },
      { label: "[PROCESSING METRICS]", subtext: "Calculating KPIs", duration: 2000 },
      { label: "[IDENTIFYING TRENDS]", subtext: "Pattern recognition", duration: 2500 },
      { label: "[REVIEW INSIGHTS]", subtext: "5 key findings detected", duration: 0, requiresResolve: true, resolveType: "insights" },
      { label: "[GENERATING REPORT]", subtext: "Creating PDF", duration: 1500 },
    ]
  },
  {
    id: "inventory-check",
    buttonLabel: "Check Inventory",
    side: "right",
    tasks: [
      { label: "[SCANNING INVENTORY]", subtext: "Reading stock levels", duration: 1800 },
      { label: "[LOW STOCK ALERT]", subtext: "12 items below threshold", duration: 0, requiresResolve: true, resolveType: "inventory" },
      { label: "[PREDICTING DEMAND]", subtext: "Forecasting sales", duration: 2200 },
      { label: "[CONFIRM REORDER]", subtext: "$4,230 purchase order", duration: 0, requiresApproval: true },
    ]
  }
];

// Sub-workflow configurations by type
const subWorkflowConfigs: Record<string, { tasks: { label: string; subtext?: string; duration: number }[] }> = {
  inventory: {
    tasks: [
      { label: "[ANALYZING STOCK]", subtext: "Checking levels", duration: 1200 },
      { label: "[FINDING SUPPLIERS]", subtext: "Best prices", duration: 1500 },
      { label: "[CREATING PO]", subtext: "Purchase order", duration: 1000 },
      { label: "[RESOLVED]", subtext: "Ready to continue", duration: 800 },
    ]
  },
  insights: {
    tasks: [
      { label: "[DEEP ANALYSIS]", subtext: "Statistical review", duration: 1000 },
      { label: "[GENERATING CHARTS]", subtext: "Visualizations", duration: 1200 },
      { label: "[SUMMARY]", subtext: "Key takeaways", duration: 800 },
    ]
  },
  email_copy: {
    tasks: [] // Email copy uses a special preview widget instead
  }
};

const GRID_SIZE = 20;
const WIDGET_GAP = 20; // Consistent gap between all widgets
const TASK_ROW_HEIGHT = 100; // Used for connection line calculations

// The Y position where connection lines hit relative to task row top (aligned to grid)
// Widget starts at paddingTop + widget center
const TASK_CONNECTION_Y = 45; // Centered in row

// Agent center Y - where the Sidekick Agent box center is (aligned to grid)
// Calculated: header(~40px) + mb-5(20px) + firstRow(60px) + gap(20px) + halfMiddle(70px) = 210
const AGENT_CENTER_Y = 220; // 11 * GRID_SIZE (adjusted for grid alignment)

// Connection line Y at the task end
const CONNECTION_LINE_Y = TASK_CONNECTION_Y;

// Connection area width (aligned to grid)
const CONNECTION_WIDTH = 160; // 8 * GRID_SIZE
const CONNECTION_BEND_X = 80; // 4 * GRID_SIZE (midpoint)

function EnergyDot({ delay, color, duration, path }: { delay: number; color: string; duration: number; path: string }) {
  return (
    <motion.div
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
      style={{
        position: "absolute",
        width: 4,
        height: 4,
        borderRadius: 1,
        background: color,
        boxShadow: `0 0 4px ${color}`,
        offsetPath: `path('${path}')`,
        offsetRotate: "0deg"
      }}
    />
  );
}

function CompletedTaskWidget({ label, onClose, mirrored }: { label: string; onClose: () => void; mirrored?: boolean }) {
  const theme = useContext(ThemeContext);
  const isRetro = true; // Always retro mode
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col gap-1"
      style={{ alignItems: mirrored ? "flex-end" : "flex-start", position: "relative", willChange: "transform, opacity, filter" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        style={{
          position: "absolute",
          top: -12,
          left: mirrored ? "auto" : 8,
          right: mirrored ? 8 : "auto",
          fontSize: isRetro ? 9 : 10,
          letterSpacing: isRetro ? "0.08em" : undefined,
          padding: "4px 10px",
          background: theme.success,
          color: isRetro ? "#000" : "white",
          width: "fit-content",
          fontWeight: isRetro ? 700 : 600,
          zIndex: 10,
          borderRadius: isRetro ? 0 : 4
        }}
      >
        {isRetro ? "✓ WORKFLOW COMPLETED" : "✓ Completed"}
      </motion.div>

      <motion.div
        style={{ 
          border: isRetro ? `2px solid ${theme.success}` : "1px solid #d1fae5", 
          padding: "20px 24px", 
          minWidth: isRetro ? 320 : 300, 
          position: "relative", 
          overflow: "hidden",
          background: isRetro ? theme.successBg : "white",
          borderRadius: theme.borderRadius,
          boxShadow: theme.shadow
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: isRetro ? 22 : 24,
            height: isRetro ? 22 : 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isRetro ? "transparent" : "#f5f5f5",
            border: isRetro ? `2px solid rgba(16, 185, 129, 0.4)` : "none",
            color: isRetro ? "rgba(16, 185, 129, 0.6)" : "#737373",
            cursor: "pointer",
            fontSize: isRetro ? 11 : 12,
            fontWeight: isRetro ? 600 : 500,
            fontFamily: isRetro ? "monospace" : undefined,
            transition: "all 0.2s",
            lineHeight: 1,
            borderRadius: isRetro ? 0 : 6
          }}
          onMouseEnter={(e) => { 
            if (isRetro) {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)"; 
              e.currentTarget.style.color = "#10b981";
              e.currentTarget.style.borderColor = "#10b981";
            } else {
              e.currentTarget.style.background = "#e5e5e5"; 
            }
          }}
          onMouseLeave={(e) => { 
            if (isRetro) {
              e.currentTarget.style.background = "transparent"; 
              e.currentTarget.style.color = "rgba(16, 185, 129, 0.6)";
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
            } else {
              e.currentTarget.style.background = "#f5f5f5"; 
            }
          }}
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.35, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ 
              background: isRetro ? "transparent" : "#dcfce7",
              color: isRetro ? "rgba(94, 234, 212, 0.5)" : "#16a34a", 
              fontSize: isRetro ? 16 : 14, 
              width: isRetro ? 22 : 28, 
              height: isRetro ? 22 : 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontWeight: 600,
              borderRadius: isRetro ? 0 : 8
            }}
          >
            ✓
          </motion.div>

          <span style={{ fontSize: isRetro ? 13 : 14, letterSpacing: isRetro ? "0.06em" : undefined, color: isRetro ? theme.success : "#171717", fontWeight: 600 }}>
            {isRetro ? label.toUpperCase() : label}
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          style={{ 
            marginTop: isRetro ? 14 : 12, 
            marginLeft: isRetro ? 38 : 40,
            fontSize: isRetro ? 11 : 13, 
            color: isRetro ? "rgba(16, 185, 129, 0.7)" : "#737373",
            letterSpacing: isRetro ? "0.04em" : undefined
          }}
        >
          All tasks completed successfully
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Live status widget showing real-time canvas activity
function LiveStatusWidget({
  leftWorkflow,
  rightWorkflow,
  deepCleanMode
}: {
  leftWorkflow: { tasks: Task[]; isRunning: boolean; subWorkflowActive: boolean; subWorkflowTasks: Task[]; isCompleted: boolean };
  rightWorkflow: { tasks: Task[]; isRunning: boolean; subWorkflowActive: boolean; subWorkflowTasks: Task[]; isCompleted: boolean };
  deepCleanMode: "idle" | "running" | "collapsing" | "complete";
}) {
  const theme = useContext(ThemeContext);
  const isRetro = true; // Always retro mode

  // Track totals that accumulate over session
  const totalsRef = useRef({
    tasksProcessed: 0,
    subTasksProcessed: 0,
    fixesApplied: 0,
    restructured: 0,
    errorsRecovered: 0,
    lastCompletedCount: 0,
    lastFixingCount: 0,
    lastRewritingCount: 0,
    lastFailedCount: 0
  });

  // Compute live stats from workflow states
  const allTasks = [...leftWorkflow.tasks, ...rightWorkflow.tasks];
  const allSubTasks = [...leftWorkflow.subWorkflowTasks, ...rightWorkflow.subWorkflowTasks];

  const stats = {
    tasksRunning: allTasks.filter(t => t.status === "working").length,
    tasksCompleted: allTasks.filter(t => t.status === "completed").length,
    tasksFailed: allTasks.filter(t => t.status === "failed").length,
    tasksFixing: allTasks.filter(t => t.status === "fixing").length,
    tasksRewriting: allTasks.filter(t => t.status === "rewriting").length,
    awaitingApproval: allTasks.filter(t => t.status === "needs_approval" || t.status === "needs_resolve").length,
    subTasksActive: allSubTasks.filter(t => t.status === "working").length,
    subTasksCompleted: allSubTasks.filter(t => t.status === "completed").length,
    totalActive: allTasks.length + allSubTasks.length,
    workflowsActive: (leftWorkflow.isRunning ? 1 : 0) + (rightWorkflow.isRunning ? 1 : 0),
    subWorkflowsActive: (leftWorkflow.subWorkflowActive ? 1 : 0) + (rightWorkflow.subWorkflowActive ? 1 : 0),
  };

  // Update totals when stats change
  useEffect(() => {
    const t = totalsRef.current;
    // Count new completions
    if (stats.tasksCompleted > t.lastCompletedCount) {
      t.tasksProcessed += (stats.tasksCompleted - t.lastCompletedCount);
    }
    t.lastCompletedCount = stats.tasksCompleted;

    // Count fixes (when fixing count goes down, a fix completed)
    if (stats.tasksFixing < t.lastFixingCount && t.lastFixingCount > 0) {
      t.fixesApplied += (t.lastFixingCount - stats.tasksFixing);
    }
    t.lastFixingCount = stats.tasksFixing;

    // Count restructures
    if (stats.tasksRewriting < t.lastRewritingCount && t.lastRewritingCount > 0) {
      t.restructured += (t.lastRewritingCount - stats.tasksRewriting);
    }
    t.lastRewritingCount = stats.tasksRewriting;

    // Count error recoveries
    if (stats.tasksFailed < t.lastFailedCount && t.lastFailedCount > 0) {
      t.errorsRecovered += (t.lastFailedCount - stats.tasksFailed);
    }
    t.lastFailedCount = stats.tasksFailed;

    // Track sub-tasks
    t.subTasksProcessed = Math.max(t.subTasksProcessed, stats.subTasksCompleted);
  }, [stats.tasksCompleted, stats.tasksFixing, stats.tasksRewriting, stats.tasksFailed, stats.subTasksCompleted]);

  const totals = totalsRef.current;

  // Determine current status message
  const getStatusMessage = () => {
    if (deepCleanMode === "running") return "DEEP CLEAN ACTIVE";
    if (deepCleanMode === "collapsing") return "CONSOLIDATING...";
    if (stats.tasksRewriting > 0) return "RESTRUCTURING";
    if (stats.tasksFixing > 0) return "APPLYING FIXES";
    if (stats.tasksFailed > 0) return "ERRORS DETECTED";
    if (stats.awaitingApproval > 0) return "AWAITING INPUT";
    if (stats.subWorkflowsActive > 0) return "SUB-TASK RUNNING";
    if (stats.workflowsActive > 1) return "MULTI-TASK RUNNING";
    if (stats.workflowsActive === 1) return "TASK RUNNING";
    if (leftWorkflow.isCompleted || rightWorkflow.isCompleted) return "TASK COMPLETE";
    return "IDLE";
  };

  const statusMessage = getStatusMessage();
  const isActive = stats.workflowsActive > 0 || deepCleanMode !== "idle";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onWheel={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        minWidth: isRetro ? 220 : 200,
        background: isRetro ? "rgba(13, 15, 13, 0.95)" : "white",
        border: isRetro ? `1px solid ${isActive ? "rgba(94, 234, 212, 0.4)" : "rgba(94, 234, 212, 0.2)"}` : `1px solid ${isActive ? "#d4d4d4" : "#e5e5e5"}`,
        borderRadius: isRetro ? 0 : 12,
        padding: isRetro ? "12px 16px" : "14px 18px",
        boxShadow: isRetro ? (isActive ? "0 0 20px rgba(94, 234, 212, 0.1)" : "none") : "0 4px 12px rgba(0,0,0,0.08)",
        zIndex: 1000,
        fontFamily: isRetro ? "monospace" : "inherit"
      }}
    >
      {/* Header with status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${isRetro ? "rgba(94, 234, 212, 0.15)" : "#f0f0f0"}` }}>
        <motion.div
          animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 0.3 }}
          transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          style={{
            width: 8,
            height: 8,
            borderRadius: isRetro ? 0 : "50%",
            background: isActive
              ? (stats.tasksFailed > 0 ? "#ef4444" : stats.awaitingApproval > 0 ? "#e07020" : stats.tasksRewriting > 0 ? "#a855f7" : "#5eead4")
              : (isRetro ? "rgba(94, 234, 212, 0.3)" : "#d4d4d4"),
            boxShadow: isRetro && isActive ? `0 0 8px ${stats.tasksFailed > 0 ? "#ef4444" : stats.awaitingApproval > 0 ? "#e07020" : stats.tasksRewriting > 0 ? "#a855f7" : "#5eead4"}` : "none"
          }}
        />
        <span style={{
          fontSize: isRetro ? 10 : 11,
          fontWeight: 600,
          letterSpacing: isRetro ? "0.1em" : "0.02em",
          color: isRetro ? "#5eead4" : "#171717"
        }}>
          {statusMessage}
        </span>
      </div>

      {/* Current Stats */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: isRetro ? 8 : 9, color: isRetro ? "rgba(94, 234, 212, 0.4)" : "#a3a3a3", letterSpacing: isRetro ? "0.15em" : "0.05em", marginBottom: 6, fontWeight: 600 }}>
          {isRetro ? "CURRENT" : "Current"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <StatusRow label="Workflows" value={stats.workflowsActive} isRetro={isRetro} active={stats.workflowsActive > 0} />
          <StatusRow label="Tasks" value={stats.totalActive} isRetro={isRetro} active={stats.tasksRunning > 0} />
          {stats.subWorkflowsActive > 0 && <StatusRow label="Sub-tasks" value={stats.subTasksActive} isRetro={isRetro} active />}
          {stats.awaitingApproval > 0 && <StatusRow label="Pending" value={stats.awaitingApproval} isRetro={isRetro} color="#e07020" active />}
          {stats.tasksFixing > 0 && <StatusRow label="Fixing" value={stats.tasksFixing} isRetro={isRetro} color="#3b82f6" active />}
          {stats.tasksRewriting > 0 && <StatusRow label="Rewriting" value={stats.tasksRewriting} isRetro={isRetro} color="#a855f7" active />}
          {stats.tasksFailed > 0 && <StatusRow label="Failed" value={stats.tasksFailed} isRetro={isRetro} color="#ef4444" active />}
        </div>
      </div>

      {/* Total Stats */}
      <div style={{ paddingTop: 8, borderTop: `1px solid ${isRetro ? "rgba(94, 234, 212, 0.1)" : "#f5f5f5"}` }}>
        <div style={{ fontSize: isRetro ? 8 : 9, color: isRetro ? "rgba(94, 234, 212, 0.4)" : "#a3a3a3", letterSpacing: isRetro ? "0.15em" : "0.05em", marginBottom: 6, fontWeight: 600 }}>
          {isRetro ? "SESSION TOTAL" : "Session Total"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <StatusRow label="Processed" value={totals.tasksProcessed} isRetro={isRetro} color="#10b981" />
          {totals.subTasksProcessed > 0 && <StatusRow label="Sub-tasks" value={totals.subTasksProcessed} isRetro={isRetro} />}
          {totals.fixesApplied > 0 && <StatusRow label="Fixes" value={totals.fixesApplied} isRetro={isRetro} color="#3b82f6" />}
          {totals.restructured > 0 && <StatusRow label="Restructured" value={totals.restructured} isRetro={isRetro} color="#a855f7" />}
          {totals.errorsRecovered > 0 && <StatusRow label="Recovered" value={totals.errorsRecovered} isRetro={isRetro} color="#e07020" />}
        </div>
      </div>
    </motion.div>
  );
}

function StatusRow({ label, value, isRetro, color, active }: { label: string; value: number; isRetro: boolean; color?: string; active?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{
        fontSize: isRetro ? 9 : 11,
        color: isRetro ? "rgba(94, 234, 212, 0.5)" : "#737373",
        letterSpacing: isRetro ? "0.05em" : undefined
      }}>
        {isRetro ? label.toUpperCase() : label}
      </span>
      <motion.span
        animate={active ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
        transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
        style={{
          fontSize: isRetro ? 11 : 12,
          fontWeight: 600,
          color: color || (isRetro ? "#5eead4" : "#171717"),
          fontFamily: isRetro ? "monospace" : undefined
        }}
      >
        {value}
      </motion.span>
    </div>
  );
}

function TaskWidget({ task, onApprove, onReject, onResolve, isCollapsing, collapseIndex, mirrored }: { task: Task; onApprove?: () => void; onReject?: () => void; onResolve?: () => void; isCollapsing?: boolean; collapseIndex?: number; mirrored?: boolean }) {
  const theme = useContext(ThemeContext);
  const isRetro = true; // Always retro mode
  
  const isWorking = task.status === "working";
  const isCompleted = task.status === "completed";
  const needsApproval = task.status === "needs_approval";
  const needsResolve = task.status === "needs_resolve";
  const isFailed = task.status === "failed";
  const isFixing = task.status === "fixing";
  const isRewriting = task.status === "rewriting";

  const stateColors = isRetro ? {
    working: { border: "#5eead4", bg: "rgba(94, 234, 212, 0.12)", text: "#5eead4", subtext: "#5eead4" },
    completed: { border: "#10b981", bg: "rgba(16, 185, 129, 0.08)", text: "#10b981", subtext: "#10b981" },
    needs_approval: { border: "#e07020", bg: "rgba(224, 112, 32, 0.12)", text: "#f0a050", subtext: "#e07020" },
    needs_resolve: { border: "#e07020", bg: "rgba(224, 112, 32, 0.12)", text: "#f0a050", subtext: "#e07020" },
    failed: { border: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", subtext: "#ef4444" },
    fixing: { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa", subtext: "#3b82f6" },
    rewriting: { border: "#a855f7", bg: "rgba(168, 85, 247, 0.12)", text: "#c084fc", subtext: "#a855f7" },
    idle: { border: "rgba(94, 234, 212, 0.2)", bg: "transparent", text: "rgba(94, 234, 212, 0.3)", subtext: "transparent" }
  } : {
    working: { border: "#e5e5e5", bg: "white", text: "#171717", subtext: "#3b82f6" },
    completed: { border: "#d1fae5", bg: "white", text: "#10b981", subtext: "#10b981" },
    needs_approval: { border: "#fcd34d", bg: "white", text: "#171717", subtext: "#e07020" },
    needs_resolve: { border: "#fcd34d", bg: "white", text: "#171717", subtext: "#e07020" },
    failed: { border: "#fecaca", bg: "white", text: "#dc2626", subtext: "#ef4444" },
    fixing: { border: "#bfdbfe", bg: "white", text: "#2563eb", subtext: "#3b82f6" },
    rewriting: { border: "#e9d5ff", bg: "white", text: "#7c3aed", subtext: "#a855f7" },
    idle: { border: "#e5e5e5", bg: "white", text: "#a3a3a3", subtext: "transparent" }
  };

  const colors = stateColors[task.status] || stateColors.idle;
  const exitDelay = isCollapsing && collapseIndex !== undefined ? collapseIndex * 0.07 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)", x: 0, y: 0 }}
      animate={isCollapsing ? {
        opacity: 0,
        scale: 0.92,
        filter: "blur(8px)",
        x: mirrored ? -20 : 20,
        y: -12,
        transition: { duration: 0.5, delay: exitDelay, ease: [0.32, 0.72, 0, 1] }
      } : {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0
      }}
      exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)", x: mirrored ? -20 : 20, y: -12, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col gap-1"
      style={{ alignItems: mirrored ? "flex-end" : "flex-start", position: "relative", willChange: "transform, opacity, filter" }}
    >
      {(isCompleted || isFailed || isFixing || isRewriting || (task.subtext && (isWorking || needsApproval || needsResolve))) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            position: "absolute",
            top: -12,
            left: mirrored ? "auto" : 8,
            right: mirrored ? 8 : "auto",
            fontSize: isRetro ? 9 : 10,
            letterSpacing: isRetro ? "0.08em" : undefined,
            padding: "4px 10px",
            background: isCompleted ? theme.success : colors.subtext,
            color: isRetro ? (isCompleted || isFailed || isFixing || isRewriting || needsApproval || needsResolve || isWorking ? "#000" : colors.text) : "white",
            width: "fit-content",
            fontWeight: isRetro ? 700 : 600,
            zIndex: 10,
            borderRadius: isRetro ? 0 : 4
          }}
        >
          {isCompleted ? (isRetro ? "✓ DONE" : "✓ Done") : isFailed ? (isRetro ? "✕ FAILED" : "✕ Failed") : isFixing ? (isRetro ? "⟳ FIXING..." : "⟳ Fixing...") : isRewriting ? (isRetro ? "↺ REWRITING..." : "↺ Rewriting...") : needsApproval ? (isRetro ? "⚡ APPROVAL REQUIRED" : "Approval Required") : needsResolve ? (isRetro ? "⚡ ACTION REQUIRED" : "Action Required") : (isRetro ? task.subtext?.toUpperCase() : task.subtext)}
        </motion.div>
      )}

      <motion.div
        animate={{ borderColor: colors.border, backgroundColor: colors.bg }}
        transition={{ duration: 0.3 }}
        style={{ border: isRetro ? "2px solid" : "1px solid", padding: "16px 20px", minWidth: isRetro ? 320 : 300, position: "relative", overflow: "hidden", borderRadius: theme.borderRadius, boxShadow: theme.shadow }}
      >
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} style={{ background: isRetro ? "rgba(16, 185, 129, 0.15)" : "#dcfce7", color: isRetro ? "#10b981" : "#16a34a", fontSize: isRetro ? 14 : 12, width: isRetro ? 18 : 24, height: isRetro ? 18 : 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: isRetro ? 0 : 6, textAlign: "center" as const, fontWeight: 600 }}>✓</motion.div>
          ) : isFailed ? (
            isRetro ? (
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", fontSize: 12, fontWeight: 700 }}>✕</motion.div>
            ) : (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ width: 24, height: 24, borderRadius: 6, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", fontSize: 12, fontWeight: 600 }}>✕</motion.div>
            )
          ) : isFixing ? (
            isRetro ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 14, height: 14, border: "2px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%" }} />
            ) : (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 12, height: 12, border: "2px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%" }} />
              </div>
            )
          ) : isRewriting ? (
            isRetro ? (
              <motion.div style={{ position: "relative", width: 14, height: 14 }}>
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: 0, border: "2px solid #a855f7", borderTopColor: "transparent", borderRadius: "50%" }} />
                <motion.div animate={{ scale: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 4, height: 4, background: "#a855f7", borderRadius: "50%" }} />
              </motion.div>
            ) : (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div style={{ position: "relative", width: 14, height: 14 }}>
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: 0, border: "2px solid #a855f7", borderTopColor: "transparent", borderRadius: "50%" }} />
                  <motion.div animate={{ scale: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 4, height: 4, background: "#a855f7", borderRadius: "50%" }} />
                </motion.div>
              </div>
            )
          ) : needsApproval || needsResolve ? (
            isRetro ? (
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 10, height: 10, borderRadius: "50%", background: "#e07020", boxShadow: "0 0 10px rgba(224, 112, 32, 0.6)" }} />
            ) : (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 24, height: 24, borderRadius: 6, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e07020" }} />
              </motion.div>
            )
          ) : isWorking ? (
            isRetro ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {[0, 1, 2, 3].map(i => (
                  <motion.div key={i} animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} style={{ width: 4, height: 4, background: "#5eead4" }} />
                ))}
              </div>
            ) : (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} style={{ width: 3, height: 3, borderRadius: "50%", background: "#3b82f6" }} />
                ))}
              </div>
            )
          ) : (
            <div style={{ width: isRetro ? 14 : 24, height: isRetro ? 14 : 24, border: `1px solid ${isRetro ? "rgba(94, 234, 212, 0.2)" : "#e5e5e5"}`, borderRadius: isRetro ? 0 : 6 }} />
          )}

          <span style={{ fontSize: isRetro ? 13 : 14, letterSpacing: isRetro ? "0.06em" : undefined, color: colors.text, fontWeight: isRetro ? 600 : 500 }}>{task.label}</span>
        </div>

        {isCompleted && task.subtext && (
          <div style={{ marginTop: 8, marginLeft: isRetro ? 25 : 36, fontSize: isRetro ? 10 : 13, color: isRetro ? "rgba(16, 185, 129, 0.6)" : "#6b7280", letterSpacing: isRetro ? "0.05em" : undefined }}>{task.subtext}</div>
        )}

        {needsApproval && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ delay: 0.2, duration: 0.3 }}>
            {task.subtext && (
              <div style={{ marginTop: 12, padding: "10px 12px", background: isRetro ? "rgba(224, 112, 32, 0.1)" : "#fffbeb", border: `1px solid ${isRetro ? "rgba(224, 112, 32, 0.2)" : "#fef3c7"}`, fontSize: isRetro ? 11 : 13, color: isRetro ? "#fcd34d" : "#92400e", letterSpacing: isRetro ? "0.04em" : undefined, borderRadius: isRetro ? 0 : 8 }}>{task.subtext}</div>
            )}
            <div style={{ display: "flex", gap: isRetro ? 10 : 8, marginTop: 14 }}>
              <button
                onClick={onApprove}
                style={{ flex: 1, background: isRetro ? "rgba(94, 234, 212, 0.15)" : "#3b82f6", border: isRetro ? "2px solid rgba(94, 234, 212, 0.4)" : "none", color: isRetro ? "#5eead4" : "white", padding: isRetro ? "12px 20px" : "10px 16px", fontSize: isRetro ? 11 : 13, letterSpacing: isRetro ? "0.1em" : undefined, cursor: "pointer", fontFamily: isRetro ? "monospace" : undefined, fontWeight: isRetro ? 700 : 600, borderRadius: isRetro ? 0 : 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isRetro ? "rgba(94, 234, 212, 0.25)" : "#2563eb"; if (isRetro) e.currentTarget.style.boxShadow = "0 0 20px rgba(94, 234, 212, 0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isRetro ? "rgba(94, 234, 212, 0.15)" : "#3b82f6"; if (isRetro) e.currentTarget.style.boxShadow = "none"; }}
              >{isRetro ? "✓ APPROVE" : "Approve"}</button>
              <button
                onClick={onReject}
                style={{ background: isRetro ? "transparent" : "white", border: isRetro ? "2px solid rgba(239, 68, 68, 0.3)" : "1px solid #e5e5e5", color: isRetro ? "#f87171" : "#525252", padding: isRetro ? "12px 20px" : "10px 16px", fontSize: isRetro ? 11 : 13, letterSpacing: isRetro ? "0.1em" : undefined, cursor: "pointer", fontFamily: isRetro ? "monospace" : undefined, fontWeight: isRetro ? 700 : 500, borderRadius: isRetro ? 0 : 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isRetro ? "rgba(239, 68, 68, 0.1)" : "#f5f5f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isRetro ? "transparent" : "white"; }}
              >{isRetro ? "✕ REJECT" : "Reject"}</button>
            </div>
          </motion.div>
        )}

        {needsResolve && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ delay: 0.2, duration: 0.3 }}>
            {task.subtext && (
              <div style={{ marginTop: 12, padding: "10px 12px", background: isRetro ? "rgba(224, 112, 32, 0.1)" : "#fffbeb", border: `1px solid ${isRetro ? "rgba(224, 112, 32, 0.2)" : "#fef3c7"}`, fontSize: isRetro ? 11 : 13, color: isRetro ? "#fcd34d" : "#92400e", letterSpacing: isRetro ? "0.04em" : undefined, borderRadius: isRetro ? 0 : 8 }}>{task.subtext}</div>
            )}
            <div style={{ marginTop: 20 }}>
              <button
                onClick={onResolve}
                style={{ width: "100%", background: isRetro ? "rgba(224, 112, 32, 0.15)" : "#e07020", border: isRetro ? "2px solid rgba(224, 112, 32, 0.5)" : "none", color: isRetro ? "#f0a050" : "white", padding: isRetro ? "12px 20px" : "10px 16px", fontSize: isRetro ? 11 : 13, letterSpacing: isRetro ? "0.1em" : undefined, cursor: "pointer", fontFamily: isRetro ? "monospace" : undefined, fontWeight: isRetro ? 700 : 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: isRetro ? 0 : 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isRetro ? "rgba(224, 112, 32, 0.25)" : "#d97706"; if (isRetro) e.currentTarget.style.boxShadow = "0 0 20px rgba(224, 112, 32, 0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isRetro ? "rgba(224, 112, 32, 0.15)" : "#e07020"; if (isRetro) e.currentTarget.style.boxShadow = "none"; }}
              >
                {isRetro ? "REVIEW" : "Review"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Container component that wraps workflow branch tasks
function WorkflowBranchContainer({
  children,
  scenarioLabel,
  isActive,
  isCollapsing,
  isCleanComplete,
  mirrored
}: {
  children: React.ReactNode;
  scenarioLabel: string;
  isActive: boolean;
  isCollapsing: boolean;
  isCleanComplete?: boolean;
  mirrored?: boolean;
}) {
  const theme = useContext(ThemeContext);

  // Show container if active, has label, or showing clean complete state
  if (!isActive && !scenarioLabel && !isCleanComplete) return null;

  // Colors based on state
  const borderColor = isCleanComplete ? "rgba(16, 185, 129, 0.4)" : "rgba(94, 234, 212, 0.25)";
  const bgColor = isCleanComplete ? "rgba(16, 185, 129, 0.06)" : "rgba(94, 234, 212, 0.03)";
  const accentColor = isCleanComplete ? "#10b981" : theme.accent;
  const glowColor = isCleanComplete ? "0 0 8px rgba(16, 185, 129, 0.6)" : theme.glowAccent;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{
        opacity: isCollapsing && !isCleanComplete ? 0 : 1,
        scale: isCollapsing && !isCleanComplete ? 0.97 : 1
      }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1]
      }}
      style={{
        position: "relative",
        border: `1px solid ${borderColor}`,
        background: bgColor,
        padding: 0,
        boxShadow: isCleanComplete ? "0 0 20px rgba(16, 185, 129, 0.15)" : "none",
      }}
    >
      {/* Header */}
      {(scenarioLabel || isCleanComplete) && (
        <div
          style={{
            borderBottom: `1px solid ${isCleanComplete ? "rgba(16, 185, 129, 0.2)" : "rgba(94, 234, 212, 0.15)"}`,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexDirection: mirrored ? "row-reverse" : "row",
          }}
        >
          {isCleanComplete ? (
            // Checkmark for complete state
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{
                width: 14,
                height: 14,
                background: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
              }}
            >
              <span style={{ color: "#000", fontSize: 10, fontWeight: 900 }}>✓</span>
            </motion.div>
          ) : (
            // Pulsing dot for active state
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                background: accentColor,
                boxShadow: glowColor,
              }}
            />
          )}
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              color: isCleanComplete ? "#10b981" : theme.textMuted,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {isCleanComplete ? "SYSTEM OPTIMIZED" : scenarioLabel}
          </span>
        </div>
      )}

      {/* Corner accents */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}`, opacity: 0.6 }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderTop: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, opacity: 0.6 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 8, height: 8, borderBottom: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}`, opacity: 0.6 }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, opacity: 0.6 }} />

      {/* Content */}
      <div style={{ padding: "12px 16px" }}>
        {isCleanComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "16px 24px",
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(16, 185, 129, 0.7)", letterSpacing: "0.08em" }}>
              ALL ISSUES RESOLVED
            </span>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>0</div>
                <div style={{ fontSize: 9, color: "rgba(16, 185, 129, 0.5)", letterSpacing: "0.1em" }}>ERRORS</div>
              </div>
              <div style={{ width: 1, background: "rgba(16, 185, 129, 0.2)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>100%</div>
                <div style={{ fontSize: 9, color: "rgba(16, 185, 129, 0.5)", letterSpacing: "0.1em" }}>HEALTH</div>
              </div>
            </div>
          </motion.div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

// Email preview sub-workflow component
function EmailPreviewPanel({
  isActive,
  isCollapsing,
  onApprove,
  mirrored
}: {
  isActive: boolean;
  isCollapsing: boolean;
  onApprove: () => void;
  mirrored?: boolean;
}) {
  const theme = useContext(ThemeContext);
  const isRetro = true; // Always retro mode

  // Editable email content state
  const [subject, setSubject] = useState("Your exclusive 20% off awaits!");
  const [body, setBody] = useState("Hi valued customer,\n\nWe noticed you've been eyeing some items in your cart. Here's a special 20% discount just for you!\n\nUse code: SAVE20\n\nOffer expires in 48 hours.");

  if (!isActive) return null;

  // For mirrored (left side): [Content] [Connection →] where connection goes right to task
  // For normal (right side): [← Connection] [Content] where connection goes left to task

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-1"
      style={{ alignItems: mirrored ? "flex-end" : "flex-start", position: "relative" }}
    >
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} style={{ position: "absolute", top: -12, left: mirrored ? "auto" : 8, right: mirrored ? 8 : "auto", fontSize: isRetro ? 9 : 10, letterSpacing: isRetro ? "0.08em" : undefined, padding: "4px 10px", background: theme.warning, color: isRetro ? "#000" : "white", width: "fit-content", fontWeight: isRetro ? 700 : 600, zIndex: 10, borderRadius: isRetro ? 0 : 4 }}>
        {isRetro ? "REVIEW EMAIL COPY" : "Review email copy"}
      </motion.div>
      <motion.div
        onWheel={(e) => e.stopPropagation()}
        style={{ border: isRetro ? "2px solid rgba(224, 112, 32, 0.5)" : "1px solid #fef3c7", background: isRetro ? "rgba(224, 112, 32, 0.08)" : "white", padding: "16px 20px", minWidth: isRetro ? 320 : 300, maxWidth: isRetro ? 360 : 340, position: "relative", overflow: "hidden", borderRadius: theme.borderRadius, boxShadow: theme.shadow }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: isRetro ? 9 : 11, color: isRetro ? "rgba(224, 112, 32, 0.5)" : "#a3a3a3", letterSpacing: isRetro ? "0.1em" : undefined, marginBottom: 4 }}>{isRetro ? "SUBJECT" : "Subject"}</div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: "100%",
              fontSize: isRetro ? 12 : 13,
              color: isRetro ? "#f0a050" : "#171717",
              fontWeight: 600,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "inherit",
              padding: 0
            }}
          />
        </div>
        <div style={{ background: isRetro ? "rgba(0, 0, 0, 0.3)" : "#f5f5f5", border: `1px solid ${isRetro ? "rgba(224, 112, 32, 0.2)" : "#e5e5e5"}`, padding: 12, marginBottom: 14, borderRadius: isRetro ? 0 : 8 }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{
              width: "100%",
              minHeight: 120,
              fontSize: isRetro ? 10 : 12,
              color: isRetro ? "rgba(255, 255, 255, 0.7)" : "#525252",
              lineHeight: 1.6,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "inherit",
              padding: 0,
              resize: "vertical"
            }}
          />
        </div>
        <button
          onClick={onApprove}
          style={{ width: "100%", background: isRetro ? "rgba(94, 234, 212, 0.15)" : "#3b82f6", border: isRetro ? "2px solid rgba(94, 234, 212, 0.4)" : "none", color: isRetro ? "#5eead4" : "white", padding: isRetro ? "12px 20px" : "10px 16px", fontSize: isRetro ? 11 : 13, letterSpacing: isRetro ? "0.1em" : undefined, cursor: "pointer", fontFamily: isRetro ? "monospace" : undefined, fontWeight: isRetro ? 700 : 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: isRetro ? 0 : 8 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = isRetro ? "rgba(94, 234, 212, 0.25)" : "#2563eb"; if (isRetro) e.currentTarget.style.boxShadow = "0 0 20px rgba(94, 234, 212, 0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isRetro ? "rgba(94, 234, 212, 0.15)" : "#3b82f6"; if (isRetro) e.currentTarget.style.boxShadow = "none"; }}
        >
          {isRetro ? "✓ APPROVE COPY" : "Approve copy"}
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
      animate={isCollapsing ? {
        opacity: 0,
        scale: 0.96,
        filter: "blur(4px)",
        transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
      } : {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
      }}
      className="flex items-start"
      style={{ willChange: "transform, opacity, filter" }}
    >
      {mirrored && (
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={isCollapsing ? { opacity: 0, x: -15, transition: { duration: 0.3 } } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginTop: TASK_CONNECTION_Y }}
        >
          {content}
        </motion.div>
      )}
      
      {/* Connection line at TASK_CONNECTION_Y (where main workflow line hits the task row) */}
      <div className="relative" style={{ width: SUB_CONNECTION_WIDTH, height: 400 }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
          <motion.path
            d={mirrored ? `M ${SUB_CONNECTION_WIDTH - 4} ${TASK_CONNECTION_Y} L 4 ${TASK_CONNECTION_Y}` : `M 4 ${TASK_CONNECTION_Y} L ${SUB_CONNECTION_WIDTH - 4} ${TASK_CONNECTION_Y}`}
            fill="none"
            stroke={isRetro ? "rgba(224, 112, 32, 0.4)" : "#fcd34d"}
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isCollapsing ? 0 : 1 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </svg>
        {!isCollapsing && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }} style={{ position: "absolute", left: mirrored ? SUB_CONNECTION_WIDTH - 6 : 2, top: TASK_CONNECTION_Y - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: "#e07020", boxShadow: isRetro ? theme.glowWarning : "none" }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }} style={{ position: "absolute", left: mirrored ? 2 : SUB_CONNECTION_WIDTH - 6, top: TASK_CONNECTION_Y - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: "#e07020", boxShadow: isRetro ? theme.glowWarning : "none" }} />
          </>
        )}
      </div>

      {!mirrored && (
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={isCollapsing ? { opacity: 0, x: 15, transition: { duration: 0.3 } } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginTop: TASK_CONNECTION_Y }}
        >
          {content}
        </motion.div>
      )}
    </motion.div>
  );
}

// Insights preview sub-workflow component
function InsightsPreviewPanel({ 
  isActive, 
  isCollapsing,
  onApprove,
  mirrored
}: { 
  isActive: boolean; 
  isCollapsing: boolean;
  onApprove: () => void;
  mirrored?: boolean;
}) {
  const theme = useContext(ThemeContext);
  const isRetro = true; // Always retro mode
  
  if (!isActive) return null;

  const insightsContent = (
    <motion.div
      initial={{ opacity: 0, x: mirrored ? -15 : 15 }}
      animate={isCollapsing ? { opacity: 0, x: mirrored ? -15 : 15, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-1"
      style={{ alignItems: mirrored ? "flex-end" : "flex-start", position: "relative" }}
    >
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} style={{ position: "absolute", top: -12, left: mirrored ? "auto" : 8, right: mirrored ? 8 : "auto", fontSize: isRetro ? 9 : 10, letterSpacing: isRetro ? "0.08em" : undefined, padding: "4px 10px", background: theme.warning, color: isRetro ? "#000" : "white", width: "fit-content", fontWeight: isRetro ? 700 : 600, zIndex: 10, borderRadius: isRetro ? 0 : 4 }}>{isRetro ? "REVIEW INSIGHTS" : "Review insights"}</motion.div>
      <motion.div onWheel={(e) => e.stopPropagation()} style={{ border: isRetro ? "2px solid rgba(224, 112, 32, 0.5)" : "1px solid #fef3c7", background: isRetro ? "rgba(224, 112, 32, 0.08)" : "white", padding: "16px 20px", minWidth: isRetro ? 320 : 300, maxWidth: isRetro ? 360 : 340, position: "relative", overflow: "hidden", borderRadius: theme.borderRadius, boxShadow: theme.shadow }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: isRetro ? 9 : 11, color: isRetro ? "rgba(224, 112, 32, 0.5)" : "#a3a3a3", letterSpacing: isRetro ? "0.1em" : undefined, marginBottom: 8 }}>{isRetro ? "KEY FINDINGS" : "Key findings"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: isRetro ? 8 : 6 }}>
            {[{ metric: "Revenue", value: "+23%", trend: "up" },{ metric: "Orders", value: "+18%", trend: "up" },{ metric: "AOV", value: "$127", trend: "up" },{ metric: "Returns", value: "-5%", trend: "down" },{ metric: "New Customers", value: "+31%", trend: "up" }].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isRetro ? "6px 10px" : "8px 12px", background: isRetro ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5", border: isRetro ? "1px solid rgba(224, 112, 32, 0.15)" : undefined, borderRadius: isRetro ? 0 : 6 }}>
                <span style={{ fontSize: isRetro ? 10 : 12, color: isRetro ? "rgba(255, 255, 255, 0.6)" : "#525252" }}>{item.metric}</span>
                <span style={{ fontSize: isRetro ? 11 : 12, color: item.trend === "up" ? (isRetro ? "#5eead4" : "#16a34a") : (isRetro ? "#f87171" : "#dc2626"), fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onApprove} style={{ width: "100%", background: isRetro ? "rgba(94, 234, 212, 0.15)" : "#3b82f6", border: isRetro ? "2px solid rgba(94, 234, 212, 0.4)" : "none", color: isRetro ? "#5eead4" : "white", padding: isRetro ? "12px 20px" : "10px 16px", fontSize: isRetro ? 11 : 13, letterSpacing: isRetro ? "0.1em" : undefined, cursor: "pointer", fontFamily: isRetro ? "monospace" : undefined, fontWeight: isRetro ? 700 : 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: isRetro ? 0 : 8 }} onMouseEnter={(e) => { e.currentTarget.style.background = isRetro ? "rgba(94, 234, 212, 0.25)" : "#2563eb"; if (isRetro) e.currentTarget.style.boxShadow = "0 0 20px rgba(94, 234, 212, 0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = isRetro ? "rgba(94, 234, 212, 0.15)" : "#3b82f6"; if (isRetro) e.currentTarget.style.boxShadow = "none"; }}>{isRetro ? "✓ APPROVE INSIGHTS" : "Approve insights"}</button>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
      animate={isCollapsing ? {
        opacity: 0,
        scale: 0.96,
        filter: "blur(4px)",
        transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
      } : {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
      }}
      className="flex items-start"
      style={{ willChange: "transform, opacity, filter" }}
    >
      {mirrored && <div style={{ marginTop: TASK_CONNECTION_Y }}>{insightsContent}</div>}
      
      {/* Connection line at TASK_CONNECTION_Y (where main workflow line hits the task row) */}
      <div className="relative" style={{ width: SUB_CONNECTION_WIDTH, height: 450 }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
          <motion.path d={mirrored ? `M ${SUB_CONNECTION_WIDTH - 4} ${TASK_CONNECTION_Y} L 4 ${TASK_CONNECTION_Y}` : `M 4 ${TASK_CONNECTION_Y} L ${SUB_CONNECTION_WIDTH - 4} ${TASK_CONNECTION_Y}`} fill="none" stroke={isRetro ? "rgba(224, 112, 32, 0.4)" : "#fcd34d"} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: isCollapsing ? 0 : 1 }} transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }} />
        </svg>
        {!isCollapsing && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }} style={{ position: "absolute", left: mirrored ? SUB_CONNECTION_WIDTH - 6 : 2, top: TASK_CONNECTION_Y - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: "#e07020", boxShadow: isRetro ? theme.glowWarning : "none" }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }} style={{ position: "absolute", left: mirrored ? 2 : SUB_CONNECTION_WIDTH - 6, top: TASK_CONNECTION_Y - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: "#e07020", boxShadow: isRetro ? theme.glowWarning : "none" }} />
          </>
        )}
      </div>
      
      {!mirrored && <div style={{ marginTop: TASK_CONNECTION_Y }}>{insightsContent}</div>}
    </motion.div>
  );
}

// Sub-workflow component for step-by-step resolving
const SUB_TASK_ROW_HEIGHT = GRID_SIZE * 4; // 80px - Height for each sub-task row (aligned to grid)
const SUB_CONNECTION_WIDTH = GRID_SIZE * 4; // 80px - Width of sub-workflow connection area

function SubWorkflowPanel({ 
  isActive, 
  tasks, 
  isCollapsing,
  mirrored 
}: { 
  isActive: boolean; 
  tasks: SubWorkflowTask[]; 
  isCollapsing: boolean;
  mirrored?: boolean;
}) {
  const theme = useContext(ThemeContext);
  const isRetro = true; // Always retro mode
  
  if (!isActive && tasks.length === 0) return null;

  // First sub-task connects at TASK_CONNECTION_Y (same as parent task's connection point)
  // Subsequent tasks are spaced by SUB_TASK_ROW_HEIGHT
  const getTaskY = (i: number) => TASK_CONNECTION_Y + i * SUB_TASK_ROW_HEIGHT;

  const tasksContent = (
    <div className="flex flex-col" style={{ marginTop: TASK_CONNECTION_Y }} onWheel={(e) => e.stopPropagation()}>
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, scale: 0.96, filter: "blur(3px)" }}
          animate={isCollapsing ? {
            opacity: 0,
            scale: 0.96,
            filter: "blur(3px)",
            transition: { duration: 0.3, delay: (tasks.length - 1 - index) * 0.05, ease: [0.32, 0.72, 0, 1] }
          } : {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1], delay: index * 0.08 }}
          style={{ height: SUB_TASK_ROW_HEIGHT, display: "flex", alignItems: "center", willChange: "transform, opacity, filter" }}
        >
          <motion.div style={{ border: isRetro ? `2px solid ${task.status === "completed" ? "#10b981" : "rgba(224, 112, 32, 0.5)"}` : `1px solid ${task.status === "completed" ? "#d1fae5" : "#fef3c7"}`, background: isRetro ? (task.status === "completed" ? "rgba(16, 185, 129, 0.08)" : "rgba(224, 112, 32, 0.08)") : "white", padding: "12px 16px", minWidth: isRetro ? 240 : 220, position: "relative", overflow: "hidden", borderRadius: isRetro ? 0 : 10, boxShadow: isRetro ? "none" : "0 1px 2px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3">
              {task.status === "completed" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} style={{ background: isRetro ? "rgba(16, 185, 129, 0.15)" : "#dcfce7", color: isRetro ? "#10b981" : "#16a34a", fontSize: isRetro ? 14 : 11, width: isRetro ? 16 : 20, height: isRetro ? 16 : 20, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: isRetro ? 0 : 5, textAlign: "center" as const, fontWeight: 600 }}>✓</motion.div>
              ) : task.status === "working" ? (
                isRetro ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>{[0, 1, 2, 3].map(i => (<motion.div key={i} animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} style={{ width: 3, height: 3, background: "#e07020" }} />))}</div>
                ) : (
                  <div style={{ width: 20, height: 20, background: "#fef3c7", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>{[0, 1, 2].map(i => (<motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} style={{ width: 3, height: 3, borderRadius: "50%", background: "#e07020" }} />))}</div>
                )
              ) : (
                <div style={{ width: isRetro ? 12 : 20, height: isRetro ? 12 : 20, border: `1px solid ${isRetro ? "rgba(224, 112, 32, 0.3)" : "#e5e5e5"}`, borderRadius: isRetro ? 0 : 5 }} />
              )}
              <span style={{ fontSize: isRetro ? 11 : 13, letterSpacing: isRetro ? "0.05em" : undefined, color: task.status === "completed" ? (isRetro ? "#10b981" : "#10b981") : (isRetro ? "#f0a050" : "#171717"), fontWeight: isRetro ? 600 : 500 }}>{task.label}</span>
            </div>
            {task.subtext && (<div style={{ marginTop: 6, marginLeft: isRetro ? 25 : 32, fontSize: isRetro ? 9 : 12, color: task.status === "completed" ? (isRetro ? "rgba(16, 185, 129, 0.6)" : "#6b7280") : (isRetro ? "rgba(224, 112, 32, 0.6)" : "#a3a3a3"), letterSpacing: isRetro ? "0.04em" : undefined }}>{task.subtext}</div>)}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );

  const totalHeight = Math.max(200, getTaskY(tasks.length - 1) + SUB_TASK_ROW_HEIGHT / 2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
      animate={isCollapsing ? {
        opacity: 0,
        scale: 0.96,
        filter: "blur(4px)",
        transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
      } : {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
      }}
      className="flex items-start"
      style={{ willChange: "transform, opacity, filter" }}
    >
      {mirrored && tasksContent}
      
      {/* Connection line from parent task - all at TASK_CONNECTION_Y to match parent task's connection point */}
      <div className="relative" style={{ width: SUB_CONNECTION_WIDTH, height: totalHeight }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
          {/* Main horizontal connection from parent task */}
          <motion.path d={mirrored ? `M ${SUB_CONNECTION_WIDTH - 4} ${TASK_CONNECTION_Y} L ${SUB_CONNECTION_WIDTH / 2} ${TASK_CONNECTION_Y}` : `M 4 ${TASK_CONNECTION_Y} L ${SUB_CONNECTION_WIDTH / 2} ${TASK_CONNECTION_Y}`} fill="none" stroke={isRetro ? "rgba(224, 112, 32, 0.4)" : "#fcd34d"} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: isCollapsing ? 0 : 1 }} transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }} />
          {/* Vertical line connecting all sub-tasks */}
          {tasks.length > 1 && (<motion.path d={`M ${SUB_CONNECTION_WIDTH / 2} ${TASK_CONNECTION_Y} L ${SUB_CONNECTION_WIDTH / 2} ${getTaskY(tasks.length - 1)}`} fill="none" stroke={isRetro ? "rgba(224, 112, 32, 0.25)" : "#e5e5e5"} strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: isCollapsing ? 0 : 1 }} transition={{ duration: 0.35, delay: 0.1 }} />)}
          {/* Horizontal lines to each sub-task */}
          {tasks.map((_, i) => (<motion.path key={i} d={mirrored ? `M 4 ${getTaskY(i)} L ${SUB_CONNECTION_WIDTH / 2} ${getTaskY(i)}` : `M ${SUB_CONNECTION_WIDTH / 2} ${getTaskY(i)} L ${SUB_CONNECTION_WIDTH - 4} ${getTaskY(i)}`} fill="none" stroke={isRetro ? "rgba(224, 112, 32, 0.3)" : "#fcd34d"} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: isCollapsing ? 0 : 1 }} transition={{ duration: 0.3, delay: 0.05 + i * 0.06 }} />))}
        </svg>
        
        {!isCollapsing && (
          <>
            {/* Start node (connects to parent task) */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: "absolute", left: mirrored ? SUB_CONNECTION_WIDTH - 6 : 2, top: TASK_CONNECTION_Y - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: "#e07020", boxShadow: isRetro ? theme.glowWarning : "none" }} />
            {/* Junction node */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: "absolute", left: GRID_SIZE * 2, top: TASK_CONNECTION_Y - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: "#e07020", boxShadow: isRetro ? theme.glowWarning : "none" }} />
            {/* Task nodes */}
            {tasks.map((task, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + i * 0.1 }} style={{ position: "absolute", left: mirrored ? 2 : SUB_CONNECTION_WIDTH - 6, top: getTaskY(i) - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: task.status === "working" ? "#e07020" : task.status === "completed" ? (isRetro ? "rgba(94, 234, 212, 0.5)" : "#10b981") : (isRetro ? "rgba(224, 112, 32, 0.4)" : "#d4d4d4"), boxShadow: isRetro && task.status === "working" ? theme.glowWarning : "none" }} />
            ))}
          </>
        )}
      </div>
      
      {!mirrored && tasksContent}
    </motion.div>
  );
}

// Interface for workflow state
interface WorkflowState {
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

const initialWorkflowState: WorkflowState = {
  isRunning: false,
  tasks: [],
  lineProgress: 0,
  awaitingApproval: false,
  isCompleted: false,
  isCollapsing: false,
  completedScenarioLabel: "",
  currentScenarioLabel: "",
  subWorkflowActive: false,
  subWorkflowTasks: [],
  subWorkflowCollapsing: false,
  resolveTaskIndex: null,
  resolveType: null,
  insightsApplied: false,
  deepCleanComplete: false,
};

export default function Home() {
  // Theme is now a global constant (retro only)
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Separate state for left and right workflows
  const [leftWorkflow, setLeftWorkflow] = useState<WorkflowState>(initialWorkflowState);
  const [rightWorkflow, setRightWorkflow] = useState<WorkflowState>(initialWorkflowState);

  const [deepCleanMode, setDeepCleanMode] = useState<"idle" | "running" | "collapsing" | "complete">("idle");
  const deepCleanTaskCounterRef = useRef({ left: 0, right: 0 });
  
  const leftScenarioRef = useRef<Scenario | null>(null);
  const rightScenarioRef = useRef<Scenario | null>(null);
  const leftTaskIndexRef = useRef(0);
  const rightTaskIndexRef = useRef(0);
  const leftSubTaskIndexRef = useRef(0);
  const rightSubTaskIndexRef = useRef(0);

  const accentColor = theme.accent;

  const zoomSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scrollAmount = Math.abs(e.deltaY);
    const sensitivity = 0.001;
    const zoomFactor = 1 + (scrollAmount * sensitivity);
    const delta = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
    const oldZoom = zoomRef.current;
    const newZoom = Math.min(Math.max(oldZoom * delta, 0.25), 3);

    // Get mouse position relative to viewport center
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;
    const mouseX = e.clientX - rect.left - viewportCenterX;
    const mouseY = e.clientY - rect.top - viewportCenterY;

    // Adjust pan to zoom toward mouse position
    const zoomRatio = newZoom / oldZoom;
    const newPanX = mouseX - (mouseX - panRef.current.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - panRef.current.y) * zoomRatio;

    zoomRef.current = newZoom;
    panRef.current = { x: newPanX, y: newPanY };

    // Direct DOM manipulation - no React re-render during scroll
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${newPanX}px, ${newPanY}px) scale(${newZoom})`;
    }

    // Debounced sync to React state (for UI display)
    if (zoomSyncTimeoutRef.current) {
      clearTimeout(zoomSyncTimeoutRef.current);
    }
    zoomSyncTimeoutRef.current = setTimeout(() => {
      setZoom(zoomRef.current);
      setPan(panRef.current);
    }, 150);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isPanningRef.current = true;
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const newX = e.clientX - startPanRef.current.x;
      const newY = e.clientY - startPanRef.current.y;
      panRef.current = { x: newX, y: newY };

      // Direct DOM manipulation - no React re-render
      // Grid is inside canvas now, so only need to update canvas transform
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${zoomRef.current})`;
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
      // Sync React state with final position
      setPan(panRef.current);
    }
  }, []);

  // Keep refs in sync with state (for reset/zoom buttons)
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Set initial canvas transform on mount (never let React control transform)
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`;
    }
  }, []);

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  // Create workflow handlers for a specific side
  const createWorkflowHandlers = useCallback((side: WorkflowSide) => {
    const setWorkflow = side === "left" ? setLeftWorkflow : setRightWorkflow;
    const scenarioRef = side === "left" ? leftScenarioRef : rightScenarioRef;
    const taskIndexRef = side === "left" ? leftTaskIndexRef : rightTaskIndexRef;
    const subTaskIndexRef = side === "left" ? leftSubTaskIndexRef : rightSubTaskIndexRef;
    const workflow = side === "left" ? leftWorkflow : rightWorkflow;

    const triggerCompletion = () => {
      const scenario = scenarioRef.current;
      if (!scenario) return;

      // Check current state and trigger collapse if all tasks are completed
      setWorkflow(prev => {
        // Don't collapse if any tasks still need approval or resolve or are working
        const hasPendingReviews = prev.tasks.some(t =>
          t.status === "needs_approval" || t.status === "needs_resolve" || t.status === "working"
        );
        if (hasPendingReviews) return prev;

        // All tasks completed - clear tasks and show completed widget after brief delay
        setTimeout(() => {
          setWorkflow(p => ({ ...p, tasks: [], isCollapsing: false, isCompleted: true, isRunning: false, currentScenarioLabel: "" }));
        }, 400); // Wait for exit animation

        return { ...prev, completedScenarioLabel: scenario.buttonLabel, isCollapsing: true };
      });
    };

    // Schedule a task's completion (with optional failure/recovery or rewriting)
    const scheduleTaskCompletion = (taskIndex: number, taskDef: typeof scenarios[0]["tasks"][0], baseDelay: number) => {
      const randomOutcome = Math.random();
      const shouldFail = randomOutcome < 0.10; // 10% chance of failure
      const shouldRewrite = randomOutcome >= 0.10 && randomOutcome < 0.55; // 45% chance of rewriting

      if (shouldFail && taskDef.duration >= 1500) {
        // Fail after partial duration, then recover
        const failAfter = baseDelay + taskDef.duration * 0.4;
        setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "failed" as TaskState, subtext: "Error encountered" } : t)
          }));

          setTimeout(() => {
            setWorkflow(prev => ({
              ...prev,
              tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "fixing" as TaskState, subtext: "Auto-recovering..." } : t)
            }));

            setTimeout(() => {
              setWorkflow(prev => ({
                ...prev,
                tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "completed" as TaskState, subtext: taskDef.subtext } : t)
              }));
            }, 1500);
          }, 1200);
        }, failAfter);
      } else if (shouldRewrite && taskDef.duration >= 1200) {
        // Rewrite/restructure after partial duration
        const rewriteAfter = baseDelay + taskDef.duration * 0.5;
        setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "rewriting" as TaskState, subtext: "Restructuring..." } : t)
          }));

          setTimeout(() => {
            setWorkflow(prev => ({
              ...prev,
              tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "working" as TaskState, subtext: "Rebuilding..." } : t)
            }));

            setTimeout(() => {
              setWorkflow(prev => ({
                ...prev,
                tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "completed" as TaskState, subtext: taskDef.subtext } : t)
              }));
            }, 2500);
          }, 4000);
        }, rewriteAfter);
      } else {
        // Normal completion
        setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "completed" as TaskState } : t)
          }));
        }, baseDelay + taskDef.duration);
      }
    };

    const addNextTask = () => {
      const scenario = scenarioRef.current;
      if (!scenario || taskIndexRef.current >= scenario.tasks.length) {
        triggerCompletion();
        return;
      }

      // Spawn all tasks until we hit an approval/resolve task
      let spawnIndex = taskIndexRef.current;
      let spawnDelay = 0;
      const tasksToSpawn: { index: number; def: typeof scenario.tasks[0]; delay: number }[] = [];

      while (spawnIndex < scenario.tasks.length) {
        const taskDef = scenario.tasks[spawnIndex];
        tasksToSpawn.push({ index: spawnIndex, def: taskDef, delay: spawnDelay });

        if (taskDef.requiresApproval || taskDef.requiresResolve) {
          break; // Stop spawning at approval/resolve tasks
        }

        spawnIndex++;
        spawnDelay += 300; // Stagger spawn by 300ms
      }

      // Spawn all tasks with staggered delays
      tasksToSpawn.forEach(({ index, def, delay }) => {
        setTimeout(() => {
          const newTask: Task = {
            id: `${side}-task-${index}`,
            label: def.label,
            subtext: def.subtext,
            status: def.requiresApproval ? "needs_approval" : def.requiresResolve ? "needs_resolve" : "working",
            requiresApproval: def.requiresApproval,
            requiresResolve: def.requiresResolve,
            resolveType: def.resolveType
          };

          setWorkflow(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));

          if (def.requiresApproval || def.requiresResolve) {
            setWorkflow(prev => ({ ...prev, awaitingApproval: true }));
            taskIndexRef.current = index; // Set to approval task index
          } else {
            // Schedule this task's completion independently
            scheduleTaskCompletion(index, def, 0);
          }
        }, delay);
      });

      // Update taskIndexRef to after the last spawned task (or the approval task)
      const lastTask = tasksToSpawn[tasksToSpawn.length - 1];
      if (lastTask && !lastTask.def.requiresApproval && !lastTask.def.requiresResolve) {
        // Calculate when all parallel tasks complete, then check for more
        const maxCompletionTime = Math.max(...tasksToSpawn.map(t => t.delay + t.def.duration + (Math.random() < 0.25 && t.def.duration >= 1500 ? 2700 : 0)));
        setTimeout(() => {
          taskIndexRef.current = spawnIndex;
          addNextTask();
        }, maxCompletionTime + 400);
      }
    };

    const handleApprove = () => {
      // Find the first task that needs approval
      setWorkflow(prev => {
        const approvalIndex = prev.tasks.findIndex(t => t.status === "needs_approval");
        if (approvalIndex === -1) return prev;
        taskIndexRef.current = approvalIndex; // Sync the ref
        return {
          ...prev,
          awaitingApproval: false,
          tasks: prev.tasks.map((t, i) => i === approvalIndex ? { ...t, status: "working" as TaskState, subtext: "Processing..." } : t)
        };
      });
      setTimeout(() => {
        setWorkflow(prev => {
          const processingIndex = prev.tasks.findIndex(t => t.status === "working" && t.subtext === "Processing...");
          if (processingIndex === -1) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map((t, i) => i === processingIndex ? { ...t, status: "completed" as TaskState } : t)
          };
        });
        taskIndexRef.current++;
        setTimeout(addNextTask, 400);
      }, 1000);
    };

    const handleReject = () => {
      setWorkflow(prev => ({
        ...prev,
        tasks: prev.tasks.slice(0, -1),
        awaitingApproval: false,
        isRunning: false
      }));
    };

    const completeSubWorkflow = (completedSubtext: string) => {
      const indexToComplete = taskIndexRef.current; // Capture index before async
      setWorkflow(prev => ({ ...prev, subWorkflowCollapsing: true }));
      setTimeout(() => {
        setWorkflow(prev => ({
          ...prev,
          subWorkflowActive: false,
          subWorkflowTasks: [],
          subWorkflowCollapsing: false,
          resolveTaskIndex: null,
          resolveType: null,
          awaitingApproval: false, // Reset so energy flows again
          tasks: prev.tasks.map((t, i) => i === indexToComplete ? { ...t, status: "completed" as TaskState, subtext: completedSubtext } : t)
        }));
        taskIndexRef.current++;
        subTaskIndexRef.current = 0;
        setTimeout(addNextTask, 400);
      }, 600);
    };

    const runSubWorkflow = (type: string) => {
      const config = subWorkflowConfigs[type];
      if (!config || config.tasks.length === 0) return;
      
      const subTask = config.tasks[subTaskIndexRef.current];
      if (!subTask) {
        completeSubWorkflow("Issue resolved");
        return;
      }

      const newSubTask: SubWorkflowTask = {
        id: `${side}-subtask-${subTaskIndexRef.current}`,
        label: subTask.label,
        subtext: subTask.subtext,
        status: "working"
      };

      setWorkflow(prev => ({ ...prev, subWorkflowTasks: [...prev.subWorkflowTasks, newSubTask] }));

      setTimeout(() => {
        setWorkflow(prev => ({
          ...prev,
          subWorkflowTasks: prev.subWorkflowTasks.map((t, i) => i === subTaskIndexRef.current ? { ...t, status: "completed" as TaskState } : t)
        }));
        subTaskIndexRef.current++;
        setTimeout(() => runSubWorkflow(type), 300);
      }, subTask.duration);
    };

    const handleResolve = () => {
      const currentIndex = taskIndexRef.current; // Capture index before async
      setWorkflow(prev => {
        const currentTask = prev.tasks[currentIndex];
        const type = currentTask?.resolveType || "inventory";

        // For automatic sub-workflows (not preview panels), energy should flow
        // For preview panels (email_copy, insights), energy stays stopped until human approves
        const isAutomaticSubWorkflow = type !== "email_copy" && type !== "insights";

        setTimeout(() => {
          if (isAutomaticSubWorkflow) {
            runSubWorkflow(type);
          }
        }, 400);

        return {
          ...prev,
          resolveTaskIndex: currentIndex,
          subWorkflowActive: true,
          subWorkflowTasks: [],
          resolveType: type,
          awaitingApproval: !isAutomaticSubWorkflow, // Energy flows for automatic sub-workflows
          tasks: prev.tasks.map((t, i) => i === currentIndex ? { ...t, status: "working" as TaskState, subtext: "Resolving..." } : t)
        };
      });
    };

    const handleApprovePreview = () => {
      completeSubWorkflow("Approved");
    };

    const runScenario = (scenario: Scenario) => {
      if (workflow.isRunning) return;

      scenarioRef.current = scenario;
      taskIndexRef.current = 0;

      setWorkflow({
        ...initialWorkflowState,
        isRunning: true,
        currentScenarioLabel: scenario.buttonLabel,
      });

      const lineAnimDuration = 600;
      const startTime = Date.now();

      const animateLine = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / lineAnimDuration, 1);
        setWorkflow(prev => ({ ...prev, lineProgress: progress }));
        if (progress < 1) requestAnimationFrame(animateLine);
        else addNextTask();
      };
      requestAnimationFrame(animateLine);
    };

    const resetWorkflow = () => {
      scenarioRef.current = null;
      taskIndexRef.current = 0;
      subTaskIndexRef.current = 0;
      setWorkflow(initialWorkflowState);
    };

    return { handleApprove, handleReject, handleResolve, handleApprovePreview, runScenario, resetWorkflow };
  }, [leftWorkflow, rightWorkflow]);

  const leftHandlers = createWorkflowHandlers("left");
  const rightHandlers = createWorkflowHandlers("right");

  // Deep Clean labels - Shopify merchant-related issues
  const cleanLabels = [
    // Inventory & Stock
    "[SYNCING INVENTORY]", "[FIXING STOCK COUNTS]", "[RESOLVING OVERSELLS]", "[UPDATING SKU DATA]",
    "[RESYNCING WAREHOUSES]", "[CLEARING GHOST STOCK]", "[FIXING VARIANT LINKS]", "[RECONCILING COUNTS]",
    // Orders & Fulfillment
    "[FIXING STUCK ORDERS]", "[CLEARING ORDER QUEUE]", "[RESOLVING DUPLICATES]", "[UPDATING TRACKING]",
    "[SYNCING FULFILLMENTS]", "[FIXING FAILED ORDERS]", "[CLEARING DRAFT ORDERS]", "[RETRYING WEBHOOKS]",
    // Products & Catalog
    "[FIXING BROKEN IMAGES]", "[RESYNCING PRODUCTS]", "[UPDATING METAFIELDS]", "[CLEANING DEAD LINKS]",
    "[FIXING SEO HANDLES]", "[REBUILDING SEARCH INDEX]", "[CLEARING PRODUCT CACHE]", "[FIXING COLLECTIONS]",
    // Payments & Transactions
    "[RETRYING PAYMENTS]", "[FIXING FAILED CAPTURES]", "[RECONCILING REFUNDS]", "[CLEARING PENDING TXN]",
    "[UPDATING TAX RATES]", "[FIXING CURRENCY RATES]", "[SYNCING PAYOUTS]", "[RESOLVING DISPUTES]",
    // Customers & Data
    "[MERGING DUPLICATES]", "[CLEANING GUEST DATA]", "[FIXING EMAIL TAGS]", "[UPDATING SEGMENTS]",
    "[SYNCING LOYALTY POINTS]", "[CLEARING ABANDONED CARTS]", "[FIXING ACCOUNT LINKS]", "[PRUNING OLD DATA]",
    // Shipping & Rates
    "[RECALCULATING RATES]", "[FIXING ZONE ERRORS]", "[UPDATING CARRIERS]", "[SYNCING LABELS]",
    "[CLEARING RATE CACHE]", "[FIXING WEIGHT ISSUES]", "[UPDATING DIMENSIONS]", "[RESOLVING DELAYS]",
    // Discounts & Pricing
    "[FIXING DISCOUNT CONFLICTS]", "[CLEARING EXPIRED CODES]", "[RECALCULATING PRICES]", "[SYNCING SALES]",
    "[FIXING BUNDLE PRICES]", "[UPDATING PRICE RULES]", "[RESOLVING PROMO ERRORS]", "[CLEARING DUPLICATES]",
    // Integrations & Apps
    "[RESYNCING APPS]", "[FIXING API ERRORS]", "[CLEARING STALE TOKENS]", "[RETRYING SYNC JOBS]",
    "[UPDATING WEBHOOKS]", "[FIXING OAUTH ISSUES]", "[RECONNECTING CHANNELS]", "[RESOLVING CONFLICTS]"
  ];

  const cleanSubtexts = [
    "Syncing data...", "Checking records...", "Resolving conflicts...", "Updating store...", "Processing...",
    "Fixing issues...", "Validating data...", "Reconciling...", "Retrying failed...", "Cleaning up...",
    "Rebuilding index...", "Refreshing cache...", "Merging records...", "Recalculating...", "Reconnecting...",
    "Verifying integrity...", "Updating references...", "Clearing stale...", "Patching errors...", "Finalizing..."
  ];

  // Deep Clean effect
  useEffect(() => {
    if (deepCleanMode !== "running") return;

    const timeouts: NodeJS.Timeout[] = [];
    const CLEAN_DURATION = 9000; // 9 seconds - quick and impactful
    const taskIds: { left: string[]; right: string[] } = { left: [], right: [] };

    const spawnCleanTask = (side: "left" | "right") => {
      const setWorkflow = side === "left" ? setLeftWorkflow : setRightWorkflow;
      const counter = deepCleanTaskCounterRef.current[side]++;
      const taskId = `clean-${side}-${counter}`;
      taskIds[side].push(taskId);

      const newTask: Task = {
        id: taskId,
        label: cleanLabels[Math.floor(Math.random() * cleanLabels.length)],
        subtext: cleanSubtexts[Math.floor(Math.random() * cleanSubtexts.length)],
        status: "working",
        requiresApproval: false,
        requiresResolve: false
      };

      setWorkflow(prev => {
        if (prev.isCollapsing || prev.isCompleted) return prev;
        return { ...prev, tasks: [...prev.tasks, newTask], isRunning: true, lineProgress: 1 };
      });

      // Complete the task after random duration
      const duration = 1000 + Math.random() * 1800;
      const randomOutcome = Math.random();
      const shouldFail = randomOutcome < 0.08;
      const shouldRewrite = randomOutcome >= 0.08 && randomOutcome < 0.55; // 47% chance of rewriting

      if (shouldFail) {
        const t1 = setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "failed" as TaskState, subtext: "Retry needed" } : t)
          }));
          const t2 = setTimeout(() => {
            setWorkflow(prev => ({
              ...prev,
              tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "fixing" as TaskState, subtext: "Retrying..." } : t)
            }));
            const t3 = setTimeout(() => {
              setWorkflow(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "completed" as TaskState, subtext: "Fixed" } : t)
              }));
            }, 700);
            timeouts.push(t3);
          }, 500);
          timeouts.push(t2);
        }, duration * 0.4);
        timeouts.push(t1);
      } else if (shouldRewrite) {
        // Task realizes it needs to rewrite/restructure (longer duration)
        const t1 = setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "rewriting" as TaskState, subtext: "Restructuring..." } : t)
          }));
          const t2 = setTimeout(() => {
            setWorkflow(prev => ({
              ...prev,
              tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "working" as TaskState, subtext: "Rebuilding..." } : t)
            }));
            const t3 = setTimeout(() => {
              setWorkflow(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "completed" as TaskState, subtext: "Rebuilt" } : t)
              }));
            }, 2500);
            timeouts.push(t3);
          }, 4000);
          timeouts.push(t2);
        }, duration * 0.5);
        timeouts.push(t1);
      } else {
        const t = setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "completed" as TaskState, subtext: "Cleaned" } : t)
          }));
        }, duration);
        timeouts.push(t);
      }
    };

    const spawnSubWorkflow = (side: "left" | "right", taskIndex: number) => {
      const setWorkflow = side === "left" ? setLeftWorkflow : setRightWorkflow;
      const numSubTasks = 3 + Math.floor(Math.random() * 4); // 3-6 sub-tasks
      const subTasks: SubWorkflowTask[] = [];

      for (let i = 0; i < numSubTasks; i++) {
        subTasks.push({
          id: `clean-sub-${side}-${Date.now()}-${i}`,
          label: cleanLabels[Math.floor(Math.random() * cleanLabels.length)],
          status: "working",
          subtext: cleanSubtexts[Math.floor(Math.random() * cleanSubtexts.length)]
        });
      }

      setWorkflow(prev => ({
        ...prev,
        subWorkflowActive: true,
        subWorkflowTasks: subTasks,
        resolveTaskIndex: taskIndex,
        resolveType: "sub_workflow"
      }));

      subTasks.forEach((subTask, i) => {
        const delay = 800 + i * (500 + Math.random() * 700);
        const t = setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            subWorkflowTasks: prev.subWorkflowTasks.map(t =>
              t.id === subTask.id ? { ...t, status: "completed" as TaskState, subtext: "Cleaned" } : t
            )
          }));
        }, delay);
        timeouts.push(t);
      });

      const totalDuration = 800 + numSubTasks * 900;
      const t = setTimeout(() => {
        setWorkflow(prev => ({ ...prev, subWorkflowCollapsing: true }));
        const t2 = setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            subWorkflowActive: false,
            subWorkflowCollapsing: false,
            subWorkflowTasks: [],
            resolveTaskIndex: null,
            resolveType: null
          }));
        }, 500);
        timeouts.push(t2);
      }, totalDuration);
      timeouts.push(t);
    };

    // Initialize workflows
    setLeftWorkflow({ ...initialWorkflowState, isRunning: true, lineProgress: 1 });
    setRightWorkflow({ ...initialWorkflowState, isRunning: true, lineProgress: 1 });

    // Simple spawning - just a few tasks on each side
    let spawnCount = 0;
    const maxSpawns = 8; // 8 tasks per side = 16 total

    const scheduleSpawn = (side: "left" | "right", delay: number) => {
      const t = setTimeout(() => {
        if (deepCleanMode === "running" && spawnCount < maxSpawns * 2) {
          spawnCleanTask(side);
          spawnCount++;
          const nextDelay = 300 + Math.random() * 400;
          if (spawnCount < maxSpawns * 2) {
            scheduleSpawn(side === "left" ? "right" : "left", nextDelay);
          }
        }
      }, delay);
      timeouts.push(t);
    };

    // Start spawning alternating sides
    scheduleSpawn("left", 200);
    scheduleSpawn("right", 400);


    // After CLEAN_DURATION, start collapsing everything
    const collapseTimeout = setTimeout(() => {
      setDeepCleanMode("collapsing");

      // Collapse sub-workflows first
      setLeftWorkflow(prev => ({ ...prev, subWorkflowCollapsing: true }));
      setRightWorkflow(prev => ({ ...prev, subWorkflowCollapsing: true }));

      setTimeout(() => {
        setLeftWorkflow(prev => ({
          ...prev,
          subWorkflowActive: false,
          subWorkflowCollapsing: false,
          subWorkflowTasks: [],
          isCollapsing: true
        }));
        setRightWorkflow(prev => ({
          ...prev,
          subWorkflowActive: false,
          subWorkflowCollapsing: false,
          subWorkflowTasks: [],
          isCollapsing: true
        }));

        // After collapse animation, show clean complete state
        setTimeout(() => {
          // Show the "cleaned" state in containers instead of full reset
          setLeftWorkflow(prev => ({
            ...initialWorkflowState,
            deepCleanComplete: true,
            currentScenarioLabel: "DEEP CLEAN",
          }));
          setRightWorkflow(prev => ({
            ...initialWorkflowState,
            deepCleanComplete: true,
            currentScenarioLabel: "DEEP CLEAN",
          }));
          setDeepCleanMode("complete");

          // DO NOT touch the canvas - user controls panning independently

          // Reset to idle after showing complete
          setTimeout(() => {
            setLeftWorkflow(initialWorkflowState);
            setRightWorkflow(initialWorkflowState);
            setDeepCleanMode("idle");
          }, 2500);
        }, 800);
      }, 400);
    }, CLEAN_DURATION);
    timeouts.push(collapseTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [deepCleanMode]);

  const startDeepClean = () => {
    if (deepCleanMode !== "idle") return;

    // Reset everything first
    setLeftWorkflow(initialWorkflowState);
    setRightWorkflow(initialWorkflowState);
    deepCleanTaskCounterRef.current = { left: 0, right: 0 };
    setDeepCleanMode("running");
  };

  const numDots = 3;
  const cycleDuration = 2.5;

  const anyRunning = leftWorkflow.isRunning || rightWorkflow.isRunning;
  const anyTasks = leftWorkflow.tasks.length > 0 || rightWorkflow.tasks.length > 0;
  const anyCompleted = leftWorkflow.isCompleted || rightWorkflow.isCompleted;

  return (
    <ThemeContext.Provider value={theme}>
    <div className="h-screen w-screen overflow-hidden relative flex flex-col" style={{ background: theme.background, fontFamily: theme.fontFamily }}>

      {/* Fixed UI Elements - Outside canvas area to prevent clipping */}
      <LiveStatusWidget
        leftWorkflow={{
          tasks: leftWorkflow.tasks,
          isRunning: leftWorkflow.isRunning,
          subWorkflowActive: leftWorkflow.subWorkflowActive,
          subWorkflowTasks: leftWorkflow.subWorkflowTasks,
          isCompleted: leftWorkflow.isCompleted
        }}
        rightWorkflow={{
          tasks: rightWorkflow.tasks,
          isRunning: rightWorkflow.isRunning,
          subWorkflowActive: rightWorkflow.subWorkflowActive,
          subWorkflowTasks: rightWorkflow.subWorkflowTasks,
          isCompleted: rightWorkflow.isCompleted
        }}
        deepCleanMode={deepCleanMode}
      />

      {/* Zoom Controls */}
      <div style={{ position: "fixed", top: 20, left: 20, display: "flex", alignItems: "center", gap: 8, zIndex: 1000, background: "rgba(0, 0, 0, 0.6)", border: `1px solid ${theme.borderLight}`, padding: "6px 8px", borderRadius: 0 }}>
        <button onClick={resetView} style={{ background: "transparent", border: "none", color: theme.textMuted, padding: "6px 10px", fontSize: 11, cursor: "pointer", fontFamily: theme.fontFamily, fontWeight: 500, letterSpacing: "0.05em" }}>RESET</button>
        <div style={{ width: 1, height: 16, background: theme.borderLight }} />
        <button onClick={() => { zoomRef.current = Math.max(zoomRef.current * 0.8, 0.25); if (canvasRef.current) canvasRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`; setZoom(zoomRef.current); }} style={{ background: "transparent", border: "none", color: theme.text, padding: "6px 8px", fontSize: 13, cursor: "pointer", fontFamily: theme.fontFamily, fontWeight: 500, lineHeight: 1 }}>−</button>
        <span style={{ color: theme.textMuted, fontSize: 11, fontFamily: theme.fontFamily, minWidth: 36, textAlign: "center", fontWeight: 500 }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => { zoomRef.current = Math.min(zoomRef.current * 1.2, 3); if (canvasRef.current) canvasRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`; setZoom(zoomRef.current); }} style={{ background: "transparent", border: "none", color: theme.text, padding: "6px 8px", fontSize: 13, cursor: "pointer", fontFamily: theme.fontFamily, fontWeight: 500, lineHeight: 1 }}>+</button>
      </div>

      <div
        className="flex-1 relative overflow-hidden"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Canvas Content - zero-size anchor point, content positioned around it */}
        <div ref={canvasRef} style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, transformOrigin: "0 0", willChange: "transform", overflow: "visible" }}>
          {/* Grid - centered on the anchor point */}
          <div
            ref={gridRef}
            style={{
              position: "absolute",
              width: 10000,
              height: 10000,
              left: -5000,
              top: -5000,
              backgroundImage: theme.gridPattern,
              backgroundSize: true ? `${GRID_SIZE}px ${GRID_SIZE}px` : "24px 24px",
              backgroundPosition: "0 0",
              pointerEvents: "none"
            }}
          />
          {/* Content wrapper - agent at center (0,0), workflows expand outward */}
          <div className="flex items-start" style={{ position: "absolute", top: -150, left: -800 }}>

            {/* LEFT WORKFLOW */}
            <div className="flex items-start">
              {/* Left Tasks (mirrored) - fixed width to prevent layout shifts */}
              <div className="flex flex-col" style={{ width: 400, marginRight: 0, minHeight: 300, alignItems: "flex-end", gap: 0 }}>
                <AnimatePresence mode="wait">
                  {/* Show completed widget ONLY after tasks are cleared */}
                  {leftWorkflow.isCompleted && leftWorkflow.completedScenarioLabel && (
                    <motion.div
                      key="left-completed-container"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      style={{ width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "flex-start", marginBottom: WIDGET_GAP }}
                    >
                      <CompletedTaskWidget label={leftWorkflow.completedScenarioLabel} onClose={leftHandlers.resetWorkflow} mirrored />
                    </motion.div>
                  )}
                  {/* Show tasks while running or collapsing */}
                  {/* Show tasks while running/collapsing OR show clean complete state */}
                  {(!leftWorkflow.isCompleted && leftWorkflow.tasks.length > 0) || leftWorkflow.deepCleanComplete ? (
                    <motion.div
                      key="left-tasks-container"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                      className="flex"
                      style={{ alignItems: "flex-start", justifyContent: "flex-end", gap: 16 }}
                    >
                      {/* Sub-workflows appear on the LEFT (further from agent) */}
                      {!leftWorkflow.deepCleanComplete && (
                        <div className="flex flex-col" style={{ gap: WIDGET_GAP }}>
                          {leftWorkflow.subWorkflowActive && leftWorkflow.resolveType === "email_copy" && (
                            <EmailPreviewPanel isActive={leftWorkflow.subWorkflowActive} isCollapsing={leftWorkflow.subWorkflowCollapsing} onApprove={leftHandlers.handleApprovePreview} mirrored />
                          )}
                          {leftWorkflow.subWorkflowActive && leftWorkflow.resolveType === "insights" && (
                            <InsightsPreviewPanel isActive={leftWorkflow.subWorkflowActive} isCollapsing={leftWorkflow.subWorkflowCollapsing} onApprove={leftHandlers.handleApprovePreview} mirrored />
                          )}
                          {(leftWorkflow.subWorkflowActive || leftWorkflow.subWorkflowTasks.length > 0) && leftWorkflow.resolveType !== "email_copy" && leftWorkflow.resolveType !== "insights" && (
                            <SubWorkflowPanel isActive={leftWorkflow.subWorkflowActive} tasks={leftWorkflow.subWorkflowTasks} isCollapsing={leftWorkflow.subWorkflowCollapsing} mirrored />
                          )}
                        </div>
                      )}

                      {/* Main tasks container */}
                      <WorkflowBranchContainer
                        scenarioLabel={leftWorkflow.currentScenarioLabel}
                        isActive={leftWorkflow.tasks.length > 0 || leftWorkflow.deepCleanComplete || false}
                        isCollapsing={leftWorkflow.isCollapsing}
                        isCleanComplete={leftWorkflow.deepCleanComplete || false}
                        mirrored
                      >
                        <div className="flex flex-col" style={{ gap: WIDGET_GAP }}>
                          {leftWorkflow.tasks.map((task, index) => (
                            <TaskWidget
                              key={task.id}
                              task={task}
                              onApprove={leftHandlers.handleApprove}
                              onReject={leftHandlers.handleReject}
                              onResolve={leftHandlers.handleResolve}
                              isCollapsing={leftWorkflow.isCollapsing && index !== 0}
                              collapseIndex={leftWorkflow.tasks.length - 1 - index}
                              mirrored
                            />
                          ))}
                        </div>
                      </WorkflowBranchContainer>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Left Connection - lines go from agent (right) TO tasks (left) */}
              {(() => {
                // Find the task with review status (needs_approval or needs_resolve)
                const reviewTaskIndex = leftWorkflow.tasks.findIndex(t => t.status === "needs_approval" || t.status === "needs_resolve");
                // Target the review task if found, otherwise last working task or first task
                const targetTaskIndex = reviewTaskIndex >= 0 ? reviewTaskIndex : Math.max(0, leftWorkflow.tasks.length - 1);
                const targetY = CONNECTION_LINE_Y + targetTaskIndex * TASK_ROW_HEIGHT;
                const hasReviewTask = reviewTaskIndex >= 0;

                // Calculate actual height needed (last task position + half row for the node)
                const actualTasksHeight = leftWorkflow.tasks.length > 0
                  ? CONNECTION_LINE_Y + (leftWorkflow.tasks.length - 1) * TASK_ROW_HEIGHT + 50
                  : 300;

                return (
                  <div className="relative" style={{ width: CONNECTION_WIDTH, height: Math.max(300, actualTasksHeight) }}>
                    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
                      {/* Main path: from agent to target task (review task or last task) */}
                      <motion.path d={`M ${CONNECTION_WIDTH} ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${targetY} L 0 ${targetY}`} fill="none" stroke={leftWorkflow.isCompleted ? "rgba(16, 185, 129, 0.4)" : hasReviewTask ? "rgba(224, 112, 32, 0.5)" : theme.connectionLine} strokeWidth="1" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: leftWorkflow.lineProgress > 0 || leftWorkflow.isCompleted ? 1 : 0, opacity: leftWorkflow.isCollapsing ? 0 : 1 }} transition={{ pathLength: { duration: 0.6 }, opacity: { duration: 0.5, delay: leftWorkflow.isCollapsing ? 0.15 + leftWorkflow.tasks.length * 0.04 : 0, ease: [0.32, 0.72, 0, 1] } }} />
                      {/* Vertical dashed line for other tasks */}
                      {leftWorkflow.tasks.length > 1 && !leftWorkflow.isCompleted && <motion.path d={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y} L ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + (leftWorkflow.tasks.length - 1) * TASK_ROW_HEIGHT}`} fill="none" stroke={theme.connectionLineDim} strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: leftWorkflow.isCollapsing ? 0 : 1, opacity: leftWorkflow.isCollapsing ? 0 : 1 }} transition={{ duration: 0.5, delay: leftWorkflow.isCollapsing ? 0.1 : 0, ease: [0.32, 0.72, 0, 1] }} />}
                      {/* Horizontal lines to each task */}
                      {!leftWorkflow.isCompleted && leftWorkflow.tasks.map((_, i) => <motion.path key={i} d={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + i * TASK_ROW_HEIGHT} L 0 ${CONNECTION_LINE_Y + i * TASK_ROW_HEIGHT}`} fill="none" stroke={i === targetTaskIndex && hasReviewTask ? "rgba(224, 112, 32, 0.5)" : theme.connectionLine} strokeWidth="1" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: leftWorkflow.isCollapsing ? 0 : 1, opacity: leftWorkflow.isCollapsing ? 0 : 1 }} transition={{ duration: 0.45, delay: leftWorkflow.isCollapsing ? i * 0.06 : 0, ease: [0.32, 0.72, 0, 1] }} />)}
                    </svg>
                    {/* Connection dots - agent side (right) */}
                    {!leftWorkflow.isCompleted && leftWorkflow.lineProgress > 0.3 && <motion.div initial={{ scale: 0, opacity: 0, y: 0 }} animate={leftWorkflow.isCollapsing ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0], y: -12, filter: "blur(8px)" } : { scale: [1, 1.2, 1], opacity: 1, y: 0 }} transition={leftWorkflow.isCollapsing ? { duration: 0.5, delay: 0.3 + leftWorkflow.tasks.length * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 1, repeat: Infinity }} style={{ position: "absolute", left: CONNECTION_WIDTH - 3, top: AGENT_CENTER_Y - 3, width: 6, height: 6, borderRadius: 0, background: hasReviewTask ? "#e07020" : accentColor, boxShadow: hasReviewTask ? "0 0 8px #e07020" : theme.glowAccent }} />}
                    {/* Junction dot (at turn point) - positioned at target task Y */}
                    {!leftWorkflow.isCompleted && leftWorkflow.lineProgress > 0.6 && <motion.div initial={{ scale: 0, opacity: 0 }} animate={leftWorkflow.isCollapsing ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0], filter: "blur(8px)" } : { scale: [1, 1.2, 1], opacity: 1 }} transition={leftWorkflow.isCollapsing ? { duration: 0.5, delay: 0.2 + leftWorkflow.tasks.length * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 1, repeat: Infinity, delay: 0.2 }} style={{ position: "absolute", left: CONNECTION_BEND_X - 3, top: targetY - 3, width: 6, height: 6, borderRadius: 0, background: hasReviewTask ? "#e07020" : accentColor, boxShadow: hasReviewTask ? "0 0 8px #e07020" : theme.glowAccent }} />}
                    {/* Completed state node */}
                    {leftWorkflow.isCompleted && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} style={{ position: "absolute", left: -3, top: CONNECTION_LINE_Y - 6, width: 12, height: 12, borderRadius: 0, background: "#10b981", boxShadow: "0 0 12px rgba(16, 185, 129, 0.6)" }} />}
                    {/* Task connection nodes on left side */}
                    {!leftWorkflow.isCompleted && leftWorkflow.tasks.map((task, i) => <motion.div key={`node-${i}`} initial={{ scale: 0, opacity: 0, x: 0, y: 0 }} animate={leftWorkflow.isCollapsing ? { scale: [1, 1.4, 0], opacity: [1, 0.6, 0], x: -15, y: -8, filter: "blur(10px)" } : { scale: 1, opacity: 1, x: 0, y: 0 }} transition={leftWorkflow.isCollapsing ? { duration: 0.55, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 0.3 }} style={{ position: "absolute", left: -3, top: CONNECTION_LINE_Y - 3 + i * TASK_ROW_HEIGHT, width: 6, height: 6, borderRadius: 0, background: task.status === "needs_approval" || task.status === "needs_resolve" ? "#e07020" : task.status === "failed" ? "#ef4444" : task.status === "fixing" ? "#3b82f6" : task.status === "rewriting" ? "#a855f7" : task.status === "completed" ? "#10b981" : task.status === "working" ? accentColor : theme.dotDim, boxShadow: task.status === "needs_approval" || task.status === "needs_resolve" ? "0 0 8px #e07020" : task.status === "failed" ? "0 0 8px #ef4444" : task.status === "fixing" ? "0 0 8px #3b82f6" : task.status === "rewriting" ? "0 0 8px #a855f7" : task.status === "completed" ? "0 0 8px #10b981" : task.status === "working" ? theme.glowAccent : "none" }} />)}
                    {/* Energy dots - main path from agent to junction */}
                    {leftWorkflow.isRunning && !leftWorkflow.awaitingApproval && !leftWorkflow.isCompleted && Array.from({ length: numDots }).map((_, i) => <EnergyDot key={`main-${i}`} delay={(i / numDots) * cycleDuration} color={hasReviewTask ? "#e07020" : accentColor} duration={cycleDuration} path={`M ${CONNECTION_WIDTH} ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${AGENT_CENTER_Y}`} />)}
                    {/* Energy dots - branch lines to each task */}
                    {leftWorkflow.isRunning && !leftWorkflow.awaitingApproval && !leftWorkflow.isCompleted && leftWorkflow.tasks.map((_, taskIndex) =>
                      Array.from({ length: 2 }).map((__, i) => <EnergyDot key={`branch-${taskIndex}-${i}`} delay={(i / 2) * 1.5 + taskIndex * 0.3} color={taskIndex === targetTaskIndex && hasReviewTask ? "#e07020" : accentColor} duration={1.5} path={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + taskIndex * TASK_ROW_HEIGHT} L 0 ${CONNECTION_LINE_Y + taskIndex * TASK_ROW_HEIGHT}`} />)
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Agent Container */}
            {true ? (
              <div className="relative p-6" style={{ border: `1px solid ${theme.border}`, background: theme.cardBg }}>
                <div className="flex items-center justify-between mb-5">
                  <span style={{ fontSize: 13, letterSpacing: "0.1em", color: theme.textMuted, fontWeight: 600, padding: "6px 12px", background: "rgba(94, 234, 212, 0.08)", border: "1px solid rgba(94, 234, 212, 0.2)" }}>SHOPIFY MERCHANT AGENT</span>
                  <div className="flex gap-1">
                    <motion.div animate={{ opacity: anyRunning ? [0.4, 1, 0.4] : 0.4 }} transition={{ duration: 0.8, repeat: Infinity }} style={{ width: 4, height: 4, background: theme.accent }} />
                    <motion.div animate={{ opacity: anyRunning ? [0.4, 1, 0.4] : 0.4 }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} style={{ width: 4, height: 4, background: theme.accent }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "80px 140px 80px", gridTemplateRows: "60px 140px 60px", gap: 20, width: 340 }}>
                  <ServerRack />
                  <div style={{ border: `1px solid ${theme.borderDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 32, height: 14, border: `1px solid ${theme.borderDim}` }} /></div>
                  <ServerRack />
                  <div style={{ border: `1px solid ${theme.borderDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 26, height: 14, border: `1px solid ${theme.borderDim}` }} /></div>

                  <div className="relative flex items-center justify-center" style={{ border: `1px solid ${theme.border}`, background: anyRunning ? "rgba(94, 234, 212, 0.12)" : "rgba(94, 234, 212, 0.08)" }}>
                    <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", width: 1, height: 10, background: theme.borderLight }} />
                    <div style={{ position: "absolute", bottom: -11, left: "50%", transform: "translateX(-50%)", width: 1, height: 10, background: theme.borderLight }} />
                    <div style={{ position: "absolute", left: -11, top: "50%", transform: "translateY(-50%)", width: 10, height: 1, background: theme.borderLight }} />
                    <div style={{ position: "absolute", right: -11, top: "50%", transform: "translateY(-50%)", width: 10, height: 1, background: theme.borderLight }} />
                    <div style={{ position: "absolute", top: 6, left: 6, width: 14, height: 14, borderTop: `2px solid ${theme.border}`, borderLeft: `2px solid ${theme.border}` }} />
                    <div style={{ position: "absolute", top: 6, right: 6, width: 14, height: 14, borderTop: `2px solid ${theme.border}`, borderRight: `2px solid ${theme.border}` }} />
                    <div style={{ position: "absolute", bottom: 6, left: 6, width: 14, height: 14, borderBottom: `2px solid ${theme.border}`, borderLeft: `2px solid ${theme.border}` }} />
                    <div style={{ position: "absolute", bottom: 6, right: 6, width: 14, height: 14, borderBottom: `2px solid ${theme.border}`, borderRight: `2px solid ${theme.border}` }} />
                    {anyRunning && <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ position: "absolute", inset: 0, border: `2px solid ${theme.border}` }} />}
                    <span style={{ fontSize: 13, letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.5, color: theme.accent, fontWeight: 600 }}>SIDEKICK<br />AGENT</span>
                  </div>

                  <div style={{ border: `1px solid ${theme.borderDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 26, height: 14, border: `1px solid ${theme.borderDim}` }} /></div>
                  <ServerRack />
                  <div style={{ border: `1px solid ${theme.borderDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 32, height: 14, border: `1px solid ${theme.borderDim}` }} /></div>
                  <ServerRack />
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center" style={{ width: 240, height: 300, background: "white", borderRadius: 16, border: "1px solid #e5e5e5", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", padding: 24 }}>
                <div style={{ width: 64, height: 64, background: "#f5f5f5", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9h6M9 13h6M9 17h4" />
                  </svg>
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, color: "#171717", marginBottom: 4, textAlign: "center" }}>Shopify Agent</div>
                <div style={{ fontSize: 12, color: "#737373", marginBottom: 20, textAlign: "center" }}>Orchestrating workflows</div>

                <div className="flex gap-2">
                  <motion.div animate={{ opacity: anyRunning ? [0.3, 1, 0.3] : 0.3 }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: anyRunning ? "#3b82f6" : "#d4d4d4" }} />
                  <motion.div animate={{ opacity: anyRunning ? [0.3, 1, 0.3] : 0.3 }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} style={{ width: 8, height: 8, borderRadius: "50%", background: anyRunning ? "#3b82f6" : "#d4d4d4" }} />
                  <motion.div animate={{ opacity: anyRunning ? [0.3, 1, 0.3] : 0.3 }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }} style={{ width: 8, height: 8, borderRadius: "50%", background: anyRunning ? "#3b82f6" : "#d4d4d4" }} />
                </div>
              </div>
            )}

            {/* RIGHT WORKFLOW */}
            <div className="flex items-start">
              {/* Right Connection */}
              {(() => {
                // Find the task with review status (needs_approval or needs_resolve)
                const reviewTaskIndex = rightWorkflow.tasks.findIndex(t => t.status === "needs_approval" || t.status === "needs_resolve");
                // Target the review task if found, otherwise last working task or first task
                const targetTaskIndex = reviewTaskIndex >= 0 ? reviewTaskIndex : Math.max(0, rightWorkflow.tasks.length - 1);
                const targetY = CONNECTION_LINE_Y + targetTaskIndex * TASK_ROW_HEIGHT;
                const hasReviewTask = reviewTaskIndex >= 0;

                // Calculate actual height needed (last task position + half row for the node)
                const actualTasksHeight = rightWorkflow.tasks.length > 0
                  ? CONNECTION_LINE_Y + (rightWorkflow.tasks.length - 1) * TASK_ROW_HEIGHT + 50
                  : 300;

                return (
                  <div className="relative" style={{ width: CONNECTION_WIDTH, height: Math.max(300, actualTasksHeight) }}>
                    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
                      {/* Main path: from agent to target task (review task or last task) */}
                      <motion.path d={`M 0 ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${targetY} L ${CONNECTION_WIDTH} ${targetY}`} fill="none" stroke={rightWorkflow.isCompleted ? "rgba(16, 185, 129, 0.4)" : hasReviewTask ? "rgba(224, 112, 32, 0.5)" : theme.connectionLine} strokeWidth="1" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: rightWorkflow.lineProgress > 0 || rightWorkflow.isCompleted ? 1 : 0, opacity: rightWorkflow.isCollapsing ? 0 : 1 }} transition={{ pathLength: { duration: 0.6 }, opacity: { duration: 0.5, delay: rightWorkflow.isCollapsing ? 0.15 + rightWorkflow.tasks.length * 0.04 : 0, ease: [0.32, 0.72, 0, 1] } }} />
                      {/* Vertical dashed line for other tasks */}
                      {rightWorkflow.tasks.length > 1 && !rightWorkflow.isCompleted && <motion.path d={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y} L ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + (rightWorkflow.tasks.length - 1) * TASK_ROW_HEIGHT}`} fill="none" stroke={theme.connectionLineDim} strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: rightWorkflow.isCollapsing ? 0 : 1, opacity: rightWorkflow.isCollapsing ? 0 : 1 }} transition={{ duration: 0.5, delay: rightWorkflow.isCollapsing ? 0.1 : 0, ease: [0.32, 0.72, 0, 1] }} />}
                      {/* Horizontal lines to each task */}
                      {!rightWorkflow.isCompleted && rightWorkflow.tasks.map((_, i) => <motion.path key={i} d={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + i * TASK_ROW_HEIGHT} L ${CONNECTION_WIDTH} ${CONNECTION_LINE_Y + i * TASK_ROW_HEIGHT}`} fill="none" stroke={i === targetTaskIndex && hasReviewTask ? "rgba(224, 112, 32, 0.5)" : theme.connectionLine} strokeWidth="1" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: rightWorkflow.isCollapsing ? 0 : 1, opacity: rightWorkflow.isCollapsing ? 0 : 1 }} transition={{ duration: 0.45, delay: rightWorkflow.isCollapsing ? i * 0.06 : 0, ease: [0.32, 0.72, 0, 1] }} />)}
                    </svg>
                    {/* Connection dots - agent side (left) */}
                    {!rightWorkflow.isCompleted && rightWorkflow.lineProgress > 0.3 && <motion.div initial={{ scale: 0, opacity: 0, y: 0 }} animate={rightWorkflow.isCollapsing ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0], y: -12, filter: "blur(8px)" } : { scale: [1, 1.2, 1], opacity: 1, y: 0 }} transition={rightWorkflow.isCollapsing ? { duration: 0.5, delay: 0.3 + rightWorkflow.tasks.length * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 1, repeat: Infinity }} style={{ position: "absolute", left: -3, top: AGENT_CENTER_Y - 3, width: 6, height: 6, borderRadius: 0, background: hasReviewTask ? "#e07020" : accentColor, boxShadow: hasReviewTask ? "0 0 8px #e07020" : theme.glowAccent }} />}
                    {/* Junction dot (at turn point) - positioned at target task Y */}
                    {!rightWorkflow.isCompleted && rightWorkflow.lineProgress > 0.6 && <motion.div initial={{ scale: 0, opacity: 0 }} animate={rightWorkflow.isCollapsing ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0], filter: "blur(8px)" } : { scale: [1, 1.2, 1], opacity: 1 }} transition={rightWorkflow.isCollapsing ? { duration: 0.5, delay: 0.2 + rightWorkflow.tasks.length * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 1, repeat: Infinity, delay: 0.2 }} style={{ position: "absolute", left: CONNECTION_BEND_X - 3, top: targetY - 3, width: 6, height: 6, borderRadius: 0, background: hasReviewTask ? "#e07020" : accentColor, boxShadow: hasReviewTask ? "0 0 8px #e07020" : theme.glowAccent }} />}
                    {/* Completed state node */}
                    {rightWorkflow.isCompleted && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} style={{ position: "absolute", left: CONNECTION_WIDTH - 6, top: CONNECTION_LINE_Y - 6, width: 12, height: 12, borderRadius: 0, background: "#10b981", boxShadow: "0 0 12px rgba(16, 185, 129, 0.6)" }} />}
                    {/* Task connection nodes on right side */}
                    {!rightWorkflow.isCompleted && rightWorkflow.tasks.map((task, i) => <motion.div key={`node-${i}`} initial={{ scale: 0, opacity: 0, x: 0, y: 0 }} animate={rightWorkflow.isCollapsing ? { scale: [1, 1.4, 0], opacity: [1, 0.6, 0], x: 15, y: -8, filter: "blur(10px)" } : { scale: 1, opacity: 1, x: 0, y: 0 }} transition={rightWorkflow.isCollapsing ? { duration: 0.55, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 0.3 }} style={{ position: "absolute", left: CONNECTION_WIDTH - 3, top: CONNECTION_LINE_Y - 3 + i * TASK_ROW_HEIGHT, width: 6, height: 6, borderRadius: 0, background: task.status === "needs_approval" || task.status === "needs_resolve" ? "#e07020" : task.status === "failed" ? "#ef4444" : task.status === "fixing" ? "#3b82f6" : task.status === "rewriting" ? "#a855f7" : task.status === "completed" ? "#10b981" : task.status === "working" ? accentColor : theme.dotDim, boxShadow: task.status === "needs_approval" || task.status === "needs_resolve" ? "0 0 8px #e07020" : task.status === "failed" ? "0 0 8px #ef4444" : task.status === "fixing" ? "0 0 8px #3b82f6" : task.status === "rewriting" ? "0 0 8px #a855f7" : task.status === "completed" ? "0 0 8px #10b981" : task.status === "working" ? theme.glowAccent : "none" }} />)}
                    {/* Energy dots - main path from agent to junction */}
                    {rightWorkflow.isRunning && !rightWorkflow.awaitingApproval && !rightWorkflow.isCompleted && Array.from({ length: numDots }).map((_, i) => <EnergyDot key={`main-${i}`} delay={(i / numDots) * cycleDuration} color={hasReviewTask ? "#e07020" : accentColor} duration={cycleDuration} path={`M 0 ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${AGENT_CENTER_Y}`} />)}
                    {/* Energy dots - branch lines to each task */}
                    {rightWorkflow.isRunning && !rightWorkflow.awaitingApproval && !rightWorkflow.isCompleted && rightWorkflow.tasks.map((_, taskIndex) =>
                      Array.from({ length: 2 }).map((__, i) => <EnergyDot key={`branch-${taskIndex}-${i}`} delay={(i / 2) * 1.5 + taskIndex * 0.3} color={taskIndex === targetTaskIndex && hasReviewTask ? "#e07020" : accentColor} duration={1.5} path={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + taskIndex * TASK_ROW_HEIGHT} L ${CONNECTION_WIDTH} ${CONNECTION_LINE_Y + taskIndex * TASK_ROW_HEIGHT}`} />)
                    )}
                  </div>
                );
              })()}

              {/* Right Tasks - fixed width to prevent layout shifts */}
              <div className="flex flex-col" style={{ width: 400, marginLeft: 0, minHeight: 300, gap: 0 }}>
                <AnimatePresence mode="wait">
                  {/* Show completed widget ONLY after tasks are cleared */}
                  {rightWorkflow.isCompleted && rightWorkflow.completedScenarioLabel && (
                    <motion.div
                      key="right-completed-container"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      style={{ width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "flex-start", marginBottom: WIDGET_GAP }}
                    >
                      <CompletedTaskWidget label={rightWorkflow.completedScenarioLabel} onClose={rightHandlers.resetWorkflow} />
                    </motion.div>
                  )}
                  {/* Show tasks while running/collapsing OR show clean complete state */}
                  {(!rightWorkflow.isCompleted && rightWorkflow.tasks.length > 0) || rightWorkflow.deepCleanComplete ? (
                    <motion.div
                      key="right-tasks-container"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                      className="flex"
                      style={{ alignItems: "flex-start", justifyContent: "flex-start", gap: 16 }}
                    >
                      {/* Main tasks container */}
                      <WorkflowBranchContainer
                        scenarioLabel={rightWorkflow.currentScenarioLabel}
                        isActive={rightWorkflow.tasks.length > 0 || rightWorkflow.deepCleanComplete || false}
                        isCollapsing={rightWorkflow.isCollapsing}
                        isCleanComplete={rightWorkflow.deepCleanComplete || false}
                      >
                        <div className="flex flex-col" style={{ gap: WIDGET_GAP }}>
                          {rightWorkflow.tasks.map((task, index) => (
                            <TaskWidget
                              key={task.id}
                              task={task}
                              onApprove={rightHandlers.handleApprove}
                              onReject={rightHandlers.handleReject}
                              onResolve={rightHandlers.handleResolve}
                              isCollapsing={rightWorkflow.isCollapsing && index !== 0}
                              collapseIndex={rightWorkflow.tasks.length - 1 - index}
                            />
                          ))}
                        </div>
                      </WorkflowBranchContainer>

                      {/* Sub-workflows appear on the RIGHT (further from agent) */}
                      {!rightWorkflow.deepCleanComplete && (
                        <div className="flex flex-col" style={{ gap: WIDGET_GAP }}>
                          {rightWorkflow.subWorkflowActive && rightWorkflow.resolveType === "email_copy" && (
                            <EmailPreviewPanel
                              isActive={rightWorkflow.subWorkflowActive}
                              isCollapsing={rightWorkflow.subWorkflowCollapsing}
                              onApprove={rightHandlers.handleApprovePreview}
                            />
                          )}
                          {rightWorkflow.subWorkflowActive && rightWorkflow.resolveType === "insights" && (
                            <InsightsPreviewPanel isActive={rightWorkflow.subWorkflowActive} isCollapsing={rightWorkflow.subWorkflowCollapsing} onApprove={rightHandlers.handleApprovePreview} />
                          )}
                          {(rightWorkflow.subWorkflowActive || rightWorkflow.subWorkflowTasks.length > 0) && rightWorkflow.resolveType !== "email_copy" && rightWorkflow.resolveType !== "insights" && (
                            <SubWorkflowPanel isActive={rightWorkflow.subWorkflowActive} tasks={rightWorkflow.subWorkflowTasks} isCollapsing={rightWorkflow.subWorkflowCollapsing} />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: `1px solid ${theme.borderDim}`, background: true ? "rgba(13, 15, 13, 0.95)" : "white", padding: "16px 40px", display: "flex", justifyContent: "center", alignItems: "center", gap: true ? 12 : 10, flexShrink: 0 }}>
        {scenarios.map((scenario) => {
          const isThisSideRunning = scenario.side === "left" ? leftWorkflow.isRunning : rightWorkflow.isRunning;
          const handlers = scenario.side === "left" ? leftHandlers : rightHandlers;
          
          return (
            <button
              key={scenario.id}
              onClick={() => handlers.runScenario(scenario)}
              disabled={isThisSideRunning}
              style={{
                background: isThisSideRunning ? (true ? "rgba(94, 234, 212, 0.05)" : "#f5f5f5") : (true ? "rgba(94, 234, 212, 0.08)" : "white"),
                border: `1px solid ${theme.borderLight}`,
                color: isThisSideRunning ? theme.textDim : theme.text,
                padding: "10px 20px",
                fontSize: true ? 11 : 13,
                letterSpacing: true ? "0.08em" : undefined,
                cursor: isThisSideRunning ? "not-allowed" : "pointer",
                fontFamily: theme.fontFamily,
                fontWeight: true ? 600 : 500,
                flex: "1",
                maxWidth: 200,
                textAlign: "center",
                transition: "all 0.15s ease",
                opacity: isThisSideRunning ? 0.6 : 1,
                borderRadius: true ? 0 : 8
              }}
              onMouseEnter={(e) => { if (!isThisSideRunning) { e.currentTarget.style.background = true ? "rgba(94, 234, 212, 0.15)" : "#f5f5f5"; e.currentTarget.style.borderColor = true ? "rgba(94, 234, 212, 0.5)" : "#d4d4d4"; }}}
              onMouseLeave={(e) => { e.currentTarget.style.background = isThisSideRunning ? (true ? "rgba(94, 234, 212, 0.05)" : "#f5f5f5") : (true ? "rgba(94, 234, 212, 0.08)" : "white"); e.currentTarget.style.borderColor = theme.borderLight; }}
            >
              {true ? scenario.buttonLabel.toUpperCase() : scenario.buttonLabel}
            </button>
          );
        })}
        {(anyTasks || anyCompleted) && (
          <button
            onClick={() => { leftHandlers.resetWorkflow(); rightHandlers.resetWorkflow(); }}
            style={{
              background: anyCompleted && !anyRunning ? (true ? "rgba(16, 185, 129, 0.08)" : "#dcfce7") : (true ? "rgba(239, 68, 68, 0.08)" : "#fee2e2"),
              border: anyCompleted && !anyRunning ? (true ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #bbf7d0") : (true ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid #fecaca"),
              color: anyCompleted && !anyRunning ? theme.success : theme.error,
              padding: "10px 20px",
              fontSize: true ? 11 : 13,
              letterSpacing: true ? "0.08em" : undefined,
              cursor: "pointer",
              fontFamily: theme.fontFamily,
              fontWeight: true ? 600 : 500,
              flex: "1",
              maxWidth: 200,
              textAlign: "center",
              transition: "all 0.15s ease",
              borderRadius: true ? 0 : 8
            }}
            onMouseEnter={(e) => {
              if (anyCompleted && !anyRunning) {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
              } else {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (anyCompleted && !anyRunning) {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)";
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)";
              } else {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              }
            }}
          >
            {true ? "RESET ALL" : "Reset all"}
          </button>
        )}
        <button
          onClick={startDeepClean}
          disabled={deepCleanMode !== "idle"}
          style={{
            background: deepCleanMode !== "idle"
              ? (true ? "rgba(59, 130, 246, 0.2)" : "#dbeafe")
              : (true ? "rgba(59, 130, 246, 0.08)" : "#eff6ff"),
            border: deepCleanMode !== "idle"
              ? (true ? "1px solid rgba(59, 130, 246, 0.6)" : "1px solid #60a5fa")
              : (true ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid #bfdbfe"),
            color: true ? "#60a5fa" : "#2563eb",
            padding: "10px 20px",
            fontSize: true ? 11 : 13,
            letterSpacing: true ? "0.08em" : undefined,
            cursor: deepCleanMode !== "idle" ? "not-allowed" : "pointer",
            fontFamily: theme.fontFamily,
            fontWeight: true ? 600 : 500,
            flex: "1",
            maxWidth: 200,
            textAlign: "center",
            transition: "all 0.15s ease",
            borderRadius: true ? 0 : 8,
            opacity: deepCleanMode !== "idle" ? 0.8 : 1,
            boxShadow: deepCleanMode === "running" ? (true ? "0 0 20px rgba(59, 130, 246, 0.4)" : "0 0 12px rgba(37, 99, 235, 0.3)") : "none"
          }}
          onMouseEnter={(e) => {
            if (deepCleanMode === "idle") {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = deepCleanMode !== "idle"
              ? (true ? "rgba(59, 130, 246, 0.2)" : "#dbeafe")
              : (true ? "rgba(59, 130, 246, 0.08)" : "#eff6ff");
            e.currentTarget.style.borderColor = deepCleanMode !== "idle"
              ? (true ? "rgba(59, 130, 246, 0.6)" : "#60a5fa")
              : (true ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe");
            e.currentTarget.style.boxShadow = deepCleanMode === "running" ? (true ? "0 0 20px rgba(59, 130, 246, 0.4)" : "0 0 12px rgba(37, 99, 235, 0.3)") : "none";
          }}
        >
          {deepCleanMode === "running" ? "CLEANING..." : deepCleanMode === "collapsing" ? "FINISHING..." : deepCleanMode === "complete" ? "CLEAN!" : "RUN DEEP CLEAN"}
        </button>
      </div>
    </div>
    </ThemeContext.Provider>
  );
}

function ServerRack() {
  return (
    <div style={{ border: "1px solid rgba(94, 234, 212, 0.15)", background: "rgba(94, 234, 212, 0.02)", display: "flex", flexDirection: "column", gap: 4, padding: 6, justifyContent: "center" }}>
      {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ height: 5, background: "rgba(94, 234, 212, 0.2)", width: "100%" }} />)}
    </div>
  );
}
