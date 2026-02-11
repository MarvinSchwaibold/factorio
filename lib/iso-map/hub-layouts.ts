import type { MerchantStage, StageLayout, StageNodePosition, Region, NodeCategory } from "./types";

// ── Commerce Flywheel: Build → Sell → Fulfill → Grow (Hub mode) ──
// Mirrors stage-layouts.ts. 4 cardinal sections around center command hub.

// ── Center: Command (Admin + Sidekick) ──
var HUB_X = 20;
var HUB_Y = 18;
var POS_SIDEKICK = { x: 23, y: 18 };

// ── Finance (its own section, just below center) ──
var POS_FINANCE  = { x: 20, y: 21 };

// ── W: Build ──
var POS_PRODUCTS = { x: 11, y: 16 };
var POS_CONTENT  = { x: 11, y: 20 };
var POS_JUDGEME  = { x: 8,  y: 18 };

// ── N: Sell ──
var POS_ONLINE_STORE = { x: 20, y: 9 };
var POS_POS          = { x: 17, y: 11 };
var POS_SHOP         = { x: 23, y: 11 };
var POS_FACEBOOK     = { x: 17, y: 13 };
var POS_GOOGLE       = { x: 23, y: 13 };
var POS_TIKTOK       = { x: 20, y: 7 };

// ── E: Fulfill ──
var POS_ORDERS = { x: 29, y: 16 };
var POS_FLOW   = { x: 32, y: 18 };

// ── S: Grow ──
var POS_CUSTOMERS = { x: 20, y: 25 };
var POS_MARKETING = { x: 17, y: 27 };
var POS_ANALYTICS = { x: 23, y: 27 };
var POS_DISCOUNTS = { x: 17, y: 30 };
var POS_KLAVIYO   = { x: 14, y: 27 };
var POS_MARKETS   = { x: 26, y: 25 };

// ── Region templates (4 sections) ────────────────────────────
interface RegionTemplate {
  label: string;
  color: string;
  categories: NodeCategory[];
}

var REGION_TEMPLATES: RegionTemplate[] = [
  { label: "Command",  color: "#5E8E3E", categories: ["back-office", "agent-sidekick"] },
  { label: "Finance",  color: "#059669", categories: ["finance"] },
  { label: "Build",    color: "#7c3aed", categories: ["products", "content", "app-judgeme"] },
  { label: "Sell",     color: "#0284c7", categories: ["online-store", "pos", "shop-channel", "facebook-instagram", "google-youtube", "tiktok"] },
  { label: "Fulfill",  color: "#ea580c", categories: ["orders", "app-flow"] },
  { label: "Grow",     color: "#db2777", categories: ["customers", "marketing", "analytics", "discounts", "app-klaviyo", "markets"] },
];

// ── Hub Stage Definitions ──────────────────────────────────────

