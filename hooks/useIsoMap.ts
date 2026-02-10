"use client";

import { useState, useRef, useCallback } from "react";
import type { MapModel, MapUIState, MapNode, Connector, InteractionMode, NodeCategory, MapAction, MerchantStage } from "@/lib/iso-map/types";
import { findPath } from "@/lib/iso-map/pathfinder";
import { generateMerchantMap, getCommerceData } from "@/lib/iso-map/commerce-map-data";
import { getAutoStage } from "@/lib/iso-map/stage-layouts";

// Default grid size
var DEFAULT_GRID_W = 44;
var DEFAULT_GRID_H = 36;

function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export interface IsoMapState {
  model: MapModel;
  uiState: MapUIState;
  connectorPaths: Array<{ id: string; path: Array<[number, number]> }>;
}

export interface IsoMapActions {
  addNode: (category: NodeCategory, tileX: number, tileY: number, label?: string) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Pick<MapNode, "label" | "description">>) => void;
  moveNode: (nodeId: string, tileX: number, tileY: number) => void;
  addConnector: (sourceId: string, targetId: string) => void;
  removeConnector: (connectorId: string) => void;
  setMode: (mode: InteractionMode) => void;
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  zoomAtPoint: (deltaY: number, mouseX: number, mouseY: number) => void;
  centerAtZoom: (zoom: number, containerW: number, containerH: number) => void;
  panBy: (dx: number, dy: number) => void;
  selectNode: (nodeId: string | null) => void;
  setHoveredTile: (tile: [number, number] | null) => void;
  setPlacingCategory: (cat: NodeCategory | null) => void;
  setConnectorSource: (nodeId: string | null) => void;
  setDragStart: (ds: MapUIState["dragStart"]) => void;
  getNodeAtTile: (tileX: number, tileY: number) => MapNode | null;
  isTileOccupied: (tileX: number, tileY: number) => boolean;
  refreshCommerceData: () => void;
  setStage: (stage: MerchantStage) => void;
  currentStage: MerchantStage;
  autoStage: MerchantStage;
}

function recomputeConnectorPaths(
  connectors: Connector[],
  nodes: MapNode[],
  gridW: number,
  gridH: number
): Array<{ id: string; path: Array<[number, number]> }> {
  var results: Array<{ id: string; path: Array<[number, number]> }> = [];
  for (var i = 0; i < connectors.length; i++) {
    var c = connectors[i];
    var srcNode: MapNode | null = null;
    var tgtNode: MapNode | null = null;
    for (var j = 0; j < nodes.length; j++) {
      if (nodes[j].id === c.sourceId) srcNode = nodes[j];
      if (nodes[j].id === c.targetId) tgtNode = nodes[j];
    }
    if (srcNode && tgtNode) {
      var path = findPath(
        srcNode.tileX, srcNode.tileY,
        tgtNode.tileX, tgtNode.tileY,
        nodes, gridW, gridH,
        [srcNode.id, tgtNode.id]
      );
      results.push({ id: c.id, path: path });
    }
  }
  return results;
}

// Compute auto-detected stage from commerce data
var _autoStage: MerchantStage = getAutoStage(getCommerceData());

// Generate initial commerce map and pre-compute connector paths
function getInitialState(stage?: MerchantStage): { model: MapModel; paths: Array<{ id: string; path: Array<[number, number]> }> } {
  var model = generateMerchantMap(stage);
  var paths = recomputeConnectorPaths(model.connectors, model.nodes, model.gridWidth, model.gridHeight);
  return { model: model, paths: paths };
}

var _initial = getInitialState();

