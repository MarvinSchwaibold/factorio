"use client";

import { X, Link2, ArrowUpRight, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import type { MapNode, Connector, CommerceStat } from "@/lib/iso-map/types";
import { getCategoryDef } from "@/lib/iso-map/node-palette";

interface NodeInspectorProps {
  node: MapNode | null;
  connectors: Connector[];
  nodes: MapNode[];
  onUpdateNode: (nodeId: string, updates: Partial<Pick<MapNode, "label" | "description">>) => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveConnector: (connectorId: string) => void;
  onClose: () => void;
  onDrillDown?: (category: string) => void;
  isDark: boolean;
}

function TrendIcon({ trend, size }: { trend?: "up" | "down" | "flat"; size: number }) {
  if (trend === "up") return <TrendingUp size={size} style={{ color: "#22c55e" }} />;
  if (trend === "down") return <TrendingDown size={size} style={{ color: "#ef4444" }} />;
  if (trend === "flat") return <Minus size={size} style={{ color: "#6b7280" }} />;
  return null;
}

export function NodeInspector({
  node,
  connectors,
  nodes,
  onUpdateNode,
  onRemoveNode,
  onRemoveConnector,
  onClose,
  onDrillDown,
  isDark,
}: NodeInspectorProps) {
  if (!node) return null;

  var def = getCategoryDef(node.category);
  var stats = node.stats || [];
  var primaryStat = stats.length > 0 ? stats[0] : null;
  var secondaryStats = stats.slice(1);

  // Find connected connectors
  var nodeConnectors = connectors.filter(function(c) {
    return c.sourceId === node.id || c.targetId === node.id;
  });

  function getNodeLabel(nodeId: string): string {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) return nodes[i].label;
    }
    return "Unknown";
  }

  var font = "var(--font-geist-sans), system-ui, sans-serif";

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        width: 240,
        borderRadius: 10,
        background: isDark ? "rgba(26,26,26,0.95)" : "rgba(255,255,255,0.95)",
        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
        backdropFilter: "blur(12px)",
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      {/* Header with category color bar */}
      <div style={{
        height: 3,
        background: def.color,
      }} />
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px 8px",
        borderBottom: isDark ? "1px solid #2a2a2a" : "1px solid #eee",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: def.color,
          }} />
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: isDark ? "#ccc" : "#333",
            fontFamily: font,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {def.label}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 4,
            border: "none",
            background: "transparent",
            color: isDark ? "#666" : "#999",
            cursor: "pointer",
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Primary stat */}
      {primaryStat && (
        <div style={{ padding: "12px 12px 4px" }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: isDark ? "#666" : "#999",
            fontFamily: font,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}>
            {primaryStat.label}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: isDark ? "#eee" : "#111",
              fontFamily: font,
              letterSpacing: "-0.02em",
            }}>
              {primaryStat.value}
            </span>
            <TrendIcon trend={primaryStat.trend} size={16} />
          </div>
        </div>
      )}

      {/* Secondary stats */}
      {secondaryStats.length > 0 && (
        <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {secondaryStats.map(function(stat: CommerceStat, idx: number) {
            return (
              <div key={idx} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "3px 0",
              }}>
                <span style={{
                  fontSize: 11,
                  color: isDark ? "#888" : "#666",
                  fontFamily: font,
                }}>
                  {stat.label}
                </span>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: isDark ? "#ccc" : "#333",
                  fontFamily: font,
                }}>
                  {stat.value}
                  <TrendIcon trend={stat.trend} size={12} />
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Alerts */}
      {node.alertCount != null && node.alertCount > 0 && (
        <div style={{
          margin: "0 12px",
          padding: "6px 8px",
          borderRadius: 6,
          background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <AlertCircle size={12} style={{ color: "#ef4444", flexShrink: 0 }} />
          <span style={{
            fontSize: 11,
            color: "#ef4444",
            fontFamily: font,
          }}>
            {node.alertCount} {node.alertCount === 1 ? "alert" : "alerts"} need attention
          </span>
        </div>
      )}

      {/* Connections */}
      {nodeConnectors.length > 0 && (
        <div style={{
          padding: "8px 12px 6px",
          borderTop: isDark ? "1px solid #222" : "1px solid #f0f0f0",
          marginTop: 6,
        }}>
          <label style={{
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            color: isDark ? "#666" : "#999",
            fontFamily: font,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}>
            Data Flows
          </label>
          {nodeConnectors.map(function(c) {
            var otherId = c.sourceId === node.id ? c.targetId : c.sourceId;
            var direction = c.sourceId === node.id ? "\u2192" : "\u2190";
            return (
              <div key={c.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "3px 0",
              }}>
                <span style={{
                  fontSize: 11,
                  color: isDark ? "#aaa" : "#666",
                  fontFamily: font,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  <Link2 size={10} />
                  {direction} {getNodeLabel(otherId)}
                </span>
                <button
                  onClick={function() { onRemoveConnector(c.id); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    border: "none",
                    background: "transparent",
                    color: isDark ? "#555" : "#ccc",
                    cursor: "pointer",
                    fontSize: 10,
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: "8px 12px 10px",
        borderTop: isDark ? "1px solid #222" : "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}>
        {/* Drill down button */}
        {onDrillDown && (
          <button
            onClick={function() { onDrillDown(node.category); }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              padding: "6px",
              borderRadius: 6,
              border: isDark ? "1px solid #333" : "1px solid #ddd",
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
              color: isDark ? "#ccc" : "#333",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 500,
              fontFamily: font,
            }}
          >
            <ArrowUpRight size={12} />
            Drill Down
          </button>
        )}

        {/* Delete button — hidden for admin hub */}
        {node.category !== "back-office" && (
        <button
          onClick={function() { onRemoveNode(node.id); }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "6px",
            borderRadius: 6,
            border: "none",
            background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 500,
            fontFamily: font,
          }}
        >
          Delete Node
        </button>
        )}
      </div>
    </div>
  );
}