var HUB_STAGE_0: StageLayout = {
  stage: 0,
  label: "Out of the Box",
  nodes: [
    { category: "back-office",     tileX: HUB_X,               tileY: HUB_Y },
    { category: "agent-sidekick",  nodeType: "agent",   tileX: POS_SIDEKICK.x,     tileY: POS_SIDEKICK.y },
    { category: "online-store",    nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
  ],
  connections: [
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
    { from: "back-office", to: "online-store",   label: "storefront",  style: "solid",  flowRate: 0.5 },
  ],
};

var HUB_STAGE_1: StageLayout = {
  stage: 1,
  label: "First Sale",
  nodes: [
    { category: "back-office",     tileX: HUB_X,               tileY: HUB_Y },
    { category: "agent-sidekick",  nodeType: "agent",   tileX: POS_SIDEKICK.x,     tileY: POS_SIDEKICK.y },
    { category: "products",        nodeType: "core",    tileX: POS_PRODUCTS.x,     tileY: POS_PRODUCTS.y },
    { category: "online-store",    nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
    { category: "orders",          nodeType: "core",    tileX: POS_ORDERS.x,       tileY: POS_ORDERS.y },
    { category: "customers",       nodeType: "core",    tileX: POS_CUSTOMERS.x,    tileY: POS_CUSTOMERS.y },
  ],
  connections: [
    { from: "products",     to: "online-store", label: "catalog sync",      style: "solid", flowRate: 0.7 },
    { from: "online-store", to: "orders",       label: "storefront sales",  style: "solid", flowRate: 0.7 },
    { from: "orders",       to: "customers",    label: "customer creation", style: "solid", flowRate: 0.7 },
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
  ],
};

var HUB_STAGE_2: StageLayout = {
  stage: 2,
  label: "Growing",
  nodes: [
    // Command
    { category: "back-office",     tileX: HUB_X,               tileY: HUB_Y },
    { category: "agent-sidekick",  nodeType: "agent",   tileX: POS_SIDEKICK.x,     tileY: POS_SIDEKICK.y },
    // Finance
    { category: "finance",         nodeType: "core",    tileX: POS_FINANCE.x,      tileY: POS_FINANCE.y },
    // Build
    { category: "products",        nodeType: "core",    tileX: POS_PRODUCTS.x,     tileY: POS_PRODUCTS.y },
    // Sell
    { category: "online-store",    nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
    // Fulfill
    { category: "orders",          nodeType: "core",    tileX: POS_ORDERS.x,       tileY: POS_ORDERS.y },
    // Grow
    { category: "customers",       nodeType: "core",    tileX: POS_CUSTOMERS.x,    tileY: POS_CUSTOMERS.y },
    { category: "marketing",       nodeType: "core",    tileX: POS_MARKETING.x,    tileY: POS_MARKETING.y },
    { category: "analytics",       nodeType: "core",    tileX: POS_ANALYTICS.x,    tileY: POS_ANALYTICS.y },
    { category: "discounts",       nodeType: "core",    tileX: POS_DISCOUNTS.x,    tileY: POS_DISCOUNTS.y },
  ],
  connections: [
    { from: "products",     to: "online-store", label: "catalog sync",       style: "solid",  flowRate: 0.7 },
    { from: "online-store", to: "orders",       label: "storefront sales",   style: "solid",  flowRate: 0.7 },
    { from: "orders",       to: "customers",    label: "customer creation",  style: "solid",  flowRate: 0.7 },
    { from: "customers",    to: "marketing",    label: "customer targeting", style: "solid",  flowRate: 0.7 },
    { from: "marketing",    to: "online-store", label: "campaign traffic",   style: "dashed", flowRate: 0.5 },
    { from: "orders",    to: "finance",   label: "revenue tracking", style: "solid",  flowRate: 0.6 },
    { from: "marketing", to: "discounts", label: "promo codes",      style: "solid",  flowRate: 0.5 },
    { from: "orders",    to: "analytics", label: "order data",       style: "dashed", flowRate: 0.4 },
    { from: "customers", to: "analytics", label: "customer data",    style: "dashed", flowRate: 0.4 },
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
  ],
};

var HUB_STAGE_3: StageLayout = {
  stage: 3,
  label: "Scaling",
  nodes: [
    // Command
    { category: "back-office",     tileX: HUB_X,               tileY: HUB_Y },
    { category: "agent-sidekick",  nodeType: "agent",   tileX: POS_SIDEKICK.x,     tileY: POS_SIDEKICK.y },
    // Finance
    { category: "finance",         nodeType: "core",    tileX: POS_FINANCE.x,      tileY: POS_FINANCE.y },
    // Build
    { category: "products",        nodeType: "core",    tileX: POS_PRODUCTS.x,     tileY: POS_PRODUCTS.y },
    { category: "content",         nodeType: "core",    tileX: POS_CONTENT.x,      tileY: POS_CONTENT.y },
    { category: "app-judgeme",     nodeType: "app",     tileX: POS_JUDGEME.x,      tileY: POS_JUDGEME.y },
    // Sell
    { category: "online-store",    nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
    { category: "pos",             nodeType: "channel", tileX: POS_POS.x,          tileY: POS_POS.y },
    { category: "shop-channel",    nodeType: "channel", tileX: POS_SHOP.x,         tileY: POS_SHOP.y },
    // Fulfill
    { category: "orders",          nodeType: "core",    tileX: POS_ORDERS.x,       tileY: POS_ORDERS.y },
    // Grow
    { category: "customers",       nodeType: "core",    tileX: POS_CUSTOMERS.x,    tileY: POS_CUSTOMERS.y },
    { category: "marketing",       nodeType: "core",    tileX: POS_MARKETING.x,    tileY: POS_MARKETING.y },
    { category: "analytics",       nodeType: "core",    tileX: POS_ANALYTICS.x,    tileY: POS_ANALYTICS.y },
    { category: "discounts",       nodeType: "core",    tileX: POS_DISCOUNTS.x,    tileY: POS_DISCOUNTS.y },
    { category: "app-klaviyo",     nodeType: "app",     tileX: POS_KLAVIYO.x,      tileY: POS_KLAVIYO.y },
  ],
  connections: [
    { from: "products",     to: "online-store", label: "catalog sync",       style: "solid",  flowRate: 0.7 },
    { from: "products",     to: "pos",          label: "catalog sync",       style: "solid",  flowRate: 0.6 },
    { from: "products",     to: "shop-channel", label: "catalog sync",       style: "solid",  flowRate: 0.5 },
    { from: "online-store", to: "orders",       label: "storefront sales",   style: "solid",  flowRate: 0.7 },
    { from: "pos",          to: "orders",       label: "in-store sales",     style: "solid",  flowRate: 0.6 },
    { from: "shop-channel", to: "orders",       label: "Shop sales",         style: "solid",  flowRate: 0.5 },
    { from: "orders",       to: "customers",    label: "customer creation",  style: "solid",  flowRate: 0.7 },
    { from: "customers",    to: "marketing",    label: "customer targeting", style: "solid",  flowRate: 0.7 },
    { from: "marketing",    to: "online-store", label: "campaign traffic",   style: "dashed", flowRate: 0.5 },
    { from: "content",   to: "online-store", label: "SEO/blog",         style: "solid",  flowRate: 0.5 },
    { from: "products",  to: "app-judgeme",  label: "reviews",          style: "dashed", flowRate: 0.3 },
    { from: "orders",    to: "finance",      label: "revenue tracking", style: "solid",  flowRate: 0.6 },
    { from: "marketing", to: "discounts",    label: "promo codes",      style: "solid",  flowRate: 0.5 },
    { from: "marketing", to: "app-klaviyo",  label: "email/SMS",        style: "dashed", flowRate: 0.4 },
    { from: "orders",    to: "analytics",    label: "order data",       style: "dashed", flowRate: 0.4 },
    { from: "customers", to: "analytics",    label: "customer data",    style: "dashed", flowRate: 0.4 },
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
  ],
};

var HUB_STAGE_4: StageLayout = {
  stage: 4,
  label: "Thriving",
  nodes: [
    // Command
    { category: "back-office",        tileX: HUB_X,               tileY: HUB_Y },
    { category: "agent-sidekick",     nodeType: "agent",   tileX: POS_SIDEKICK.x,     tileY: POS_SIDEKICK.y },
    // Finance
    { category: "finance",            nodeType: "core",    tileX: POS_FINANCE.x,      tileY: POS_FINANCE.y },
    // Build
    { category: "products",           nodeType: "core",    tileX: POS_PRODUCTS.x,     tileY: POS_PRODUCTS.y },
    { category: "content",            nodeType: "core",    tileX: POS_CONTENT.x,      tileY: POS_CONTENT.y },
    { category: "app-judgeme",        nodeType: "app",     tileX: POS_JUDGEME.x,      tileY: POS_JUDGEME.y },
    // Sell
    { category: "online-store",       nodeType: "channel", tileX: POS_ONLINE_STORE.x, tileY: POS_ONLINE_STORE.y },
    { category: "pos",                nodeType: "channel", tileX: POS_POS.x,          tileY: POS_POS.y },
    { category: "shop-channel",       nodeType: "channel", tileX: POS_SHOP.x,         tileY: POS_SHOP.y },
    { category: "facebook-instagram", nodeType: "channel", tileX: POS_FACEBOOK.x,     tileY: POS_FACEBOOK.y },
    { category: "google-youtube",     nodeType: "channel", tileX: POS_GOOGLE.x,       tileY: POS_GOOGLE.y },
    { category: "tiktok",             nodeType: "channel", tileX: POS_TIKTOK.x,       tileY: POS_TIKTOK.y },
    // Fulfill
    { category: "orders",       nodeType: "core", tileX: POS_ORDERS.x,    tileY: POS_ORDERS.y },
    { category: "app-flow",     nodeType: "app",  tileX: POS_FLOW.x,      tileY: POS_FLOW.y },
    // Grow
    { category: "customers",    nodeType: "core", tileX: POS_CUSTOMERS.x, tileY: POS_CUSTOMERS.y },
    { category: "marketing",    nodeType: "core", tileX: POS_MARKETING.x, tileY: POS_MARKETING.y },
    { category: "analytics",    nodeType: "core", tileX: POS_ANALYTICS.x, tileY: POS_ANALYTICS.y },
    { category: "discounts",    nodeType: "core", tileX: POS_DISCOUNTS.x, tileY: POS_DISCOUNTS.y },
    { category: "app-klaviyo",  nodeType: "app",  tileX: POS_KLAVIYO.x,   tileY: POS_KLAVIYO.y },
    { category: "markets",      nodeType: "core", tileX: POS_MARKETS.x,   tileY: POS_MARKETS.y },
  ],
  connections: [
    { from: "products",     to: "online-store",       label: "catalog sync", style: "solid", flowRate: 0.7 },
    { from: "products",     to: "pos",                label: "catalog sync", style: "solid", flowRate: 0.6 },
    { from: "products",     to: "shop-channel",       label: "catalog sync", style: "solid", flowRate: 0.5 },
    { from: "products",     to: "facebook-instagram", label: "catalog sync", style: "solid", flowRate: 0.5 },
    { from: "products",     to: "google-youtube",     label: "catalog sync", style: "solid", flowRate: 0.5 },
    { from: "products",     to: "tiktok",             label: "catalog sync", style: "solid", flowRate: 0.4 },
    { from: "online-store",       to: "orders", label: "storefront sales", style: "solid", flowRate: 0.7 },
    { from: "pos",                to: "orders", label: "in-store sales",   style: "solid", flowRate: 0.6 },
    { from: "shop-channel",       to: "orders", label: "Shop sales",       style: "solid", flowRate: 0.5 },
    { from: "facebook-instagram", to: "orders", label: "social sales",     style: "solid", flowRate: 0.4 },
    { from: "google-youtube",     to: "orders", label: "search sales",     style: "solid", flowRate: 0.4 },
    { from: "tiktok",             to: "orders", label: "social sales",     style: "solid", flowRate: 0.3 },
    { from: "orders",    to: "customers", label: "customer creation",  style: "solid", flowRate: 0.7 },
    { from: "customers", to: "marketing", label: "customer targeting", style: "solid", flowRate: 0.7 },
    { from: "marketing", to: "online-store",       label: "campaign traffic", style: "dashed", flowRate: 0.5 },
    { from: "marketing", to: "facebook-instagram", label: "paid social",      style: "dashed", flowRate: 0.4 },
    { from: "marketing", to: "google-youtube",     label: "paid search",      style: "dashed", flowRate: 0.4 },
    { from: "marketing", to: "tiktok",             label: "paid social",      style: "dashed", flowRate: 0.3 },
    { from: "content",   to: "online-store", label: "SEO/blog",            style: "solid",  flowRate: 0.5 },
    { from: "products",  to: "app-judgeme",  label: "reviews",             style: "dashed", flowRate: 0.3 },
    { from: "orders",    to: "finance",      label: "revenue tracking",    style: "solid",  flowRate: 0.6 },
    { from: "orders",    to: "app-flow",     label: "workflow automation",  style: "dashed", flowRate: 0.4 },
    { from: "marketing", to: "discounts",    label: "promo codes",         style: "solid",  flowRate: 0.5 },
    { from: "marketing", to: "app-klaviyo",  label: "email/SMS",           style: "dashed", flowRate: 0.4 },
    { from: "orders",    to: "analytics",    label: "order data",          style: "dashed", flowRate: 0.4 },
    { from: "customers", to: "analytics",    label: "customer data",       style: "dashed", flowRate: 0.4 },
    { from: "markets",   to: "online-store", label: "international",       style: "dashed", flowRate: 0.4 },
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
  ],
};

var HUB_ALL_STAGES: StageLayout[] = [HUB_STAGE_0, HUB_STAGE_1, HUB_STAGE_2, HUB_STAGE_3, HUB_STAGE_4];

export function getHubStageLayout(stage: MerchantStage): StageLayout {
  return HUB_ALL_STAGES[stage] || HUB_ALL_STAGES[0];
}

export function computeHubRegions(positions: StageNodePosition[]): Region[] {
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

    if (matchX.length < 1) continue;

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
