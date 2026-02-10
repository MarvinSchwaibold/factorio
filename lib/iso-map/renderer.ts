import type { MapNode, MapUIState, Connector, Region, ConnectorStyle } from "./types";
import { gridToScreen, HALF_TILE_W, HALF_TILE_H } from "./projection";
import { getCategoryDef } from "./node-palette";

// ── Constants ──────────────────────────────────────────
var NODE_HEIGHT_BASE = 32;
var LEVEL_HEIGHT_STEP = 16;

function getBuildingHeight(node: MapNode): number {
  var level = node.buildingLevel || 1;
  return NODE_HEIGHT_BASE + (level - 1) * LEVEL_HEIGHT_STEP;
}

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
      var _pos = gridToScreen(x, y, panX, panY, zoom);
      var cx = _pos[0];
      var cy = _pos[1];
      var hw = HALF_TILE_W * zoom;
      var hh = HALF_TILE_H * zoom;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + hw, cy + hh);
      ctx.lineTo(cx, cy + 2 * hh);
      ctx.lineTo(cx - hw, cy + hh);
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
  var _pos = gridToScreen(tileX, tileY, panX, panY, zoom);
  var cx = _pos[0];
  var cy = _pos[1];
  var hw = HALF_TILE_W * zoom;
  var hh = HALF_TILE_H * zoom;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + hw, cy + hh);
  ctx.lineTo(cx, cy + 2 * hh);
  ctx.lineTo(cx - hw, cy + hh);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ── Region / Zone rendering ──────────────────────────────────────
export function drawRegion(
  ctx: CanvasRenderingContext2D,
  region: Region,
  panX: number,
  panY: number,
  zoom: number,
  isDark: boolean
): void {
  var fromX = region.fromTile[0];
  var fromY = region.fromTile[1];
  var toX = region.toTile[0];
  var toY = region.toTile[1];

  var topPt = gridToScreen(fromX, fromY, panX, panY, zoom);
  var rightPt = gridToScreen(toX, fromY, panX, panY, zoom);
  var bottomPt = gridToScreen(toX, toY, panX, panY, zoom);
  var leftPt = gridToScreen(fromX, toY, panX, panY, zoom);

  var offY = HALF_TILE_H * zoom;

  ctx.beginPath();
  ctx.moveTo(topPt[0], topPt[1] + offY);
  ctx.lineTo(rightPt[0], rightPt[1] + offY);
  ctx.lineTo(bottomPt[0], bottomPt[1] + offY);
  ctx.lineTo(leftPt[0], leftPt[1] + offY);
  ctx.closePath();

  ctx.globalAlpha = isDark ? 0.08 : 0.06;
  ctx.fillStyle = region.color;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = region.strokeColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = isDark ? 0.25 : 0.2;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  if (zoom > 0.4) {
    ctx.fillStyle = region.strokeColor;
    ctx.globalAlpha = isDark ? 0.6 : 0.5;
    ctx.font = "600 " + Math.max(9, 10 * zoom) + "px var(--font-geist-sans), system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(region.label, topPt[0], topPt[1] + offY - 4 * zoom);
    ctx.globalAlpha = 1;
  }
}

// ── Generic fallback cube (also used as drawNode for backward compat) ──
export function drawNode(
  ctx: CanvasRenderingContext2D,
  node: MapNode,
  panX: number,
  panY: number,
  zoom: number,
  isSelected: boolean,
  _isHovered: boolean
): void {
  drawBuilding(ctx, node, panX, panY, zoom, isSelected);
}

