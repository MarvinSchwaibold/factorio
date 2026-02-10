import type { MerchantStage, StageLayout, StageNodePosition, Region, NodeCategory } from "./types";

// ── Clustered layout positions ──────────────────────────────────
// Center: Shopify Admin — the merchant's command center
// 4 quadrants: Commerce (NE), Growth (NW), Channels (W/SW), Platform (SE)

// Hub center coordinates
var HUB_X = 20;
var HUB_Y = 18;

// ── Commerce cluster (NE) ──
var POS_ORDERS     = { x: 24, y: 10 };
var POS_PRODUCTS   = { x: 28, y: 12 };
var POS_CUSTOMERS  = { x: 24, y: 14 };
var POS_JUDGEME    = { x: 31, y: 11 };
var POS_FLOW      = { x: 27, y: 9 };

// ── Growth cluster (NW) ──
var POS_MARKETING  = { x: 13, y: 11 };
var POS_DISCOUNTS  = { x: 13, y: 15 };
var POS_KLAVIYO    = { x: 10, y: 10 };

// ── Channels cluster (W/SW) ──
var POS_ONLINE_STORE = { x: 12, y: 20 };
var POS_POS          = { x: 9,  y: 22 };
var POS_SHOP         = { x: 12, y: 24 };
var POS_FACEBOOK     = { x: 9,  y: 26 };
var POS_GOOGLE       = { x: 15, y: 26 };
var POS_TIKTOK       = { x: 9,  y: 28 };

// ── Platform cluster (SE) ──
var POS_FINANCE    = { x: 27, y: 22 };
var POS_ANALYTICS  = { x: 24, y: 25 };
var POS_CONTENT    = { x: 21, y: 22 };
var POS_MARKETS    = { x: 27, y: 26 };

// ── Region templates ─────────────────────────────────────────
interface RegionTemplate {
  label: string;
  color: string;
  categories: NodeCategory[];
}

var REGION_TEMPLATES: RegionTemplate[] = [
  {
    label: "Commerce",
    color: "#ea580c",
    categories: ["orders", "products", "customers", "app-judgeme", "app-flow"],
  },
  {
    label: "Growth",
    color: "#db2777",
    categories: ["marketing", "discounts", "app-klaviyo"],
  },
  {
    label: "Channels",
    color: "#0284c7",
    categories: ["online-store", "pos", "shop-channel", "facebook-instagram", "google-youtube", "tiktok"],
  },
  {
    label: "Platform",
    color: "#059669",
    categories: ["finance", "analytics", "content", "markets"],
  },
];

// ── Hub Stage Definitions ──────────────────────────────────────

// Stage 0: "I just signed up for Shopify" — Admin + Online Store
var HUB_STAGE_0: StageLayout = {
  stage: 0,
  label: "Just Started",
  nodes: [
    { category: "back-office",   tileX: HUB_X,              tileY: HUB_Y },
    { category: "online-store",  nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.5 },
  ],
};

