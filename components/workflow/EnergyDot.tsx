"use client";

import { motion } from "framer-motion";

export function EnergyDot({ delay, color, duration, path }: { delay: number; color: string; duration: number; path: string }) {
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