// ── Building dispatcher ─────────────────────────────────────────
export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  node: MapNode,
  panX: number,
  panY: number,
  zoom: number,
  isSelected: boolean
): void {
  var def = getCategoryDef(node.category);
  var _pos = gridToScreen(node.tileX, node.tileY, panX, panY, zoom);
  var cx = _pos[0];
  var cy = _pos[1];
  var hw = HALF_TILE_W * zoom;
  var hh = HALF_TILE_H * zoom;
  var botY = cy + hh;
  var h = getBuildingHeight(node) * zoom;

  switch (node.category) {
    case "online-store":
      drawOnlineStore(ctx, cx, botY, hw, hh, h, zoom, def);
      break;
    case "retail":
      drawRetail(ctx, cx, botY, hw, hh, h, zoom, def);
      break;
    case "warehouse":
      drawWarehouse(ctx, cx, botY, hw, hh, h, zoom, def, node);
      break;
    case "marketing":
      drawMarketing(ctx, cx, botY, hw, hh, h, zoom, def, node);
      break;
    case "shipping":
      drawShipping(ctx, cx, botY, hw, hh, h, zoom, def, node);
      break;
    default:
      drawGenericCube(ctx, cx, botY, hw, hh, h, zoom, def);
  }

  // Selection outline
  if (isSelected) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, botY - h);
    ctx.lineTo(cx + hw, botY + hh - h);
    ctx.lineTo(cx + hw, botY + hh);
    ctx.lineTo(cx, botY + 2 * hh);
    ctx.lineTo(cx - hw, botY + hh);
    ctx.lineTo(cx - hw, botY + hh - h);
    ctx.closePath();
    ctx.stroke();
  }

  // Alert badge
  if (node.alertCount && node.alertCount > 0) {
    var badgeR = 6 * zoom;
    var badgeX = cx + hw * 0.6;
    var badgeY = botY - h - badgeR;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.strokeStyle = "#7f1d1d";
    ctx.lineWidth = 1;
    ctx.stroke();
    if (zoom > 0.6) {
      ctx.fillStyle = "#ffffff";
      ctx.font = Math.max(7, 8 * zoom) + "px var(--font-geist-sans), system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var badgeText = node.alertCount > 99 ? "99+" : node.alertCount.toString();
      ctx.fillText(badgeText, badgeX, badgeY);
    }
  }

  // ── Floating label stem (isoflow-inspired) ──
  var stemHeight = (node.labelHeight || 24) * zoom;
  var stemTopY = botY - h - stemHeight;
  var stemBottomY = botY - h;

  ctx.beginPath();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = isSelected ? "rgba(255,255,255,0.5)" : "rgba(150,150,150,0.35)";
  ctx.lineWidth = 1;
  ctx.moveTo(cx, stemBottomY);
  ctx.lineTo(cx, stemTopY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(cx, stemBottomY, 2 * zoom, 0, Math.PI * 2);
  ctx.fillStyle = isSelected ? "#ffffff" : def.colorTop;
  ctx.fill();

  ctx.fillStyle = isSelected ? "#ffffff" : def.colorTop;
  ctx.font = "600 " + Math.max(10, 11 * zoom) + "px var(--font-geist-sans), system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(node.label, cx, stemTopY - 2 * zoom);

  if (zoom > 1.0 && node.stats && node.stats.length > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = Math.max(8, 9 * zoom) + "px var(--font-geist-sans), system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(node.stats[0].value, cx, stemTopY - 1 * zoom);
  }
}

