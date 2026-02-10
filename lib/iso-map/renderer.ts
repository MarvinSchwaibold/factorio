import type { MapNode, MapUIState, Connector, Region, ConnectorStyle } from "./types";
import { gridToScreen, TILE_SIZE } from "./projection";
import { getCategoryDef } from "./node-palette";

// ── Node card dimensions ──────────────────────────────
var CARD_W = 180;
var CARD_H = 76;
var CARD_R = 8;      // corner radius
var ACCENT_W = 4;    // left accent bar width
var ICON_R = 12;     // icon circle radius

// ── Rounded rect helper ──────────────────────────────
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Grid Drawing (dot grid) ──────────────────────────────
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridWidth: number,
  gridHeight: number,
  panX: number,
  panY: number,
  zoom: number,
  isDark: boolean
): void {
  var dotColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  var dotR = 1.5 * zoom;

  // Only render dots in visible viewport
  var startX = Math.max(0, Math.floor(-panX / (TILE_SIZE * zoom)) - 1);
  var startY = Math.max(0, Math.floor(-panY / (TILE_SIZE * zoom)) - 1);
  var canvasW = ctx.canvas.width;
  var canvasH = ctx.canvas.height;
  var endX = Math.min(gridWidth, Math.ceil((canvasW - panX) / (TILE_SIZE * zoom)) + 1);
  var endY = Math.min(gridHeight, Math.ceil((canvasH - panY) / (TILE_SIZE * zoom)) + 1);

  ctx.fillStyle = dotColor;
  for (var y = startY; y <= endY; y++) {
    for (var x = startX; x <= endX; x++) {
      var _pos = gridToScreen(x, y, panX, panY, zoom);
      ctx.beginPath();
      ctx.arc(_pos[0], _pos[1], dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Tile highlight (hover/selection) ────────────────────
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
  var w = CARD_W * zoom;
  var h = CARD_H * zoom;
  var x = _pos[0] - w / 2;
  var y = _pos[1] - h / 2;
  var r = CARD_R * zoom;

  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ── Region / Zone rendering (axis-aligned rounded rect with label badge) ──
export function drawRegion(
  ctx: CanvasRenderingContext2D,
  region: Region,
  panX: number,
  panY: number,
  zoom: number,
  isDark: boolean
): void {
  var fromPt = gridToScreen(region.fromTile[0], region.fromTile[1], panX, panY, zoom);
  var toPt = gridToScreen(region.toTile[0], region.toTile[1], panX, panY, zoom);

  // Add padding around the tiles
  var pad = TILE_SIZE * zoom * 0.5;
  var rx = fromPt[0] - pad;
  var ry = fromPt[1] - pad;
  var rw = (toPt[0] - fromPt[0]) + pad * 2;
  var rh = (toPt[1] - fromPt[1]) + pad * 2;
  var rr = 12 * zoom;

  // Subtle fill
  roundedRect(ctx, rx, ry, rw, rh, rr);
  ctx.globalAlpha = isDark ? 0.06 : 0.04;
  ctx.fillStyle = region.color;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Thin border
  ctx.strokeStyle = region.strokeColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = isDark ? 0.2 : 0.15;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Label badge at top-left corner
  if (zoom > 0.4) {
    var badgeX = rx + 8 * zoom;
    var badgeY = ry + 4 * zoom;
    var fontSize = Math.max(8, 9 * zoom);
    ctx.font = "600 " + fontSize + "px var(--font-geist-sans), system-ui, sans-serif";
    var textWidth = ctx.measureText(region.label).width;
    var padX = 5 * zoom;
    var padY = 3 * zoom;

    // Badge background
    var bx = badgeX;
    var by = badgeY;
    var bw = textWidth + padX * 2;
    var bh = fontSize + padY * 2;
    var br = 3 * zoom;
    ctx.globalAlpha = isDark ? 0.8 : 0.9;
    ctx.fillStyle = isDark ? "#1a1a1a" : "#ffffff";
    roundedRect(ctx, bx, by, bw, bh, br);
    ctx.fill();
    ctx.strokeStyle = region.strokeColor;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Badge text
    ctx.fillStyle = region.strokeColor;
    ctx.globalAlpha = isDark ? 0.7 : 0.6;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(region.label, bx + padX, by + padY);
    ctx.globalAlpha = 1;
  }
}

// ── Category icon drawing (matches Lucide icons from NodePalette) ──
function drawCategoryIcon(
  ctx: CanvasRenderingContext2D,
  category: string,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  var s = size / 24; // scale from 24px Lucide base
  ctx.save();
  ctx.translate(cx - 12 * s, cy - 12 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "none";

  switch (category) {
    case "back-office": // Building2
      ctx.beginPath();
      ctx.moveTo(6, 22); ctx.lineTo(6, 4); ctx.lineTo(14, 2); ctx.lineTo(14, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, 13); ctx.lineTo(18, 9); ctx.lineTo(18, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 22); ctx.lineTo(22, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(9, 6); ctx.lineTo(9, 6.01);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(9, 10); ctx.lineTo(9, 10.01);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(9, 14); ctx.lineTo(9, 14.01);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(9, 18); ctx.lineTo(9, 18.01);
      ctx.stroke();
      break;
    case "online-store": // Monitor
      ctx.beginPath();
      ctx.rect(2, 3, 20, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 21); ctx.lineTo(16, 21);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, 17); ctx.lineTo(12, 21);
      ctx.stroke();
      break;
    case "retail": // Store
      ctx.beginPath();
      ctx.moveTo(4, 2); ctx.lineTo(20, 2); ctx.lineTo(22, 8); ctx.lineTo(2, 8); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, 8); ctx.lineTo(4, 22); ctx.lineTo(20, 22); ctx.lineTo(20, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 8); ctx.quadraticCurveTo(6, 12, 6, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 8); ctx.quadraticCurveTo(10, 12, 12, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, 8); ctx.quadraticCurveTo(14, 12, 18, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(18, 8); ctx.quadraticCurveTo(20, 12, 22, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(9, 16, 6, 6);
      ctx.stroke();
      break;
    case "checkout": // ShoppingCart
      ctx.beginPath();
      ctx.arc(9, 21, 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(20, 21, 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1, 1); ctx.lineTo(5, 1); ctx.lineTo(7, 13); ctx.lineTo(21, 13);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 5); ctx.lineTo(21, 5); ctx.lineTo(20, 13);
      ctx.stroke();
      break;
    case "payments": // Lock
      ctx.beginPath();
      ctx.rect(3, 11, 18, 11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, 11); ctx.lineTo(7, 7);
      ctx.arc(12, 7, 5, Math.PI, 0);
      ctx.lineTo(17, 11);
      ctx.stroke();
      break;
    case "balance": // Landmark
      ctx.beginPath();
      ctx.moveTo(3, 22); ctx.lineTo(21, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 9); ctx.lineTo(12, 2); ctx.lineTo(22, 9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 9); ctx.lineTo(6, 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 9); ctx.lineTo(10, 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, 9); ctx.lineTo(14, 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(18, 9); ctx.lineTo(18, 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 18); ctx.lineTo(22, 18);
      ctx.stroke();
      break;
    case "inventory": // Warehouse
      ctx.beginPath();
      ctx.moveTo(4, 22); ctx.lineTo(4, 10); ctx.lineTo(12, 3); ctx.lineTo(20, 10); ctx.lineTo(20, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 22); ctx.lineTo(8, 16); ctx.lineTo(16, 16); ctx.lineTo(16, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 13); ctx.lineTo(16, 13);
      ctx.stroke();
      break;
    case "marketing": // Megaphone
      ctx.beginPath();
      ctx.moveTo(3, 11); ctx.lineTo(3, 15); ctx.lineTo(8, 15); ctx.lineTo(8, 11); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 11); ctx.lineTo(19, 5); ctx.lineTo(19, 21); ctx.lineTo(8, 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5, 15); ctx.lineTo(5, 19);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(19, 11); ctx.lineTo(22, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(19, 15); ctx.lineTo(22, 16);
      ctx.stroke();
      break;
    case "shipping": // Truck
      ctx.beginPath();
      ctx.moveTo(1, 3); ctx.lineTo(15, 3); ctx.lineTo(15, 15); ctx.lineTo(1, 15); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(15, 8); ctx.lineTo(20, 8); ctx.lineTo(23, 11); ctx.lineTo(23, 15); ctx.lineTo(15, 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(7, 18, 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(19, 18, 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "tax": // Receipt
      ctx.beginPath();
      ctx.moveTo(4, 2); ctx.lineTo(20, 2); ctx.lineTo(20, 22);
      ctx.lineTo(18, 20); ctx.lineTo(16, 22); ctx.lineTo(14, 20); ctx.lineTo(12, 22);
      ctx.lineTo(10, 20); ctx.lineTo(8, 22); ctx.lineTo(6, 20); ctx.lineTo(4, 22);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 7); ctx.lineTo(16, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 11); ctx.lineTo(16, 11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 15); ctx.lineTo(12, 15);
      ctx.stroke();
      break;
    case "billing": // CreditCard
      ctx.beginPath();
      ctx.rect(2, 4, 20, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 10); ctx.lineTo(22, 10);
      ctx.stroke();
      break;
    case "capital": // TrendingUp
      ctx.beginPath();
      ctx.moveTo(22, 7); ctx.lineTo(14, 15); ctx.lineTo(10, 11); ctx.lineTo(2, 19);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 7); ctx.lineTo(22, 7); ctx.lineTo(22, 13);
      ctx.stroke();
      break;
    default: // fallback circle
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.stroke();
  }
  ctx.restore();
}

// ── Node card renderer (replaces all building functions) ──
export function drawNodeCard(
  ctx: CanvasRenderingContext2D,
  node: MapNode,
  panX: number,
  panY: number,
  zoom: number,
  isSelected: boolean,
  isDark: boolean
): void {
  var def = getCategoryDef(node.category);
  var _pos = gridToScreen(node.tileX, node.tileY, panX, panY, zoom);
  var w = CARD_W * zoom;
  var h = CARD_H * zoom;
  var x = _pos[0] - w / 2;
  var y = _pos[1] - h / 2;
  var r = CARD_R * zoom;

  // Card background
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = isDark ? "#1e1e1e" : "#ffffff";
  ctx.fill();

  // Card border
  if (isSelected) {
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
  }
  ctx.stroke();

  // Left accent bar
  var accentW = ACCENT_W * zoom;
  var accentR = r;
  ctx.beginPath();
  ctx.moveTo(x + accentR, y);
  ctx.lineTo(x + accentW, y);
  ctx.lineTo(x + accentW, y + h);
  ctx.lineTo(x + accentR, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - accentR);
  ctx.lineTo(x, y + accentR);
  ctx.quadraticCurveTo(x, y, x + accentR, y);
  ctx.closePath();
  ctx.fillStyle = def.color;
  ctx.fill();

  // Icon circle (top-left inside card)
  var iconR = ICON_R * zoom;
  var iconCX = x + accentW + 8 * zoom + iconR;
  var iconCY = y + h * 0.38;
  ctx.beginPath();
  ctx.arc(iconCX, iconCY, iconR, 0, Math.PI * 2);
  ctx.fillStyle = def.color;
  ctx.globalAlpha = 0.12;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Draw Lucide-style icon
  var iconSize = iconR * 1.3;
  drawCategoryIcon(ctx, node.category, iconCX, iconCY, iconSize, def.color);

  // Label text (bold, to the right of icon)
  var labelX = iconCX + iconR + 6 * zoom;
  var labelY = y + h * 0.35;
  ctx.fillStyle = isDark ? "#e5e5e5" : "#1a1a1a";
  ctx.font = "600 " + Math.max(10, 12 * zoom) + "px var(--font-geist-sans), system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Truncate label if too long — reserve space for badge
  var badgeReserve = (node.alertCount && node.alertCount > 0) ? 28 * zoom : 0;
  var maxLabelW = w - (labelX - x) - 8 * zoom - badgeReserve;
  var labelText = node.label;
  if (ctx.measureText(labelText).width > maxLabelW) {
    while (labelText.length > 0 && ctx.measureText(labelText + "\u2026").width > maxLabelW) {
      labelText = labelText.slice(0, -1);
    }
    labelText += "\u2026";
  }
  ctx.fillText(labelText, labelX, labelY);

  // First stat value (muted text below label)
  if (node.stats && node.stats.length > 0 && zoom > 0.4) {
    var statY = y + h * 0.64;
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
    ctx.font = Math.max(8, 10 * zoom) + "px var(--font-geist-sans), system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    var statText = node.stats[0].value;
    var maxStatW = w - (labelX - x) - 8 * zoom;
    if (ctx.measureText(statText).width > maxStatW) {
      while (statText.length > 0 && ctx.measureText(statText + "\u2026").width > maxStatW) {
        statText = statText.slice(0, -1);
      }
      statText += "\u2026";
    }
    ctx.fillText(statText, labelX, statY);
  }

  // Alert badge (pill shape at top-right with proper padding)
  if (node.alertCount && node.alertCount > 0) {
    var badgeText = node.alertCount > 99 ? "99+" : node.alertCount.toString();
    var badgeFontSize = Math.max(8, 9 * zoom);
    ctx.font = "600 " + badgeFontSize + "px var(--font-geist-sans), system-ui, sans-serif";
    var badgeTextW = ctx.measureText(badgeText).width;
    var badgePadX = 5 * zoom;
    var badgePadY = 3 * zoom;
    var badgeH = badgeFontSize + badgePadY * 2;
    var badgeW = Math.max(badgeH, badgeTextW + badgePadX * 2); // pill: min width = height
    var badgeRR = badgeH / 2;
    var badgeX = x + w - badgeW - 5 * zoom;
    var badgeY = y + 5 * zoom;

    // Badge background
    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeRR);
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    // Badge text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);
  }
}

// ── Connector path (with dual-stroke glow + direction arrows) ────
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

  var screenPts: Array<[number, number]> = [];
  for (var i = 0; i < path.length; i++) {
    var _sc = gridToScreen(path[i][0], path[i][1], panX, panY, zoom);
    screenPts.push([_sc[0], _sc[1]]);
  }

  var connStyle = style || "solid";

  // ── Dual-stroke glow (white outline underneath) ──
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = (lineWidth * zoom) * 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.beginPath();
  for (var g = 0; g < screenPts.length; g++) {
    if (g === 0) {
      ctx.moveTo(screenPts[g][0], screenPts[g][1]);
    } else {
      ctx.lineTo(screenPts[g][0], screenPts[g][1]);
    }
  }
  ctx.stroke();
  ctx.restore();

  // ── Main stroke ──
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

  for (var j = 0; j < screenPts.length; j++) {
    if (j === 0) {
      ctx.moveTo(screenPts[j][0], screenPts[j][1]);
    } else {
      ctx.lineTo(screenPts[j][0], screenPts[j][1]);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Direction arrow (filled triangle at target end) ──
  if (screenPts.length >= 2) {
    var lx = screenPts[screenPts.length - 1][0];
    var ly = screenPts[screenPts.length - 1][1];
    var px = screenPts[screenPts.length - 2][0];
    var py = screenPts[screenPts.length - 2][1];
    var angle = Math.atan2(ly - py, lx - px);
    var arrowLen = 8 * zoom;

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx - arrowLen * Math.cos(angle - 0.4), ly - arrowLen * Math.sin(angle - 0.4));
    ctx.lineTo(lx - arrowLen * Math.cos(angle + 0.4), ly - arrowLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
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

// ── Full scene render ───────────────────────────────────
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
            connColor = srcDef.color;
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

  // Draw node cards (no depth sorting needed in flat 2D)
  for (var ni = 0; ni < nodes.length; ni++) {
    var node = nodes[ni];
    var isSelected = uiState.selectedNodeId === node.id;
    drawNodeCard(ctx, node, panX, panY, zoom, isSelected, isDark);
  }
}

// ── Hover canvas overlay ────────────────────────────────
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

// ── Animation frame (flow particles + card border pulse) ─────────
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
            connColor = srcDef.color;
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
      screenPoints.push([pt[0], pt[1]]);
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

  // ── Card border pulse for active nodes ──
  for (var bi = 0; bi < nodes.length; bi++) {
    var bNode = nodes[bi];
    var activity = bNode.activityLevel || 0;
    if (activity < 0.5) continue;

    var bPos = gridToScreen(bNode.tileX, bNode.tileY, panX, panY, zoom);
    var w = CARD_W * zoom;
    var h = CARD_H * zoom;
    var bx = bPos[0] - w / 2;
    var by = bPos[1] - h / 2;
    var br = CARD_R * zoom;
    var bDef = getCategoryDef(bNode.category);

    var pulseAlpha = 0.08 + 0.06 * Math.sin(time * 0.003 + bi);
    roundedRect(ctx, bx - 2, by - 2, w + 4, h + 4, br + 2);
    ctx.strokeStyle = bDef.color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = pulseAlpha;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Alert pulse for nodes with issues
    if (bNode.alertCount && bNode.alertCount > 0) {
      var alertPulse = Math.sin(time * 0.004) * 0.5 + 0.5;
      var alertR = (7 + alertPulse * 3) * zoom;
      var alertX = bx + w - 7 * zoom - 4 * zoom;
      var alertY = by + 7 * zoom + 4 * zoom;
      ctx.beginPath();
      ctx.arc(alertX, alertY, alertR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239,68,68," + (0.15 + alertPulse * 0.1) + ")";
      ctx.fill();
    }
  }
}
