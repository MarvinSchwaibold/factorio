"use client";

import { useContext } from "react";
import { TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ThemeContext } from "@/lib/theme";

const metrics = [
  { label: "Orders today", value: "23", change: "+12%", up: true },
  { label: "Revenue (MTD)", value: "$14.2k", change: "+8.3%", up: true },
  { label: "Avg order value", value: "$62", change: "-2.1%", up: false },
  { label: "Conversion rate", value: "3.4%", change: "+0.5%", up: true },
];

const alerts = [
  {
    type: "warning" as const,
    message: "Low stock on 3 bestselling products",
    time: "2h ago",
  },
  {
    type: "info" as const,
    message: "Weekend traffic up 18% vs. last week",
    time: "4h ago",
  },
  {
    type: "info" as const,
    message: "New customer segment identified: repeat buyers (30-day)",
    time: "1d ago",
  },
];

export function InsightsView() {
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
          Insights
        </h1>
        <p
          style={{
            fontSize: 13,
            color: theme.textMuted,
            marginBottom: 32,
          }}
        >
          Performance metrics and agent recommendations
        </p>

        {/* Metrics grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 32,
          }}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                padding: "16px 20px",
                background: theme.cardBg,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: theme.textMuted,
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: theme.text,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {metric.value}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {metric.up ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.text,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrendingUp size={14} />
            Agent observations
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {alerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 16px",
                  background: theme.cardBg,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: 10,
                }}
              >
                <AlertCircle
                  size={14}
                  style={{
                    color: "#9ca3af",
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.text,
                      lineHeight: 1.4,
                    }}
                  >
                    {alert.message}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.textDim,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {alert.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
