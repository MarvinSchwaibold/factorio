import type { MerchantStage, StageLayout, ConnectionTemplate, StageNodePosition, Region, NodeCategory } from "./types";
import type { CommerceData } from "./commerce-map-data";

// ── Commerce Flywheel: Build → Sell → Fulfill → Grow ─────────────
// 4 cardinal sections around a center command hub.
// Clockwise flow: W → N → E → S → (loop back to N)
// Grid: 44x36, center at (20, 18)

// ── Center: Command (Admin + Sidekick) ──
var MID_X = 20;
var MID_Y = 18;
var X_SIDEKICK = 23;
var Y_SIDEKICK = 18;
// ── Finance (its own section, just below center) ──
var X_FINANCE = 20;
var Y_FINANCE = 21;

// ── W: Build (what you sell) ──
var X_PRODUCTS = 11;
var Y_PRODUCTS = 16;
var X_CONTENT  = 11;
var Y_CONTENT  = 20;
var X_JUDGEME  = 8;
var Y_JUDGEME  = 18;

// ── N: Sell (where you sell) ──
var X_ONLINE_STORE = 20;
var Y_ONLINE_STORE = 9;
var X_POS          = 17;
var Y_POS          = 11;
var X_SHOP         = 23;
var Y_SHOP         = 11;
var X_FACEBOOK     = 17;
var Y_FACEBOOK     = 13;
var X_GOOGLE       = 23;
var Y_GOOGLE       = 13;
var X_TIKTOK       = 20;
var Y_TIKTOK       = 7;

// ── E: Fulfill (what comes in) ──
var X_ORDERS = 29;
var Y_ORDERS = 16;
var X_FLOW   = 32;
var Y_FLOW   = 18;

// ── S: Grow (how you get more) ──
var X_CUSTOMERS = 20;
var Y_CUSTOMERS = 25;
var X_MARKETING = 17;
var Y_MARKETING = 27;
var X_ANALYTICS = 23;
var Y_ANALYTICS = 27;
var X_DISCOUNTS = 17;
var Y_DISCOUNTS = 30;
var X_KLAVIYO   = 14;
var Y_KLAVIYO   = 27;
var X_MARKETS   = 26;
var Y_MARKETS   = 25;

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

// ── Stage Definitions ──────────────────────────────────────────