// ── Generic cube ────────────────────────────────────────────────
function drawGenericCube(
  ctx: CanvasRenderingContext2D,
  cx: number, botY: number, hw: number, hh: number, h: number,
  _zoom: number,
  def: { colorTop: string; colorLeft: string; colorRight: string; colorStroke: string }
): void {
  // Top face
  ctx.beginPath();
  ctx.moveTo(cx, botY - h);
  ctx.lineTo(cx + hw, botY + hh - h);
  ctx.lineTo(cx, botY + 2 * hh - h);
  ctx.lineTo(cx - hw, botY + hh - h);
  ctx.closePath();
  ctx.fillStyle = def.colorTop;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left face
  ctx.beginPath();
  ctx.moveTo(cx - hw, botY + hh - h);
  ctx.lineTo(cx, botY + 2 * hh - h);
  ctx.lineTo(cx, botY + 2 * hh);
  ctx.lineTo(cx - hw, botY + hh);
  ctx.closePath();
  ctx.fillStyle = def.colorLeft;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right face
  ctx.beginPath();
  ctx.moveTo(cx + hw, botY + hh - h);
  ctx.lineTo(cx, botY + 2 * hh - h);
  ctx.lineTo(cx, botY + 2 * hh);
  ctx.lineTo(cx + hw, botY + hh);
  ctx.closePath();
  ctx.fillStyle = def.colorRight;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ── Online Store: Tall building with peaked gable roof (hero, 1.15x) ──
// Distinguished by: tallest building, peaked roof, large storefront window
function drawOnlineStore(
  ctx: CanvasRenderingContext2D,
  cx: number, botY: number, hw: number, hh: number, h: number,
  zoom: number,
  def: { colorTop: string; colorLeft: string; colorRight: string; colorStroke: string }
): void {
  var s = 1.15; // hero scale
  var sHw = hw * s;
  var sHh = hh * s;
  var sH = h * s;
  var roofPeak = sH * 0.3;

  // Left wall
  ctx.beginPath();
  ctx.moveTo(cx - sHw, botY + sHh - sH);
  ctx.lineTo(cx, botY + 2 * sHh - sH);
  ctx.lineTo(cx, botY + 2 * hh);
  ctx.lineTo(cx - hw, botY + hh);
  ctx.closePath();
  ctx.fillStyle = def.colorLeft;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right wall
  ctx.beginPath();
  ctx.moveTo(cx + sHw, botY + sHh - sH);
  ctx.lineTo(cx, botY + 2 * sHh - sH);
  ctx.lineTo(cx, botY + 2 * hh);
  ctx.lineTo(cx + hw, botY + hh);
  ctx.closePath();
  ctx.fillStyle = def.colorRight;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Peaked roof — left slope
  ctx.beginPath();
  ctx.moveTo(cx, botY - sH - roofPeak);
  ctx.lineTo(cx - sHw, botY + sHh - sH);
  ctx.lineTo(cx, botY + 2 * sHh - sH);
  ctx.closePath();
  ctx.fillStyle = def.colorTop;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Peaked roof — right slope (brighter)
  ctx.beginPath();
  ctx.moveTo(cx, botY - sH - roofPeak);
  ctx.lineTo(cx + sHw, botY + sHh - sH);
  ctx.lineTo(cx, botY + 2 * sHh - sH);
  ctx.closePath();
  ctx.fillStyle = adjustBrightness(def.colorTop, 1.15);
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Storefront window on right wall (large, inset dark pane)
  if (zoom > 0.4) {
    var winMargin = sHw * 0.12;
    var winTopY = botY + sHh - sH + sH * 0.2;
    var winBotY = botY + sHh - sH * 0.15;
    ctx.beginPath();
    ctx.moveTo(cx + sHw - winMargin, winTopY);
    ctx.lineTo(cx + winMargin, winTopY + sHh - winMargin);
    ctx.lineTo(cx + winMargin, winBotY + sHh - winMargin);
    ctx.lineTo(cx + sHw - winMargin, winBotY);
    ctx.closePath();
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
    ctx.strokeStyle = def.colorStroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ── Retail: Shorter building with flat roof + awning overhang ────
// Distinguished by: shorter than online store, flat roof, awning extends right
function drawRetail(
  ctx: CanvasRenderingContext2D,
  cx: number, botY: number, hw: number, hh: number, h: number,
  zoom: number,
  def: { colorTop: string; colorLeft: string; colorRight: string; colorStroke: string }
): void {
  var shortH = h * 0.7;
  var awningDrop = shortH * 0.12;
  var awningExt = hw * 0.45;

  // Base building (generic cube, shorter)
  drawGenericCube(ctx, cx, botY, hw, hh, shortH, zoom, def);

  // Awning: extends from right wall top edge outward
  // It's a flat slab that overhangs — the signature retail element
  var awY = botY + hh - shortH; // top of right wall

  // Awning top surface (isometric parallelogram extending right)
  ctx.beginPath();
  ctx.moveTo(cx + hw, awY);
  ctx.lineTo(cx + hw + awningExt, awY + hh * 0.25);
  ctx.lineTo(cx + awningExt, awY + hh + hh * 0.25);
  ctx.lineTo(cx, awY + hh);
  ctx.closePath();
  ctx.fillStyle = def.colorTop;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Awning front face (thin drop edge)
  ctx.beginPath();
  ctx.moveTo(cx + hw + awningExt, awY + hh * 0.25);
  ctx.lineTo(cx + awningExt, awY + hh + hh * 0.25);
  ctx.lineTo(cx + awningExt, awY + hh + hh * 0.25 + awningDrop);
  ctx.lineTo(cx + hw + awningExt, awY + hh * 0.25 + awningDrop);
  ctx.closePath();
  ctx.fillStyle = adjustBrightness(def.colorTop, 0.8);
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Awning underside (shadow)
  ctx.beginPath();
  ctx.moveTo(cx, awY + hh);
  ctx.lineTo(cx + awningExt, awY + hh + hh * 0.25);
  ctx.lineTo(cx + awningExt, awY + hh + hh * 0.25 + awningDrop);
  ctx.lineTo(cx, awY + hh + awningDrop);
  ctx.closePath();
  ctx.fillStyle = adjustBrightness(def.colorLeft, 0.65);
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Door on front face
  if (zoom > 0.5) {
    var doorW = hw * 0.22;
    var doorH = shortH * 0.45;
    ctx.beginPath();
    ctx.moveTo(cx - doorW, botY + 2 * hh - doorH);
    ctx.lineTo(cx + doorW, botY + 2 * hh - doorH + doorW * 0.3);
    ctx.lineTo(cx + doorW, botY + 2 * hh);
    ctx.lineTo(cx - doorW, botY + 2 * hh);
    ctx.closePath();
    ctx.fillStyle = def.colorStroke;
    ctx.fill();
  }
}

// ── Warehouse: Wide + short cube (proportions = identity) ────────
// Distinguished by: widest building, shortest height, segment lines on top
function drawWarehouse(
  ctx: CanvasRenderingContext2D,
  cx: number, botY: number, hw: number, hh: number, h: number,
  zoom: number,
  def: { colorTop: string; colorLeft: string; colorRight: string; colorStroke: string },
  node: MapNode
): void {
  var level = node.buildingLevel || 1;
  var wideHw = hw * 1.25;
  var wideHh = hh * 1.25;
  var shortH = h * 0.45;

  // Left wall (wide)
  ctx.beginPath();
  ctx.moveTo(cx - wideHw, botY + wideHh - shortH);
  ctx.lineTo(cx, botY + 2 * wideHh - shortH);
  ctx.lineTo(cx, botY + 2 * hh);
  ctx.lineTo(cx - hw, botY + hh);
  ctx.closePath();
  ctx.fillStyle = def.colorLeft;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right wall (wide)
  ctx.beginPath();
  ctx.moveTo(cx + wideHw, botY + wideHh - shortH);
  ctx.lineTo(cx, botY + 2 * wideHh - shortH);
  ctx.lineTo(cx, botY + 2 * hh);
  ctx.lineTo(cx + hw, botY + hh);
  ctx.closePath();
  ctx.fillStyle = def.colorRight;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top face (wide diamond)
  ctx.beginPath();
  ctx.moveTo(cx, botY - shortH + hh - wideHh);
  ctx.lineTo(cx + wideHw, botY + wideHh - shortH);
  ctx.lineTo(cx, botY + 2 * wideHh - shortH);
  ctx.lineTo(cx - wideHw, botY + wideHh - shortH);
  ctx.closePath();
  ctx.fillStyle = def.colorTop;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Segment dividers on top face (storage sections)
  if (zoom > 0.4) {
    var segments = Math.min(level + 1, 5);
    ctx.strokeStyle = def.colorStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    for (var seg = 1; seg < segments; seg++) {
      var frac = seg / segments;
      // diagonal lines across the wide top diamond
      var lx = cx - wideHw + wideHw * 2 * frac;
      var ly = botY + wideHh - shortH - wideHh + wideHh * frac;
      ctx.beginPath();
      ctx.moveTo(lx - wideHw * (1 - frac), ly + wideHh * (1 - frac));
      ctx.lineTo(lx, ly);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Bay doors on right wall
  if (zoom > 0.5) {
    var bayCount = Math.min(level, 3);
    ctx.globalAlpha = 0.5;
    for (var b = 0; b < bayCount; b++) {
      var bFrac = (b + 0.5) / bayCount;
      var bx = cx + wideHw * (1 - bFrac * 0.85);
      var by = botY + wideHh * (1 - bFrac * 0.85) + wideHh * 0.1;
      var bw = wideHw * 0.15;
      var bh = shortH * 0.6;
      ctx.beginPath();
      ctx.moveTo(bx, by - bh);
      ctx.lineTo(bx - bw, by - bh + wideHh * 0.1);
      ctx.lineTo(bx - bw, by + wideHh * 0.1);
      ctx.lineTo(bx, by);
      ctx.closePath();
      ctx.fillStyle = def.colorStroke;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Red warning stripe for low stock
  if (node.alertCount && node.alertCount > 0 && zoom > 0.6) {
    ctx.beginPath();
    ctx.moveTo(cx + hw, botY + hh - 4 * zoom);
    ctx.lineTo(cx, botY + 2 * hh - 4 * zoom);
    ctx.lineTo(cx, botY + 2 * hh);
    ctx.lineTo(cx + hw, botY + hh);
    ctx.closePath();
    ctx.fillStyle = "rgba(239,68,68,0.3)";
    ctx.fill();
  }
}

// ── Marketing: Broadcast tower with signal arcs ──────────────────
// Distinguished by: narrow tapered tower, signal arcs at top
function drawMarketing(
  ctx: CanvasRenderingContext2D,
  cx: number, botY: number, hw: number, hh: number, h: number,
  zoom: number,
  def: { colorTop: string; colorLeft: string; colorRight: string; colorStroke: string },
  node: MapNode
): void {
  var level = node.buildingLevel || 1;
  var towerW = hw * 0.4;
  var towerH = hh * 0.4;

  // Tower left face (tapered)
  ctx.beginPath();
  ctx.moveTo(cx - towerW, botY + towerH - h);
  ctx.lineTo(cx, botY + 2 * towerH - h);
  ctx.lineTo(cx, botY + 2 * hh);
  ctx.lineTo(cx - hw * 0.3, botY + hh + hh * 0.3);
  ctx.closePath();
  ctx.fillStyle = def.colorLeft;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tower right face (tapered)
  ctx.beginPath();
  ctx.moveTo(cx + towerW, botY + towerH - h);
  ctx.lineTo(cx, botY + 2 * towerH - h);
  ctx.lineTo(cx, botY + 2 * hh);
  ctx.lineTo(cx + hw * 0.3, botY + hh + hh * 0.3);
  ctx.closePath();
  ctx.fillStyle = def.colorRight;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tower top
  ctx.beginPath();
  ctx.moveTo(cx, botY - h);
  ctx.lineTo(cx + towerW, botY + towerH - h);
  ctx.lineTo(cx, botY + 2 * towerH - h);
  ctx.lineTo(cx - towerW, botY + towerH - h);
  ctx.closePath();
  ctx.fillStyle = def.colorTop;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Signal arcs emanating from top
  if (zoom > 0.4) {
    var arcCount = Math.min(level + 1, 4);
    ctx.strokeStyle = def.colorTop;
    ctx.lineWidth = 1.5 * zoom;
    for (var a = 0; a < arcCount; a++) {
      var radius = (10 + a * 8) * zoom;
      ctx.globalAlpha = 0.5 - a * 0.1;
      ctx.beginPath();
      ctx.arc(cx, botY - h, radius, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

// ── Shipping: Standard cube + chimney smokestack ─────────────────
// Distinguished by: chimney on top, same height as retail
function drawShipping(
  ctx: CanvasRenderingContext2D,
  cx: number, botY: number, hw: number, hh: number, h: number,
  zoom: number,
  def: { colorTop: string; colorLeft: string; colorRight: string; colorStroke: string },
  node: MapNode
): void {
  var level = node.buildingLevel || 1;

  // Main building body
  drawGenericCube(ctx, cx, botY, hw, hh, h, zoom, def);

  // Chimney (on the back-left corner)
  var chimneyH = (14 + level * 8) * zoom;
  var chimneyW = hw * 0.2;
  var chimneyX = cx - hw * 0.5;
  var chimneyBaseY = botY + hh - h;

  // Chimney left face
  ctx.beginPath();
  ctx.moveTo(chimneyX - chimneyW, chimneyBaseY - chimneyH);
  ctx.lineTo(chimneyX, chimneyBaseY - chimneyH + chimneyW * 0.5);
  ctx.lineTo(chimneyX, chimneyBaseY);
  ctx.lineTo(chimneyX - chimneyW, chimneyBaseY);
  ctx.closePath();
  ctx.fillStyle = def.colorLeft;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Chimney right face
  ctx.beginPath();
  ctx.moveTo(chimneyX, chimneyBaseY - chimneyH + chimneyW * 0.5);
  ctx.lineTo(chimneyX + chimneyW, chimneyBaseY - chimneyH);
  ctx.lineTo(chimneyX + chimneyW, chimneyBaseY);
  ctx.lineTo(chimneyX, chimneyBaseY);
  ctx.closePath();
  ctx.fillStyle = def.colorRight;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Chimney top
  ctx.beginPath();
  ctx.moveTo(chimneyX, chimneyBaseY - chimneyH - chimneyW * 0.3);
  ctx.lineTo(chimneyX + chimneyW, chimneyBaseY - chimneyH);
  ctx.lineTo(chimneyX, chimneyBaseY - chimneyH + chimneyW * 0.5);
  ctx.lineTo(chimneyX - chimneyW, chimneyBaseY - chimneyH);
  ctx.closePath();
  ctx.fillStyle = def.colorTop;
  ctx.fill();
  ctx.strokeStyle = def.colorStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Loading bay door on right face
  if (zoom > 0.5) {
    var bayInset = 3 * zoom;
    var bayTop = botY + hh - h + h * 0.2;
    var bayBot = botY + hh - h * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx + hw - bayInset, bayTop);
    ctx.lineTo(cx + bayInset, bayTop + hh - bayInset * 0.5);
    ctx.lineTo(cx + bayInset, bayBot + hh - bayInset * 0.5);
    ctx.lineTo(cx + hw - bayInset, bayBot);
    ctx.closePath();
    ctx.fillStyle = def.colorStroke;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ── Helper: adjust hex brightness ───────────────────────────────
function adjustBrightness(hex: string, factor: number): string {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, Math.round(r * factor));
  g = Math.min(255, Math.round(g * factor));
  b = Math.min(255, Math.round(b * factor));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ── Connector path (with style support) ─────────────────────────
export function drawConnectorPath(
  ctx: CanvasRenderingContext2D,
  path: Array<[number, number]>,
  panX: number,
  panY: number,
  zoom: number,
  color: string,
  lineWidth: number,
  style?: ConnectorStyle,
  label?: string
): void {
  if (path.length < 2) return;

  var connStyle = style || "solid";
  if (connStyle === "dashed") {
    ctx.setLineDash([8 * zoom, 4 * zoom]);
  } else if (connStyle === "dotted") {
    ctx.setLineDash([2 * zoom, 4 * zoom]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth * zoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  var screenPts: Array<[number, number]> = [];
  for (var i = 0; i < path.length; i++) {
    var _sc = gridToScreen(path[i][0], path[i][1], panX, panY, zoom);
    var sx = _sc[0];
    var sy = _sc[1] + HALF_TILE_H * zoom;
    screenPts.push([sx, sy]);
    if (i === 0) {
      ctx.moveTo(sx, sy);
    } else {
      ctx.lineTo(sx, sy);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw arrowhead at end
  if (path.length >= 2) {
    var lx = screenPts[screenPts.length - 1][0];
    var ly = screenPts[screenPts.length - 1][1];
    var px = screenPts[screenPts.length - 2][0];
    var py = screenPts[screenPts.length - 2][1];
    var angle = Math.atan2(ly - py, lx - px);
    var arrowLen = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx - arrowLen * Math.cos(angle - 0.4), ly - arrowLen * Math.sin(angle - 0.4));
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx - arrowLen * Math.cos(angle + 0.4), ly - arrowLen * Math.sin(angle + 0.4));
    ctx.stroke();
  }

  // Draw label at midpoint
  if (label && zoom > 0.5 && screenPts.length >= 2) {
    var midIdx = Math.floor(screenPts.length / 2);
    var midX: number;
    var midY: number;
    if (screenPts.length % 2 === 0) {
      midX = (screenPts[midIdx - 1][0] + screenPts[midIdx][0]) / 2;
      midY = (screenPts[midIdx - 1][1] + screenPts[midIdx][1]) / 2;
    } else {
      midX = screenPts[midIdx][0];
      midY = screenPts[midIdx][1];
    }

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.font = Math.max(8, 9 * zoom) + "px var(--font-geist-sans), system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(label, midX, midY - 4 * zoom);
    ctx.globalAlpha = 1;
  }
}

// ── Full scene render ───────────────────────────────────────────
export function renderScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: MapNode[],
  connectors: Connector[],
  connectorPaths: Array<{ id: string; path: Array<[number, number]> }>,
  regions: Region[],
  uiState: MapUIState,
  isDark: boolean,
  gridWidth: number,
  gridHeight: number
): void {
  ctx.clearRect(0, 0, width, height);

  var panX = uiState.panX;
  var panY = uiState.panY;
  var zoom = uiState.zoom;

  // Draw regions (below everything)
  var _regions = regions || [];
  for (var ri = 0; ri < _regions.length; ri++) {
    drawRegion(ctx, _regions[ri], panX, panY, zoom, isDark);
  }

  // Draw grid
  drawGrid(ctx, gridWidth, gridHeight, panX, panY, zoom, isDark);

  // Draw connectors (below nodes)
  for (var ci = 0; ci < connectorPaths.length; ci++) {
    var cp = connectorPaths[ci];
    var connMeta: Connector | null = null;
    var _connectors = connectors || [];
    for (var mi = 0; mi < _connectors.length; mi++) {
      if (_connectors[mi].id === cp.id) {
        connMeta = _connectors[mi];
        break;
      }
    }

    var connColor = isDark ? "rgba(13,148,136,0.35)" : "rgba(13,148,136,0.3)";
    var connStyle: ConnectorStyle = "solid";
    var connLabel: string | undefined;
    if (connMeta) {
      connStyle = connMeta.style || "solid";
      connLabel = connMeta.label;
      if (connMeta.color) {
        connColor = connMeta.color;
      } else {
        for (var si = 0; si < nodes.length; si++) {
          if (nodes[si].id === connMeta.sourceId) {
            var srcDef = getCategoryDef(nodes[si].category);
            connColor = srcDef.colorTop;
            break;
          }
        }
      }
    }

    var lineW = connStyle === "dotted" ? 1.5 : 2;
    var opacity = connStyle === "dotted" ? 0.3 : (connStyle === "dashed" ? 0.4 : 0.5);
    ctx.globalAlpha = opacity;
    drawConnectorPath(ctx, cp.path, panX, panY, zoom, connColor, lineW, connStyle, connLabel);
    ctx.globalAlpha = 1;
  }

  // Depth-sort nodes: painter's algorithm
  var sorted = nodes.slice().sort(function(a, b) {
    return (a.tileX + a.tileY) - (b.tileX + b.tileY);
  });

  for (var ni = 0; ni < sorted.length; ni++) {
    var node = sorted[ni];
    var isSelected = uiState.selectedNodeId === node.id;
    drawBuilding(ctx, node, panX, panY, zoom, isSelected);
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

// ── Animation frame (flow particles + building effects) ─────────
export function renderAnimationFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: MapNode[],
  connectors: Connector[],
  connectorPaths: Array<{ id: string; path: Array<[number, number]> }>,
  uiState: MapUIState,
  time: number
): void {
  ctx.clearRect(0, 0, width, height);

  var panX = uiState.panX;
  var panY = uiState.panY;
  var zoom = uiState.zoom;

  // ── Flow particles along connector paths ──
  for (var ci = 0; ci < connectorPaths.length; ci++) {
    var cp = connectorPaths[ci];
    if (cp.path.length < 2) continue;

    var flowRate = 0.3;
    for (var fi = 0; fi < connectors.length; fi++) {
      if (connectors[fi].id === cp.id) {
        flowRate = connectors[fi].flowRate || 0.3;
        break;
      }
    }

    var connColor = "rgba(13,148,136,0.6)";
    for (var si = 0; si < connectors.length; si++) {
      if (connectors[si].id === cp.id) {
        for (var ni = 0; ni < nodes.length; ni++) {
          if (nodes[ni].id === connectors[si].sourceId) {
            var srcDef = getCategoryDef(nodes[ni].category);
            connColor = srcDef.colorTop;
            break;
          }
        }
        break;
      }
    }

    var screenPoints: Array<[number, number]> = [];
    var totalLen = 0;
    for (var pi = 0; pi < cp.path.length; pi++) {
      var pt = gridToScreen(cp.path[pi][0], cp.path[pi][1], panX, panY, zoom);
      screenPoints.push([pt[0], pt[1] + HALF_TILE_H * zoom]);
      if (pi > 0) {
        var dx = screenPoints[pi][0] - screenPoints[pi - 1][0];
        var dy = screenPoints[pi][1] - screenPoints[pi - 1][1];
        totalLen += Math.sqrt(dx * dx + dy * dy);
      }
    }

    if (totalLen < 1) continue;

    var particleCount = Math.max(1, Math.round(flowRate * 3));
    var speed = 0.0003 + flowRate * 0.0005;
    for (var p = 0; p < particleCount; p++) {
      var progress = ((time * speed + p / particleCount) % 1);
      var targetDist = progress * totalLen;

      var accumulated = 0;
      var ptX = screenPoints[0][0];
      var ptY = screenPoints[0][1];
      for (var seg = 1; seg < screenPoints.length; seg++) {
        var segDx = screenPoints[seg][0] - screenPoints[seg - 1][0];
        var segDy = screenPoints[seg][1] - screenPoints[seg - 1][1];
        var segLen = Math.sqrt(segDx * segDx + segDy * segDy);
        if (accumulated + segLen >= targetDist) {
          var t = (targetDist - accumulated) / segLen;
          ptX = screenPoints[seg - 1][0] + segDx * t;
          ptY = screenPoints[seg - 1][1] + segDy * t;
          break;
        }
        accumulated += segLen;
      }

      var dotR = (2 + flowRate * 2) * zoom;
      ctx.beginPath();
      ctx.arc(ptX, ptY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = connColor;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ── Building activity effects ──
  for (var bi = 0; bi < nodes.length; bi++) {
    var bNode = nodes[bi];
    var activity = bNode.activityLevel || 0;
    if (activity < 0.3) continue;

    var bPos = gridToScreen(bNode.tileX, bNode.tileY, panX, panY, zoom);
    var bCx = bPos[0];
    var bBotY = bPos[1] + HALF_TILE_H * zoom;
    var bH = getBuildingHeight(bNode) * zoom;

    // Pulsing glow at base
    if (activity > 0.5) {
      var glowIntensity = 0.1 + 0.08 * Math.sin(time * 0.003 + bi);
      var bDef = getCategoryDef(bNode.category);
      ctx.beginPath();
      ctx.ellipse(bCx, bBotY + HALF_TILE_H * zoom * 1.5, HALF_TILE_W * zoom * 0.8, HALF_TILE_H * zoom * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = bDef.colorTop;
      ctx.globalAlpha = glowIntensity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Shipping smoke particles (was "fulfillment")
    if (bNode.category === "shipping" && zoom > 0.4) {
      var smokeCount = 3;
      for (var sm = 0; sm < smokeCount; sm++) {
        var smokePhase = ((time * 0.001 + sm * 1.5) % 3);
        var smokeY = bBotY - bH - smokePhase * 15 * zoom;
        var smokeR = (2 + smokePhase * 2) * zoom;
        var smokeAlpha = Math.max(0, 0.3 - smokePhase * 0.1);
        ctx.beginPath();
        ctx.arc(bCx - HALF_TILE_W * zoom * 0.5, smokeY, smokeR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,200,200," + smokeAlpha + ")";
        ctx.fill();
      }
    }

    // Marketing signal waves
    if (bNode.category === "marketing" && zoom > 0.4) {
      var waveCount = 2;
      var mDef = getCategoryDef(bNode.category);
      for (var w = 0; w < waveCount; w++) {
        var wavePhase = ((time * 0.002 + w * 1.5) % 3);
        var waveRadius = (8 + wavePhase * 12) * zoom;
        var waveAlpha = Math.max(0, 0.4 - wavePhase * 0.13);
        ctx.beginPath();
        ctx.arc(bCx, bBotY - bH, waveRadius, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.strokeStyle = mDef.colorTop;
        ctx.lineWidth = 1.5 * zoom;
        ctx.globalAlpha = waveAlpha;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Online Store screen glow
    if (bNode.category === "online-store" && zoom > 0.4) {
      var glowPhase = 0.15 + 0.1 * Math.sin(time * 0.002 + 0.5);
      var osDef = getCategoryDef(bNode.category);
      ctx.beginPath();
      ctx.ellipse(bCx + HALF_TILE_W * zoom * 0.3, bBotY - bH * 0.5, HALF_TILE_W * zoom * 0.5, bH * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = osDef.colorTop;
      ctx.globalAlpha = glowPhase;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Alert pulse for buildings with issues
    if (bNode.alertCount && bNode.alertCount > 0) {
      var pulsePhase = Math.sin(time * 0.004) * 0.5 + 0.5;
      var badgeR = (6 + pulsePhase * 2) * zoom;
      var badgeX = bCx + HALF_TILE_W * zoom * 0.6;
      var badgeY = bBotY - bH - 6 * zoom;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239,68,68," + (0.2 + pulsePhase * 0.15) + ")";
      ctx.fill();
    }
  }
}
