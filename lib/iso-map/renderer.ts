import type { MapNode, MapUIState, Connector, Region, ConnectorStyle, NodeType } from "./types";
import { gridToScreen, TILE_SIZE } from "./projection";
import { getCategoryDef } from "./node-palette";

// ── Node card dimensions by type ──────────────────────
// Core: 180×76, Channel: 160×68, App: 150×64
var CARD_W = 180;
var CARD_H = 76;
var CARD_W_CHANNEL = 160;
var CARD_H_CHANNEL = 68;
var CARD_W_APP = 150;
var CARD_H_APP = 64;
var CARD_W_AGENT = 160;
var CARD_H_AGENT = 72;
var CARD_R = 8;      // corner radius
var ACCENT_W = 4;    // left accent bar width
var ICON_R = 12;     // icon circle radius

function getCardDimensions(nodeType?: NodeType): { w: number; h: number } {
  if (nodeType === "channel") return { w: CARD_W_CHANNEL, h: CARD_H_CHANNEL };
  if (nodeType === "app") return { w: CARD_W_APP, h: CARD_H_APP };
  if (nodeType === "agent") return { w: CARD_W_AGENT, h: CARD_H_AGENT };
  return { w: CARD_W, h: CARD_H };
}

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
  isDark: boolean,
  isSelected?: boolean
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
  ctx.globalAlpha = isSelected ? (isDark ? 0.12 : 0.08) : (isDark ? 0.06 : 0.04);
  ctx.fillStyle = region.color;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Border — thicker and brighter when selected
  if (isSelected) {
    ctx.strokeStyle = region.strokeColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = isDark ? 0.6 : 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else {
    ctx.strokeStyle = region.strokeColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = isDark ? 0.2 : 0.15;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

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
    ctx.globalAlpha = isSelected ? 0.6 : 0.3;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Badge text
    ctx.fillStyle = region.strokeColor;
    ctx.globalAlpha = isSelected ? 0.9 : (isDark ? 0.7 : 0.6);
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
    case "back-office": { // Shopify bag logo (from official SVG)
      // Scale from 109.5x124.5 viewBox into 24x24 icon space
      var svgS = 24 / 124.5;
      var oX = (24 - 109.5 * svgS) / 2; // center horizontally
      ctx.save();
      ctx.translate(oX, 0);
      ctx.scale(svgS, svgS);
      ctx.strokeStyle = "none";
      ctx.lineWidth = 0;
      // Green bag body
      var bagPath = new Path2D("M95.9 23.9c-.1-.6-.6-1-1.1-1-.5 0-9.3-.2-9.3-.2s-7.4-7.2-8.1-7.9c-.7-.7-2.2-.5-2.7-.3 0 0-1.4.4-3.7 1.1-.4-1.3-1-2.8-1.8-4.4-2.6-5-6.5-7.7-11.1-7.7-.3 0-.6 0-1 .1-.1-.2-.3-.3-.4-.5C54.7.9 52.1-.1 49 0c-6 .2-12 4.5-16.8 12.2-3.4 5.4-6 12.2-6.8 17.5-6.9 2.1-11.7 3.6-11.8 3.7-3.5 1.1-3.6 1.2-4 4.5-.3 2.5-9.5 73-9.5 73l76.4 13.2 33.1-8.2c-.1-.1-13.6-91.4-13.7-92zm-28.7-7.1c-1.8.5-3.8 1.2-5.9 1.8 0-3-.4-7.3-1.8-10.9 4.5.9 6.7 6 7.7 9.1zm-10 3.1c-4 1.2-8.4 2.6-12.8 3.9 1.2-4.7 3.6-9.4 6.4-12.5 1.1-1.1 2.6-2.4 4.3-3.2 1.8 3.5 2.2 8.4 2.1 11.8zM49.1 4c1.4 0 2.6.3 3.6.9-1.6.9-3.2 2.1-4.7 3.7-3.8 4.1-6.7 10.5-7.9 16.6-3.6 1.1-7.2 2.2-10.5 3.2C31.7 18.8 39.8 4.3 49.1 4z");
      ctx.fillStyle = "#95bf47";
      ctx.fill(bagPath);
      // Dark green side
      var sidePath = new Path2D("M94.8 22.9c-.5 0-9.3-.2-9.3-.2s-7.4-7.2-8.1-7.9c-.3-.3-.6-.4-1-.5V124l33.1-8.2S96 24.5 95.9 23.8c-.1-.5-.6-.9-1.1-.9z");
      ctx.fillStyle = "#5e8e3e";
      ctx.fill(sidePath);
      // White S
      var sPath = new Path2D("m58 39.9-3.8 14.4s-4.3-2-9.4-1.6c-7.5.5-7.5 5.2-7.5 6.4.4 6.4 17.3 7.8 18.3 22.9.7 11.9-6.3 20-16.4 20.6-12.2.8-18.9-6.4-18.9-6.4l2.6-11s6.7 5.1 12.1 4.7c3.5-.2 4.8-3.1 4.7-5.1-.5-8.4-14.3-7.9-15.2-21.7-.7-11.6 6.9-23.4 23.7-24.4 6.5-.5 9.8 1.2 9.8 1.2z");
      ctx.fillStyle = "#ffffff";
      ctx.fill(sPath);
      ctx.restore();
      break;
    }
    case "orders": // ShoppingBag
      ctx.beginPath();
      ctx.rect(3, 7, 18, 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 7); ctx.lineTo(8, 5);
      ctx.arc(12, 5, 4, Math.PI, 0);
      ctx.lineTo(16, 7);
      ctx.stroke();
      break;
    case "products": // Tag
      ctx.beginPath();
      ctx.moveTo(12, 2); ctx.lineTo(22, 2); ctx.lineTo(22, 12); ctx.lineTo(12, 22); ctx.lineTo(2, 12); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(17, 7, 1.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "customers": // Users
      // First person
      ctx.beginPath();
      ctx.arc(9, 7, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1, 21); ctx.quadraticCurveTo(1, 14, 9, 14);
      ctx.quadraticCurveTo(17, 14, 17, 21);
      ctx.stroke();
      // Second person (smaller, behind)
      ctx.beginPath();
      ctx.arc(17, 8, 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22, 21); ctx.quadraticCurveTo(22, 15, 17, 15);
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
    case "discounts": // Percent
      ctx.beginPath();
      ctx.arc(9, 9, 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(15, 15, 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(19, 5); ctx.lineTo(5, 19);
      ctx.stroke();
      break;
    case "content": // Image
      ctx.beginPath();
      ctx.rect(3, 3, 18, 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(8.5, 8.5, 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(21, 15); ctx.lineTo(16, 10); ctx.lineTo(5, 21);
      ctx.stroke();
      break;
    case "markets": // Globe
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 12); ctx.lineTo(22, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(12, 12, 4, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "finance": // Landmark
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
    case "analytics": // BarChart3
      ctx.beginPath();
      ctx.moveTo(3, 3); ctx.lineTo(3, 21); ctx.lineTo(21, 21);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, 17); ctx.lineTo(7, 13);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(11, 17); ctx.lineTo(11, 9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(15, 17); ctx.lineTo(15, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(19, 17); ctx.lineTo(19, 11);
      ctx.stroke();
      break;
    // ── Sales Channel Icons ──
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
    case "pos": // Store
      ctx.beginPath();
      ctx.moveTo(2, 7); ctx.lineTo(22, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 7); ctx.lineTo(2, 21); ctx.lineTo(22, 21); ctx.lineTo(22, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 3); ctx.lineTo(12, 1); ctx.lineTo(22, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 21); ctx.lineTo(10, 15); ctx.lineTo(14, 15); ctx.lineTo(14, 21);
      ctx.stroke();
      break;
    case "shop-channel": // Smartphone
      ctx.beginPath();
      ctx.rect(5, 2, 14, 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 18); ctx.lineTo(14, 18);
      ctx.stroke();
      break;
    case "facebook-instagram": // Custom FB/IG
      // Facebook 'f' shape
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 22); ctx.lineTo(10, 12); ctx.lineTo(15, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 15); ctx.lineTo(14, 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 12); ctx.quadraticCurveTo(10, 6, 15, 6);
      ctx.stroke();
      break;
    case "google-youtube": // Play button in circle (Google/YouTube)
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(9, 7); ctx.lineTo(18, 12); ctx.lineTo(9, 17); ctx.closePath();
      ctx.stroke();
      break;
    case "tiktok": // Music note (TikTok)
      ctx.beginPath();
      ctx.moveTo(12, 4); ctx.lineTo(12, 17);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9, 17, 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, 4); ctx.quadraticCurveTo(16, 4, 18, 8);
      ctx.stroke();
      break;
    // ── App Icons ──
    case "app-klaviyo": // Mail
      ctx.beginPath();
      ctx.rect(2, 5, 20, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 5); ctx.lineTo(12, 13); ctx.lineTo(22, 5);
      ctx.stroke();
      break;
    case "app-judgeme": // Star
      var cx2 = 12;
      var cy2 = 12;
      var outerR = 9;
      var innerR = 4;
      ctx.beginPath();
      for (var si2 = 0; si2 < 5; si2++) {
        var outerAngle = -Math.PI / 2 + si2 * (2 * Math.PI / 5);
        var innerAngle = outerAngle + Math.PI / 5;
        if (si2 === 0) {
          ctx.moveTo(cx2 + outerR * Math.cos(outerAngle), cy2 + outerR * Math.sin(outerAngle));
        } else {
          ctx.lineTo(cx2 + outerR * Math.cos(outerAngle), cy2 + outerR * Math.sin(outerAngle));
        }
        ctx.lineTo(cx2 + innerR * Math.cos(innerAngle), cy2 + innerR * Math.sin(innerAngle));
      }
      ctx.closePath();
      ctx.stroke();
      break;
    case "app-flow": // Zap / workflow
      ctx.beginPath();
      ctx.moveTo(13, 2); ctx.lineTo(3, 14); ctx.lineTo(12, 14); ctx.lineTo(11, 22); ctx.lineTo(21, 10); ctx.lineTo(12, 10); ctx.closePath();
      ctx.stroke();
      break;
    // ── Agent Icons ──
    case "agent-sidekick": // Sparkles / AI
      // Large sparkle (top-right)
      ctx.beginPath();
      ctx.moveTo(14, 2); ctx.lineTo(15.5, 7); ctx.lineTo(20, 8); ctx.lineTo(15.5, 9.5);
      ctx.lineTo(14, 14); ctx.lineTo(12.5, 9.5); ctx.lineTo(8, 8); ctx.lineTo(12.5, 7);
      ctx.closePath();
      ctx.stroke();
      // Small sparkle (bottom-left)
      ctx.beginPath();
      ctx.moveTo(7, 14); ctx.lineTo(8, 16.5); ctx.lineTo(11, 17); ctx.lineTo(8, 18);
      ctx.lineTo(7, 21); ctx.lineTo(6, 18); ctx.lineTo(3, 17); ctx.lineTo(6, 16.5);
      ctx.closePath();
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
  var dims = getCardDimensions(node.nodeType);
  var _pos = gridToScreen(node.tileX, node.tileY, panX, panY, zoom);
  var w = dims.w * zoom;
  var h = dims.h * zoom;
  var x = _pos[0] - w / 2;
  var y = _pos[1] - h / 2;
  var r = CARD_R * zoom;

  // ── Maturity state from activityLevel ──
  var activity = node.activityLevel || 0;
  var isSetup = activity < 0.2;
  var isEarly = activity >= 0.2 && activity <= 0.4;
  // Opacity multipliers per maturity state
  var accentOpacity = isSetup ? 0.4 : (isEarly ? 0.7 : 1.0);
  var iconOpacity = isSetup ? 0.4 : (isEarly ? 0.7 : 1.0);
  var labelOpacity = isSetup ? 0.5 : (isEarly ? 0.75 : 1.0);

  // Card background
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = isDark ? "#1e1e1e" : "#ffffff";
  ctx.fill();

  // Card border — varies by nodeType and maturity
  if (isSelected) {
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
  } else if (isSetup) {
    // Setup state: dashed, muted border
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
  } else if (node.nodeType === "agent") {
    ctx.strokeStyle = def.color;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
  } else if (node.nodeType === "app") {
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
  } else {
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

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
  ctx.globalAlpha = accentOpacity;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Icon circle (top-left inside card)
  var iconR = ICON_R * zoom;
  var iconCX = x + accentW + 8 * zoom + iconR;
  var iconCY = y + h * 0.38;
  ctx.beginPath();
  ctx.arc(iconCX, iconCY, iconR, 0, Math.PI * 2);
  ctx.fillStyle = def.color;
  ctx.globalAlpha = 0.12 * iconOpacity;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Draw Lucide-style icon
  var iconSize = iconR * 1.3;
  ctx.globalAlpha = iconOpacity;
  drawCategoryIcon(ctx, node.category, iconCX, iconCY, iconSize, def.color);
  ctx.globalAlpha = 1;

  // Label text (bold, to the right of icon)
  var labelX = iconCX + iconR + 6 * zoom;
  var labelY = y + h * 0.35;
  ctx.globalAlpha = labelOpacity;
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
  ctx.globalAlpha = 1;

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

  // Draw grid
  drawGrid(ctx, gridWidth, gridHeight, panX, panY, zoom, isDark);

  // Draw regions (behind connectors and nodes)
  var _regions = regions || [];
  for (var ri = 0; ri < _regions.length; ri++) {
    var isRegionSelected = uiState.selectedRegionId === _regions[ri].id;
    drawRegion(ctx, _regions[ri], panX, panY, zoom, isDark, isRegionSelected);
  }

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

// ── Section preview (dashed rectangle while drawing) ────────
function drawSectionPreview(
  ctx: CanvasRenderingContext2D,
  fromTile: [number, number],
  toTile: [number, number],
  panX: number,
  panY: number,
  zoom: number
): void {
  var fromPt = gridToScreen(fromTile[0], fromTile[1], panX, panY, zoom);
  var toPt = gridToScreen(toTile[0], toTile[1], panX, panY, zoom);

  var pad = TILE_SIZE * zoom * 0.5;
  var x1 = Math.min(fromPt[0], toPt[0]) - pad;
  var y1 = Math.min(fromPt[1], toPt[1]) - pad;
  var x2 = Math.max(fromPt[0], toPt[0]) + pad;
  var y2 = Math.max(fromPt[1], toPt[1]) + pad;
  var rr = 12 * zoom;

  // Fill
  roundedRect(ctx, x1, y1, x2 - x1, y2 - y1, rr);
  ctx.fillStyle = "rgba(13,148,136,0.06)";
  ctx.fill();

  // Dashed border
  ctx.setLineDash([6 * zoom, 4 * zoom]);
  ctx.strokeStyle = "rgba(13,148,136,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
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

  // Section draw preview
  if (uiState.sectionDrawStart && uiState.sectionDrawEnd) {
    drawSectionPreview(
      ctx,
      uiState.sectionDrawStart,
      uiState.sectionDrawEnd,
      uiState.panX,
      uiState.panY,
      uiState.zoom
    );
  }

  if (uiState.hoveredTile && (uiState.mode === "PLACE_NODE" || uiState.mode === "CONNECTOR" || uiState.mode === "CREATE_SECTION")) {
    var tile = uiState.hoveredTile;
    var fillAlpha = uiState.mode === "PLACE_NODE"
      ? (isDark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.1)")
      : (isDark ? "rgba(13,148,136,0.1)" : "rgba(13,148,136,0.08)");
    var strokeAlpha = uiState.mode === "PLACE_NODE"
      ? (isDark ? "rgba(13,148,136,0.5)" : "rgba(13,148,136,0.3)")
      : (isDark ? "rgba(13,148,136,0.4)" : "rgba(13,148,136,0.25)");
    drawTileHighlight(
      ctx,
      tile[0],
      tile[1],
      uiState.panX,
      uiState.panY,
      uiState.zoom,
      fillAlpha,
      strokeAlpha
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

  // ── Agent radiating rings ──
  for (var ai = 0; ai < nodes.length; ai++) {
    var aNode = nodes[ai];
    if (aNode.nodeType !== "agent") continue;
    var aDims = getCardDimensions(aNode.nodeType);
    var aPos = gridToScreen(aNode.tileX, aNode.tileY, panX, panY, zoom);
    var aDef = getCategoryDef(aNode.category);
    // Two rings cycling at different speeds
    for (var ring = 0; ring < 2; ring++) {
      var ringProgress = ((time * 0.0008 + ring * 0.5) % 1);
      var ringScale = 1 + ringProgress * 0.4;
      var ringAlpha = 0.15 * (1 - ringProgress);
      var rw = aDims.w * zoom * ringScale;
      var rh = aDims.h * zoom * ringScale;
      var rx2 = aPos[0] - rw / 2;
      var ry2 = aPos[1] - rh / 2;
      roundedRect(ctx, rx2, ry2, rw, rh, CARD_R * zoom * ringScale);
      ctx.strokeStyle = aDef.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = ringAlpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // ── Card border pulse for active nodes ──
  for (var bi = 0; bi < nodes.length; bi++) {
    var bNode = nodes[bi];
    var activity = bNode.activityLevel || 0;
    if (activity < 0.5) continue;

    var bDims = getCardDimensions(bNode.nodeType);
    var bPos = gridToScreen(bNode.tileX, bNode.tileY, panX, panY, zoom);
    var w = bDims.w * zoom;
    var h = bDims.h * zoom;
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
