import type { MerchantStage, StageLayout, ConnectionTemplate, StageNodePosition, Region } from "./types";
import type { CommerceData } from "./commerce-map-data";

// ── Three-lane layout positions ──────────────────────────────────
// TOP LANE: Acquisition & Funding (lower tileY = higher on screen)
// MIDDLE LANE: Revenue path — the "main street"
// BOTTOM LANE: Operations & Fulfillment (higher tileY = lower on screen)
//
// Left-to-right money flow:
//   Capital → BackOffice → OnlineStore → Checkout → Payments → Balance → (Earnings)
//                           └── Retail                 └── Tax
//   Marketing ──traffic──→ OnlineStore
//   Inventory ──fulfill──→ Shipping
//   Apps         Billing

// Middle lane Y
var MID_Y = 18;
// Top lane Y (above middle) — 8 tiles of breathing room
var TOP_Y = 10;
// Bottom lane Y (below middle) — 8 tiles of breathing room
var BOT_Y = 26;

// X positions along the horizontal revenue path — 6 tiles between each
var X_CAPITAL = 6;
var X_BACKOFFICE = 12;
var X_STORE = 18;
var X_CHECKOUT = 24;
var X_PAYMENTS = 30;
var X_BALANCE = 36;

// ── Stage Definitions ──────────────────────────────────────────

var STAGE_0: StageLayout = {
  stage: 0,
  label: "Just Started",
  nodes: [
    { category: "back-office", tileX: X_BACKOFFICE, tileY: MID_Y },
    { category: "online-store", tileX: X_STORE, tileY: MID_Y },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.5 },
  ],
};

var STAGE_1: StageLayout = {
  stage: 1,
  label: "First Sale",
  nodes: [
    { category: "back-office", tileX: X_BACKOFFICE, tileY: MID_Y },
    { category: "online-store", tileX: X_STORE, tileY: MID_Y },
    { category: "checkout", tileX: X_CHECKOUT, tileY: MID_Y },
    { category: "payments", tileX: X_PAYMENTS, tileY: MID_Y },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.5 },
    { from: "online-store", to: "checkout", label: "orders", style: "solid", flowRate: 0.7 },
    { from: "checkout", to: "payments", label: "revenue", style: "solid", flowRate: 0.8 },
  ],
};

var STAGE_2: StageLayout = {
  stage: 2,
  label: "Growing",
  nodes: [
    { category: "back-office", tileX: X_BACKOFFICE, tileY: MID_Y },
    { category: "online-store", tileX: X_STORE, tileY: MID_Y },
    { category: "checkout", tileX: X_CHECKOUT, tileY: MID_Y },
    { category: "payments", tileX: X_PAYMENTS, tileY: MID_Y },
    { category: "balance", tileX: X_BALANCE, tileY: MID_Y },
    { category: "marketing", tileX: X_STORE, tileY: TOP_Y },
    { category: "inventory", tileX: X_STORE, tileY: BOT_Y },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.5 },
    { from: "marketing", to: "online-store", label: "traffic", style: "solid", flowRate: 0.6 },
    { from: "online-store", to: "checkout", label: "orders", style: "solid", flowRate: 0.7 },
    { from: "checkout", to: "payments", label: "revenue", style: "solid", flowRate: 0.8 },
    { from: "payments", to: "balance", label: "deposits", style: "solid", flowRate: 0.6 },
    { from: "back-office", to: "inventory", label: "manage", style: "dashed", flowRate: 0.3 },
  ],
};

