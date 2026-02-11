"use client";

import { useContext, useRef, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Home, Package, Settings, PanelLeftClose, Map, LayoutDashboard, Workflow, ShoppingBag, Tag, Users, Megaphone, Percent, Image, Globe, Landmark, BarChart3, ChevronRight, Bot, FolderKanban, Activity } from "lucide-react";
import { Tabs } from "@base-ui/react/tabs";
import { ThemeContext } from "@/lib/theme";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  viewKey: string;
  badge?: string;
}

export const SIDEBAR_WIDTH_COLLAPSED = 56;
export const SIDEBAR_WIDTH_EXPANDED = 200;

export type AppMode = "map" | "admin";

interface SideNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

// --- Draggable segmented toggle (adapted from artifact-main ViewToggle) ---

const EASE = 0.2;
const TOGGLE_PADDING = 2;

const rubberband = (overscroll: number, maxOverscroll = 8) => {
  const factor = 0.2;
  return (overscroll * factor * maxOverscroll) / (maxOverscroll + overscroll * factor);
};

const isSettled = (
  posDiff: number,
  scaleXDiff: number,
  scaleYDiff: number,
  containerScaleDiff: number,
  containerTranslateDiff: number
) =>
  Math.abs(posDiff) < 0.3 &&
  Math.abs(scaleXDiff) < 0.001 &&
  Math.abs(scaleYDiff) < 0.001 &&
  Math.abs(containerScaleDiff) < 0.001 &&
  Math.abs(containerTranslateDiff) < 0.3;

interface ModeToggleProps {
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isDark: boolean;
  fontFamily: string;
}

