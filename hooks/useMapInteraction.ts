"use client";

import { useCallback, useRef } from "react";
import { screenToGrid, snapToGrid } from "@/lib/iso-map/projection";
import type { IsoMapState, IsoMapActions } from "./useIsoMap";

export interface MapInteractionHandlers {
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleKeyUp: (e: React.KeyboardEvent) => void;
}

export function useMapInteraction(
  state: IsoMapState,
  actions: IsoMapActions
): MapInteractionHandlers {
  var isPanningRef = useRef(false);
  var panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  var isDraggingNodeRef = useRef(false);
  var dragNodeIdRef = useRef<string | null>(null);
  var spaceHeldRef = useRef(false);

  // Ref for latest state to avoid stale closures in mouse handlers
  var stateRef = useRef(state);
  stateRef.current = state;

  var getGridCoords = useCallback(function(e: React.MouseEvent<HTMLCanvasElement>): [number, number] {
    var rect = e.currentTarget.getBoundingClientRect();
    var screenX = e.clientX - rect.left;
    var screenY = e.clientY - rect.top;
    var s = stateRef.current;
    var raw = screenToGrid(screenX, screenY, s.uiState.panX, s.uiState.panY, s.uiState.zoom);
    return snapToGrid(raw[0], raw[1]);
  }, []);

  var handleMouseDown = useCallback(function(e: React.MouseEvent<HTMLCanvasElement>) {
    var s = stateRef.current;
    var mode = s.uiState.mode;

    // Middle mouse or space+click = pan
    if (e.button === 1 || (e.button === 0 && spaceHeldRef.current) || mode === "PAN") {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: s.uiState.panX, panY: s.uiState.panY };
      return;
    }

    if (e.button !== 0) return;

    var _grid = getGridCoords(e);
    var tileX = _grid[0];
    var tileY = _grid[1];

    if (tileX < 0 || tileY < 0 || tileX >= s.model.gridWidth || tileY >= s.model.gridHeight) return;

    var nodeAtTile = actions.getNodeAtTile(tileX, tileY);

    if (mode === "CURSOR") {
      if (nodeAtTile) {
        actions.selectNode(nodeAtTile.id);
        // Start drag
        isDraggingNodeRef.current = true;
        dragNodeIdRef.current = nodeAtTile.id;
        actions.setDragStart({ tileX: tileX, tileY: tileY, screenX: e.clientX, screenY: e.clientY });
      } else {
        actions.selectNode(null);
      }
    } else if (mode === "PLACE_NODE") {
      if (!nodeAtTile && s.uiState.placingCategory) {
        actions.addNode(s.uiState.placingCategory, tileX, tileY);
      }
    } else if (mode === "CONNECTOR") {
      if (nodeAtTile) {
        if (!s.uiState.connectorSourceId) {
          actions.setConnectorSource(nodeAtTile.id);
        } else if (s.uiState.connectorSourceId !== nodeAtTile.id) {
          actions.addConnector(s.uiState.connectorSourceId, nodeAtTile.id);
          actions.setConnectorSource(null);
        }
      } else {
        actions.setConnectorSource(null);
      }
    }
  }, [actions, getGridCoords]);

  var handleMouseMove = useCallback(function(e: React.MouseEvent<HTMLCanvasElement>) {
    var s = stateRef.current;

    // Panning
    if (isPanningRef.current) {
      var dx = e.clientX - panStartRef.current.x;
      var dy = e.clientY - panStartRef.current.y;
      actions.setPan(panStartRef.current.panX + dx, panStartRef.current.panY + dy);
      return;
    }

    // Dragging a node
    if (isDraggingNodeRef.current && dragNodeIdRef.current) {
      var _grid = getGridCoords(e);
      var tileX = _grid[0];
      var tileY = _grid[1];
      if (tileX >= 0 && tileY >= 0 && tileX < s.model.gridWidth && tileY < s.model.gridHeight) {
        if (!actions.isTileOccupied(tileX, tileY) || actions.getNodeAtTile(tileX, tileY)?.id === dragNodeIdRef.current) {
          actions.moveNode(dragNodeIdRef.current, tileX, tileY);
        }
      }
      return;
    }

    // Hover tile tracking
    var _grid2 = getGridCoords(e);
    var hx = _grid2[0];
    var hy = _grid2[1];
    if (hx >= 0 && hy >= 0 && hx < s.model.gridWidth && hy < s.model.gridHeight) {
      actions.setHoveredTile([hx, hy]);
    } else {
      actions.setHoveredTile(null);
    }
  }, [actions, getGridCoords]);

  var handleMouseUp = useCallback(function(_e: React.MouseEvent<HTMLCanvasElement>) {
    isPanningRef.current = false;
    isDraggingNodeRef.current = false;
    dragNodeIdRef.current = null;
    actions.setDragStart(null);
  }, [actions]);

  var handleKeyDown = useCallback(function(e: React.KeyboardEvent) {
    if (e.code === "Space") {
      e.preventDefault();
      spaceHeldRef.current = true;
    }
    if (e.code === "Escape") {
      actions.setMode("CURSOR");
      actions.selectNode(null);
      actions.setPlacingCategory(null);
      actions.setConnectorSource(null);
    }
    if (e.code === "Delete" || e.code === "Backspace") {
      var s = stateRef.current;
      if (s.uiState.selectedNodeId) {
        actions.removeNode(s.uiState.selectedNodeId);
      }
    }
    // Arrow keys to pan
    var PAN_STEP = 80;
    if (e.code === "ArrowLeft") { e.preventDefault(); actions.panBy(PAN_STEP, 0); }
    if (e.code === "ArrowRight") { e.preventDefault(); actions.panBy(-PAN_STEP, 0); }
    if (e.code === "ArrowUp") { e.preventDefault(); actions.panBy(0, PAN_STEP); }
    if (e.code === "ArrowDown") { e.preventDefault(); actions.panBy(0, -PAN_STEP); }
  }, [actions]);

  var handleKeyUp = useCallback(function(e: React.KeyboardEvent) {
    if (e.code === "Space") {
      spaceHeldRef.current = false;
    }
  }, []);

  return {
    handleMouseDown: handleMouseDown,
    handleMouseMove: handleMouseMove,
    handleMouseUp: handleMouseUp,
    handleKeyDown: handleKeyDown,
    handleKeyUp: handleKeyUp,
  };
}