var STAGE_3: StageLayout = {
  stage: 3,
  label: "Scaling",
  nodes: [
    { category: "back-office", tileX: X_BACKOFFICE, tileY: MID_Y },
    { category: "online-store", tileX: X_STORE, tileY: MID_Y },
    { category: "retail", tileX: X_STORE + 3, tileY: MID_Y + 3 },
    { category: "checkout", tileX: X_CHECKOUT, tileY: MID_Y },
    { category: "payments", tileX: X_PAYMENTS, tileY: MID_Y },
    { category: "balance", tileX: X_BALANCE, tileY: MID_Y },
    { category: "tax", tileX: X_PAYMENTS, tileY: MID_Y + 4 },
    { category: "marketing", tileX: X_STORE, tileY: TOP_Y },
    { category: "inventory", tileX: X_STORE, tileY: BOT_Y },
    { category: "shipping", tileX: X_CHECKOUT, tileY: BOT_Y },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.5 },
    { from: "marketing", to: "online-store", label: "traffic", style: "solid", flowRate: 0.6 },
    { from: "online-store", to: "checkout", label: "orders", style: "solid", flowRate: 0.7 },
    { from: "checkout", to: "payments", label: "revenue", style: "solid", flowRate: 0.8 },
    { from: "payments", to: "balance", label: "deposits", style: "solid", flowRate: 0.6 },
    { from: "payments", to: "tax", label: "tax", style: "dotted", flowRate: 0.3 },
    { from: "back-office", to: "inventory", label: "manage", style: "dashed", flowRate: 0.3 },
    { from: "inventory", to: "shipping", label: "fulfill", style: "solid", flowRate: 0.6 },
    { from: "inventory", to: "retail", label: "restock", style: "dashed", flowRate: 0.3 },
  ],
};

var STAGE_4: StageLayout = {
  stage: 4,
  label: "Mature",
  nodes: [
    { category: "capital", tileX: X_CAPITAL, tileY: TOP_Y },
    { category: "back-office", tileX: X_BACKOFFICE, tileY: MID_Y },
    { category: "online-store", tileX: X_STORE, tileY: MID_Y },
    { category: "retail", tileX: X_STORE + 3, tileY: MID_Y + 3 },
    { category: "checkout", tileX: X_CHECKOUT, tileY: MID_Y },
    { category: "payments", tileX: X_PAYMENTS, tileY: MID_Y },
    { category: "balance", tileX: X_BALANCE, tileY: MID_Y },
    { category: "tax", tileX: X_PAYMENTS, tileY: MID_Y + 4 },
    { category: "marketing", tileX: X_STORE, tileY: TOP_Y },
    { category: "inventory", tileX: X_STORE, tileY: BOT_Y },
    { category: "shipping", tileX: X_CHECKOUT, tileY: BOT_Y },
    { category: "billing", tileX: X_CHECKOUT, tileY: BOT_Y + 4 },
  ],
  connections: [
    { from: "capital", to: "back-office", label: "funding", style: "dashed", flowRate: 0.4 },
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.5 },
    { from: "marketing", to: "online-store", label: "traffic", style: "solid", flowRate: 0.6 },
    { from: "online-store", to: "checkout", label: "orders", style: "solid", flowRate: 0.7 },
    { from: "checkout", to: "payments", label: "revenue", style: "solid", flowRate: 0.8 },
    { from: "payments", to: "balance", label: "deposits", style: "solid", flowRate: 0.6 },
    { from: "payments", to: "tax", label: "tax", style: "dotted", flowRate: 0.3 },
    { from: "back-office", to: "inventory", label: "manage", style: "dashed", flowRate: 0.3 },
    { from: "inventory", to: "shipping", label: "fulfill", style: "solid", flowRate: 0.6 },
    { from: "inventory", to: "retail", label: "restock", style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "billing", label: "subscription", style: "dotted", flowRate: 0.2 },
  ],
};

var ALL_STAGES: StageLayout[] = [STAGE_0, STAGE_1, STAGE_2, STAGE_3, STAGE_4];

export function getStageLayout(stage: MerchantStage): StageLayout {
  return ALL_STAGES[stage] || ALL_STAGES[0];
}

export function getStageLabel(stage: MerchantStage): string {
  var layout = getStageLayout(stage);
  return layout.label;
}

