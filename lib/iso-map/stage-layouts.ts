import type { MerchantStage, StageLayout, ConnectionTemplate, StageNodePosition, Region, NodeCategory } from "./types";
import type { CommerceData } from "./commerce-map-data";

// ── Clustered layout positions for commerce map view ──────────────
// 4 quadrants: Commerce (NE), Growth (NW), Channels (W/SW), Platform (SE)
// Center: Admin at (20, 18)

// Center
var MID_X = 20;
var MID_Y = 18;

// ── Commerce cluster (NE) ──
var X_ORDERS     = 24;
var Y_ORDERS     = 10;
var X_PRODUCTS   = 28;
var Y_PRODUCTS   = 12;
var X_CUSTOMERS  = 24;
var Y_CUSTOMERS  = 14;
var X_JUDGEME    = 31;
var Y_JUDGEME    = 11;
var X_FLOW      = 27;
var Y_FLOW      = 9;

// ── Growth cluster (NW) ──
var X_MARKETING  = 13;
var Y_MARKETING  = 11;
var X_DISCOUNTS  = 13;
var Y_DISCOUNTS  = 15;
var X_KLAVIYO    = 10;
var Y_KLAVIYO    = 10;

// ── Agents (near Admin center) ──
var X_SIDEKICK = 17;
var Y_SIDEKICK = 21;

// ── Channels cluster (W/SW) ──
var X_ONLINE_STORE = 12;
var Y_ONLINE_STORE = 20;
var X_POS          = 9;
var Y_POS          = 22;
var X_SHOP         = 12;
var Y_SHOP         = 24;
var X_FACEBOOK     = 9;
var Y_FACEBOOK     = 26;
var X_GOOGLE       = 15;
var Y_GOOGLE       = 26;
var X_TIKTOK       = 9;
var Y_TIKTOK       = 28;

// ── Platform cluster (SE) ──
var X_FINANCE    = 27;
var Y_FINANCE    = 22;
var X_ANALYTICS  = 24;
var Y_ANALYTICS  = 25;
var X_CONTENT    = 21;
var Y_CONTENT    = 22;
var X_MARKETS    = 27;
var Y_MARKETS    = 26;

// ── Region templates (same as hub-layouts) ─────────────────────
interface RegionTemplate {
  label: string;
  color: string;
  categories: NodeCategory[];
}

var REGION_TEMPLATES: RegionTemplate[] = [
  { label: "Commerce", color: "#ea580c", categories: ["orders", "products", "customers", "app-judgeme", "app-flow"] },
  { label: "Growth",   color: "#db2777", categories: ["marketing", "discounts", "app-klaviyo"] },
  { label: "Channels", color: "#0284c7", categories: ["online-store", "pos", "shop-channel", "facebook-instagram", "google-youtube", "tiktok"] },
  { label: "Platform", color: "#059669", categories: ["finance", "analytics", "content", "markets"] },
];

// ── Stage Definitions ──────────────────────────────────────────

var STAGE_0: StageLayout = {
  stage: 0,
  label: "Just Started",
  nodes: [
    { category: "back-office",  tileX: MID_X, tileY: MID_Y },
    { category: "online-store", nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.5 },
  ],
};

var STAGE_1: StageLayout = {
  stage: 1,
  label: "First Sale",
  nodes: [
    { category: "back-office",  tileX: MID_X, tileY: MID_Y },
    { category: "online-store", nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
    { category: "orders",       nodeType: "core", tileX: X_ORDERS, tileY: Y_ORDERS },
    { category: "products",     nodeType: "core", tileX: X_PRODUCTS, tileY: Y_PRODUCTS },
    { category: "customers",    nodeType: "core", tileX: X_CUSTOMERS, tileY: Y_CUSTOMERS },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.6 },
    { from: "back-office", to: "orders",       label: "orders",     style: "solid", flowRate: 0.7 },
    { from: "back-office", to: "products",     label: "catalog",    style: "solid", flowRate: 0.5 },
    { from: "back-office", to: "customers",    label: "CRM",        style: "solid", flowRate: 0.5 },
  ],
};

