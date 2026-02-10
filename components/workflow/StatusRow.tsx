"use client";

import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/lib/theme";

export function StatusRow({ label, value, isRetro, color, active }: { label: string; value: number; isRetro: boolean; color?: string; active?: boolean }) {
  const theme = useContext(ThemeContext);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{
        fontSize: isRetro ? 9 : 11,
        color: isRetro ? "rgba(94, 234, 212, 0.5)" : theme.textMuted,
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
          color: color || (isRetro ? "#5eead4" : theme.text),
          fontFamily: isRetro ? "monospace" : undefined
        }}
      >
        {value}
      </motion.span>
    </div>
  );
}