// ── Auto-detect merchant stage from commerce data ──────────────
export function getAutoStage(data: CommerceData): MerchantStage {
  // Stage 4: manual opt-in or very mature
  // Stage 3: >100 orders OR has retail inventory
  if (data.totalOrders > 100 || data.retailInventory > 0) return 3;
  // Stage 2: >30 orders OR has marketing (newsletter subscribers)
  if (data.totalOrders > 30 || data.newsletterSubscribers > 0) return 2;
  // Stage 1: has any orders
  if (data.totalOrders > 0) return 1;
  // Stage 0: brand new
  return 0;
}

// ── Auto-compute regions from node positions ──────────────────
export function computeRegions(positions: StageNodePosition[]): Region[] {
  var regions: Region[] = [];

  // Classify nodes into lanes
  var midNodes: StageNodePosition[] = [];
  var topNodes: StageNodePosition[] = [];
  var botNodes: StageNodePosition[] = [];

  for (var i = 0; i < positions.length; i++) {
    var p = positions[i];
    if (p.tileY <= TOP_Y + 1) {
      topNodes.push(p);
    } else if (p.tileY >= BOT_Y - 1) {
      botNodes.push(p);
    } else {
      midNodes.push(p);
    }
  }

  // Revenue Path region (middle lane, if 2+ nodes)
  if (midNodes.length >= 2) {
    var minX = midNodes[0].tileX;
    var maxX = midNodes[0].tileX;
    var minY = midNodes[0].tileY;
    var maxY = midNodes[0].tileY;
    for (var mi = 1; mi < midNodes.length; mi++) {
      if (midNodes[mi].tileX < minX) minX = midNodes[mi].tileX;
      if (midNodes[mi].tileX > maxX) maxX = midNodes[mi].tileX;
      if (midNodes[mi].tileY < minY) minY = midNodes[mi].tileY;
      if (midNodes[mi].tileY > maxY) maxY = midNodes[mi].tileY;
    }
    regions.push({
      id: "region-revenue",
      label: "Revenue Path",
      fromTile: [minX - 1, minY - 1],
      toTile: [maxX + 1, maxY + 1],
      color: "#5eead4",
      strokeColor: "#0d9488",
    });
  }

  // Acquisition region (top lane, if any)
  if (topNodes.length > 0) {
    var tMinX = topNodes[0].tileX;
    var tMaxX = topNodes[0].tileX;
    var tMinY = topNodes[0].tileY;
    var tMaxY = topNodes[0].tileY;
    for (var ti = 1; ti < topNodes.length; ti++) {
      if (topNodes[ti].tileX < tMinX) tMinX = topNodes[ti].tileX;
      if (topNodes[ti].tileX > tMaxX) tMaxX = topNodes[ti].tileX;
      if (topNodes[ti].tileY < tMinY) tMinY = topNodes[ti].tileY;
      if (topNodes[ti].tileY > tMaxY) tMaxY = topNodes[ti].tileY;
    }
    regions.push({
      id: "region-acquisition",
      label: "Acquisition",
      fromTile: [tMinX - 1, tMinY - 1],
      toTile: [tMaxX + 1, tMaxY + 1],
      color: "#f9a8d4",
      strokeColor: "#db2777",
    });
  }

  // Operations region (bottom lane, if any)
  if (botNodes.length > 0) {
    var bMinX = botNodes[0].tileX;
    var bMaxX = botNodes[0].tileX;
    var bMinY = botNodes[0].tileY;
    var bMaxY = botNodes[0].tileY;
    for (var bi = 1; bi < botNodes.length; bi++) {
      if (botNodes[bi].tileX < bMinX) bMinX = botNodes[bi].tileX;
      if (botNodes[bi].tileX > bMaxX) bMaxX = botNodes[bi].tileX;
      if (botNodes[bi].tileY < bMinY) bMinY = botNodes[bi].tileY;
      if (botNodes[bi].tileY > bMaxY) bMaxY = botNodes[bi].tileY;
    }
    regions.push({
      id: "region-operations",
      label: "Operations",
      fromTile: [bMinX - 1, bMinY - 1],
      toTile: [bMaxX + 1, bMaxY + 1],
      color: "#93c5fd",
      strokeColor: "#2563eb",
    });
  }

  return regions;
}
