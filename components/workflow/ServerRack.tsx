"use client";

import { useContext } from "react";
import { ThemeContext } from "@/lib/theme";

export function ServerRack() {
  const theme = useContext(ThemeContext);
  return (
    <div style={{ border: `1px solid ${theme.border}`, background: theme.cardBgHover, display: "flex", flexDirection: "column", gap: 4, padding: 6, justifyContent: "center", borderRadius: 6 }}>
      {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ height: 5, background: theme.border, width: "100%", borderRadius: 2 }} />)}
    </div>
  );
}
