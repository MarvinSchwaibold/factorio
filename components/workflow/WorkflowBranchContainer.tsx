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
