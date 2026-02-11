"use client";

import { useRef, useCallback, useEffect } from "react";
import type { Theme } from "@/lib/theme";
import { useIsoMap } from "@/hooks/useIsoMap";
import { useMapInteraction } from "@/hooks/useMapInteraction";
import { IsoCanvas } from "./IsoCanvas";
import { MapToolbar } from "./MapToolbar";
import { NodePalette } from "./NodePalette";
import { NodeInspector } from "./NodeInspector";
import type { MapNode, Region } from "@/lib/iso-map/types";
import { TILE_SIZE, gridToScreen } from "@/lib/iso-map/projection";

interface MapViewProps {
  isDark: boolean;
  currentTheme: Theme;
  sidebarWidth: number;
  onDrillDown?: (view: string) => void;
}

export function MapView({ isDark, currentTheme, sidebarWidth, onDrillDown }: MapViewProps) {
  var [state, actions] = useIsoMap("hub");
  var handlers = useMapInteraction(state, actions);
  var canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Center on hub node when the view mounts
  var hasCentered = useRef(false);
  useEffect(function() {
    if (hasCentered.current) return;
    var raf = requestAnimationFrame(function() {
      var raf2 = requestAnimationFrame(function() {
        var container = canvasContainerRef.current;
        if (!container || hasCentered.current) return;
        var w = container.clientWidth;
        var h = container.clientHeight;
        if (w === 0 || h === 0) return;
        // Hub center is at tile (20, 18) — center that in the viewport
        var hubTileX = 20;
        var hubTileY = 18;
        var zoom = state.uiState.zoom;
        var panX = w / 2 - hubTileX * TILE_SIZE * zoom;
        var panY = h / 2 - hubTileY * TILE_SIZE * zoom;
        actions.setPan(panX, panY);
        hasCentered.current = true;
      });
      rafRef2.current = raf2;
    });
    var rafRef2 = { current: 0 };
    return function() { cancelAnimationFrame(raf); cancelAnimationFrame(rafRef2.current); };
  }, [actions, state.uiState.zoom]);

  // Find selected node for inspector
  var selectedNode: MapNode | null = null;
  if (state.uiState.selectedNodeId) {
    var nodes = state.model.nodes;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === state.uiState.selectedNodeId) {
        selectedNode = nodes[i];
        break;
      }
    }
  }

  var handleZoomPreset = useCallback(function(zoom: number) {
    var container = canvasContainerRef.current;
    if (container) {
      actions.centerAtZoom(zoom, container.clientWidth, container.clientHeight);
    } else {
      actions.setZoom(zoom);
    }
  }, [actions]);

  var handleDrillDown = useCallback(function(category: string) {
    if (!onDrillDown) return;
    // Map infrastructure category to admin view
    onDrillDown("commerce");
  }, [onDrillDown]);

  return (
    <div style={{
      marginLeft: sidebarWidth,
      transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      height: "100vh",
      overflow: "hidden",
      padding: "8px 8px 8px 4px",
      display: "flex",
    }}>
      <div style={{
        flex: 1,
        background: isDark ? "#141414" : "#ffffff",
        borderRadius: 12,
        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
        overflow: "hidden",
        position: "relative",
      }}>
        <IsoCanvas
          state={state}
          actions={actions}
          handlers={handlers}
          isDark={isDark}
          containerRefOut={canvasContainerRef}
        />

        <MapToolbar
          mode={state.uiState.mode}
          zoom={state.uiState.zoom}
          onSetMode={actions.setMode}
          onZoomPreset={handleZoomPreset}
          onZoomIn={function() { actions.setZoom(state.uiState.zoom * 1.2); }}
          onZoomOut={function() { actions.setZoom(state.uiState.zoom / 1.2); }}
          isDark={isDark}
          currentStage={actions.currentStage}
          autoStage={actions.autoStage}
          onSetStage={actions.setStage}
        />

        <NodePalette
          activeCategory={state.uiState.placingCategory}
          onSelectCategory={function(cat) {
            if (state.uiState.placingCategory === cat) {
              actions.setPlacingCategory(null);
            } else {
              actions.setPlacingCategory(cat);
            }
          }}
          isDark={isDark}
          placedCategories={state.model.nodes.map(function(n) { return n.category; })}
        />

        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            connectors={state.model.connectors}
            nodes={state.model.nodes}
            onUpdateNode={actions.updateNode}
            onRemoveNode={actions.removeNode}
            onRemoveConnector={actions.removeConnector}
            onClose={function() { actions.selectNode(null); }}
            onDrillDown={onDrillDown ? handleDrillDown : undefined}
            isDark={isDark}
          />
        )}

        {/* Inline region label editor */}
        {state.uiState.editingRegionId && (function() {
          var editRegion: Region | null = null;
          var regions = state.model.regions;
          for (var eri = 0; eri < regions.length; eri++) {
            if (regions[eri].id === state.uiState.editingRegionId) {
              editRegion = regions[eri];
              break;
            }
          }
          if (!editRegion) return null;
          var screenPt = gridToScreen(
            editRegion.fromTile[0],
            editRegion.fromTile[1],
            state.uiState.panX,
            state.uiState.panY,
            state.uiState.zoom
          );
          var pad = TILE_SIZE * state.uiState.zoom * 0.5;
          return (
            <input
              key={editRegion.id}
              autoFocus
              defaultValue={editRegion.label}
              style={{
                position: "absolute",
                left: screenPt[0] - pad + 8 * state.uiState.zoom,
                top: screenPt[1] - pad + 4 * state.uiState.zoom,
                zIndex: 20,
                padding: "2px 6px",
                borderRadius: 4,
                border: isDark ? "1px solid #333" : "1px solid #ccc",
                background: isDark ? "#1a1a1a" : "#fff",
                color: isDark ? "#e5e5e5" : "#1a1a1a",
                fontSize: Math.max(10, 11 * state.uiState.zoom),
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontWeight: 600,
                outline: "none",
                minWidth: 60,
              }}
              onKeyDown={function(e) {
                if (e.key === "Enter") {
                  var val = (e.target as HTMLInputElement).value.trim();
                  if (val && state.uiState.editingRegionId) {
                    actions.updateRegion(state.uiState.editingRegionId, { label: val });
                  }
                  actions.setEditingRegionId(null);
                  e.stopPropagation();
                }
                if (e.key === "Escape") {
                  actions.setEditingRegionId(null);
                  e.stopPropagation();
                }
              }}
              onBlur={function(e) {
                var val = e.target.value.trim();
                if (val && state.uiState.editingRegionId) {
                  actions.updateRegion(state.uiState.editingRegionId, { label: val });
                }
                actions.setEditingRegionId(null);
              }}
            />
          );
        })()}

        {/* Mode hint at bottom */}
        <div style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "4px 12px",
          borderRadius: 6,
          background: isDark ? "rgba(26,26,26,0.9)" : "rgba(255,255,255,0.9)",
          border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
          fontSize: 11,
          color: isDark ? "#666" : "#999",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          pointerEvents: "none",
          zIndex: 10,
        }}>
          {state.uiState.mode === "CURSOR" && "Click to select \u00b7 Drag to move \u00b7 Space+drag to pan \u00b7 Scroll to zoom"}
          {state.uiState.mode === "PAN" && "Drag to pan \u00b7 Scroll to zoom"}
          {state.uiState.mode === "PLACE_NODE" && (state.uiState.placingCategory
            ? "Click on grid to place " + state.uiState.placingCategory + " \u00b7 Esc to cancel"
            : "Select a node type from the palette"
          )}
          {state.uiState.mode === "CONNECTOR" && (state.uiState.connectorSourceId
            ? "Click target node to connect \u00b7 Esc to cancel"
            : "Click source node \u00b7 Esc to cancel"
          )}
          {state.uiState.mode === "CREATE_SECTION" && "Click and drag to draw a section \u00b7 Esc to cancel"}
        </div>
      </div>
    </div>
  );
}
