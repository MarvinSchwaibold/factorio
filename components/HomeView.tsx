"use client";

import { useContext } from "react";
import { ThemeContext } from "@/lib/theme";

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

const stats = [
  { label: "Orders today", value: "23" },
  { label: "Revenue (MTD)", value: "$14.2k" },
  { label: "Pending tasks", value: "3" },
  { label: "Low stock items", value: "5" },
];

const quickActions = [
  { label: "Process orders", target: "canvas" },
  { label: "Check inventory", target: "canvas" },
  { label: "View insights", target: "insights" },
];

const recentActivity = [
  { label: "Completed: Weekly Analytics Report", time: "12 min ago" },
  { label: "Completed: Bulk Product Update", time: "34 min ago" },
  { label: "Flagged: Inventory Discrepancy", time: "1h ago" },
  { label: "Auto-resolved: Order #4821 payment retry", time: "2h ago" },
];

export function HomeView({ onNavigate }: HomeViewProps) {
  const theme = useContext(ThemeContext);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        flex: 1,
        padding: "40px 40px",
        fontFamily: theme.fontFamily,
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 640 }}>
        {/* Greeting */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: theme.text,
            marginBottom: 4,
          }}
        >
          {greeting}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: theme.textMuted,
            marginBottom: 36,
          }}
        >
          {dateStr}
        </p>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginBottom: 36,
            paddingBottom: 24,
            borderBottom: `1px solid ${theme.borderDim}`,
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: theme.text,
                  fontVariantNumeric: "tabular-nums",
                  marginBottom: 2,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Quick actions
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.target)}
                style={{
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: theme.text,
                  background: "#ffffff",
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: theme.fontFamily,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = theme.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = theme.borderLight;
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Recent activity
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentActivity.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom:
                    i < recentActivity.length - 1
                      ? `1px solid ${theme.borderDim}`
                      : "none",
                }}
              >
                <span style={{ fontSize: 13, color: theme.text, fontWeight: 400 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 11, color: theme.textDim, flexShrink: 0, marginLeft: 16 }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
