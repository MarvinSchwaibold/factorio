"use client";

import { useContext } from "react";
import { ThemeContext } from "@/lib/theme";

const sections = [
  { label: "General", description: "Store name, timezone, and units" },
  { label: "Agent Preferences", description: "Auto-pilot behavior, approval thresholds" },
  { label: "Notifications", description: "Alerts, email digests, and webhooks" },
  { label: "Permissions", description: "Staff access and agent capabilities" },
  { label: "Integrations", description: "Connected apps and data sources" },
];

export function SettingsView() {
  const theme = useContext(ThemeContext);

  return (
    <div
      style={{
        flex: 1,
        padding: "32px 40px",
        background: "transparent",
        fontFamily: theme.fontFamily,
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 720 }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme.text,
            marginBottom: 4,
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontSize: 13,
            color: theme.textMuted,
            marginBottom: 32,
          }}
        >
          Configuration and preferences
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {sections.map((section, i) => (
            <div
              key={section.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom:
                  i < sections.length - 1
                    ? `1px solid ${theme.borderDim}`
                    : "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fafafa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: theme.text,
                    marginBottom: 2,
                  }}
                >
                  {section.label}
                </div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>
                  {section.description}
                </div>
              </div>
              <div style={{ color: "#d1d5db", fontSize: 14 }}>›</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
