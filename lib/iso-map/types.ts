// Node categories for merchant infrastructure topology
export type NodeCategory =
  | "online-store"
  | "retail"
  | "warehouse"
  | "marketing"
  | "shipping";

// Commerce stat for building inspector
export interface CommerceStat {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
}

// A node placed on the isometric grid
export interface MapNode {
  id: string;
  category: NodeCategory;
  label: string;
  description: string;
  tileX: number;
  tileY: number;
  buildingLevel?: number;   // 1-5, determines height
  activityLevel?: number;   // 0-1, animation intensity
  stats?: CommerceStat[];
  alertCount?: number;
  labelHeight?: number;     // stem height in px (default 24)
}

// Connector line style (isoflow-inspired)
export type ConnectorStyle = "solid" | "dashed" | "dotted";

// A connector between two nodes
export interface Connector {
  id: string;
  sourceId: string;
  targetId: string;
  path: Array<[number, number]>; // computed tile coords from A*
  flowRate?: number;       // 0-1, particle speed/density
  style?: ConnectorStyle;  // line rendering style
  color?: string;          // override color (else derived from source)
  label?: string;          // annotation text along the connector
}

// An isometric region / zone that groups related buildings
export interface Region {
  id: string;
  label: string;
  fromTile: [number, number]; // top-left corner in tile coords
  toTile: [number, number];   // bottom-right corner in tile coords
  color: string;               // fill color (will be drawn at low opacity)
  strokeColor: string;         // border color
}

// Interaction modes (state machine from isoflow pattern)
export type InteractionMode =
  | "CURSOR"
  | "PAN"
  | "PLACE_NODE"
  | "CONNECTOR"
  | "DRAG_ITEMS";

// The data model (nodes + connectors + regions)
export interface MapModel {
  nodes: MapNode[];
  connectors: Connector[];
  regions: Region[];
  gridWidth: number;
  gridHeight: number;
}

// UI state (viewport, selection, mode)
export interface MapUIState {
  mode: InteractionMode;
  zoom: number;
  panX: number;
  panY: number;
  selectedNodeId: string | null;
  hoveredTile: [number, number] | null;
  placingCategory: NodeCategory | null;
  connectorSourceId: string | null;
  dragStart: { tileX: number; tileY: number; screenX: number; screenY: number } | null;
}

// Computed scene data (connector paths, etc.)
export interface MapScene {
  connectorPaths: Map<string, Array<[number, number]>>;
}

// Visual definition for a node category
export interface NodeCategoryDef {
  category: NodeCategory;
  label: string;
  icon: string; // Lucide icon name
  colorTop: string;
  colorLeft: string;
  colorRight: string;
  colorStroke: string;
}

// Actions dispatched to the model
export type MapAction =
  | { type: "ADD_NODE"; node: MapNode }
  | { type: "REMOVE_NODE"; nodeId: string }
  | { type: "UPDATE_NODE"; nodeId: string; updates: Partial<Pick<MapNode, "label" | "description" | "tileX" | "tileY">> }
  | { type: "MOVE_NODE"; nodeId: string; tileX: number; tileY: number }
  | { type: "ADD_CONNECTOR"; connector: Connector }
  | { type: "REMOVE_CONNECTOR"; connectorId: string }
  | { type: "SET_CONNECTOR_PATH"; connectorId: string; path: Array<[number, number]> };
