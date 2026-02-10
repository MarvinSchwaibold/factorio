"use client";

import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/lib/theme";

export function CompletedTaskWidget({ label, onClose, mirrored }: { label: string; onClose: () => void; mirrored?: boolean }) {
  const theme = useContext(ThemeContext);
  const isRetro = false;

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
          background: isRetro ? theme.successBg : theme.cardBg,
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
            background: isRetro ? "transparent" : theme.cardBgHover,
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
              e.currentTarget.style.background = theme.border;
            }
          }}
          onMouseLeave={(e) => {
            if (isRetro) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(16, 185, 129, 0.6)";
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
            } else {
              e.currentTarget.style.background = theme.cardBgHover;
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

          <span style={{ fontSize: isRetro ? 13 : 14, letterSpacing: isRetro ? "0.06em" : undefined, color: isRetro ? theme.success : theme.text, fontWeight: 600 }}>
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
