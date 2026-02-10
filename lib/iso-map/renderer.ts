import type { MapNode, MapUIState, NodeCategoryDef } from "./types";
import { gridToScreen, getDiamondCorners, TILE_WIDTH, TILE_HEIGHT, HALF_TILE_W, HALF_TILE_H } from "./projection";
import { getCategoryDef } from "./node-palette";

// ── Grid Drawing ────────────────────────────────────────────────
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridWidth: number,
  gridHeight: number,
  panX: number,
  panY: number,
  zoom: number,
  isDark: boolean
): void {
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  ctx.lineWidth = 1;

  for (var y = 0; y < gridHeight; y++) {
    for (var x = 0; x < gridWidth; x++) {
      var corners = getDiamondCorners(x, y, panX, panY, zoom);
      ctx.beginPath();
      ctx.moveTo(corners[0][0], corners[0][1]);
      ctx.lineTo(corners[1][0], corners[1][1]);
      ctx.lineTo(corners[2][0], corners[2][1]);
      ctx.lineTo(corners[3][0], corners[3][1]);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

// ── Tile highlight (hover/selection) ────────────────────────────
export function drawTileHighlight(
  ctx: CanvasRenderingContext2D,
  tileX: number,
  tileY: number,
  panX: number,
  panY: number,
  zoom: number,
  fillColor: string,
  strokeColor: string
): void {
  var corners = getDiamondCorners(tileX, tileY, panX, panY, zoom);
  ctx.beginPath();
  ctx.moveTo(corners[0][0], corners[0][1]);
  ctx.lineTo(corners[1][0], corners[1][1]);
  ctx.lineTo(corners[2][0], corners[2][1]);
  ctx.lineTo(corners[3][0], corners[3][1]);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ── Isometric cube node ─────────────────────────────────────────
// Draws a 3-face isometric cube at the given tile position
var NODE_HEIGHT = 32; // cube height in pixels (before zoom)

export function drawNode(
  ctx: CanvasRenderingContext2D,
  node: MapNode,
  panX: number,
  panY: number,
  zoom: number,
  isSelected: boolean,
  isHovered: boolean
): void {
  var def = getCategoryDef(node.category);
  var _pos = gridToScreen(node.tileX, node.tileY, panX, panY, zoom);
  var cx = _pos[0];
  var cy = _pos[1];
  var hw = HALF_TILE_W * zoom;
  var hh = HALF_TILE_H * zoom;
  var h = NODE_HEIGHT * zoom;

  // Bottom diamond center
  var botY = cy + hh; // center of tile

  // Top face (shifted up by cube height)
  ctx.beginPath();
  ctx.moveTo(cx, botY - h);          // top
  ctx.lineTo(cx + hw, botY + hh - h); // right
  ctx.lineTo(cx, botY + 2 * hh - h); // bottom
  ctx.lineTo(cx - hw, botY + hh - h); // left
  ctx.closePath();
  ctx.fillStyle = def.colorTop;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left face
  ctx.beginPath();
  ctx.moveTo(cx - hw, botY + hh - h); // top-left of top face
  ctx.lineTo(cx, botY + 2 * hh - h);  // bottom of top face
  ctx.lineTo(cx, botY + 2 * hh);      // bottom (no height offset)
  ctx.lineTo(cx - hw, botY + hh);     // bottom-left
  ctx.closePath();
  ctx.fillStyle = def.colorLeft;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right face
  ctx.beginPath();
  ctx.moveTo(cx + hw, botY + hh - h); // top-right of top face
  ctx.lineTo(cx, botY + 2 * hh - h);  // bottom of top face
  ctx.lineTo(cx, botY + 2 * hh);      // bottom (no height offset)
  ctx.lineTo(cx + hw, botY + hh);     // bottom-right
  ctx.closePath();
  ctx.fillStyle = def.colorRight;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Selection outline
  if (isSelected) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    // Outline the whole cube
    ctx.beginPath();
    ctx.moveTo(cx, botY - h);              // top
    ctx.lineTo(cx + hw, botY + hh - h);    // right-top
    ctx.lineTo(cx + hw, botY + hh);        // right-bottom
    ctx.lineTo(cx, botY + 2 * hh);         // bottom
    ctx.lineTo(cx - hw, botY + hh);        // left-bottom
    ctx.lineTo(cx - hw, botY + hh - h);    // left-top
    ctx.closePath();
    ctx.stroke();
  }

  // Label below the cube
  ctx.fillStyle = isSelected ? "#ffffff" : (def.colorTop);
  ctx.font = Math.max(10, 11 * zoom) + "px var(--font-geist-sans), system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(node.label, cx, botY + 2 * hh + 4 * zoom);
}

// ── Connector path ──────────────────────────────────────────────
export function drawConnectorPath(
  ctx: CanvasRenderingContext2D,
  path: Array<[number, number]>,
  panX: number,
  panY: number,
  zoom: number,
  color: string,
  lineWidth: number
): void {
  if (path.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth * zoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  for (var i = 0; i < path.length; i++) {
    var _sc = gridToScreen(path[i][0], path[i][1], panX, panY, zoom);
    var sx = _sc[0];
    var sy = _sc[1] + HALF_TILE_H * zoom; // offset to tile center
    if (i === 0) {
      ctx.moveTo(sx, sy);
    } else {
      ctx.lineTo(sx, sy);
    }
  }
  ctx.stroke();

  // Draw arrowhead at end
  if (path.length >= 2) {
    var last = path[path.length - 1];
    var prev = path[path.length - 2];
    var _lastSc = gridToScreen(last[0], last[1], panX, panY, zoom);
    var _prevSc = gridToScreen(prev[0], prev[1], panX, panY, zoom);
    var lx = _lastSc[0];
    var ly = _lastSc[1] + HALF_TILE_H * zoom;
    var px = _prevSc[0];
    var py = _prevSc[1] + HALF_TILE_H * zoom;
    var angle = Math.atan2(ly - py, lx - px);
    var arrowLen = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx - arrowLen * Math.cos(angle - 0.4), ly - arrowLen * Math.sin(angle - 0.4));
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx - arrowLen * Math.cos(angle + 0.4), ly - arrowLen * Math.sin(angle + 0.4));
    ctx.stroke();
  }
}

// ── Full scene render ───────────────────────────────────────────
export function renderScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: MapNode[],
  connectorPaths: Array<{ id: string; path: Array<[number, number]> }>,
  uiState: MapUIState,
  isDark: boolean,
  gridWidth: number,
  gridHeight: number
): void {
  // Clear
  ctx.clearRect(0, 0, width, height);

  var panX = uiState.panX;
  var panY = uiState.panY;
  var zoom = uiState.zoom;

  // Draw grid
  drawGrid(ctx, gridWidth, gridHeight, panX, panY, zoom, isDark);

  // Draw connectors (below nodes)
  for (var ci = 0; ci < connectorPaths.length; ci++) {
    var cp = connectorPaths[ci];
    drawConnectorPath(ctx, cp.path, panX, panY, zoom, isDark ? "rgba(13,148,136,0.5)" : "rgba(13,148,136,0.4)", 2.5);
  }

  // Depth-sort nodes: painter's algorithm (tileX + tileY ascending)
  var sorted = nodes.slice().sort(function(a, b) {
    return (a.tileX + a.tileY) - (b.tileX + b.tileY);
  });

  // Draw nodes
  for (var ni = 0; ni < sorted.length; ni++) {
    var node = sorted[ni];
    var isSelected = uiState.selectedNodeId === node.id;
    drawNode(ctx, node, panX, panY, zoom, isSelected, false);
  }
}

// ── Hover canvas overlay ────────────────────────────────────────
export function renderHoverOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  uiState: MapUIState,
  isDark: boolean
): void {
  ctx.clearRect(0, 0, width, height);

  if (uiState.hoveredTile && uiState.mode === "PLACE_NODE") {
    var tile = uiState.hoveredTile;
    drawTileHighlight(
      ctx,
      tile[0],
      tile[1],
      uiState.panX,
      uiState.panY,
      uiState.zoom,
      isDark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.1)",
      isDark ? "rgba(13,148,136,0.5)" : "rgba(13,148,136,0.3)"
    );
  } else if (uiState.hoveredTile && uiState.mode === "CURSOR") {
    var tile2 = uiState.hoveredTile;
    drawTileHighlight(
      ctx,
      tile2[0],
      tile2[1],
      uiState.panX,
      uiState.panY,
      uiState.zoom,
      isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
      isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
    );
  } else if (uiState.hoveredTile && uiState.mode === "CONNECTOR") {
    var tile3 = uiState.hoveredTile;
    drawTileHighlight(
      ctx,
      tile3[0],
      tile3[1],
      uiState.panX,
      uiState.panY,
      uiState.zoom,
      isDark ? "rgba(13,148,136,0.1)" : "rgba(13,148,136,0.08)",
      isDark ? "rgba(13,148,136,0.4)" : "rgba(13,148,136,0.25)"
    );
  }
}
