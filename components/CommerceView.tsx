"use client";

import { useContext, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";
import { ThemeContext } from "@/lib/theme";
import { getCommerceData } from "@/lib/commerce-data";

var STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  paid: { bg: "#dcfce7", text: "#166534" },
  pending: { bg: "#fef9c3", text: "#854d0e" },
  refunded: { bg: "#fee2e2", text: "#991b1b" },
  partially_refunded: { bg: "#fee2e2", text: "#991b1b" },
};

export function CommerceView() {
  var theme = useContext(ThemeContext);
  var data = useMemo(function () {
    return getCommerceData();
  }, []);

  var m = data.metrics;
  var changeUp = m.revenueChange >= 0;

  var card: React.CSSProperties = {
    background: theme.cardBg,
    border: "1px solid " + theme.borderLight,
    borderRadius: 12,
    overflow: "hidden",
  };

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
      <style>{"\
        .commerce-row { transition: background 120ms ease; }\
        .commerce-row:hover { background: rgba(0,0,0,0.04); }\
      "}</style>

      <div>
        {/* Header */}
        <h1
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme.text,
            marginBottom: 4,
          }}
        >
          Commerce
        </h1>
        <p
          style={{
            fontSize: 13,
            color: theme.textMuted,
            marginBottom: 20,
          }}
        >
          {"Store overview \u00B7 Kaz\u2019s Candles"}
        </p>

        {/* Metrics bar */}
        <div
          style={{
            display: "flex",
            gap: 28,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid " + theme.borderDim,
          }}
        >
          {/* Revenue */}
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: theme.text,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 2,
                display: "flex",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              {"$" +
                m.revenue.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
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
                {changeUp ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {(changeUp ? "+" : "") + m.revenueChange.toFixed(1) + "%"}
              </span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: theme.textMuted,
                fontWeight: 500,
              }}
            >
              Revenue
            </div>
          </div>

          {/* Orders */}
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: theme.text,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 2,
              }}
            >
              {m.orderCount}
            </div>
            <div
              style={{
                fontSize: 11,
                color: theme.textMuted,
                fontWeight: 500,
              }}
            >
              Orders (30d)
            </div>
          </div>

          {/* AOV */}
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: theme.text,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 2,
              }}
            >
              {"$" + m.aov.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: theme.textMuted,
                fontWeight: 500,
              }}
            >
              AOV (30d)
            </div>
          </div>

          {/* Low stock */}
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: m.lowStockCount > 0 ? theme.warning : theme.text,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 2,
              }}
            >
              {m.lowStockCount}
            </div>
            <div
              style={{
                fontSize: 11,
                color: theme.textMuted,
                fontWeight: 500,
              }}
            >
              Low stock items
            </div>
          </div>
        </div>

        {/* Widget grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Recent orders */}
          <div style={card}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.text,
                padding: "14px 16px 6px",
              }}
            >
              Recent orders
            </div>
            <div style={{ paddingBottom: 6 }}>
              {data.recentOrders.map(function (order) {
                var statusStyle =
                  STATUS_COLORS[order.financialStatus] || STATUS_COLORS.pending;
                return (
                  <div
                    key={order.name}
                    className="commerce-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: theme.textDim,
                          fontVariantNumeric: "tabular-nums",
                          fontWeight: 500,
                        }}
                      >
                        {order.name}
                      </span>
                      <span style={{ fontSize: 13, color: theme.text }}>
                        {order.customerName}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {order.financialStatus}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: theme.text,
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                        marginLeft: 12,
                      }}
                    >
                      {order.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory alerts */}
          <div style={card}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.text,
                padding: "14px 16px 6px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <AlertTriangle size={13} />
              Inventory alerts
            </div>
            <div style={{ paddingBottom: 6 }}>
              {data.inventoryAlerts.map(function (alert) {
                var isZero = alert.available === 0;
                return (
                  <div
                    key={alert.productTitle + "|" + alert.variantTitle}
                    className="commerce-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 16px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: theme.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {alert.productTitle}
                      </div>
                      {alert.variantTitle !== "Standard" && (
                        <div
                          style={{ fontSize: 11, color: theme.textMuted }}
                        >
                          {alert.variantTitle}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: isZero ? "#991b1b" : theme.warningText,
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                        marginLeft: 12,
                      }}
                    >
                      {isZero ? "Out of stock" : alert.available + " left"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
