export type {
  NodeCategory,
  MerchantStage,
  StageNodePosition,
  ConnectionTemplate,
  StageLayout,
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
  TILE_SIZE,
  gridToScreen,
  screenToGrid,
  snapToGrid,
} from "./projection";

export { findPath } from "./pathfinder";

export {
  drawGrid,
  drawTileHighlight,
  drawRegion,
  drawNodeCard,
  drawConnectorPath,
  renderScene,
  renderHoverOverlay,
  renderAnimationFrame,
} from "./renderer";

export { NODE_CATEGORIES, getCategoryDef } from "./node-palette";

export { generateCommerceMap, generateMerchantMap, getCommerceData } from "./commerce-map-data";
export type { CommerceData } from "./commerce-map-data";

export { getStageLayout, getStageLabel, getAutoStage, computeRegions } from "./stage-layouts";
