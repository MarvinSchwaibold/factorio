"use client";

import { useContext, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/lib/theme";
import { StatusRow } from "./StatusRow";
import type { Task } from "@/lib/types";

interface WorkflowSnapshot {
  tasks: Task[];
  isRunning: boolean;
  subWorkflowActive: boolean;
  subWorkflowTasks: Task[];
  isCompleted: boolean;
}

export function LiveStatusWidget({
  leftWorkflow,
  rightWorkflow,
  deepCleanMode
}: {
  leftWorkflow: WorkflowSnapshot;
  rightWorkflow: WorkflowSnapshot;
  deepCleanMode: "idle" | "running" | "collapsing" | "complete";
}) {
  const theme = useContext(ThemeContext);
  const isRetro = false;

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

  useEffect(() => {
    const t = totalsRef.current;
    if (stats.tasksCompleted > t.lastCompletedCount) {
      t.tasksProcessed += (stats.tasksCompleted - t.lastCompletedCount);
    }
    t.lastCompletedCount = stats.tasksCompleted;

    if (stats.tasksFixing < t.lastFixingCount && t.lastFixingCount > 0) {
      t.fixesApplied += (t.lastFixingCount - stats.tasksFixing);
    }
    t.lastFixingCount = stats.tasksFixing;

    if (stats.tasksRewriting < t.lastRewritingCount && t.lastRewritingCount > 0) {
      t.restructured += (t.lastRewritingCount - stats.tasksRewriting);
    }
    t.lastRewritingCount = stats.tasksRewriting;

    if (stats.tasksFailed < t.lastFailedCount && t.lastFailedCount > 0) {
      t.errorsRecovered += (t.lastFailedCount - stats.tasksFailed);
    }
    t.lastFailedCount = stats.tasksFailed;

    t.subTasksProcessed = Math.max(t.subTasksProcessed, stats.subTasksCompleted);
  }, [stats.tasksCompleted, stats.tasksFixing, stats.tasksRewriting, stats.tasksFailed, stats.subTasksCompleted]);

  const totals = totalsRef.current;

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
        background: isRetro ? "rgba(13, 15, 13, 0.95)" : theme.cardBg,
        border: isRetro ? `1px solid ${isActive ? "rgba(94, 234, 212, 0.4)" : "rgba(94, 234, 212, 0.2)"}` : `1px solid ${isActive ? theme.border : theme.borderLight}`,
        borderRadius: isRetro ? 0 : 12,
        padding: isRetro ? "12px 16px" : "14px 18px",
        boxShadow: isRetro ? (isActive ? "0 0 20px rgba(94, 234, 212, 0.1)" : "none") : "0 4px 12px rgba(0,0,0,0.08)",
        zIndex: 1000,
        fontFamily: isRetro ? "monospace" : "inherit"
      }}
    >
      {/* Header with status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${isRetro ? "rgba(94, 234, 212, 0.15)" : theme.borderDim}` }}>
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
          color: isRetro ? "#5eead4" : theme.text
        }}>
          {statusMessage}
        </span>
      </div>

      {/* Current Stats */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: isRetro ? 8 : 9, color: isRetro ? "rgba(94, 234, 212, 0.4)" : theme.textDim, letterSpacing: isRetro ? "0.15em" : "0.05em", marginBottom: 6, fontWeight: 600 }}>
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
      <div style={{ paddingTop: 8, borderTop: `1px solid ${isRetro ? "rgba(94, 234, 212, 0.1)" : theme.borderDim}` }}>
        <div style={{ fontSize: isRetro ? 8 : 9, color: isRetro ? "rgba(94, 234, 212, 0.4)" : theme.textDim, letterSpacing: isRetro ? "0.15em" : "0.05em", marginBottom: 6, fontWeight: 600 }}>
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
