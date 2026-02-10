// Node categories for Shopify business plan visualization
export type NodeCategory =
  | "store"
  | "warehouse"
  | "fulfillment"
  | "marketing"
  | "payment"
  | "shipping"
  | "analytics"
  | "custom";

// A node placed on the isometric grid
export interface MapNode {
  id: string;
  category: NodeCategory;
  label: string;
  description: string;
  tileX: number;
  tileY: number;
}

// A connector between two nodes
export interface Connector {
  id: string;
  sourceId: string;
  targetId: string;
  path: Array<[number, number]>; // computed tile coords from A*
}

// Interaction modes (state machine from isoflow pattern)
export type InteractionMode =
  | "CURSOR"
  | "PAN"
  | "PLACE_NODE"
  | "CONNECTOR"
  | "DRAG_ITEMS";

// The data model (nodes + connectors)
export interface MapModel {
  nodes: MapNode[];
  connectors: Connector[];
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
