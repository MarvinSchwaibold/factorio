"use client";

import { useContext } from "react";
import { LayoutDashboard, Grid3x3, Clock, BarChart3, Settings } from "lucide-react";
import { ThemeContext } from "@/lib/theme";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  viewKey: string;
}

interface SideNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function SideNav({ activeView, onViewChange }: SideNavProps) {
  const theme = useContext(ThemeContext);

  const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={18} />, label: "MAIN", viewKey: "main" },
    { icon: <Grid3x3 size={18} />, label: "BLUEPRINT", viewKey: "blueprint" },
    { icon: <Clock size={18} />, label: "HISTORY", viewKey: "history" },
    { icon: <BarChart3 size={18} />, label: "ANALYTICS", viewKey: "analytics" },
    { icon: <Settings size={18} />, label: "SETTINGS", viewKey: "settings" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 56,
        height: "100vh",
        background: "rgba(13, 15, 13, 0.95)",
        borderRight: `1px solid ${theme.borderLight}`,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "14px 0 18px",
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: theme.accent,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        SIDE
        <br />
        KICK
      </div>

      {/* Nav Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {navItems.map((item) => {
          const isActive = activeView === item.viewKey;

          return (
            <button
              key={item.viewKey}
              onClick={() => onViewChange(item.viewKey)}
              style={{
                background: isActive
                  ? "rgba(94, 234, 212, 0.12)"
                  : "transparent",
                border: "none",
                borderLeft: isActive
                  ? `2px solid ${theme.accent}`
                  : "2px solid transparent",
                color: isActive ? theme.accent : theme.textDim,
                padding: "10px 0",
                cursor: "pointer",
                fontFamily: theme.fontFamily,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                width: "100%",
                transition: "all 0.15s ease",
                boxShadow: isActive
                  ? "inset 0 0 20px rgba(94, 234, 212, 0.06)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(94, 234, 212, 0.06)";
                  e.currentTarget.style.color = "rgba(94, 234, 212, 0.7)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = theme.textDim;
                }
              }}
            >
              {item.icon}
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.08em" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
