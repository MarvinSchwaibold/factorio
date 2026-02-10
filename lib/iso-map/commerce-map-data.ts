import type { MapModel, MapNode, Connector, Region, MerchantStage, NodeType } from "./types";
import { getMockStore } from "../quick-agent/mock-store";
import { getStageLayout, getAutoStage, computeRegions } from "./stage-layouts";
import { getHubStageLayout, computeHubRegions } from "./hub-layouts";
import { getCategoryDef } from "./node-palette";

// ── Helpers ────────────────────────────────────────────
var _cid = 0;
function cid(): string {
  return "cm-" + (++_cid).toString(36);
}

// ── Commerce data extraction ──────────────────────────

export interface CommerceData {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  refundedOrders: number;
  fulfilledOrders: number;
  unfulfilledOrders: number;
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalCustomers: number;
  repeatCustomers: number;
  totalInventoryItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  topProduct: string;
  revenueByDay: number[];
  // New fields for infrastructure model
  warehouseInventory: number;
  retailInventory: number;
  newsletterSubscribers: number;
  ordersPerMonth: number;
}

export function getCommerceData(): CommerceData {
  var store = getMockStore();

  var totalRevenue = 0;
  var paidOrders = 0;
  var pendingOrders = 0;
  var refundedOrders = 0;
  var fulfilledOrders = 0;
  var unfulfilledOrders = 0;

  for (var oi = 0; oi < store.orders.length; oi++) {
    var order = store.orders[oi];
    totalRevenue += parseFloat(order.totalPrice);
    if (order.financialStatus === "paid") paidOrders++;
    else if (order.financialStatus === "pending") pendingOrders++;
    else if (order.financialStatus === "refunded") refundedOrders++;
    if (order.fulfillmentStatus === "fulfilled") fulfilledOrders++;
    else if (order.fulfillmentStatus === "unfulfilled") unfulfilledOrders++;
  }

  var activeProducts = 0;
  var draftProducts = 0;
  for (var pi = 0; pi < store.products.length; pi++) {
    if (store.products[pi].status === "active") activeProducts++;
    else draftProducts++;
  }

  var repeatCustomers = 0;
  var newsletterSubscribers = 0;
  for (var ci = 0; ci < store.customers.length; ci++) {
    if (store.customers[ci].ordersCount > 1) repeatCustomers++;
    var tags = store.customers[ci].tags || [];
    for (var ti = 0; ti < tags.length; ti++) {
      if (tags[ti].toLowerCase() === "newsletter") {
        newsletterSubscribers++;
        break;
      }
    }
  }
  if (newsletterSubscribers === 0) {
    newsletterSubscribers = Math.round(store.customers.length * 0.6);
  }

  var lowStockItems = 0;
  var outOfStockItems = 0;
  var warehouseInventory = 0;
  var retailInventory = 0;
  for (var ii = 0; ii < store.inventory.length; ii++) {
    var inv = store.inventory[ii];
    if (inv.available === 0) outOfStockItems++;
    else if (inv.available < 10) lowStockItems++;
    if (inv.locationId === "loc-retail") {
      retailInventory += inv.available;
    } else {
      warehouseInventory += inv.available;
    }
  }

  var productCounts: { [title: string]: number } = {};
  for (var oi2 = 0; oi2 < store.orders.length; oi2++) {
    var items = store.orders[oi2].lineItems;
    for (var li = 0; li < items.length; li++) {
      var title = items[li].title;
      productCounts[title] = (productCounts[title] || 0) + items[li].quantity;
    }
  }
  var topProduct = "";
  var topCount = 0;
  var productKeys = Object.keys(productCounts);
  for (var pk = 0; pk < productKeys.length; pk++) {
    if (productCounts[productKeys[pk]] > topCount) {
      topCount = productCounts[productKeys[pk]];
      topProduct = productKeys[pk];
    }
  }

  var revenueByDay = [
    totalRevenue * 0.12,
    totalRevenue * 0.15,
    totalRevenue * 0.10,
    totalRevenue * 0.18,
    totalRevenue * 0.14,
    totalRevenue * 0.16,
    totalRevenue * 0.15,
  ];

  var ordersPerMonth = Math.round(store.orders.length / 3);

  return {
    totalRevenue: totalRevenue,
    totalOrders: store.orders.length,
    paidOrders: paidOrders,
    pendingOrders: pendingOrders,
    refundedOrders: refundedOrders,
    fulfilledOrders: fulfilledOrders,
    unfulfilledOrders: unfulfilledOrders,
    totalProducts: store.products.length,
    activeProducts: activeProducts,
    draftProducts: draftProducts,
    totalCustomers: store.customers.length,
    repeatCustomers: repeatCustomers,
    totalInventoryItems: store.inventory.length,
    lowStockItems: lowStockItems,
    outOfStockItems: outOfStockItems,
    topProduct: topProduct,
    revenueByDay: revenueByDay,
    warehouseInventory: warehouseInventory,
    retailInventory: retailInventory,
    newsletterSubscribers: newsletterSubscribers,
    ordersPerMonth: ordersPerMonth,
  };
}

