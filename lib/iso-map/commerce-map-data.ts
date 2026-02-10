import type { MapModel, MapNode, Connector, Region, MerchantStage } from "./types";
import { getMockStore } from "../quick-agent/mock-store";
import { getStageLayout, getAutoStage, computeRegions } from "./stage-layouts";

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
          { label: "Revenue", value: "$" + Math.round(data.totalRevenue).toLocaleString(), trend: "up" as const },
          { label: "Customers", value: data.totalCustomers + " total", trend: "up" as const },
          { label: "Products", value: data.activeProducts + " active", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.6,
      };
    case "online-store":
      return {
        stats: [
          { label: "Revenue", value: "$" + Math.round(data.totalRevenue).toLocaleString(), trend: "up" as const },
          { label: "Products", value: data.activeProducts + " listed", trend: "flat" as const },
          { label: "Orders", value: data.totalOrders + " total", trend: "up" as const },
          { label: "Conversion", value: "3.2%", trend: "up" as const },
        ],
        alertCount: data.pendingOrders,
        activityLevel: 0.8,
      };
    case "checkout":
      return {
        stats: [
          { label: "Orders", value: data.totalOrders + " processed", trend: "up" as const },
          { label: "Paid", value: data.paidOrders + " orders", trend: "up" as const },
          { label: "Pending", value: data.pendingOrders + " orders", trend: data.pendingOrders > 5 ? "down" as const : "flat" as const },
        ],
        alertCount: data.pendingOrders > 10 ? data.pendingOrders : 0,
        activityLevel: 0.7,
      };
    case "payments":
      return {
        stats: [
          { label: "Collected", value: "$" + Math.round(data.totalRevenue * 0.97).toLocaleString(), trend: "up" as const },
          { label: "Refunded", value: data.refundedOrders + " orders", trend: data.refundedOrders > 5 ? "down" as const : "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.6,
      };
    case "balance":
      return {
        stats: [
          { label: "Balance", value: "$" + Math.round(data.totalRevenue * 0.92).toLocaleString(), trend: "up" as const },
          { label: "Payouts", value: Math.round(data.totalOrders / 7) + " weekly", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.4,
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
    case "retail":
      return {
        stats: [
          { label: "In-store Items", value: data.retailInventory + " units" },
          { label: "Stock Count", value: data.retailInventory > 0 ? "stocked" : "empty", trend: data.retailInventory > 20 ? "up" as const : "down" as const },
        ],
        alertCount: 0,
        activityLevel: 0.5,
      };
    case "inventory":
      var inventoryAlerts = data.lowStockItems + data.outOfStockItems;
      return {
        stats: [
          { label: "Items Tracked", value: data.totalInventoryItems + " SKUs" },
          { label: "Low Stock", value: data.lowStockItems + " items", trend: data.lowStockItems > 5 ? "down" as const : "flat" as const },
          { label: "Out of Stock", value: data.outOfStockItems + " items", trend: data.outOfStockItems > 0 ? "down" as const : "flat" as const },
        ],
        alertCount: inventoryAlerts,
        activityLevel: 0.4,
      };
    case "shipping":
      return {
        stats: [
          { label: "Fulfilled", value: data.fulfilledOrders + " orders", trend: "up" as const },
          { label: "Pending", value: data.unfulfilledOrders + " shipments", trend: data.unfulfilledOrders > 20 ? "down" as const : "flat" as const },
        ],
        alertCount: data.unfulfilledOrders > 20 ? data.unfulfilledOrders : 0,
        activityLevel: 0.7,
      };
    case "tax":
      return {
        stats: [
          { label: "Tax Collected", value: "$" + Math.round(data.totalRevenue * 0.08).toLocaleString() },
          { label: "Filing", value: "quarterly", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.3,
      };
    case "billing":
      return {
        stats: [
          { label: "Plan", value: "Shopify Plus" },
          { label: "Monthly", value: "$299/mo", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.2,
      };
    case "capital":
      return {
        stats: [
          { label: "Funding", value: "$50K line", trend: "up" as const },
          { label: "Utilization", value: "24%", trend: "flat" as const },
        ],
        alertCount: 0,
        activityLevel: 0.3,
      };
    default:
      return { stats: [], alertCount: 0, activityLevel: 0.3 };
  }
}

// ── Category labels ──────────────────────────────────────
var CATEGORY_LABELS: { [key: string]: string } = {
  "back-office": "Back Office",
  "online-store": "Online Store",
  "checkout": "Checkout",
  "payments": "Payments",
  "balance": "Balance",
  "marketing": "Marketing",
  "retail": "Queen St Retail",
  "inventory": "Inventory",
  "shipping": "Shipping",
  "tax": "Tax",
  "billing": "Billing",
  "capital": "Capital",
};

var CATEGORY_DESCRIPTIONS: { [key: string]: string } = {
  "back-office": "Kaz's Candles headquarters",
  "online-store": "Kaz's Candles online storefront",
  "checkout": "Order processing and checkout flow",
  "payments": "Payment processing and collection",
  "balance": "Account balance and payouts",
  "marketing": "Customer acquisition and campaigns",
  "retail": "Queen Street brick-and-mortar POS location",
  "inventory": "Central fulfillment center and inventory storage",
  "shipping": "Outbound logistics and delivery",
  "tax": "Tax collection and filing",
  "billing": "Shopify subscription and app billing",
  "capital": "Business funding and capital",
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

    categoryToId[pos.category] = nodeId;

    nodes.push({
      id: nodeId,
      category: pos.category,
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

// Backward compat — default to auto-detected stage
export function generateCommerceMap(): MapModel {
  return generateMerchantMap();
}
