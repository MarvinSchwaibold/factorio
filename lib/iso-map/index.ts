export type {
  NodeCategory,
  MapNode,
  Connector,
  ConnectorStyle,
  Region,
  InteractionMode,
  MapModel,
  MapUIState,
  MapScene,
  NodeCategoryDef,
  MapAction,
  CommerceStat,
} from "./types";

export {
  TILE_WIDTH,
  TILE_HEIGHT,
  HALF_TILE_W,
  HALF_TILE_H,
  gridToScreen,
  screenToGrid,
  getDiamondCorners,
  snapToGrid,
  isPointInTile,
} from "./projection";

export { findPath } from "./pathfinder";

export {
  drawGrid,
  drawTileHighlight,
  drawRegion,
  drawNode,
  drawBuilding,
  drawConnectorPath,
  renderScene,
  renderHoverOverlay,
  renderAnimationFrame,
} from "./renderer";

export { NODE_CATEGORIES, getCategoryDef } from "./node-palette";

export { generateCommerceMap, getCommerceData } from "./commerce-map-data";
export type { CommerceData } from "./commerce-map-data";
