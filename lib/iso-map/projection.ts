// Flat 2D projection math
// Each grid cell is TILE_SIZE px apart in both axes
export var TILE_SIZE = 100;

/**
 * Convert grid coordinates to screen (canvas pixel) coordinates.
 * Returns the top-left corner of the tile cell.
 */
export function gridToScreen(
  tileX: number,
  tileY: number,
  panX: number,
  panY: number,
  zoom: number
): [number, number] {
  var sx = tileX * TILE_SIZE * zoom + panX;
  var sy = tileY * TILE_SIZE * zoom + panY;
  return [sx, sy];
}

/**
 * Convert screen (canvas pixel) coordinates back to grid coordinates.
 * Returns floating-point tile coords; round to nearest integer for snapping.
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  panX: number,
  panY: number,
  zoom: number
): [number, number] {
  var tileX = (screenX - panX) / (zoom * TILE_SIZE);
  var tileY = (screenY - panY) / (zoom * TILE_SIZE);
  return [tileX, tileY];
}

/**
 * Snap floating-point grid coords to the nearest integer tile.
 */
export function snapToGrid(tileX: number, tileY: number): [number, number] {
  return [Math.round(tileX), Math.round(tileY)];
}
