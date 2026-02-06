"use client";

import { useContext } from "react";
import { CheckCircle2, AlertTriangle, Zap, Clock } from "lucide-react";
import { ThemeContext } from "@/lib/theme";

const activities = [
  {
    icon: <CheckCircle2 size={14} />,
    label: "Completed: Weekly Analytics Report",
    detail: "Generated revenue summary, customer acquisition metrics, and inventory forecast",
    time: "12 min ago",
  },
  {
    icon: <CheckCircle2 size={14} />,
    label: "Completed: Bulk Product Update",
    detail: "Updated pricing on 47 products across 3 collections",
    time: "34 min ago",
  },
  {
    icon: <AlertTriangle size={14} />,
    label: "Flagged: Inventory Discrepancy",
    detail: "3 SKUs show negative available count — needs manual review",
    time: "1h ago",
  },
  {
    icon: <Zap size={14} />,
    label: "Auto-resolved: Order #4821 payment retry",
    detail: "Payment gateway timeout — retried successfully on second attempt",
    time: "2h ago",
  },
  {
    icon: <CheckCircle2 size={14} />,
    label: "Completed: Customer Segment Refresh",
    detail: "Recalculated 12 dynamic segments, 2.4k customers re-evaluated",
    time: "3h ago",
  },
  {
    icon: <Clock size={14} />,
    label: "Scheduled: End-of-day fulfillment batch",
    detail: "18 orders queued for pickup scan at 5:00 PM",
    time: "Upcoming",
  },
];

export function ActivityView() {
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
          Activity
        </h1>
        <p
          style={{
            fontSize: 13,
            color: theme.textMuted,
            marginBottom: 32,
          }}
        >
          Agent actions, decisions, and audit trail
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {activities.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "14px 0",
                borderBottom:
                  i < activities.length - 1
                    ? `1px solid ${theme.borderDim}`
                    : "none",
              }}
            >
              <div
                style={{
                  color: "#9ca3af",
                  marginTop: 2,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: theme.text,
                    marginBottom: 3,
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: theme.textMuted,
                    lineHeight: 1.4,
                  }}
                >
                  {item.detail}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.textDim,
                  flexShrink: 0,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
