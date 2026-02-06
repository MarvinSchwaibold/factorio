"use client";

import { useContext } from "react";
import { Home, Zap, Package, Lightbulb, Settings, PanelLeft, PanelLeftClose } from "lucide-react";
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
  ];

  const mainItems: NavItem[] = [
    { icon: <Zap size={18} />, label: "Canvas", viewKey: "canvas" },
    { icon: <Package size={18} />, label: "Commerce", viewKey: "commerce" },
    { icon: <Lightbulb size={18} />, label: "Insights", viewKey: "insights" },
  ];

  const settingsItem: NavItem = { icon: <Settings size={18} />, label: "Settings", viewKey: "settings" };

  const renderTab = (item: NavItem, isBottom?: boolean) => (
    <Tabs.Tab
      key={item.viewKey}
      value={item.viewKey}
      style={(state) => ({
        background: state.active
          ? "#e5e5e5"
          : "transparent",
        border: "none",
        borderLeft: "none",
        borderRight: "none",
        outline: "none",
        color: state.active ? "#111827" : "#111827",
        padding: isExpanded ? "7px 14px" : "7px 6px",
        marginTop: 0,
        marginBottom: isBottom ? 12 : 0,
        marginLeft: isExpanded ? 8 : 6,
        marginRight: isExpanded ? 8 : 6,
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: theme.fontFamily,
        display: "flex",
        flexDirection: isExpanded ? "row" as const : "column" as const,
        alignItems: "center",
        gap: isExpanded ? 10 : 4,
        width: isExpanded ? "calc(100% - 16px)" : "calc(100% - 12px)",
        boxSizing: "border-box" as const,
        transition: "none",
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
    <>
    <style>{`
      .sidenav-tab:not([data-active]):hover {
        background: #e5e5e5 !important;
        color: #111827 !important;
      }
      .sidenav-tab[data-active]:hover {
        background: #e5e5e5 !important;
        color: #111827 !important;
      }
    `}</style>
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
          padding: "14px 0 10px 0",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          width: "100%",
          boxSizing: "border-box" as const,
        }}
      >
        <div
          style={{
            width: SIDEBAR_WIDTH_COLLAPSED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
        <button
          onClick={isExpanded ? undefined : onToggleExpand}
          style={{
            background: "transparent",
            border: "none",
            cursor: isExpanded ? "default" : "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" style={{ width: 22, height: 26 }} viewBox="0 0 109.5 124.5"><path d="M95.9 23.9c-.1-.6-.6-1-1.1-1-.5 0-9.3-.2-9.3-.2s-7.4-7.2-8.1-7.9c-.7-.7-2.2-.5-2.7-.3 0 0-1.4.4-3.7 1.1-.4-1.3-1-2.8-1.8-4.4-2.6-5-6.5-7.7-11.1-7.7-.3 0-.6 0-1 .1-.1-.2-.3-.3-.4-.5C54.7.9 52.1-.1 49 0c-6 .2-12 4.5-16.8 12.2-3.4 5.4-6 12.2-6.8 17.5-6.9 2.1-11.7 3.6-11.8 3.7-3.5 1.1-3.6 1.2-4 4.5-.3 2.5-9.5 73-9.5 73l76.4 13.2 33.1-8.2c-.1-.1-13.6-91.4-13.7-92zm-28.7-7.1c-1.8.5-3.8 1.2-5.9 1.8 0-3-.4-7.3-1.8-10.9 4.5.9 6.7 6 7.7 9.1zm-10 3.1c-4 1.2-8.4 2.6-12.8 3.9 1.2-4.7 3.6-9.4 6.4-12.5 1.1-1.1 2.6-2.4 4.3-3.2 1.8 3.5 2.2 8.4 2.1 11.8zM49.1 4c1.4 0 2.6.3 3.6.9-1.6.9-3.2 2.1-4.7 3.7-3.8 4.1-6.7 10.5-7.9 16.6-3.6 1.1-7.2 2.2-10.5 3.2C31.7 18.8 39.8 4.3 49.1 4z" style={{ fill: "#95bf47" }} /><path d="M94.8 22.9c-.5 0-9.3-.2-9.3-.2s-7.4-7.2-8.1-7.9c-.3-.3-.6-.4-1-.5V124l33.1-8.2S96 24.5 95.9 23.8c-.1-.5-.6-.9-1.1-.9z" style={{ fill: "#5e8e3e" }} /><path d="m58 39.9-3.8 14.4s-4.3-2-9.4-1.6c-7.5.5-7.5 5.2-7.5 6.4.4 6.4 17.3 7.8 18.3 22.9.7 11.9-6.3 20-16.4 20.6-12.2.8-18.9-6.4-18.9-6.4l2.6-11s6.7 5.1 12.1 4.7c3.5-.2 4.8-3.1 4.7-5.1-.5-8.4-14.3-7.9-15.2-21.7-.7-11.6 6.9-23.4 23.7-24.4 6.5-.5 9.8 1.2 9.8 1.2z" style={{ fill: "#fff" }} /></svg>
        </button>
        </div>
        <button
          onClick={onToggleExpand}
          style={{
            background: "transparent",
            border: "none",
            color: theme.textDim,
            cursor: "pointer",
            padding: isExpanded ? 4 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            marginLeft: "auto",
            marginRight: isExpanded ? 8 : 0,
            transition: "color 0.15s ease, opacity 300ms ease, width 300ms ease, padding 300ms ease, margin 300ms ease",
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? 24 : 0,
            overflow: "hidden",
            pointerEvents: isExpanded ? "auto" : "none",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = theme.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = theme.textDim; }}
        >
          <PanelLeftClose size={16} />
        </button>
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

{mainItems.map((item) => renderTab(item))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Settings - bottom anchored */}
        {renderTab(settingsItem, true)}
      </Tabs.List>
    </Tabs.Root>
    </>
  );
}