var STAGE_2: StageLayout = {
  stage: 2,
  label: "Growing",
  nodes: [
    { category: "back-office",  tileX: MID_X, tileY: MID_Y },
    { category: "online-store", nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
    { category: "orders",       nodeType: "core", tileX: X_ORDERS, tileY: Y_ORDERS },
    { category: "products",     nodeType: "core", tileX: X_PRODUCTS, tileY: Y_PRODUCTS },
    { category: "customers",    nodeType: "core", tileX: X_CUSTOMERS, tileY: Y_CUSTOMERS },
    { category: "marketing",    nodeType: "core", tileX: X_MARKETING, tileY: Y_MARKETING },
    { category: "finance",      nodeType: "core", tileX: X_FINANCE, tileY: Y_FINANCE },
    { category: "analytics",    nodeType: "core", tileX: X_ANALYTICS, tileY: Y_ANALYTICS },
    { category: "app-klaviyo",  nodeType: "app",  tileX: X_KLAVIYO, tileY: Y_KLAVIYO },
    // Agent
    { category: "agent-sidekick", nodeType: "agent", tileX: X_SIDEKICK, tileY: Y_SIDEKICK },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "orders",       label: "orders",     style: "solid",  flowRate: 0.7 },
    { from: "back-office", to: "products",     label: "catalog",    style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "customers",    label: "CRM",        style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "marketing",    label: "campaigns",  style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "finance",      label: "revenue",    style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "analytics",    label: "insights",   style: "dashed", flowRate: 0.3 },
    { from: "marketing",   to: "app-klaviyo",  label: "email/SMS",  style: "dashed", flowRate: 0.4 },
    { from: "back-office", to: "agent-sidekick", label: "AI",       style: "dotted", flowRate: 0.5 },
  ],
};