// ── Node stats builder per category ──────────────────────

function buildNodeStats(category: string, data: CommerceData): { stats: import("./types").CommerceStat[]; alertCount: number; activityLevel: number } {
  switch (category) {
    case "back-office":
      return {
        stats: [
          { label: "Channels", value: "2 connected", trend: "flat" as const },
          { label: "Apps", value: "6 installed", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.6,
      };
    case "orders":
      return {
        stats: [
          { label: "Total", value: data.totalOrders + " orders", trend: "up" as const },
          { label: "Pending", value: data.pendingOrders + " orders", trend: data.pendingOrders > 5 ? "down" as const : "flat" as const },
          { label: "Fulfilled", value: data.fulfilledOrders + " shipped", trend: "up" as const },
        ],
        alertCount: data.pendingOrders > 10 ? data.pendingOrders : 0,
        activityLevel: 0.8,
      };
    case "products":
      return {
        stats: [
          { label: "Active", value: data.activeProducts + " listed", trend: "flat" as const },
          { label: "Draft", value: data.draftProducts + " drafts", trend: "flat" as const },
          { label: "Inventory", value: data.totalInventoryItems + " SKUs", trend: "flat" as const },
        ],
        alertCount: data.lowStockItems + data.outOfStockItems,
        activityLevel: 0.5,
      };
    case "customers":
      return {
        stats: [
          { label: "Total", value: data.totalCustomers + " customers", trend: "up" as const },
          { label: "Returning", value: data.repeatCustomers + " repeat", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.6,
      };
    case "marketing":
      return {
        stats: [
          { label: "Subscribers", value: data.newsletterSubscribers + " contacts" },
          { label: "Campaigns", value: "3 active", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.5,
      };
    case "discounts":
      return {
        stats: [
          { label: "Active", value: "4 codes", trend: "flat" as const },
          { label: "Used", value: Math.round(data.totalOrders * 0.15) + " times", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.4,
      };
    case "content":
      return {
        stats: [
          { label: "Pages", value: "8 published", trend: "flat" as const },
          { label: "Blog Posts", value: "12 articles", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.3,
      };
    case "markets":
      return {
        stats: [
          { label: "Active", value: "2 markets", trend: "flat" as const },
          { label: "Primary", value: "Canada", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.4,
      };
    case "finance":
      return {
        stats: [
          { label: "Revenue", value: "$" + Math.round(data.totalRevenue).toLocaleString(), trend: "up" as const },
          { label: "Balance", value: "$" + Math.round(data.totalRevenue * 0.92).toLocaleString(), trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.6,
      };
    case "analytics":
      return {
        stats: [
          { label: "Conversion", value: "3.2%", trend: "up" as const },
          { label: "Sessions", value: Math.round(data.totalOrders * 31) + " visits", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.5,
      };
    // ── Sales Channels ──
    case "online-store":
      return {
        stats: [
          { label: "Sessions", value: Math.round(data.totalOrders * 31) + " visits", trend: "up" as const },
          { label: "Orders", value: Math.round(data.totalOrders * 0.7) + " this month", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.8,
      };
    case "pos":
      return {
        stats: [
          { label: "Orders", value: Math.round(data.totalOrders * 0.15) + " in-store", trend: "up" as const },
          { label: "Locations", value: "2 active", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.5,
      };
    case "shop-channel":
      return {
        stats: [
          { label: "Orders", value: Math.round(data.totalOrders * 0.08) + " via Shop", trend: "up" as const },
          { label: "Followers", value: "234", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.4,
      };
    case "facebook-instagram":
      return {
        stats: [
          { label: "Products", value: data.activeProducts + " synced", trend: "flat" as const },
          { label: "Orders", value: Math.round(data.totalOrders * 0.05) + " social", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.4,
      };
    case "google-youtube":
      return {
        stats: [
          { label: "Products", value: data.activeProducts + " listed", trend: "flat" as const },
          { label: "Clicks", value: Math.round(data.totalOrders * 12) + " clicks", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.3,
      };
    case "tiktok":
      return {
        stats: [
          { label: "Products", value: Math.round(data.activeProducts * 0.5) + " synced", trend: "flat" as const },
          { label: "Status", value: "Connected", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.3,
      };
    // ── Apps ──
    case "app-klaviyo":
      return {
        stats: [
          { label: "Contacts", value: data.newsletterSubscribers + " synced", trend: "up" as const },
          { label: "Flows", value: "5 active", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.6,
      };
    case "app-judgeme":
      return {
        stats: [
          { label: "Reviews", value: Math.round(data.totalOrders * 0.3) + " total", trend: "up" as const },
          { label: "Avg Rating", value: "4.7 stars", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.4,
      };
    case "app-flow":
      return {
        stats: [
          { label: "Workflows", value: "8 active", trend: "flat" as const },
          { label: "Runs", value: Math.round(data.totalOrders * 2.1) + " this month", trend: "up" as const },
        ],
        alertCount: 0,
        activityLevel: 0.5,
      };
    default:
      return { stats: [], alertCount: 0, activityLevel: 0.3 };
  }
}

// ── Category labels ──────────────────────────────────────
var CATEGORY_LABELS: { [key: string]: string } = {
  "back-office": "Admin",
  "orders": "Orders",
  "products": "Products",
  "customers": "Customers",
  "marketing": "Marketing",
  "discounts": "Discounts",
  "content": "Content",
  "markets": "Markets",
  "finance": "Finance",
  "analytics": "Analytics",
  // Channels
  "online-store": "Online Store",
  "pos": "Point of Sale",
  "shop-channel": "Shop",
  "facebook-instagram": "Facebook & Instagram",
  "google-youtube": "Google & YouTube",
  "tiktok": "TikTok",
  // Apps
  "app-klaviyo": "Klaviyo",
  "app-judgeme": "Judge.me",
  "app-flow": "Shopify Flow",
};

var CATEGORY_DESCRIPTIONS: { [key: string]: string } = {
  "back-office": "Shopify Admin",
  "orders": "Order management and fulfillment",
  "products": "Product catalog and inventory",
  "customers": "Customer profiles and segments",
  "marketing": "Campaigns and customer acquisition",
  "discounts": "Discount codes and promotions",
  "content": "Pages, blog posts, and files",
  "markets": "International selling and localization",
  "finance": "Revenue, payouts, and billing",
  "analytics": "Reports and business insights",
  // Channels
  "online-store": "Your storefront on the web",
  "pos": "In-person selling and retail",
  "shop-channel": "Shop app marketplace",
  "facebook-instagram": "Social commerce on Meta",
  "google-youtube": "Search and video shopping",
  "tiktok": "Social commerce on TikTok",
  // Apps
  "app-klaviyo": "Email and SMS marketing",
  "app-judgeme": "Product reviews and ratings",
  "app-flow": "Workflow automation",
};

// ── Stage-based map generator ─────────────────────────

export function generateMerchantMap(stage?: MerchantStage): MapModel {
  var data = getCommerceData();
  var effectiveStage: MerchantStage = stage != null ? stage : getAutoStage(data);
  var layout = getStageLayout(effectiveStage);

  var nodes: MapNode[] = [];
  var connectors: Connector[] = [];

  // Build a map from category → nodeId for connector wiring
  var categoryToId: { [key: string]: string } = {};

  // Create nodes from layout positions
  for (var ni = 0; ni < layout.nodes.length; ni++) {
    var pos = layout.nodes[ni];
    var nodeId = cid();
    var nodeData = buildNodeStats(pos.category, data);
    var catDef = getCategoryDef(pos.category);

    categoryToId[pos.category] = nodeId;

    nodes.push({
      id: nodeId,
      category: pos.category,
      nodeType: pos.nodeType || catDef.nodeType,
      label: CATEGORY_LABELS[pos.category] || pos.category,
      description: CATEGORY_DESCRIPTIONS[pos.category] || "",
      tileX: pos.tileX,
      tileY: pos.tileY,
      activityLevel: nodeData.activityLevel,
      stats: nodeData.stats,
      alertCount: nodeData.alertCount,
    });
  }

  // Create connectors from layout connection templates
  for (var ci = 0; ci < layout.connections.length; ci++) {
    var conn = layout.connections[ci];
    var srcId = categoryToId[conn.from];
    var tgtId = categoryToId[conn.to];
    if (srcId && tgtId) {
      connectors.push({
        id: cid(),
        sourceId: srcId,
        targetId: tgtId,
        path: [],
        flowRate: conn.flowRate,
        style: conn.style,
        label: conn.label,
      });
    }
  }

  // Compute regions from node positions
  var regions: Region[] = computeRegions(layout.nodes);

  return {
    nodes: nodes,
    connectors: connectors,
    regions: regions,
    gridWidth: 44,
    gridHeight: 36,
  };
}

// ── Hub layout map generator ─────────────────────────

export function generateHubMap(stage?: MerchantStage): MapModel {
  var data = getCommerceData();
  var effectiveStage: MerchantStage = stage != null ? stage : getAutoStage(data);
  var layout = getHubStageLayout(effectiveStage);

  var nodes: MapNode[] = [];
  var connectors: Connector[] = [];

  var categoryToId: { [key: string]: string } = {};

  for (var ni = 0; ni < layout.nodes.length; ni++) {
    var pos = layout.nodes[ni];
    var nodeId = cid();
    var nodeData = buildNodeStats(pos.category, data);
    var catDef2 = getCategoryDef(pos.category);

    categoryToId[pos.category] = nodeId;

    nodes.push({
      id: nodeId,
      category: pos.category,
      nodeType: pos.nodeType || catDef2.nodeType,
      label: CATEGORY_LABELS[pos.category] || pos.category,
      description: CATEGORY_DESCRIPTIONS[pos.category] || "",
      tileX: pos.tileX,
      tileY: pos.tileY,
      activityLevel: nodeData.activityLevel,
      stats: nodeData.stats,
      alertCount: nodeData.alertCount,
    });
  }

  for (var ci2 = 0; ci2 < layout.connections.length; ci2++) {
    var conn = layout.connections[ci2];
    var srcId = categoryToId[conn.from];
    var tgtId = categoryToId[conn.to];
    if (srcId && tgtId) {
      connectors.push({
        id: cid(),
        sourceId: srcId,
        targetId: tgtId,
        path: [],
        flowRate: conn.flowRate,
        style: conn.style,
        label: conn.label,
      });
    }
  }

  var regions: Region[] = computeHubRegions(layout.nodes);

  return {
    nodes: nodes,
    connectors: connectors,
    regions: regions,
    gridWidth: 44,
    gridHeight: 36,
  };
}

// Backward compat — default to auto-detected stage
export function generateCommerceMap(): MapModel {
  return generateMerchantMap();
}
