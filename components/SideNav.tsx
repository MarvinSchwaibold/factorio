"use client";

import { useContext } from "react";
import { Home, Inbox, Zap, Package, Lightbulb, Activity, Settings, PanelLeft, PanelLeftClose } from "lucide-react";
import { Tabs } from "@base-ui/react/tabs";
import { ThemeContext } from "@/lib/theme";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  viewKey: string;
}

export const SIDEBAR_WIDTH_COLLAPSED = 56;
export const SIDEBAR_WIDTH_EXPANDED = 200;

interface SideNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function SideNav({ activeView, onViewChange, isExpanded, onToggleExpand }: SideNavProps) {
  const theme = useContext(ThemeContext);
  const width = isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  const topItems: NavItem[] = [
    { icon: <Home size={18} />, label: "Home", viewKey: "home" },
    { icon: <Inbox size={18} />, label: "Inbox", viewKey: "inbox" },
  ];

  const mainItems: NavItem[] = [
    { icon: <Zap size={18} />, label: "Canvas", viewKey: "canvas" },
    { icon: <Package size={18} />, label: "Commerce", viewKey: "commerce" },
    { icon: <Lightbulb size={18} />, label: "Insights", viewKey: "insights" },
    { icon: <Activity size={18} />, label: "Activity", viewKey: "activity" },
  ];

  const settingsItem: NavItem = { icon: <Settings size={18} />, label: "Settings", viewKey: "settings" };

  const renderTab = (item: NavItem, isBottom?: boolean) => (
    <Tabs.Tab
      key={item.viewKey}
      value={item.viewKey}
      style={(state) => ({
        background: state.active
          ? "#f3f4f6"
          : "transparent",
        border: "none",
        borderLeft: "none",
        borderRight: "none",
        outline: "none",
        color: state.active ? "#111827" : "#9ca3af",
        padding: isExpanded ? "10px 14px" : "10px 6px",
        margin: isExpanded ? "0 8px" : "0 6px",
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: theme.fontFamily,
        display: "flex",
        flexDirection: isExpanded ? "row" as const : "column" as const,
        alignItems: "center",
        gap: isExpanded ? 10 : 4,
        width: isExpanded ? "calc(100% - 16px)" : "calc(100% - 12px)",
        boxSizing: "border-box" as const,
        transition: "all 0.15s ease",
        ...(isBottom ? { marginBottom: 8 } : {}),
      })}
      className="sidenav-tab"
    >
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: isExpanded ? 20 : "auto" }}>
        {item.icon}
      </div>
      {isExpanded && (
        <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden" }}>
          {item.label}
        </span>
      )}
    </Tabs.Tab>
  );

  return (
    <Tabs.Root
      value={activeView}
      onValueChange={(value) => onViewChange(value as string)}
      orientation="vertical"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width,
        height: "100vh",
        background: "#f5f5f5",
        borderRight: "none",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: isExpanded ? "stretch" : "center",
        fontFamily: theme.fontFamily,
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isExpanded ? "14px 14px 14px 16px" : "14px 0 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "space-between" : "center",
          flexShrink: 0,
        }}
      >
        {isExpanded ? (
          <>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#111827",
                whiteSpace: "nowrap",
              }}
            >
              SIDEKICK
            </div>
            <button
              onClick={onToggleExpand}
              style={{
                background: "transparent",
                border: "none",
                color: theme.textDim,
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = theme.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = theme.textDim; }}
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggleExpand}
            style={{
              background: "transparent",
              border: "none",
              color: theme.textDim,
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textDim; }}
          >
            <PanelLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <Tabs.List
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          flex: 1,
        }}
      >
        {topItems.map((item) => renderTab(item))}

        {/* Divider */}
        <div style={{ height: 1, background: theme.borderDim, margin: isExpanded ? "6px 14px" : "6px 10px" }} />

        {mainItems.map((item) => renderTab(item))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Settings - bottom anchored */}
        {renderTab(settingsItem, true)}
      </Tabs.List>
    </Tabs.Root>
  );
}
