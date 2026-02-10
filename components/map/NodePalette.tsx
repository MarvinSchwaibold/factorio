"use client";

import { useState } from "react";
import {
  Monitor, Store, Warehouse, Megaphone, Truck,
  Building2, ShoppingCart, Lock, Landmark, Receipt, CreditCard, TrendingUp,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { NODE_CATEGORIES } from "@/lib/iso-map/node-palette";
import type { NodeCategory } from "@/lib/iso-map/types";

interface NodePaletteProps {
  activeCategory: NodeCategory | null;
  onSelectCategory: (cat: NodeCategory) => void;
  isDark: boolean;
}

// Map infrastructure category to Lucide icon component
function getCategoryIcon(cat: NodeCategory, size: number) {
  switch (cat) {
    case "back-office": return <Building2 size={size} />;
    case "online-store": return <Monitor size={size} />;
    case "retail": return <Store size={size} />;
    case "checkout": return <ShoppingCart size={size} />;
    case "payments": return <Lock size={size} />;
    case "balance": return <Landmark size={size} />;
    case "inventory": return <Warehouse size={size} />;
    case "marketing": return <Megaphone size={size} />;
    case "shipping": return <Truck size={size} />;
    case "tax": return <Receipt size={size} />;
    case "billing": return <CreditCard size={size} />;
    case "capital": return <TrendingUp size={size} />;
    default: return <Monitor size={size} />;
  }
}

export function NodePalette({ activeCategory, onSelectCategory, isDark }: NodePaletteProps) {
  var [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        width: collapsed ? 40 : 160,
        maxHeight: "calc(100vh - 80px)",
        borderRadius: 10,
        background: isDark ? "rgba(26,26,26,0.95)" : "rgba(255,255,255,0.95)",
        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
        backdropFilter: "blur(12px)",
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
        overflow: "hidden",
        transition: "width 200ms ease",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <button
        onClick={function() { setCollapsed(!collapsed); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: collapsed ? "8px 12px" : "8px 12px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: isDark ? "#aaa" : "#666",
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          flexShrink: 0,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        {!collapsed && "Infrastructure"}
      </button>

      {/* Category list */}
      {!collapsed && (
        <div style={{ padding: "0 6px 6px", overflowY: "auto", flex: 1 }}>
          {NODE_CATEGORIES.map(function(def) {
            var isActive = activeCategory === def.category;
            return (
              <button
                key={def.category}
                onClick={function() { onSelectCategory(def.category); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: "none",
                  background: isActive
                    ? (isDark ? "rgba(13,148,136,0.2)" : "rgba(13,148,136,0.1)")
                    : "transparent",
                  color: isActive ? "#0d9488" : (isDark ? "#ccc" : "#444"),
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 150ms",
                  textAlign: "left",
                }}
              >
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  background: isActive
                    ? def.color
                    : (isDark ? "#252525" : "#f0f0f0"),
                  color: isActive ? "#fff" : (isDark ? "#888" : "#666"),
                  flexShrink: 0,
                }}>
                  {getCategoryIcon(def.category, 12)}
                </span>
                {def.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
