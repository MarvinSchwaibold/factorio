"use client";

import { useContext } from "react";
import { ThemeContext } from "@/lib/theme";

interface PlaceholderViewProps {
  title: string;
}

export function PlaceholderView({ title }: PlaceholderViewProps) {
  const theme = useContext(ThemeContext);

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.background,
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: theme.gridPattern,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: 40,
          border: `1px solid ${theme.borderDim}`,
          background: theme.cardBg,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: theme.accent,
            fontFamily: theme.fontFamily,
          }}
        >
          {title.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            color: theme.textDim,
            fontFamily: theme.fontFamily,
            fontWeight: 500,
          }}
        >
          COMING SOON
        </div>
        <div
          style={{
            width: 40,
            height: 1,
            background: theme.borderDim,
            marginTop: 4,
          }}
        />
        <div
          style={{
            fontSize: 9,
            color: theme.textDim,
            fontFamily: theme.fontFamily,
            opacity: 0.6,
            letterSpacing: "0.06em",
          }}
        >
          MODULE OFFLINE
        </div>
      </div>
    </div>
  );
}
