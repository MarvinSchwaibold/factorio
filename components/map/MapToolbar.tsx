"use client";

import { MousePointer2, Hand, Plus, GitBranch, Square, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import type { InteractionMode, MerchantStage } from "@/lib/iso-map/types";
import { getStageLabel } from "@/lib/iso-map/stage-layouts";

interface MapToolbarProps {
  mode: InteractionMode;
  zoom: number;
  onSetMode: (mode: InteractionMode) => void;
  onZoomPreset: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isDark: boolean;
  currentStage: MerchantStage;
  autoStage: MerchantStage;
  onSetStage: (stage: MerchantStage) => void;
}

function Btn({ children, title, active, onClick, isDark, width }: {
  children: React.ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
  width?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: width || 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: active
          ? (isDark ? "rgba(13,148,136,0.25)" : "rgba(13,148,136,0.12)")
          : "transparent",
        color: active ? "#0d9488" : (isDark ? "#888" : "#666"),
        cursor: "pointer",
        transition: "all 150ms",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        padding: 0,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div style={{ width: 1, height: 20, background: isDark ? "#333" : "#ddd", margin: "0 4px", flexShrink: 0 }} />;
}

var ZOOM_PRESETS = [
  { label: "1", value: 0.45 },
  { label: "2", value: 0.85 },
  { label: "3", value: 1.6 },
];

export function MapToolbar({ mode, zoom, onSetMode, onZoomPreset, onZoomIn, onZoomOut, isDark, currentStage, autoStage, onSetStage }: MapToolbarProps) {
  var stageLabel = getStageLabel(currentStage);
  var isAuto = currentStage === autoStage;

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "4px 6px",
        borderRadius: 10,
        background: isDark ? "rgba(26,26,26,0.95)" : "rgba(255,255,255,0.95)",
        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
        backdropFilter: "blur(12px)",
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
        zIndex: 10,
      }}
    >
      {/* Mode tools */}
      <Btn title="Cursor (V)" active={mode === "CURSOR" || mode === "DRAG_ITEMS"} onClick={function() { onSetMode("CURSOR"); }} isDark={isDark}>
        <MousePointer2 size={15} />
      </Btn>
      <Btn title="Pan (Space+Drag)" active={mode === "PAN"} onClick={function() { onSetMode("PAN"); }} isDark={isDark}>
        <Hand size={15} />
      </Btn>
      <Btn title="Place Node" active={mode === "PLACE_NODE"} onClick={function() { onSetMode("PLACE_NODE"); }} isDark={isDark}>
        <Plus size={15} />
      </Btn>
      <Btn title="Connect Nodes" active={mode === "CONNECTOR"} onClick={function() { onSetMode("CONNECTOR"); }} isDark={isDark}>
        <GitBranch size={15} />
      </Btn>
      <Btn title="Create Section" active={mode === "CREATE_SECTION"} onClick={function() { onSetMode("CREATE_SECTION"); }} isDark={isDark}>
        <Square size={15} />
      </Btn>

      <Divider isDark={isDark} />

      {/* Stage stepper */}
      <Btn title="Previous stage" active={false} onClick={function() { if (currentStage > 0) onSetStage((currentStage - 1) as MerchantStage); }} isDark={isDark}>
        <ChevronLeft size={14} />
      </Btn>
      <div
        title={"Stage " + currentStage + (isAuto ? " (auto)" : "")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "0 4px",
          fontSize: 10,
          fontWeight: 600,
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          color: isDark ? "#aaa" : "#666",
          minWidth: 80,
          justifyContent: "center",
          cursor: "default",
          flexShrink: 0,
        }}
      >
        <span style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: isDark ? "rgba(13,148,136,0.2)" : "rgba(13,148,136,0.1)",
          color: "#0d9488",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
        }}>
          {currentStage}
        </span>
        {stageLabel}
      </div>
      <Btn title="Next stage" active={false} onClick={function() { if (currentStage < 4) onSetStage((currentStage + 1) as MerchantStage); }} isDark={isDark}>
        <ChevronRight size={14} />
      </Btn>

      <Divider isDark={isDark} />

      {/* Zoom presets */}
      {ZOOM_PRESETS.map(function(preset) {
        var isActive = Math.abs(zoom - preset.value) < 0.08;
        return (
          <Btn key={preset.label} title={Math.round(preset.value * 100) + "%"} active={isActive} onClick={function() { onZoomPreset(preset.value); }} isDark={isDark}>
            {preset.label}
          </Btn>
        );
      })}

      <Divider isDark={isDark} />

      {/* Zoom +/- */}
      <Btn title="Zoom out" active={false} onClick={onZoomOut} isDark={isDark}>
        <ZoomOut size={14} />
      </Btn>
      <span style={{
        fontSize: 10,
        color: isDark ? "#666" : "#aaa",
        minWidth: 32,
        textAlign: "center",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        fontVariantNumeric: "tabular-nums",
        flexShrink: 0,
      }}>
        {Math.round(zoom * 100)}%
      </span>
      <Btn title="Zoom in" active={false} onClick={onZoomIn} isDark={isDark}>
        <ZoomIn size={14} />
      </Btn>

    </div>
  );
}
