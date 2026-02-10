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
  var isDraggingRegionRef = useRef(false);
  var dragRegionIdRef = useRef<string | null>(null);
  var dragRegionLastTileRef = useRef<[number, number] | null>(null);
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
      // Check exact tile match for node first
      var exactNode = actions.isTileOccupied(tileX, tileY) ? nodeAtTile : null;

      if (exactNode) {
        // Clicked directly on a node's tile — select and drag the node
        actions.selectNode(exactNode.id);
        actions.setSelectedRegionId(null);
        isDraggingNodeRef.current = true;
        dragNodeIdRef.current = exactNode.id;
        actions.setDragStart({ tileX: tileX, tileY: tileY, screenX: e.clientX, screenY: e.clientY });
      } else {
        // Not on exact node tile — check region first, then generous node match
        var regionAtTile = actions.getRegionAtTile(tileX, tileY);
        if (regionAtTile) {
          actions.selectNode(null);
          actions.setSelectedRegionId(regionAtTile.id);
          // Start region drag (any region can be dragged)
          isDraggingRegionRef.current = true;
          dragRegionIdRef.current = regionAtTile.id;
          dragRegionLastTileRef.current = [tileX, tileY];
        } else if (nodeAtTile) {
          // Generous node match (clicked on card edge, outside any region)
          actions.selectNode(nodeAtTile.id);
          actions.setSelectedRegionId(null);
          isDraggingNodeRef.current = true;
          dragNodeIdRef.current = nodeAtTile.id;
          actions.setDragStart({ tileX: tileX, tileY: tileY, screenX: e.clientX, screenY: e.clientY });
        } else {
          actions.selectNode(null);
          actions.setSelectedRegionId(null);
        }
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
    } else if (mode === "CREATE_SECTION") {
      actions.setSectionDrawStart([tileX, tileY]);
      actions.setSectionDrawEnd([tileX, tileY]);
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

    // Dragging a region
    if (isDraggingRegionRef.current && dragRegionIdRef.current && dragRegionLastTileRef.current) {
      var _gridR = getGridCoords(e);
      var rTileX = _gridR[0];
      var rTileY = _gridR[1];
      if (rTileX >= 0 && rTileY >= 0 && rTileX < s.model.gridWidth && rTileY < s.model.gridHeight) {
        var dxR = rTileX - dragRegionLastTileRef.current[0];
        var dyR = rTileY - dragRegionLastTileRef.current[1];
        if (dxR !== 0 || dyR !== 0) {
          actions.moveRegion(dragRegionIdRef.current, dxR, dyR);
          dragRegionLastTileRef.current = [rTileX, rTileY];
        }
      }
      return;
    }

    // Section drawing drag
    if (s.uiState.mode === "CREATE_SECTION" && s.uiState.sectionDrawStart) {
      var _gridSec = getGridCoords(e);
      var secX = _gridSec[0];
      var secY = _gridSec[1];
      if (secX >= 0 && secY >= 0 && secX < s.model.gridWidth && secY < s.model.gridHeight) {
        actions.setSectionDrawEnd([secX, secY]);
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
    var s = stateRef.current;

    // Finalize section creation
    if (s.uiState.mode === "CREATE_SECTION" && s.uiState.sectionDrawStart && s.uiState.sectionDrawEnd) {
      var sx = s.uiState.sectionDrawStart;
      var ex = s.uiState.sectionDrawEnd;
      // Normalize rect
      var fromX = Math.min(sx[0], ex[0]);
      var fromY = Math.min(sx[1], ex[1]);
      var toX = Math.max(sx[0], ex[0]);
      var toY = Math.max(sx[1], ex[1]);

      // Only create if dragged at least 1 tile
      if (toX - fromX >= 1 || toY - fromY >= 1) {
        var regionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        actions.addRegion({
          id: regionId,
          label: "Section",
          fromTile: [fromX, fromY],
          toTile: [toX, toY],
          color: "#0d9488",
          strokeColor: "#0d9488",
          isUserCreated: true,
        });
        actions.setEditingRegionId(regionId);
      }

      actions.setSectionDrawStart(null);
      actions.setSectionDrawEnd(null);
      actions.setMode("CURSOR");
    }

    isPanningRef.current = false;
    isDraggingNodeRef.current = false;
    dragNodeIdRef.current = null;
    isDraggingRegionRef.current = false;
    dragRegionIdRef.current = null;
    dragRegionLastTileRef.current = null;
    actions.setDragStart(null);
  }, [actions]);

  var handleKeyDown = useCallback(function(e: React.KeyboardEvent) {
    if (e.code === "Space") {
      e.preventDefault();
      spaceHeldRef.current = true;
    }
    if (e.code === "Escape") {
      var s2 = stateRef.current;
      if (s2.uiState.mode === "CREATE_SECTION") {
        actions.setSectionDrawStart(null);
        actions.setSectionDrawEnd(null);
      }
      if (s2.uiState.editingRegionId) {
        actions.setEditingRegionId(null);
      }
      actions.setMode("CURSOR");
      actions.selectNode(null);
      actions.setSelectedRegionId(null);
      actions.setPlacingCategory(null);
      actions.setConnectorSource(null);
    }
    if (e.code === "Delete" || e.code === "Backspace") {
      var s = stateRef.current;
      if (s.uiState.selectedRegionId) {
        // Only delete user-created regions
        var regions = s.model.regions;
        for (var rdi = 0; rdi < regions.length; rdi++) {
          if (regions[rdi].id === s.uiState.selectedRegionId && regions[rdi].isUserCreated) {
            actions.removeRegion(s.uiState.selectedRegionId);
            break;
          }
        }
      } else if (s.uiState.selectedNodeId) {
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
