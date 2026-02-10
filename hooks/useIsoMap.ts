"use client";

import { useState, useRef, useCallback } from "react";
import type { MapModel, MapUIState, MapNode, Connector, Region, InteractionMode, NodeCategory, MapAction, MerchantStage } from "@/lib/iso-map/types";
import { findPath } from "@/lib/iso-map/pathfinder";
import { generateMerchantMap, generateHubMap, getCommerceData } from "@/lib/iso-map/commerce-map-data";
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
  addRegion: (region: Region) => void;
  removeRegion: (regionId: string) => void;
  updateRegion: (regionId: string, updates: Partial<Pick<Region, "label">>) => void;
  moveRegion: (regionId: string, deltaX: number, deltaY: number) => void;
  setSectionDrawStart: (tile: [number, number] | null) => void;
  setSectionDrawEnd: (tile: [number, number] | null) => void;
  setEditingRegionId: (id: string | null) => void;
  setSelectedRegionId: (id: string | null) => void;
  getRegionAtTile: (tileX: number, tileY: number) => Region | null;
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

export type LayoutMode = "lanes" | "hub";

// Generate initial commerce map and pre-compute connector paths
function getInitialState(stage?: MerchantStage, layout?: LayoutMode): { model: MapModel; paths: Array<{ id: string; path: Array<[number, number]> }> } {
  var model = layout === "hub" ? generateHubMap(stage) : generateMerchantMap(stage);
  var paths = recomputeConnectorPaths(model.connectors, model.nodes, model.gridWidth, model.gridHeight);
  return { model: model, paths: paths };
}

var _initial = getInitialState();
var _initialHub = getInitialState(undefined, "hub");