// Stage 1: First sale — core commerce nodes appear
var HUB_STAGE_1: StageLayout = {
  stage: 1,
  label: "First Sale",
  nodes: [
    { category: "back-office",   tileX: HUB_X,              tileY: HUB_Y },
    { category: "online-store",  nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
    { category: "orders",        nodeType: "core", tileX: POS_ORDERS.x,     tileY: POS_ORDERS.y },
    { category: "products",      nodeType: "core", tileX: POS_PRODUCTS.x,   tileY: POS_PRODUCTS.y },
    { category: "customers",     nodeType: "core", tileX: POS_CUSTOMERS.x,  tileY: POS_CUSTOMERS.y },
  ],
  connections: [
    { from: "back-office", to: "online-store", label: "storefront", style: "solid", flowRate: 0.6 },
    { from: "back-office", to: "orders",       label: "orders",     style: "solid", flowRate: 0.7 },
    { from: "back-office", to: "products",     label: "catalog",    style: "solid", flowRate: 0.5 },
    { from: "back-office", to: "customers",    label: "CRM",        style: "solid", flowRate: 0.5 },
  ],
};

// Stage 2: Growing — marketing, finance, analytics + first app
var HUB_STAGE_2: StageLayout = {
  stage: 2,
  label: "Growing",
  nodes: [
    { category: "back-office",   tileX: HUB_X,              tileY: HUB_Y },
    { category: "online-store",  nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
    { category: "orders",        nodeType: "core", tileX: POS_ORDERS.x,     tileY: POS_ORDERS.y },
    { category: "products",      nodeType: "core", tileX: POS_PRODUCTS.x,   tileY: POS_PRODUCTS.y },
    { category: "customers",     nodeType: "core", tileX: POS_CUSTOMERS.x,  tileY: POS_CUSTOMERS.y },
    { category: "marketing",     nodeType: "core", tileX: POS_MARKETING.x,  tileY: POS_MARKETING.y },
    { category: "finance",       nodeType: "core", tileX: POS_FINANCE.x,    tileY: POS_FINANCE.y },
    { category: "analytics",     nodeType: "core", tileX: POS_ANALYTICS.x,  tileY: POS_ANALYTICS.y },
    { category: "app-klaviyo",   nodeType: "app",  tileX: POS_KLAVIYO.x,    tileY: POS_KLAVIYO.y },
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
  ],
};

// Stage 3: Scaling — more channels, more core nodes, more apps
var HUB_STAGE_3: StageLayout = {
  stage: 3,
  label: "Scaling",
  nodes: [
    { category: "back-office",   tileX: HUB_X,              tileY: HUB_Y },
    { category: "online-store",  nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
    { category: "pos",           nodeType: "channel", tileX: POS_POS.x,          tileY: POS_POS.y },
    { category: "shop-channel",  nodeType: "channel", tileX: POS_SHOP.x,         tileY: POS_SHOP.y },
    { category: "orders",        nodeType: "core", tileX: POS_ORDERS.x,     tileY: POS_ORDERS.y },
    { category: "products",      nodeType: "core", tileX: POS_PRODUCTS.x,   tileY: POS_PRODUCTS.y },
    { category: "customers",     nodeType: "core", tileX: POS_CUSTOMERS.x,  tileY: POS_CUSTOMERS.y },
    { category: "marketing",     nodeType: "core", tileX: POS_MARKETING.x,  tileY: POS_MARKETING.y },
    { category: "finance",       nodeType: "core", tileX: POS_FINANCE.x,    tileY: POS_FINANCE.y },
    { category: "analytics",     nodeType: "core", tileX: POS_ANALYTICS.x,  tileY: POS_ANALYTICS.y },
    { category: "discounts",     nodeType: "core", tileX: POS_DISCOUNTS.x,  tileY: POS_DISCOUNTS.y },
    { category: "content",       nodeType: "core", tileX: POS_CONTENT.x,    tileY: POS_CONTENT.y },
    { category: "app-klaviyo",   nodeType: "app",  tileX: POS_KLAVIYO.x,    tileY: POS_KLAVIYO.y },
    { category: "app-judgeme",   nodeType: "app",  tileX: POS_JUDGEME.x,    tileY: POS_JUDGEME.y },
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
  ],
};

// Stage 4: Mature — full system with all channels and apps
var HUB_STAGE_4: StageLayout = {
  stage: 4,
  label: "Mature",
  nodes: [
    { category: "back-office",       tileX: HUB_X,              tileY: HUB_Y },
    // Channels
    { category: "online-store",      nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
    { category: "pos",               nodeType: "channel", tileX: POS_POS.x,          tileY: POS_POS.y },
    { category: "shop-channel",      nodeType: "channel", tileX: POS_SHOP.x,         tileY: POS_SHOP.y },
    { category: "facebook-instagram", nodeType: "channel", tileX: POS_FACEBOOK.x,    tileY: POS_FACEBOOK.y },
    { category: "google-youtube",    nodeType: "channel", tileX: POS_GOOGLE.x,       tileY: POS_GOOGLE.y },
    { category: "tiktok",            nodeType: "channel", tileX: POS_TIKTOK.x,       tileY: POS_TIKTOK.y },
    // Core
    { category: "orders",        nodeType: "core", tileX: POS_ORDERS.x,     tileY: POS_ORDERS.y },
    { category: "products",      nodeType: "core", tileX: POS_PRODUCTS.x,   tileY: POS_PRODUCTS.y },
    { category: "customers",     nodeType: "core", tileX: POS_CUSTOMERS.x,  tileY: POS_CUSTOMERS.y },
    { category: "marketing",     nodeType: "core", tileX: POS_MARKETING.x,  tileY: POS_MARKETING.y },
    { category: "finance",       nodeType: "core", tileX: POS_FINANCE.x,    tileY: POS_FINANCE.y },
    { category: "analytics",     nodeType: "core", tileX: POS_ANALYTICS.x,  tileY: POS_ANALYTICS.y },
    { category: "discounts",     nodeType: "core", tileX: POS_DISCOUNTS.x,  tileY: POS_DISCOUNTS.y },
    { category: "content",       nodeType: "core", tileX: POS_CONTENT.x,    tileY: POS_CONTENT.y },
    { category: "markets",       nodeType: "core", tileX: POS_MARKETS.x,    tileY: POS_MARKETS.y },
    // Apps
    { category: "app-klaviyo",   nodeType: "app",  tileX: POS_KLAVIYO.x,    tileY: POS_KLAVIYO.y },
    { category: "app-judgeme",   nodeType: "app",  tileX: POS_JUDGEME.x,    tileY: POS_JUDGEME.y },
    { category: "app-flow",     nodeType: "app",  tileX: POS_FLOW.x,       tileY: POS_FLOW.y },
  ],
  connections: [
    // Admin → Channels
    { from: "back-office", to: "online-store",      label: "storefront",     style: "solid",  flowRate: 0.7 },
    { from: "back-office", to: "pos",               label: "retail",         style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "shop-channel",      label: "shop app",       style: "solid",  flowRate: 0.4 },
    { from: "back-office", to: "facebook-instagram", label: "social",        style: "solid",  flowRate: 0.4 },
    { from: "back-office", to: "google-youtube",    label: "search",         style: "solid",  flowRate: 0.4 },
    { from: "back-office", to: "tiktok",            label: "social",         style: "solid",  flowRate: 0.3 },
    // Admin → Core
    { from: "back-office", to: "orders",        label: "orders",         style: "solid",  flowRate: 0.7 },
    { from: "back-office", to: "products",      label: "catalog",        style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "customers",     label: "CRM",            style: "solid",  flowRate: 0.5 },
    { from: "back-office", to: "marketing",     label: "campaigns",      style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "finance",       label: "revenue",        style: "solid",  flowRate: 0.6 },
    { from: "back-office", to: "analytics",     label: "insights",       style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "discounts",     label: "promotions",     style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "content",       label: "pages",          style: "dashed", flowRate: 0.3 },
    { from: "back-office", to: "markets",       label: "international",  style: "dashed", flowRate: 0.4 },
    // Apps → Core nodes they extend
    { from: "marketing",   to: "app-klaviyo",   label: "email/SMS",      style: "dashed", flowRate: 0.4 },
    { from: "products",    to: "app-judgeme",   label: "reviews",        style: "dashed", flowRate: 0.3 },
    { from: "orders",      to: "app-flow",     label: "automation",     style: "dashed", flowRate: 0.4 },
  ],
};

var HUB_ALL_STAGES: StageLayout[] = [HUB_STAGE_0, HUB_STAGE_1, HUB_STAGE_2, HUB_STAGE_3, HUB_STAGE_4];

export function getHubStageLayout(stage: MerchantStage): StageLayout {
  return HUB_ALL_STAGES[stage] || HUB_ALL_STAGES[0];
}

// ── Compute regions for hub layout (clustered quadrants) ──────────────
export function computeHubRegions(positions: StageNodePosition[]): Region[] {
  var regions: Region[] = [];
  var rid = 0;

  for (var ti = 0; ti < REGION_TEMPLATES.length; ti++) {
    var tmpl = REGION_TEMPLATES[ti];
    // Find positions matching this template's categories
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

    // Only create region if 2+ nodes from this template
    if (matchX.length < 2) continue;

    // Compute bounding box with 1-tile padding
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