function ModeToggle({ appMode, onModeChange, isDark, fontFamily }: ModeToggleProps) {
  const activeIndex = appMode === "map" ? 0 : 1;
  const [localIndex, setLocalIndex] = useState(activeIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const handleVisualRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const currentPosRef = useRef(0);
  const targetPosRef = useRef(0);
  const currentScaleXRef = useRef(1);
  const targetScaleXRef = useRef(1);
  const currentScaleYRef = useRef(1);
  const targetScaleYRef = useRef(1);
  const prevPosRef = useRef(0);
  const handleWidthRef = useRef(0);
  const containerWidthRef = useRef(0);

  const currentContainerScaleRef = useRef(1);
  const targetContainerScaleRef = useRef(1);
  const currentContainerTranslateRef = useRef(0);
  const targetContainerTranslateRef = useRef(0);
  const overscrollDirectionRef = useRef<"left" | "right" | null>(null);

  const pointerDownTimeRef = useRef(0);
  const pointerDownXRef = useRef(0);
  const pointerMaxDistanceRef = useRef(0);
  const currentIndexRef = useRef(activeIndex);
  const blockClickRef = useRef(false);

  // Sync from parent
  useEffect(() => {
    currentIndexRef.current = activeIndex;
    setLocalIndex(activeIndex);
  }, [activeIndex]);

  const getPositionForIndex = useCallback((index: number) => {
    const containerWidth = containerWidthRef.current;
    const handleWidth = handleWidthRef.current;
    if (index === 0) return TOGGLE_PADDING;
    return containerWidth - handleWidth - TOGGLE_PADDING - 2;
  }, []);

  const updateHandle = useCallback((pos: number, scaleX: number, scaleY: number) => {
    if (handleRef.current) {
      handleRef.current.style.transform = `translateX(${pos}px) scale(${scaleX}, ${scaleY})`;
    }
  }, []);

  const updateContainer = useCallback((translate: number, scale: number) => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${translate}px) scaleX(${scale})`;
    }
  }, []);

  // Measure on mount/resize
  useLayoutEffect(() => {
    const measure = () => {
      if (containerRef.current && handleRef.current) {
        containerWidthRef.current = containerRef.current.offsetWidth;
        handleWidthRef.current = handleRef.current.offsetWidth;
        const initialPos = getPositionForIndex(activeIndex);
        currentPosRef.current = initialPos;
        targetPosRef.current = initialPos;
        prevPosRef.current = initialPos;
        updateHandle(initialPos, 1, 1);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex, getPositionForIndex, updateHandle]);

  // Animation loop
  useEffect(() => {
    if (!isDragging) {
      targetPosRef.current = getPositionForIndex(localIndex);
      targetScaleXRef.current = 1;
      targetScaleYRef.current = 1;
      targetContainerScaleRef.current = 1;
      targetContainerTranslateRef.current = 0;
    }

    const animate = () => {
      const posDiff = targetPosRef.current - currentPosRef.current;
      const scaleXDiff = targetScaleXRef.current - currentScaleXRef.current;
      const scaleYDiff = targetScaleYRef.current - currentScaleYRef.current;
      const containerScaleDiff = targetContainerScaleRef.current - currentContainerScaleRef.current;
      const containerTranslateDiff = targetContainerTranslateRef.current - currentContainerTranslateRef.current;

      const movementDelta = currentPosRef.current - prevPosRef.current;
      prevPosRef.current = currentPosRef.current;
      const maxDelta = 10;
      const squishAmount = Math.min(Math.abs(movementDelta) / maxDelta, 1) * 0.15;
      if (isDragging) {
        targetScaleYRef.current = 1 - squishAmount;
      }

      if (isSettled(posDiff, scaleXDiff, scaleYDiff, containerScaleDiff, containerTranslateDiff) && !isDragging) {
        currentPosRef.current = targetPosRef.current;
        currentScaleXRef.current = targetScaleXRef.current;
        currentScaleYRef.current = targetScaleYRef.current;
        currentContainerScaleRef.current = targetContainerScaleRef.current;
        currentContainerTranslateRef.current = targetContainerTranslateRef.current;
        updateHandle(currentPosRef.current, currentScaleXRef.current, currentScaleYRef.current);
        updateContainer(currentContainerTranslateRef.current, currentContainerScaleRef.current);
        rafRef.current = null;
        return;
      }

      currentPosRef.current += posDiff * EASE;
      currentScaleXRef.current += scaleXDiff * EASE;
      currentScaleYRef.current += scaleYDiff * EASE;
      currentContainerScaleRef.current += containerScaleDiff * EASE;
      currentContainerTranslateRef.current += containerTranslateDiff * EASE;
      updateHandle(currentPosRef.current, currentScaleXRef.current, currentScaleYRef.current);
      updateContainer(currentContainerTranslateRef.current, currentContainerScaleRef.current);

      rafRef.current = requestAnimationFrame(animate);
    };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current && !isDragging) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging, localIndex, getPositionForIndex, updateHandle, updateContainer]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointerDownTimeRef.current = Date.now();
    pointerDownXRef.current = e.clientX;
    pointerMaxDistanceRef.current = 0;
    blockClickRef.current = true;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;
    if (!(e.target as HTMLElement).hasPointerCapture(e.pointerId)) return;

    const distance = Math.abs(e.clientX - pointerDownXRef.current);
    pointerMaxDistanceRef.current = Math.max(pointerMaxDistanceRef.current, distance);

    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = handleWidthRef.current;
    const containerWidth = containerWidthRef.current;
    const rawX = e.clientX - rect.left - handleWidth / 2;
    const minPos = TOGGLE_PADDING;
    const maxPos = containerWidth - handleWidth - TOGGLE_PADDING;

    let targetPos: number;

    if (rawX < minPos) {
      const overscroll = minPos - rawX;
      targetPos = minPos - rubberband(overscroll);
      overscrollDirectionRef.current = "left";
      const rubberbandAmount = rubberband(overscroll);
      targetContainerTranslateRef.current = -rubberbandAmount;
      targetContainerScaleRef.current = (rubberbandAmount * 0.5 + containerWidth) / containerWidth;
      if (containerRef.current) containerRef.current.style.transformOrigin = "right center";
    } else if (rawX > maxPos) {
      const overscroll = rawX - maxPos;
      targetPos = maxPos;
      overscrollDirectionRef.current = "right";
      const rubberbandAmount = rubberband(overscroll);
      targetContainerTranslateRef.current = rubberbandAmount;
      targetContainerScaleRef.current = (rubberbandAmount * 0.5 + containerWidth) / containerWidth;
      if (containerRef.current) containerRef.current.style.transformOrigin = "left center";
    } else {
      targetPos = rawX;
      overscrollDirectionRef.current = null;
      targetContainerScaleRef.current = 1;
      targetContainerTranslateRef.current = 0;
    }

    targetPosRef.current = targetPos;

    const cursorX = e.clientX - rect.left;
    const containerMidpoint = containerWidth / 2;
    const newIndex = cursorX < containerMidpoint ? 0 : 1;
    currentIndexRef.current = newIndex;
    if (newIndex !== localIndex) setLocalIndex(newIndex);
  }, [localIndex]);

  const handleLostPointerCapture = useCallback(() => {
    setIsDragging(false);
    const elapsed = Date.now() - pointerDownTimeRef.current;
    const movedTooFar = pointerMaxDistanceRef.current > 10;
    const isQuickTap = elapsed < 200 && !movedTooFar;
    const finalIndex = currentIndexRef.current;

    if (isQuickTap && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = pointerDownXRef.current - rect.left;
      const midpoint = rect.width / 2;
      const clickedIndex = clickX < midpoint ? 0 : 1;
      currentIndexRef.current = clickedIndex;
      setLocalIndex(clickedIndex);
      onModeChange(clickedIndex === 0 ? "map" : "admin");
      setTimeout(() => { blockClickRef.current = false; }, 50);
      return;
    }

    const newMode: AppMode = finalIndex === 0 ? "map" : "admin";
    if (newMode !== appMode) {
      onModeChange(newMode);
    }
    setTimeout(() => { blockClickRef.current = false; }, 50);
  }, [appMode, onModeChange]);

  const getHoverOffset = () => {
    if (isDragging || hoverIndex === null || hoverIndex === localIndex)
      return { x: 0, scaleX: 1, scaleY: 1 };
    if (localIndex === 0 && hoverIndex === 1) return { x: 2, scaleX: 1.03, scaleY: 0.97 };
    if (localIndex === 1 && hoverIndex === 0) return { x: -2, scaleX: 1.03, scaleY: 0.97 };
    return { x: 0, scaleX: 1, scaleY: 1 };
  };

  const hoverEffect = getHoverOffset();

  // Colors
  const containerBg = isDark ? "#1a1a1a" : "#e5e5e5";
  const containerBorder = isDark ? "#2a2a2a" : "#d1d5db";
  const activeTextColor = "#ffffff";
  const inactiveTextColor = isDark ? "#888888" : "#6b7280";

  // Handle gradient: luxe dark button from artifact
  const handleBackground = isDark
    ? "linear-gradient(180deg, #1c1f20 0%, #0f1315 80%, #2a3133 96%)"
    : "linear-gradient(180deg, #1c1f20 0%, #0f1315 80%, #2a3133 96%)";
  const handleBoxShadow = "0 0 0 1px #0f1315 inset, 3px 5px 2px -5px #fff inset, 1px 1.5px 0 0 rgba(15, 19, 21, 0.75) inset, 0 4px 0.25px -2px #fbfbfb inset, 1px 1px 3px 3px #131718 inset, 0 -3px 1px 0 rgba(15, 19, 21, 0.5) inset, 2px -2px 3px 0 rgba(11, 54, 72, 0.75) inset, 0 -3px 3px 1px rgba(214, 221, 223, 0.1) inset";

  return (
    <div style={{ position: "relative", height: 36, margin: "0 8px 8px 8px" }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "100%",
          background: containerBg,
          borderRadius: 10,
          padding: TOGGLE_PADDING,
          height: 36,
          border: `1px solid ${containerBorder}`,
          willChange: "transform",
          cursor: "grab",
          boxSizing: "border-box",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onLostPointerCapture={handleLostPointerCapture}
      >
        {/* Animated handle */}
        <div
          ref={handleRef}
          style={{
            position: "absolute",
            top: TOGGLE_PADDING,
            bottom: TOGGLE_PADDING,
            width: "calc(50% - 2px)",
            willChange: "transform",
            pointerEvents: "none",
            transformOrigin: "center center",
          }}
        >
          <div
            ref={handleVisualRef}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 8,
              background: handleBackground,
              boxShadow: handleBoxShadow,
              transition: "transform 200ms ease-out",
              transform: `translateX(${hoverEffect.x}px) scale(${hoverEffect.scaleX}, ${hoverEffect.scaleY})`,
            }}
          />
        </div>

        {/* Map label */}
        <div
          onMouseEnter={() => setHoverIndex(0)}
          onMouseLeave={() => setHoverIndex(null)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            fontFamily,
            color: localIndex === 0 ? activeTextColor : inactiveTextColor,
            transition: "color 200ms ease",
            cursor: "grab",
            zIndex: 10,
            letterSpacing: "0.02em",
            userSelect: "none",
            height: "100%",
          }}
        >
          Map
        </div>

        {/* Admin label */}
        <div
          onMouseEnter={() => setHoverIndex(1)}
          onMouseLeave={() => setHoverIndex(null)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            fontFamily,
            color: localIndex === 1 ? activeTextColor : inactiveTextColor,
            transition: "color 200ms ease",
            cursor: "grab",
            zIndex: 10,
            letterSpacing: "0.02em",
            userSelect: "none",
            height: "100%",
          }}
        >
          Admin
        </div>
      </div>
    </div>
  );
}

// --- End toggle ---

export function SideNav({ activeView, onViewChange, isExpanded, onToggleExpand, appMode, onModeChange }: SideNavProps) {
  const theme = useContext(ThemeContext);
  const width = isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  const isMap = appMode === "map";

  // Colors based on mode
  const navBg = isMap ? "#111111" : "#f5f5f5";
  const tabActiveBg = isMap ? "#2a2a2a" : "#e5e5e5";
  const tabHoverBg = isMap ? "#2a2a2a" : "#e5e5e5";
  const tabText = isMap ? "#e5e5e5" : "#111827";
  const tabActiveText = isMap ? "#e5e5e5" : "#111827";

  const mapItems: NavItem[] = [
    { icon: <Map size={18} />, label: "Map", viewKey: "mapview" },
    { icon: <Activity size={18} />, label: "Activity", viewKey: "activity" },
    { icon: <Bot size={18} />, label: "Agents", viewKey: "agents" },
    { icon: <FolderKanban size={18} />, label: "Workspaces", viewKey: "workspaces" },
    { icon: <Workflow size={18} />, label: "Flow", viewKey: "canvas" },
  ];

  const adminItems: NavItem[] = [
    { icon: <Home size={18} />, label: "Home", viewKey: "home" },
    { icon: <ShoppingBag size={18} />, label: "Orders", viewKey: "orders", badge: "12" },
    { icon: <Tag size={18} />, label: "Products", viewKey: "products" },
    { icon: <Users size={18} />, label: "Customers", viewKey: "customers" },
    { icon: <Megaphone size={18} />, label: "Marketing", viewKey: "marketing" },
    { icon: <Percent size={18} />, label: "Discounts", viewKey: "discounts" },
    { icon: <Image size={18} />, label: "Content", viewKey: "content" },
    { icon: <Globe size={18} />, label: "Markets", viewKey: "markets" },
    { icon: <Landmark size={18} />, label: "Finance", viewKey: "finance" },
    { icon: <BarChart3 size={18} />, label: "Analytics", viewKey: "analytics" },
  ];

  const settingsItem: NavItem = { icon: <Settings size={18} />, label: "Settings", viewKey: "settings" };

  const renderTab = (item: NavItem, isBottom?: boolean) => (
    <Tabs.Tab
      key={item.viewKey}
      value={item.viewKey}
      style={(state) => ({
        background: state.active
          ? tabActiveBg
          : "transparent",
        border: "none",
        borderLeft: "none",
        borderRight: "none",
        outline: "none",
        color: state.active ? tabActiveText : tabText,
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
        textAlign: "left" as const,
        gap: isExpanded ? 6 : 4,
        width: isExpanded ? "calc(100% - 16px)" : "calc(100% - 12px)",
        boxSizing: "border-box" as const,
        transition: "none",
      })}
      className="sidenav-tab"
    >
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: isExpanded ? 18 : "auto" }}>
        {item.icon}
      </div>
      {isExpanded && (
        <>
        <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", flex: 1 }}>
          {item.label}
        </span>
        {item.badge && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: isMap ? "#a0a0a0" : "#6b7280",
            background: isMap ? "#2a2a2a" : "#e5e7eb",
            borderRadius: 10,
            padding: "1px 8px",
            lineHeight: "18px",
            flexShrink: 0,
          }}>
            {item.badge}
          </span>
        )}
        </>
      )}
    </Tabs.Tab>
  );

  // Icon toggle (collapsed)
  const renderModeToggleCollapsed = () => (
    <button
      onClick={() => onModeChange(isMap ? "admin" : "map")}
      title={isMap ? "Map mode" : "Admin mode"}
      style={{
        background: "transparent",
        border: "none",
        color: isMap ? "#e5e5e5" : "#111827",
        cursor: "pointer",
        padding: "7px 6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        width: "calc(100% - 12px)",
        marginLeft: 6,
        marginRight: 6,
        marginBottom: 4,
        boxSizing: "border-box" as const,
      }}
      className="sidenav-tab"
    >
      {isMap ? <Map size={18} /> : <LayoutDashboard size={18} />}
    </button>
  );

  return (
    <>
    <style>{`
      .sidenav-tab:not([data-active]):hover {
        background: ${tabHoverBg} !important;
        color: ${tabText} !important;
      }
      .sidenav-tab[data-active]:hover {
        background: ${tabActiveBg} !important;
        color: ${tabActiveText} !important;
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
        background: navBg,
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
            color: isMap ? "#555555" : theme.textDim,
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
          onMouseEnter={(e) => { e.currentTarget.style.color = isMap ? "#e5e5e5" : theme.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = isMap ? "#555555" : theme.textDim; }}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Mode Toggle */}
      {isExpanded
        ? <ModeToggle appMode={appMode} onModeChange={onModeChange} isDark={isMap} fontFamily={theme.fontFamily} />
        : renderModeToggleCollapsed()
      }

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
        {/* Nav items per mode */}
        {isMap && mapItems.map((item) => renderTab(item))}
        {!isMap && adminItems.map((item) => renderTab(item))}

        {/* Sales channels link - admin mode only */}
        {!isMap && isExpanded && (
          <button
            style={{
              background: "transparent",
              border: "none",
              color: tabText,
              padding: "8px 14px",
              marginLeft: 8,
              marginRight: 8,
              marginTop: 4,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: theme.fontFamily,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              width: "calc(100% - 16px)",
              boxSizing: "border-box" as const,
              borderRadius: 8,
            }}
            className="sidenav-tab"
          >
            Sales channels <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Settings - always visible */}
        {renderTab(settingsItem, true)}
      </Tabs.List>
    </Tabs.Root>
    </>
  );
}