var STAGE_3: StageLayout = {
  stage: 3,
  label: "Scaling",
  nodes: [
    { category: "back-office",  tileX: MID_X, tileY: MID_Y },
    { category: "online-store", nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
    { category: "pos",          nodeType: "channel", tileX: X_POS, tileY: Y_POS },
    { category: "shop-channel", nodeType: "channel", tileX: X_SHOP, tileY: Y_SHOP },
    { category: "orders",       nodeType: "core", tileX: X_ORDERS, tileY: Y_ORDERS },
    { category: "products",     nodeType: "core", tileX: X_PRODUCTS, tileY: Y_PRODUCTS },
    { category: "customers",    nodeType: "core", tileX: X_CUSTOMERS, tileY: Y_CUSTOMERS },
    { category: "marketing",    nodeType: "core", tileX: X_MARKETING, tileY: Y_MARKETING },
    { category: "finance",      nodeType: "core", tileX: X_FINANCE, tileY: Y_FINANCE },
    { category: "analytics",    nodeType: "core", tileX: X_ANALYTICS, tileY: Y_ANALYTICS },
    { category: "discounts",    nodeType: "core", tileX: X_DISCOUNTS, tileY: Y_DISCOUNTS },
    { category: "content",      nodeType: "core", tileX: X_CONTENT, tileY: Y_CONTENT },
    { category: "app-klaviyo",  nodeType: "app",  tileX: X_KLAVIYO, tileY: Y_KLAVIYO },
    { category: "app-judgeme",  nodeType: "app",  tileX: X_JUDGEME, tileY: Y_JUDGEME },
    // Agent
    { category: "agent-sidekick", nodeType: "agent", tileX: X_SIDEKICK, tileY: Y_SIDEKICK },
  ],
  connections: [
    { from: "back-office", to: "online-store",  label: "storefront",  style: "solid",  flowRate: 0.7 },
    { from: "back-office", to: "pos",           label: "retail",      style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "shop-channel",  label: "shop app",    style: "solid",  flowRate: 0.4 },
    { from: "back-office", to: "orders",        label: "orders",      style: "solid",  flowRate: 0.7 },
    { from: "back-office", to: "products",      label: "catalog",     style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "customers",     label: "CRM",         style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "marketing",     label: "campaigns",   style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "finance",       label: "revenue",     style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "analytics",     label: "insights",    style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "discounts",     label: "promotions",  style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "content",       label: "pages",       style: "dashed", flowRate: 0.3 },
    { from: "marketing",   to: "app-klaviyo",   label: "email/SMS",   style: "dashed", flowRate: 0.4 },
    { from: "products",    to: "app-judgeme",   label: "reviews",     style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "agent-sidekick", label: "AI",         style: "dotted", flowRate: 0.5 },
  ],
};

var STAGE_4: StageLayout = {
  stage: 4,
  label: "Mature",
  nodes: [
    { category: "back-office",        tileX: MID_X, tileY: MID_Y },
    // Channels
    { category: "online-store",       nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
    { category: "pos",                nodeType: "channel", tileX: X_POS, tileY: Y_POS },
    { category: "shop-channel",       nodeType: "channel", tileX: X_SHOP, tileY: Y_SHOP },
    { category: "facebook-instagram", nodeType: "channel", tileX: X_FACEBOOK, tileY: Y_FACEBOOK },
    { category: "google-youtube",     nodeType: "channel", tileX: X_GOOGLE, tileY: Y_GOOGLE },
    { category: "tiktok",             nodeType: "channel", tileX: X_TIKTOK, tileY: Y_TIKTOK },
    // Core
    { category: "orders",       nodeType: "core", tileX: X_ORDERS, tileY: Y_ORDERS },
    { category: "products",     nodeType: "core", tileX: X_PRODUCTS, tileY: Y_PRODUCTS },
    { category: "customers",    nodeType: "core", tileX: X_CUSTOMERS, tileY: Y_CUSTOMERS },
    { category: "marketing",    nodeType: "core", tileX: X_MARKETING, tileY: Y_MARKETING },
    { category: "finance",      nodeType: "core", tileX: X_FINANCE, tileY: Y_FINANCE },
    { category: "analytics",    nodeType: "core", tileX: X_ANALYTICS, tileY: Y_ANALYTICS },
    { category: "discounts",    nodeType: "core", tileX: X_DISCOUNTS, tileY: Y_DISCOUNTS },
    { category: "content",      nodeType: "core", tileX: X_CONTENT, tileY: Y_CONTENT },
    { category: "markets",      nodeType: "core", tileX: X_MARKETS, tileY: Y_MARKETS },
    // Apps
    { category: "app-klaviyo",  nodeType: "app",  tileX: X_KLAVIYO, tileY: Y_KLAVIYO },
    { category: "app-judgeme",  nodeType: "app",  tileX: X_JUDGEME, tileY: Y_JUDGEME },
    { category: "app-flow",    nodeType: "app",  tileX: X_FLOW, tileY: Y_FLOW },
    // Agent
    { category: "agent-sidekick", nodeType: "agent", tileX: X_SIDEKICK, tileY: Y_SIDEKICK },
  ],
  connections: [
    // Admin → Channels
    { from: "back-office", to: "online-store",       label: "storefront",    style: "solid",  flowRate: 0.7 },
    { from: "back-office", to: "pos",                label: "retail",        style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "shop-channel",       label: "shop app",      style: "solid",  flowRate: 0.4 },
    { from: "back-office", to: "facebook-instagram", label: "social",        style: "solid",  flowRate: 0.4 },
    { from: "back-office", to: "google-youtube",     label: "search",        style: "solid",  flowRate: 0.4 },
    { from: "back-office", to: "tiktok",             label: "social",        style: "solid",  flowRate: 0.3 },
    // Admin → Core
    { from: "back-office", to: "orders",        label: "orders",        style: "solid",  flowRate: 0.7 },
    { from: "back-office", to: "products",      label: "catalog",       style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "customers",     label: "CRM",           style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "marketing",     label: "campaigns",     style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "finance",       label: "revenue",       style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "analytics",     label: "insights",      style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "discounts",     label: "promotions",    style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "content",       label: "pages",         style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "markets",       label: "international", style: "dashed", flowRate: 0.4 },
    // Apps → Core nodes they extend
    { from: "marketing",   to: "app-klaviyo",   label: "email/SMS",     style: "dashed", flowRate: 0.4 },
    { from: "products",    to: "app-judgeme",   label: "reviews",       style: "dashed", flowRate: 0.3 },
    { from: "orders",      to: "app-flow",     label: "automation",    style: "dashed", flowRate: 0.4 },
    // Admin → Agent
    { from: "back-office", to: "agent-sidekick", label: "AI",           style: "dotted", flowRate: 0.5 },
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
  // Stage 3: >100 orders
  if (data.totalOrders > 100) return 3;
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
  var rid = 0;

  for (var ti = 0; ti < REGION_TEMPLATES.length; ti++) {
    var tmpl = REGION_TEMPLATES[ti];
    var matchX: number[] = [];
    var matchY: number[] = [];
    for (var pi = 0; pi < positions.length; pi++) {
      var pos = positions[pi];
      for (var ci = 0; ci < tmpl.categories.length; ci++) {
        if (pos.category === tmpl.categories[ci]) {
          matchX.push(pos.tileX);
          matchY.push(pos.tileY);
          break;
        }
      }
    }

    if (matchX.length < 2) continue;

    var minX = matchX[0];
    var maxX = matchX[0];
    var minY = matchY[0];
    var maxY = matchY[0];
    for (var mi = 1; mi < matchX.length; mi++) {
      if (matchX[mi] < minX) minX = matchX[mi];
      if (matchX[mi] > maxX) maxX = matchX[mi];
      if (matchY[mi] < minY) minY = matchY[mi];
      if (matchY[mi] > maxY) maxY = matchY[mi];
    }

    regions.push({
      id: "region-" + (++rid),
      label: tmpl.label,
      fromTile: [minX - 1, minY - 1],
      toTile: [maxX + 1, maxY + 1],
      color: tmpl.color,
      strokeColor: tmpl.color,
    });
  }

  return regions;
}
