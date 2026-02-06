"use client";

import { createContext } from "react";

export const theme = {
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

export type Theme = typeof theme;
export const ThemeContext = createContext<Theme>(theme);
