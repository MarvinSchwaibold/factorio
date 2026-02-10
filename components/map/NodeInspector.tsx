"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Link2 } from "lucide-react";
import type { MapNode, Connector } from "@/lib/iso-map/types";
import { getCategoryDef } from "@/lib/iso-map/node-palette";

interface NodeInspectorProps {
  node: MapNode | null;
  connectors: Connector[];
  nodes: MapNode[];
  onUpdateNode: (nodeId: string, updates: Partial<Pick<MapNode, "label" | "description">>) => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveConnector: (connectorId: string) => void;
  onClose: () => void;
  isDark: boolean;
}

export function NodeInspector({
  node,
  connectors,
  nodes,
  onUpdateNode,
  onRemoveNode,
  onRemoveConnector,
  onClose,
  isDark,
}: NodeInspectorProps) {
  var [labelValue, setLabelValue] = useState("");
  var [descValue, setDescValue] = useState("");

  useEffect(function() {
    if (node) {
      setLabelValue(node.label);
      setDescValue(node.description);
    }
  }, [node]);

  if (!node) return null;

  var def = getCategoryDef(node.category);

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

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        width: 220,
        borderRadius: 10,
        background: isDark ? "rgba(26,26,26,0.95)" : "rgba(255,255,255,0.95)",
        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
        backdropFilter: "blur(12px)",
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      {/* Header */}
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
            background: def.colorTop,
          }} />
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: isDark ? "#ccc" : "#333",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
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

      {/* Name input */}
      <div style={{ padding: "10px 12px" }}>
        <label style={{
          display: "block",
          fontSize: 10,
          fontWeight: 600,
          color: isDark ? "#666" : "#999",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}>
          Name
        </label>
        <input
          type="text"
          value={labelValue}
          onChange={function(e) {
            setLabelValue(e.target.value);
            onUpdateNode(node.id, { label: e.target.value });
          }}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 6,
            border: isDark ? "1px solid #333" : "1px solid #ddd",
            background: isDark ? "#1a1a1a" : "#f9f9f9",
            color: isDark ? "#ddd" : "#333",
            fontSize: 13,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <label style={{
          display: "block",
          fontSize: 10,
          fontWeight: 600,
          color: isDark ? "#666" : "#999",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginTop: 10,
          marginBottom: 4,
        }}>
          Description
        </label>
        <textarea
          value={descValue}
          onChange={function(e) {
            setDescValue(e.target.value);
            onUpdateNode(node.id, { description: e.target.value });
          }}
          rows={2}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 6,
            border: isDark ? "1px solid #333" : "1px solid #ddd",
            background: isDark ? "#1a1a1a" : "#f9f9f9",
            color: isDark ? "#ddd" : "#333",
            fontSize: 12,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            outline: "none",
            resize: "none",
            boxSizing: "border-box",
          }}
        />

        <div style={{
          fontSize: 10,
          color: isDark ? "#555" : "#bbb",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          marginTop: 6,
        }}>
          Tile: ({node.tileX}, {node.tileY})
        </div>
      </div>

      {/* Connections */}
      {nodeConnectors.length > 0 && (
        <div style={{
          padding: "0 12px 10px",
          borderTop: isDark ? "1px solid #222" : "1px solid #f0f0f0",
          paddingTop: 10,
        }}>
          <label style={{
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            color: isDark ? "#666" : "#999",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}>
            Connections
          </label>
          {nodeConnectors.map(function(c) {
            var otherId = c.sourceId === node.id ? c.targetId : c.sourceId;
            var direction = c.sourceId === node.id ? "→" : "←";
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
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
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

      {/* Delete button */}
      <div style={{
        padding: "8px 12px 10px",
        borderTop: isDark ? "1px solid #222" : "1px solid #f0f0f0",
      }}>
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
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}
        >
          <Trash2 size={12} />
          Delete Node
        </button>
      </div>
    </div>
  );
}