export function useIsoMap(layoutMode?: LayoutMode): [IsoMapState, IsoMapActions] {
  var isHub = layoutMode === "hub";
  var initial = isHub ? _initialHub : _initial;
  var [model, setModel] = useState<MapModel>(initial.model);

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
    sectionDrawStart: null,
    sectionDrawEnd: null,
    editingRegionId: null,
    selectedRegionId: null,
  });

  var [connectorPaths, setConnectorPaths] = useState<Array<{ id: string; path: Array<[number, number]> }>>(initial.paths);

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
    // Prevent deleting the admin hub node
    var current = modelRef.current.nodes;
    for (var ri = 0; ri < current.length; ri++) {
      if (current[ri].id === nodeId && current[ri].category === "back-office") return;
    }
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
    var fresh = getInitialState(currentStage, layoutMode);
    setModel(fresh.model);
    setConnectorPaths(fresh.paths);
  }, [currentStage, layoutMode]);

  var setStage = useCallback(function(stage: MerchantStage) {
    setCurrentStage(stage);
    var fresh = getInitialState(stage, layoutMode);
    // Preserve user-created regions across stage changes
    var prevRegions = modelRef.current.regions;
    var userRegions: Region[] = [];
    for (var ri = 0; ri < prevRegions.length; ri++) {
      if (prevRegions[ri].isUserCreated) userRegions.push(prevRegions[ri]);
    }
    fresh.model.regions = fresh.model.regions.concat(userRegions);
    setModel(fresh.model);
    setConnectorPaths(fresh.paths);
  }, [layoutMode]);

  var addRegion = useCallback(function(region: Region) {
    setModel(function(prev) {
      return { ...prev, regions: prev.regions.concat([region]) };
    });
  }, []);

  var removeRegion = useCallback(function(regionId: string) {
    setModel(function(prev) {
      return { ...prev, regions: prev.regions.filter(function(r) { return r.id !== regionId; }) };
    });
    setUiState(function(prev) {
      var updates: Partial<MapUIState> = {};
      if (prev.selectedRegionId === regionId) updates.selectedRegionId = null;
      if (prev.editingRegionId === regionId) updates.editingRegionId = null;
      if (Object.keys(updates).length > 0) return { ...prev, ...updates };
      return prev;
    });
  }, []);

  var updateRegion = useCallback(function(regionId: string, updates: Partial<Pick<Region, "label">>) {
    setModel(function(prev) {
      return {
        ...prev,
        regions: prev.regions.map(function(r) {
          if (r.id === regionId) return { ...r, ...updates };
          return r;
        }),
      };
    });
  }, []);

  var moveRegion = useCallback(function(regionId: string, deltaX: number, deltaY: number) {
    setModel(function(prev) {
      // Find the region being moved
      var region: Region | null = null;
      for (var ri = 0; ri < prev.regions.length; ri++) {
        if (prev.regions[ri].id === regionId) { region = prev.regions[ri]; break; }
      }
      if (!region) return prev;

      // Move nodes that are inside the region's current bounds
      var newNodes = prev.nodes.map(function(n) {
        if (n.tileX >= region!.fromTile[0] && n.tileX <= region!.toTile[0] &&
            n.tileY >= region!.fromTile[1] && n.tileY <= region!.toTile[1]) {
          return { ...n, tileX: n.tileX + deltaX, tileY: n.tileY + deltaY };
        }
        return n;
      });

      // Move the region
      var newRegions = prev.regions.map(function(r) {
        if (r.id === regionId) {
          return {
            ...r,
            fromTile: [r.fromTile[0] + deltaX, r.fromTile[1] + deltaY] as [number, number],
            toTile: [r.toTile[0] + deltaX, r.toTile[1] + deltaY] as [number, number],
          };
        }
        return r;
      });

      var next = { ...prev, nodes: newNodes, regions: newRegions };
      recompute(next.nodes, next.connectors);
      return next;
    });
  }, [recompute]);

  var getRegionAtTile = useCallback(function(tileX: number, tileY: number): Region | null {
    var regions = modelRef.current.regions;
    // Iterate backwards so top-most (last drawn) region is selected first
    for (var ri = regions.length - 1; ri >= 0; ri--) {
      var r = regions[ri];
      if (tileX >= r.fromTile[0] && tileX <= r.toTile[0] &&
          tileY >= r.fromTile[1] && tileY <= r.toTile[1]) {
        return r;
      }
    }
    return null;
  }, []);

  var setSectionDrawStart = useCallback(function(tile: [number, number] | null) {
    setUiState(function(prev) { return { ...prev, sectionDrawStart: tile }; });
  }, []);

  var setSectionDrawEnd = useCallback(function(tile: [number, number] | null) {
    setUiState(function(prev) { return { ...prev, sectionDrawEnd: tile }; });
  }, []);

  var setEditingRegionId = useCallback(function(id: string | null) {
    setUiState(function(prev) { return { ...prev, editingRegionId: id }; });
  }, []);

  var setSelectedRegionId = useCallback(function(id: string | null) {
    setUiState(function(prev) { return { ...prev, selectedRegionId: id }; });
  }, []);

  var setMode = useCallback(function(mode: InteractionMode) {
    setUiState(function(prev) {
      return { ...prev, mode: mode, connectorSourceId: null, sectionDrawStart: null, sectionDrawEnd: null };
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

  // Generous hit-test: checks if clicked tile is within a node card's visual bounds
  // Card widths: core=180px(1.8 tiles), channel=160px(1.6), app=150px(1.5)
  // Card heights: core=76px(0.76 tiles), channel=68px(0.68), app=64px(0.64)
  var getNodeAtTile = useCallback(function(tileX: number, tileY: number): MapNode | null {
    var nodes = modelRef.current.nodes;
    var closest: MapNode | null = null;
    var closestDist = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      // Half-widths in tile units for each node type
      var halfW = 0.9; // 180/100/2 = 0.9 for core (largest)
      var halfH = 0.5; // generous in Y
      if (n.nodeType === "channel") { halfW = 0.8; }
      else if (n.nodeType === "app") { halfW = 0.75; }
      else if (n.nodeType === "agent") { halfW = 0.8; }
      var dx = Math.abs(tileX - n.tileX);
      var dy = Math.abs(tileY - n.tileY);
      if (dx <= halfW && dy <= halfH) {
        var dist = dx + dy;
        if (dist < closestDist) {
          closestDist = dist;
          closest = n;
        }
      }
    }
    return closest;
  }, []);

  // Exact tile check for placement collision
  var isTileOccupied = useCallback(function(tileX: number, tileY: number): boolean {
    var nodes = modelRef.current.nodes;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tileX === tileX && nodes[i].tileY === tileY) return true;
    }
    return false;
  }, []);

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
    addRegion: addRegion,
    removeRegion: removeRegion,
    updateRegion: updateRegion,
    moveRegion: moveRegion,
    setSectionDrawStart: setSectionDrawStart,
    setSectionDrawEnd: setSectionDrawEnd,
    setEditingRegionId: setEditingRegionId,
    setSelectedRegionId: setSelectedRegionId,
    getRegionAtTile: getRegionAtTile,
  };

  return [state, actions];
}
