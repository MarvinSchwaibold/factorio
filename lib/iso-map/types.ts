// Node type classification
export type NodeType = "core" | "channel" | "app";

// Node categories matching admin nav tabs 1:1 + channels + apps
export type NodeCategory =
  | "back-office"
  | "orders"
  | "products"
  | "customers"
  | "marketing"
  | "discounts"
  | "content"
  | "markets"
  | "finance"
  | "analytics"
  // Sales channels
  | "online-store"
  | "pos"
  | "shop-channel"
  | "facebook-instagram"
  | "google-youtube"
  | "tiktok"
  // Apps
  | "app-klaviyo"
  | "app-judgeme"
  | "app-flow";

// Merchant business stage (progressive complexity)
export type MerchantStage = 0 | 1 | 2 | 3 | 4;

// Stage layout position template
export interface StageNodePosition {
  category: NodeCategory;
  nodeType?: NodeType;
  tileX: number;
  tileY: number;
}

// Connection template for stage-based map generation
export interface ConnectionTemplate {
  from: NodeCategory;
  to: NodeCategory;
  label: string;
  style: ConnectorStyle;
  flowRate: number;
}

// Stage layout definition
export interface StageLayout {
  stage: MerchantStage;
  label: string;
  nodes: StageNodePosition[];
  connections: ConnectionTemplate[];
}

// Commerce stat for node inspector
export interface CommerceStat {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
}

// A node placed on the 2D grid
export interface MapNode {
  id: string;
  category: NodeCategory;
  nodeType?: NodeType;
  label: string;
  description: string;
  tileX: number;
  tileY: number;
  activityLevel?: number;   // 0-1, animation intensity
  stats?: CommerceStat[];
  alertCount?: number;
}

// Connector line style
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

// A region / zone that groups related nodes
export interface Region {
  id: string;
  label: string;
  fromTile: [number, number]; // top-left corner in tile coords
  toTile: [number, number];   // bottom-right corner in tile coords
  color: string;               // fill color (will be drawn at low opacity)
  strokeColor: string;         // border color
  isUserCreated?: boolean;     // true for user-drawn sections (preserved across stage changes)
}

// Interaction modes (state machine from isoflow pattern)
export type InteractionMode =
  | "CURSOR"
  | "PAN"
  | "PLACE_NODE"
  | "CONNECTOR"
  | "DRAG_ITEMS"
  | "CREATE_SECTION";

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
  sectionDrawStart: [number, number] | null;
  sectionDrawEnd: [number, number] | null;
  editingRegionId: string | null;
  selectedRegionId: string | null;
}

// Computed scene data (connector paths, etc.)
export interface MapScene {
  connectorPaths: Map<string, Array<[number, number]>>;
}

// Visual definition for a node category (flat 2D: 2-color scheme)
export interface NodeCategoryDef {
  category: NodeCategory;
  nodeType?: NodeType;
  label: string;
  icon: string; // single letter for icon circle
  color: string;      // primary accent (border, icon bg)
  colorMuted: string; // lighter tint for card background accent
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
