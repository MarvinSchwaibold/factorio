"use client";

import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/lib/theme";
import { TASK_CONNECTION_Y, SUB_CONNECTION_WIDTH } from "@/lib/constants";

export function EmailPreviewPanel({
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
  const isRetro = false;

  const [subject, setSubject] = useState("Your exclusive 20% off awaits!");
  const [body, setBody] = useState("Hi valued customer,\n\nWe noticed you've been eyeing some items in your cart. Here's a special 20% discount just for you!\n\nUse code: SAVE20\n\nOffer expires in 48 hours.");

  if (!isActive) return null;

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

      {/* Connection line */}
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
