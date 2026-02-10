// Isometric projection math
// Tile size: 64px wide x 38.4px tall (standard ~2:1.2 ratio for isometric)
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 38.4;
export const HALF_TILE_W = TILE_WIDTH / 2;  // 32
export const HALF_TILE_H = TILE_HEIGHT / 2; // 19.2

/**
 * Convert grid coordinates to screen (canvas pixel) coordinates.
 * Returns the center-top of the diamond tile.
 */
export function gridToScreen(
  tileX: number,
  tileY: number,
  panX: number,
  panY: number,
  zoom: number
): [number, number] {
  const sx = (tileX - tileY) * HALF_TILE_W;
  const sy = (tileX + tileY) * HALF_TILE_H;
  return [sx * zoom + panX, sy * zoom + panY];
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
  const sx = (screenX - panX) / zoom;
  const sy = (screenY - panY) / zoom;
  const tileX = (sx / HALF_TILE_W + sy / HALF_TILE_H) / 2;
  const tileY = (sy / HALF_TILE_H - sx / HALF_TILE_W) / 2;
  return [tileX, tileY];
}

/**
 * Get the 4 corners of a diamond tile for canvas path drawing.
 * Returns [top, right, bottom, left] points.
 */
export function getDiamondCorners(
  tileX: number,
  tileY: number,
  panX: number,
  panY: number,
  zoom: number
): Array<[number, number]> {
  const [cx, cy] = gridToScreen(tileX, tileY, panX, panY, zoom);
  const hw = HALF_TILE_W * zoom;
  const hh = HALF_TILE_H * zoom;
  return [
    [cx, cy],           // top
    [cx + hw, cy + hh], // right
    [cx, cy + 2 * hh],  // bottom
    [cx - hw, cy + hh], // left
  ];
}

/**
 * Snap floating-point grid coords to the nearest integer tile.
 */
export function snapToGrid(tileX: number, tileY: number): [number, number] {
  return [Math.round(tileX), Math.round(tileY)];
}

/**
 * Check if a screen point is inside a diamond tile.
 */
export function isPointInTile(
  screenX: number,
  screenY: number,
  tileX: number,
  tileY: number,
  panX: number,
  panY: number,
  zoom: number
): boolean {
  const corners = getDiamondCorners(tileX, tileY, panX, panY, zoom);
  const [cx, cy] = gridToScreen(tileX, tileY, panX, panY, zoom);
  const centerY = cy + HALF_TILE_H * zoom;
  const hw = HALF_TILE_W * zoom;
  const hh = HALF_TILE_H * zoom;
  // Diamond hit test: |dx/hw| + |dy/hh| <= 1
  const dx = Math.abs(screenX - cx);
  const dy = Math.abs(screenY - centerY);
  return (dx / hw + dy / hh) <= 1;
}
