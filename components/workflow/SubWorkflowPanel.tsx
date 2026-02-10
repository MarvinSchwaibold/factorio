"use client";

import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/lib/theme";
import { TASK_CONNECTION_Y, SUB_TASK_ROW_HEIGHT, SUB_CONNECTION_WIDTH } from "@/lib/constants";
import type { SubWorkflowTask } from "@/lib/types";

export function SubWorkflowPanel({
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
  const isRetro = false;

  if (!isActive && tasks.length === 0) return null;

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
          <motion.div style={{ border: isRetro ? `2px solid ${task.status === "completed" ? "#10b981" : "rgba(224, 112, 32, 0.5)"}` : `1px solid ${task.status === "completed" ? "#d1fae5" : "#fef3c7"}`, background: isRetro ? (task.status === "completed" ? "rgba(16, 185, 129, 0.08)" : "rgba(224, 112, 32, 0.08)") : theme.cardBg, padding: "12px 16px", minWidth: isRetro ? 240 : 220, position: "relative", overflow: "hidden", borderRadius: isRetro ? 0 : 10, boxShadow: isRetro ? "none" : "0 1px 2px rgba(0,0,0,0.04)" }}>
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
                <div style={{ width: isRetro ? 12 : 20, height: isRetro ? 12 : 20, border: `1px solid ${isRetro ? "rgba(224, 112, 32, 0.3)" : theme.border}`, borderRadius: isRetro ? 0 : 5 }} />
              )}
              <span style={{ fontSize: isRetro ? 11 : 13, letterSpacing: isRetro ? "0.05em" : undefined, color: task.status === "completed" ? (isRetro ? "#10b981" : "#10b981") : (isRetro ? "#f0a050" : theme.text), fontWeight: isRetro ? 600 : 500 }}>{task.label}</span>
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

      {/* Connection line from parent task */}
      <div className="relative" style={{ width: SUB_CONNECTION_WIDTH, height: totalHeight }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
          {/* Main horizontal connection from parent task */}
          <motion.path d={mirrored ? `M ${SUB_CONNECTION_WIDTH} ${TASK_CONNECTION_Y} L ${SUB_CONNECTION_WIDTH / 2} ${TASK_CONNECTION_Y}` : `M -8 ${TASK_CONNECTION_Y} L ${SUB_CONNECTION_WIDTH / 2} ${TASK_CONNECTION_Y}`} fill="none" stroke={isRetro ? "rgba(224, 112, 32, 0.4)" : "#fcd34d"} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: isCollapsing ? 0 : 1 }} transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }} />
          {/* Vertical line connecting all sub-tasks */}
          {tasks.length > 1 && (<motion.path d={`M ${SUB_CONNECTION_WIDTH / 2} ${TASK_CONNECTION_Y} L ${SUB_CONNECTION_WIDTH / 2} ${getTaskY(tasks.length - 1)}`} fill="none" stroke={isRetro ? "rgba(224, 112, 32, 0.25)" : theme.border} strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: isCollapsing ? 0 : 1 }} transition={{ duration: 0.35, delay: 0.1 }} />)}
          {/* Horizontal lines to each sub-task */}
          {tasks.map((_, i) => (<motion.path key={i} d={mirrored ? `M -8 ${getTaskY(i)} L ${SUB_CONNECTION_WIDTH / 2} ${getTaskY(i)}` : `M ${SUB_CONNECTION_WIDTH / 2} ${getTaskY(i)} L ${SUB_CONNECTION_WIDTH + 8} ${getTaskY(i)}`} fill="none" stroke={isRetro ? "rgba(224, 112, 32, 0.3)" : "#fcd34d"} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: isCollapsing ? 0 : 1 }} transition={{ duration: 0.3, delay: 0.05 + i * 0.06 }} />))}
        </svg>

        {!isCollapsing && (
          <>
            {/* Start node */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: "absolute", left: mirrored ? SUB_CONNECTION_WIDTH : -8, top: TASK_CONNECTION_Y - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: "#e07020", boxShadow: isRetro ? theme.glowWarning : "none" }} />
            {/* Junction node */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: "absolute", left: SUB_CONNECTION_WIDTH / 2, top: TASK_CONNECTION_Y - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: "#e07020", boxShadow: isRetro ? theme.glowWarning : "none" }} />
            {/* Task nodes */}
            {tasks.map((task, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + i * 0.1 }} style={{ position: "absolute", left: mirrored ? -8 : SUB_CONNECTION_WIDTH + 8, top: getTaskY(i) - 2, width: 4, height: 4, borderRadius: isRetro ? 0 : "50%", background: task.status === "working" ? "#e07020" : task.status === "completed" ? (isRetro ? "rgba(94, 234, 212, 0.5)" : "#10b981") : (isRetro ? "rgba(224, 112, 32, 0.4)" : "#d4d4d4"), boxShadow: isRetro && task.status === "working" ? theme.glowWarning : "none" }} />
            ))}
          </>
        )}
      </div>

      {!mirrored && tasksContent}
    </motion.div>
  );
}