// Stage 0: "Out of the Box" — Admin, Sidekick, Online Store
var STAGE_0: StageLayout = {
  stage: 0,
  label: "Out of the Box",
  nodes: [
    { category: "back-office",     tileX: MID_X,          tileY: MID_Y },
    { category: "agent-sidekick",  nodeType: "agent",   tileX: X_SIDEKICK,     tileY: Y_SIDEKICK },
    { category: "online-store",    nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
  ],
  connections: [
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
    { from: "back-office", to: "online-store",   label: "storefront",  style: "solid",  flowRate: 0.5 },
  ],
};

// Stage 1: "First Sale" — flywheel spine appears
var STAGE_1: StageLayout = {
  stage: 1,
  label: "First Sale",
  nodes: [
    { category: "back-office",     tileX: MID_X,          tileY: MID_Y },
    { category: "agent-sidekick",  nodeType: "agent",   tileX: X_SIDEKICK,     tileY: Y_SIDEKICK },
    { category: "products",        nodeType: "core",    tileX: X_PRODUCTS,     tileY: Y_PRODUCTS },
    { category: "online-store",    nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
    { category: "orders",          nodeType: "core",    tileX: X_ORDERS,       tileY: Y_ORDERS },
    { category: "customers",       nodeType: "core",    tileX: X_CUSTOMERS,    tileY: Y_CUSTOMERS },
  ],
  connections: [
    // Flywheel: Build → Sell → Fulfill → Grow
    { from: "products",     to: "online-store", label: "catalog sync",      style: "solid", flowRate: 0.7 },
    { from: "online-store", to: "orders",       label: "storefront sales",  style: "solid", flowRate: 0.7 },
    { from: "orders",       to: "customers",    label: "customer creation", style: "solid", flowRate: 0.7 },
    // AI co-pilot
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
  ],
};

// Stage 2: "Growing" — full flywheel loop + supporting nodes
var STAGE_2: StageLayout = {
  stage: 2,
  label: "Growing",
  nodes: [
    { category: "back-office",     tileX: MID_X,          tileY: MID_Y },
    { category: "agent-sidekick",  nodeType: "agent",   tileX: X_SIDEKICK,     tileY: Y_SIDEKICK },
    // Finance
    { category: "finance",         nodeType: "core",    tileX: X_FINANCE,      tileY: Y_FINANCE },
    // Build
    { category: "products",        nodeType: "core",    tileX: X_PRODUCTS,     tileY: Y_PRODUCTS },
    // Sell
    { category: "online-store",    nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
    // Fulfill
    { category: "orders",          nodeType: "core",    tileX: X_ORDERS,       tileY: Y_ORDERS },
    // Grow
    { category: "customers",       nodeType: "core",    tileX: X_CUSTOMERS,    tileY: Y_CUSTOMERS },
    { category: "marketing",       nodeType: "core",    tileX: X_MARKETING,    tileY: Y_MARKETING },
    { category: "analytics",       nodeType: "core",    tileX: X_ANALYTICS,    tileY: Y_ANALYTICS },
    { category: "discounts",       nodeType: "core",    tileX: X_DISCOUNTS,    tileY: Y_DISCOUNTS },
  ],
  connections: [
    // Flywheel: Build → Sell → Fulfill → Grow → Sell (loop)
    { from: "products",     to: "online-store", label: "catalog sync",       style: "solid",  flowRate: 0.7 },
    { from: "online-store", to: "orders",       label: "storefront sales",   style: "solid",  flowRate: 0.7 },
    { from: "orders",       to: "customers",    label: "customer creation",  style: "solid",  flowRate: 0.7 },
    { from: "customers",    to: "marketing",    label: "customer targeting", style: "solid",  flowRate: 0.7 },
    { from: "marketing",    to: "online-store", label: "campaign traffic",   style: "dashed", flowRate: 0.5 },
    // Finance: revenue flows in
    { from: "orders", to: "finance", label: "revenue tracking", style: "solid", flowRate: 0.6 },
    // Within Grow
    { from: "marketing",  to: "discounts", label: "promo codes",    style: "solid",  flowRate: 0.5 },
    { from: "orders",     to: "analytics", label: "order data",     style: "dashed", flowRate: 0.4 },
    { from: "customers",  to: "analytics", label: "customer data",  style: "dashed", flowRate: 0.4 },
    // AI co-pilot
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
  ],
};

// Stage 3: "Scaling" — multi-channel + apps
var STAGE_3: StageLayout = {
  stage: 3,
  label: "Scaling",
  nodes: [
    { category: "back-office",     tileX: MID_X,          tileY: MID_Y },
    { category: "agent-sidekick",  nodeType: "agent",   tileX: X_SIDEKICK,     tileY: Y_SIDEKICK },
    // Finance
    { category: "finance",         nodeType: "core",    tileX: X_FINANCE,      tileY: Y_FINANCE },
    // Build
    { category: "products",        nodeType: "core",    tileX: X_PRODUCTS,     tileY: Y_PRODUCTS },
    { category: "content",         nodeType: "core",    tileX: X_CONTENT,      tileY: Y_CONTENT },
    { category: "app-judgeme",     nodeType: "app",     tileX: X_JUDGEME,      tileY: Y_JUDGEME },
    // Sell
    { category: "online-store",    nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
    { category: "pos",             nodeType: "channel", tileX: X_POS,          tileY: Y_POS },
    { category: "shop-channel",    nodeType: "channel", tileX: X_SHOP,         tileY: Y_SHOP },
    // Fulfill
    { category: "orders",          nodeType: "core",    tileX: X_ORDERS,       tileY: Y_ORDERS },
    // Grow
    { category: "customers",       nodeType: "core",    tileX: X_CUSTOMERS,    tileY: Y_CUSTOMERS },
    { category: "marketing",       nodeType: "core",    tileX: X_MARKETING,    tileY: Y_MARKETING },
    { category: "analytics",       nodeType: "core",    tileX: X_ANALYTICS,    tileY: Y_ANALYTICS },
    { category: "discounts",       nodeType: "core",    tileX: X_DISCOUNTS,    tileY: Y_DISCOUNTS },
    { category: "app-klaviyo",     nodeType: "app",     tileX: X_KLAVIYO,      tileY: Y_KLAVIYO },
  ],
  connections: [
    // Flywheel: Build → Sell → Fulfill → Grow → Sell (loop)
    { from: "products",     to: "online-store", label: "catalog sync",       style: "solid",  flowRate: 0.7 },
    { from: "products",     to: "pos",          label: "catalog sync",       style: "solid",  flowRate: 0.6 },
    { from: "products",     to: "shop-channel", label: "catalog sync",       style: "solid",  flowRate: 0.5 },
    { from: "online-store", to: "orders",       label: "storefront sales",   style: "solid",  flowRate: 0.7 },
    { from: "pos",          to: "orders",       label: "in-store sales",     style: "solid",  flowRate: 0.6 },
    { from: "shop-channel", to: "orders",       label: "Shop sales",         style: "solid",  flowRate: 0.5 },
    { from: "orders",       to: "customers",    label: "customer creation",  style: "solid",  flowRate: 0.7 },
    { from: "customers",    to: "marketing",    label: "customer targeting", style: "solid",  flowRate: 0.7 },
    { from: "marketing",    to: "online-store", label: "campaign traffic",   style: "dashed", flowRate: 0.5 },
    // Within Build
    { from: "content",  to: "online-store", label: "SEO/blog", style: "solid",  flowRate: 0.5 },
    { from: "products", to: "app-judgeme",  label: "reviews",  style: "dashed", flowRate: 0.3 },
    // Command: revenue flows in
    // Finance: revenue flows in
    { from: "orders", to: "finance", label: "revenue tracking", style: "solid", flowRate: 0.6 },
    // Within Grow
    { from: "marketing",  to: "discounts",   label: "promo codes",   style: "solid",  flowRate: 0.5 },
    { from: "marketing",  to: "app-klaviyo", label: "email/SMS",     style: "dashed", flowRate: 0.4 },
    { from: "orders",     to: "analytics",   label: "order data",    style: "dashed", flowRate: 0.4 },
    { from: "customers",  to: "analytics",   label: "customer data", style: "dashed", flowRate: 0.4 },
    // AI co-pilot
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
  ],
};

// Stage 4: "Thriving" — full ecosystem
var STAGE_4: StageLayout = {
  stage: 4,
  label: "Thriving",
  nodes: [
    { category: "back-office",        tileX: MID_X,          tileY: MID_Y },
    { category: "agent-sidekick",     nodeType: "agent",   tileX: X_SIDEKICK,     tileY: Y_SIDEKICK },
    // Finance
    { category: "finance",            nodeType: "core",    tileX: X_FINANCE,      tileY: Y_FINANCE },
    // Build
    { category: "products",           nodeType: "core",    tileX: X_PRODUCTS,     tileY: Y_PRODUCTS },
    { category: "content",            nodeType: "core",    tileX: X_CONTENT,      tileY: Y_CONTENT },
    { category: "app-judgeme",        nodeType: "app",     tileX: X_JUDGEME,      tileY: Y_JUDGEME },
    // Sell
    { category: "online-store",       nodeType: "channel", tileX: X_ONLINE_STORE, tileY: Y_ONLINE_STORE },
    { category: "pos",                nodeType: "channel", tileX: X_POS,          tileY: Y_POS },
    { category: "shop-channel",       nodeType: "channel", tileX: X_SHOP,         tileY: Y_SHOP },
    { category: "facebook-instagram", nodeType: "channel", tileX: X_FACEBOOK,     tileY: Y_FACEBOOK },
    { category: "google-youtube",     nodeType: "channel", tileX: X_GOOGLE,       tileY: Y_GOOGLE },
    { category: "tiktok",             nodeType: "channel", tileX: X_TIKTOK,       tileY: Y_TIKTOK },
    // Fulfill
    { category: "orders",       nodeType: "core", tileX: X_ORDERS,  tileY: Y_ORDERS },
    { category: "app-flow",    nodeType: "app",  tileX: X_FLOW,    tileY: Y_FLOW },
    // Grow
    { category: "customers",    nodeType: "core", tileX: X_CUSTOMERS, tileY: Y_CUSTOMERS },
    { category: "marketing",    nodeType: "core", tileX: X_MARKETING, tileY: Y_MARKETING },
    { category: "analytics",    nodeType: "core", tileX: X_ANALYTICS, tileY: Y_ANALYTICS },
    { category: "discounts",    nodeType: "core", tileX: X_DISCOUNTS, tileY: Y_DISCOUNTS },
    { category: "app-klaviyo",  nodeType: "app",  tileX: X_KLAVIYO,   tileY: Y_KLAVIYO },
    { category: "markets",      nodeType: "core", tileX: X_MARKETS,   tileY: Y_MARKETS },
  ],
  connections: [
    // Flywheel: Build → Sell (Products → all Channels)
    { from: "products",     to: "online-store",       label: "catalog sync", style: "solid", flowRate: 0.7 },
    { from: "products",     to: "pos",                label: "catalog sync", style: "solid", flowRate: 0.6 },
    { from: "products",     to: "shop-channel",       label: "catalog sync", style: "solid", flowRate: 0.5 },
    { from: "products",     to: "facebook-instagram", label: "catalog sync", style: "solid", flowRate: 0.5 },
    { from: "products",     to: "google-youtube",     label: "catalog sync", style: "solid", flowRate: 0.5 },
    { from: "products",     to: "tiktok",             label: "catalog sync", style: "solid", flowRate: 0.4 },
    // Flywheel: Sell → Fulfill (all Channels → Orders)
    { from: "online-store",       to: "orders", label: "storefront sales", style: "solid", flowRate: 0.7 },
    { from: "pos",                to: "orders", label: "in-store sales",   style: "solid", flowRate: 0.6 },
    { from: "shop-channel",       to: "orders", label: "Shop sales",       style: "solid", flowRate: 0.5 },
    { from: "facebook-instagram", to: "orders", label: "social sales",     style: "solid", flowRate: 0.4 },
    { from: "google-youtube",     to: "orders", label: "search sales",     style: "solid", flowRate: 0.4 },
    { from: "tiktok",             to: "orders", label: "social sales",     style: "solid", flowRate: 0.3 },
    // Flywheel: Fulfill → Grow (Orders → Customers → Marketing)
    { from: "orders",    to: "customers", label: "customer creation",  style: "solid", flowRate: 0.7 },
    { from: "customers", to: "marketing", label: "customer targeting", style: "solid", flowRate: 0.7 },
    // Flywheel: Grow → Sell (Marketing → Channels, loop)
    { from: "marketing", to: "online-store",       label: "campaign traffic", style: "dashed", flowRate: 0.5 },
    { from: "marketing", to: "facebook-instagram", label: "paid social",      style: "dashed", flowRate: 0.4 },
    { from: "marketing", to: "google-youtube",     label: "paid search",      style: "dashed", flowRate: 0.4 },
    { from: "marketing", to: "tiktok",             label: "paid social",      style: "dashed", flowRate: 0.3 },
    // Within Build
    { from: "content",  to: "online-store", label: "SEO/blog", style: "solid",  flowRate: 0.5 },
    { from: "products", to: "app-judgeme",  label: "reviews",  style: "dashed", flowRate: 0.3 },
    // Finance: revenue flows in
    { from: "orders", to: "finance", label: "revenue tracking", style: "solid", flowRate: 0.6 },
    // Within Fulfill
    { from: "orders", to: "app-flow", label: "workflow automation", style: "dashed", flowRate: 0.4 },
    // Within Grow
    { from: "marketing",  to: "discounts",   label: "promo codes",   style: "solid",  flowRate: 0.5 },
    { from: "marketing",  to: "app-klaviyo", label: "email/SMS",     style: "dashed", flowRate: 0.4 },
    { from: "orders",     to: "analytics",   label: "order data",    style: "dashed", flowRate: 0.4 },
    { from: "customers",  to: "analytics",   label: "customer data", style: "dashed", flowRate: 0.4 },
    { from: "markets",    to: "online-store", label: "international", style: "dashed", flowRate: 0.4 },
    // AI co-pilot
    { from: "back-office", to: "agent-sidekick", label: "AI co-pilot", style: "dotted", flowRate: 0.5 },
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
  if (data.totalOrders > 100) return 3;
  if (data.totalOrders > 30 || data.newsletterSubscribers > 0) return 2;
  if (data.totalOrders > 0) return 1;
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
