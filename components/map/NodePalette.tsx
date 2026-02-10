"use client";

import { useState } from "react";
import {
  ShoppingBag, Tag, Users, Megaphone, Percent,
  Image, Globe, Landmark, BarChart3, Building2,
  Monitor, Store, Smartphone, Facebook, Youtube, Music2,
  Mail, Star, Zap,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { NODE_CATEGORIES } from "@/lib/iso-map/node-palette";
import type { NodeCategory, NodeCategoryDef } from "@/lib/iso-map/types";

interface NodePaletteProps {
  activeCategory: NodeCategory | null;
  onSelectCategory: (cat: NodeCategory) => void;
  isDark: boolean;
}

// Map category to Lucide icon component
function getCategoryIcon(cat: NodeCategory, size: number) {
  switch (cat) {
    case "back-office": return <Building2 size={size} />;
    case "orders": return <ShoppingBag size={size} />;
    case "products": return <Tag size={size} />;
    case "customers": return <Users size={size} />;
    case "marketing": return <Megaphone size={size} />;
    case "discounts": return <Percent size={size} />;
    case "content": return <Image size={size} />;
    case "markets": return <Globe size={size} />;
    case "finance": return <Landmark size={size} />;
    case "analytics": return <BarChart3 size={size} />;
    // Channels
    case "online-store": return <Monitor size={size} />;
    case "pos": return <Store size={size} />;
    case "shop-channel": return <Smartphone size={size} />;
    case "facebook-instagram": return <Facebook size={size} />;
    case "google-youtube": return <Youtube size={size} />;
    case "tiktok": return <Music2 size={size} />;
    // Apps
    case "app-klaviyo": return <Mail size={size} />;
    case "app-judgeme": return <Star size={size} />;
    case "app-flow": return <Zap size={size} />;
    default: return <Building2 size={size} />;
  }
}

function PaletteSection({
  label,
  items,
  activeCategory,
  onSelectCategory,
  isDark,
}: {
  label: string;
  items: NodeCategoryDef[];
  activeCategory: NodeCategory | null;
  onSelectCategory: (cat: NodeCategory) => void;
  isDark: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div style={{
        fontSize: 9,
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        color: isDark ? "#555" : "#999",
        padding: "6px 8px 2px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}>
        {label}
      </div>
      {items.map(function(def) {
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
              textAlign: "left" as const,
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
  );
}

export function NodePalette({ activeCategory, onSelectCategory, isDark }: NodePaletteProps) {
  var [collapsed, setCollapsed] = useState(false);

  // Split categories into sections, excluding "back-office" (hub)
  var coreItems: NodeCategoryDef[] = [];
  var channelItems: NodeCategoryDef[] = [];
  var appItems: NodeCategoryDef[] = [];

  for (var i = 0; i < NODE_CATEGORIES.length; i++) {
    var def = NODE_CATEGORIES[i];
    if (def.category === "back-office") continue;
    if (def.nodeType === "channel") {
      channelItems.push(def);
    } else if (def.nodeType === "app") {
      appItems.push(def);
    } else {
      coreItems.push(def);
    }
  }

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
        flexDirection: "column" as const,
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
          padding: "8px 12px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: isDark ? "#aaa" : "#666",
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
          flexShrink: 0,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        {!collapsed && "Nodes"}
      </button>

      {/* Category sections */}
      {!collapsed && (
        <div style={{ padding: "0 6px 6px", overflowY: "auto" as const, flex: 1 }}>
          <PaletteSection
            label="Core"
            items={coreItems}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
            isDark={isDark}
          />
          <PaletteSection
            label="Channels"
            items={channelItems}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
            isDark={isDark}
          />
          <PaletteSection
            label="Apps"
            items={appItems}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
            isDark={isDark}
          />
        </div>
      )}
    </div>
  );
}
