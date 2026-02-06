"use client";

import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/lib/theme";
import type { Task } from "@/lib/types";

export function TaskWidget({ task, onApprove, onReject, onResolve, isCollapsing, collapseIndex, mirrored }: { task: Task; onApprove?: () => void; onReject?: () => void; onResolve?: () => void; isCollapsing?: boolean; collapseIndex?: number; mirrored?: boolean }) {
  const theme = useContext(ThemeContext);
  const isRetro = true;

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
      {(isCompleted || isFailed || isFixing || isRewriting || isWorking || needsApproval || needsResolve || task.subtext) && (
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
          {isCompleted ? (isRetro ? "DONE" : "Done") : isFailed ? (isRetro ? "FAILED" : "Failed") : isFixing ? (isRetro ? "FIXING..." : "Fixing...") : isRewriting ? (isRetro ? "REWRITING..." : "Rewriting...") : needsApproval ? (isRetro ? "APPROVAL REQUIRED" : "Approval Required") : needsResolve ? (isRetro ? "ACTION REQUIRED" : "Action Required") : isWorking ? (isRetro ? "WORKING" : "Working") : (isRetro ? task.subtext?.toUpperCase() : task.subtext)}
        </motion.div>
      )}

      <motion.div
        animate={{ borderColor: colors.border, backgroundColor: colors.bg }}
        transition={{ duration: 0.3 }}
        style={{ border: isRetro ? "2px solid" : "1px solid", padding: "16px 20px", minWidth: isRetro ? 320 : 300, position: "relative", overflow: "hidden", borderRadius: theme.borderRadius, boxShadow: theme.shadow }}
      >
        <div className="flex items-center" style={{ gap: 32 }}>
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
