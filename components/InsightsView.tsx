"use client";

import { useContext, useMemo } from "react";
import { TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ThemeContext } from "@/lib/theme";
import { getCommerceData } from "@/lib/commerce-data";

export function InsightsView() {
  var theme = useContext(ThemeContext);
  var data = useMemo(function () {
    return getCommerceData();
  }, []);

  var m = data.metrics;
  var changeUp = m.revenueChange >= 0;
  var aovStr = "$" + m.aov.toFixed(2);

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
        .insights-row { transition: background 120ms ease; }\
        .insights-row:hover { background: rgba(0,0,0,0.04); }\
      "}</style>

      <div>
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
            marginBottom: 20,
          }}
        >
          {"Performance metrics and observations \u00B7 Kaz\u2019s Candles"}
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
              Revenue (30d)
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
              {aovStr}
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
        </div>

        {/* Sidekick observations */}
        <div style={{ ...card, marginBottom: 16 }}>
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
            <TrendingUp size={14} />
            Sidekick observations
          </div>
          <div style={{ paddingBottom: 6 }}>
            {data.observations.map(function (obs, i) {
              return (
                <div
                  key={i}
                  className="insights-row"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 16px",
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
                  <div
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: theme.text,
                      lineHeight: 1.4,
                    }}
                  >
                    {obs.message}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: theme.textDim,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {obs.time}
                  </div>
                </div>
              );
            })}
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
          {/* Top products */}
          <div style={card}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.text,
                padding: "14px 16px 6px",
              }}
            >
              Top products (30d)
            </div>
            <div style={{ paddingBottom: 6 }}>
              {data.topProducts.map(function (product, i) {
                return (
                  <div
                    key={product.title}
                    className="insights-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: theme.textDim,
                        fontWeight: 600,
                        width: 16,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: theme.text }}>
                        {product.title}
                      </div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>
                        {"$" +
                          product.revenue.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }) +
                          " \u00B7 " +
                          product.units +
                          " units"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top customers */}
          <div style={card}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.text,
                padding: "14px 16px 6px",
              }}
            >
              Top customers
            </div>
            <div style={{ paddingBottom: 6 }}>
              {data.topCustomers.map(function (customer) {
                return (
                  <div
                    key={customer.email}
                    className="insights-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 16px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, color: theme.text }}>
                        {customer.name}
                      </div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>
                        {customer.email}
                      </div>
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
                      {"$" +
                        customer.totalSpent.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
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
