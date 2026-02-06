"use client";

import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/lib/theme";

export function WorkflowBranchContainer({
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

  if (!isActive && !scenarioLabel && !isCleanComplete) return null;

  const borderColor = isCleanComplete ? "rgba(16, 185, 129, 0.4)" : theme.borderLight;
  const bgColor = isCleanComplete ? "rgba(16, 185, 129, 0.04)" : "#ffffff";
  const accentColor = isCleanComplete ? "#10b981" : theme.accent;

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
        borderRadius: 12,
        boxShadow: isCleanComplete ? "0 0 20px rgba(16, 185, 129, 0.1)" : "0 1px 3px rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Header */}
      {(scenarioLabel || isCleanComplete) && (
        <div
          style={{
            borderBottom: `1px solid ${isCleanComplete ? "rgba(16, 185, 129, 0.2)" : "#f0f0f0"}`,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexDirection: mirrored ? "row-reverse" : "row",
          }}
        >
          {isCleanComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{
                width: 20,
                height: 20,
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
              }}
            >
              <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 700 }}>✓</span>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: accentColor,
              }}
            />
          )}
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.02em",
              color: isCleanComplete ? "#10b981" : theme.textMuted,
              fontWeight: 600,
            }}
          >
            {isCleanComplete ? "System Optimized" : scenarioLabel}
          </span>
        </div>
      )}

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
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              All issues resolved
            </span>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>0</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>Errors</div>
              </div>
              <div style={{ width: 1, background: "#e5e7eb" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>100%</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>Health</div>
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