export function useIsoMap(): [IsoMapState, IsoMapActions] {
  var [model, setModel] = useState<MapModel>(_initial.model);

  var [uiState, setUiState] = useState<MapUIState>({
    mode: "CURSOR",
    zoom: 1,
    panX: 400,
    panY: 40,
    selectedNodeId: null,
    hoveredTile: null,
    placingCategory: null,
    connectorSourceId: null,
    dragStart: null,
  });

  var [connectorPaths, setConnectorPaths] = useState<Array<{ id: string; path: Array<[number, number]> }>>(_initial.paths);

  var [currentStage, setCurrentStage] = useState<MerchantStage>(_autoStage);

  // Refs for animation-frame access without re-renders
  var modelRef = useRef(model);
  modelRef.current = model;
  var uiRef = useRef(uiState);
  uiRef.current = uiState;

  var recompute = useCallback(function(nodes: MapNode[], connectors: Connector[]) {
    var paths = recomputeConnectorPaths(connectors, nodes, DEFAULT_GRID_W, DEFAULT_GRID_H);
    setConnectorPaths(paths);
  }, []);

  var addNode = useCallback(function(category: NodeCategory, tileX: number, tileY: number, label?: string) {
    var newNode: MapNode = {
      id: createId(),
      category: category,
      label: label || category.charAt(0).toUpperCase() + category.slice(1),
      description: "",
      tileX: tileX,
      tileY: tileY,
    };
    setModel(function(prev) {
      var next = { ...prev, nodes: prev.nodes.concat([newNode]) };
      recompute(next.nodes, next.connectors);
      return next;
    });
  }, [recompute]);

  var removeNode = useCallback(function(nodeId: string) {
    setModel(function(prev) {
      var newNodes = prev.nodes.filter(function(n) { return n.id !== nodeId; });
      var newConnectors = prev.connectors.filter(function(c) {
        return c.sourceId !== nodeId && c.targetId !== nodeId;
      });
      var next = { ...prev, nodes: newNodes, connectors: newConnectors };
      recompute(next.nodes, next.connectors);
      return next;
    });
    setUiState(function(prev) {
      if (prev.selectedNodeId === nodeId) {
        return { ...prev, selectedNodeId: null };
      }
      return prev;
    });
  }, [recompute]);

  var updateNode = useCallback(function(nodeId: string, updates: Partial<Pick<MapNode, "label" | "description">>) {
    setModel(function(prev) {
      var newNodes = prev.nodes.map(function(n) {
        if (n.id === nodeId) return { ...n, ...updates };
        return n;
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  var moveNode = useCallback(function(nodeId: string, tileX: number, tileY: number) {
    setModel(function(prev) {
      var newNodes = prev.nodes.map(function(n) {
        if (n.id === nodeId) return { ...n, tileX: tileX, tileY: tileY };
        return n;
      });
      var next = { ...prev, nodes: newNodes };
      recompute(next.nodes, next.connectors);
      return next;
    });
  }, [recompute]);

  var addConnector = useCallback(function(sourceId: string, targetId: string) {
    // Don't add duplicate
    var existing = modelRef.current.connectors.filter(function(c) {
      return (c.sourceId === sourceId && c.targetId === targetId) ||
             (c.sourceId === targetId && c.targetId === sourceId);
    });
    if (existing.length > 0) return;

    var newConn: Connector = {
      id: createId(),
      sourceId: sourceId,
      targetId: targetId,
      path: [],
    };
    setModel(function(prev) {
      var next = { ...prev, connectors: prev.connectors.concat([newConn]) };
      recompute(next.nodes, next.connectors);
      return next;
    });
  }, [recompute]);

  var removeConnector = useCallback(function(connectorId: string) {
    setModel(function(prev) {
      var newConnectors = prev.connectors.filter(function(c) { return c.id !== connectorId; });
      var next = { ...prev, connectors: newConnectors };
      setConnectorPaths(function(old) {
        return old.filter(function(p) { return p.id !== connectorId; });
      });
      return next;
    });
  }, []);

  var refreshCommerceData = useCallback(function() {
    var fresh = getInitialState(currentStage);
    setModel(fresh.model);
    setConnectorPaths(fresh.paths);
  }, [currentStage]);

  var setStage = useCallback(function(stage: MerchantStage) {
    setCurrentStage(stage);
    var fresh = getInitialState(stage);
    setModel(fresh.model);
    setConnectorPaths(fresh.paths);
  }, []);

  var setMode = useCallback(function(mode: InteractionMode) {
    setUiState(function(prev) {
      return { ...prev, mode: mode, connectorSourceId: null };
    });
  }, []);

  var setZoom = useCallback(function(zoom: number) {
    setUiState(function(prev) { return { ...prev, zoom: Math.max(0.3, Math.min(3, zoom)) }; });
  }, []);

  var setPan = useCallback(function(panX: number, panY: number) {
    setUiState(function(prev) { return { ...prev, panX: panX, panY: panY }; });
  }, []);

  var zoomAtPoint = useCallback(function(deltaY: number, mouseX: number, mouseY: number) {
    setUiState(function(prev) {
      var scrollAmount = Math.abs(deltaY);
      var sensitivity = 0.001;
      var zoomFactor = 1 + (scrollAmount * sensitivity);
      var d = deltaY > 0 ? 1 / zoomFactor : zoomFactor;
      var newZoom = Math.max(0.3, Math.min(3, prev.zoom * d));
      var zoomRatio = newZoom / prev.zoom;
      var newPanX = mouseX - (mouseX - prev.panX) * zoomRatio;
      var newPanY = mouseY - (mouseY - prev.panY) * zoomRatio;
      return { ...prev, zoom: newZoom, panX: newPanX, panY: newPanY };
    });
  }, []);

  var centerAtZoom = useCallback(function(newZoom: number, containerW: number, containerH: number) {
    setUiState(function(prev) {
      // Grid center in tile coords: (gridW/2, gridH/2)
      // In screen space: tileCenter * TILE_SIZE * zoom
      var gridCenterX = (DEFAULT_GRID_W / 2) * 100 * newZoom;
      var gridCenterY = (DEFAULT_GRID_H / 2) * 100 * newZoom;
      var panX = containerW / 2 - gridCenterX;
      var panY = containerH / 2 - gridCenterY;
      return { ...prev, zoom: Math.max(0.3, Math.min(3, newZoom)), panX: panX, panY: panY };
    });
  }, []);

  var panBy = useCallback(function(dx: number, dy: number) {
    setUiState(function(prev) { return { ...prev, panX: prev.panX + dx, panY: prev.panY + dy }; });
  }, []);

  var selectNode = useCallback(function(nodeId: string | null) {
    setUiState(function(prev) { return { ...prev, selectedNodeId: nodeId }; });
  }, []);

  var setHoveredTile = useCallback(function(tile: [number, number] | null) {
    setUiState(function(prev) { return { ...prev, hoveredTile: tile }; });
  }, []);

  var setPlacingCategory = useCallback(function(cat: NodeCategory | null) {
    setUiState(function(prev) {
      return { ...prev, placingCategory: cat, mode: cat ? "PLACE_NODE" : "CURSOR" };
    });
  }, []);

  var setConnectorSource = useCallback(function(nodeId: string | null) {
    setUiState(function(prev) { return { ...prev, connectorSourceId: nodeId }; });
  }, []);

  var setDragStart = useCallback(function(ds: MapUIState["dragStart"]) {
    setUiState(function(prev) { return { ...prev, dragStart: ds }; });
  }, []);

  var getNodeAtTile = useCallback(function(tileX: number, tileY: number): MapNode | null {
    var nodes = modelRef.current.nodes;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tileX === tileX && nodes[i].tileY === tileY) return nodes[i];
    }
    return null;
  }, []);

  var isTileOccupied = useCallback(function(tileX: number, tileY: number): boolean {
    return getNodeAtTile(tileX, tileY) !== null;
  }, [getNodeAtTile]);

  var state: IsoMapState = {
    model: model,
    uiState: uiState,
    connectorPaths: connectorPaths,
  };

  var actions: IsoMapActions = {
    addNode: addNode,
    removeNode: removeNode,
    updateNode: updateNode,
    moveNode: moveNode,
    addConnector: addConnector,
    removeConnector: removeConnector,
    setMode: setMode,
    setZoom: setZoom,
    setPan: setPan,
    zoomAtPoint: zoomAtPoint,
    centerAtZoom: centerAtZoom,
    panBy: panBy,
    selectNode: selectNode,
    setHoveredTile: setHoveredTile,
    setPlacingCategory: setPlacingCategory,
    setConnectorSource: setConnectorSource,
    setDragStart: setDragStart,
    getNodeAtTile: getNodeAtTile,
    isTileOccupied: isTileOccupied,
    refreshCommerceData: refreshCommerceData,
    setStage: setStage,
    currentStage: currentStage,
    autoStage: _autoStage,
  };

  return [state, actions];
}
