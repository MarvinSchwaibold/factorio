"use client";

import { createContext } from "react";

export const theme = {
  // Main colors
  background: "#fafafa",
  accent: "#0d9488",
  accentRgb: "13, 148, 136",
  text: "#111827",
  textMuted: "#6b7280",
  textDim: "#9ca3af",
  // Borders
  border: "#d1d5db",
  borderLight: "#e5e7eb",
  borderDim: "#f3f4f6",
  // Backgrounds
  cardBg: "#ffffff",
  cardBgHover: "#f9fafb",
  buttonBg: "rgba(13, 148, 136, 0.08)",
  buttonBgHover: "rgba(13, 148, 136, 0.15)",
  inputBg: "#f5f5f5",
  // States
  success: "#10b981",
  successBg: "rgba(16, 185, 129, 0.08)",
  warning: "#e07020",
  warningText: "#b45309",
  warningBg: "rgba(224, 112, 32, 0.08)",
  warningBorder: "rgba(224, 112, 32, 0.3)",
  error: "#ef4444",
  errorBg: "rgba(239, 68, 68, 0.08)",
  // Grid
  gridPattern: "linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)",
  // Component specific
  connectionLine: "rgba(13, 148, 136, 0.3)",
  connectionLineDim: "rgba(13, 148, 136, 0.15)",
  dot: "#0d9488",
  dotDim: "rgba(13, 148, 136, 0.3)",
  // Shadows
  shadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
  glowAccent: "0 0 6px rgba(13, 148, 136, 0.3)",
  glowSuccess: "0 0 6px rgba(16, 185, 129, 0.4)",
  glowWarning: "0 0 6px rgba(224, 112, 32, 0.4)",
  // Typography
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  borderRadius: "8px",
  labelStyle: "uppercase" as const,
};

export type Theme = typeof theme;
export const ThemeContext = createContext<Theme>(theme);
