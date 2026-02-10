import type { MapModel, MapNode, Connector, CommerceStat, Region, ConnectorStyle } from "./types";
import { getMockStore } from "../quick-agent/mock-store";

// ── Helpers ────────────────────────────────────────────
var _cid = 0;
function cid(): string {
  return "cm-" + (++_cid).toString(36);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function levelFromCount(count: number, thresholds: number[]): number {
  for (var i = 0; i < thresholds.length; i++) {
    if (count < thresholds[i]) return i + 1;
  }
  return 5;
}

// ── Layout positions (tile coords) ────────────────────
// Layout:
//                [Marketing]        (15,11)
//                    |
//                    | traffic
//                    v
// [Queen St] <-- [Online Store] --> [Warehouse] --> [Shipping]
//  (11,15)        (15,15)           (19,15)         (23,15)
var BUILDING_POSITIONS: { [key: string]: [number, number] } = {
  "online-store": [15, 15],
  "retail":       [11, 15],
  "warehouse":    [19, 15],
  "marketing":    [15, 11],
  "shipping":     [23, 15],
};

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
    // Count customers tagged "newsletter" as subscribers
    var tags = store.customers[ci].tags || [];
    for (var ti = 0; ti < tags.length; ti++) {
      if (tags[ti].toLowerCase() === "newsletter") {
        newsletterSubscribers++;
        break;
      }
    }
  }
  // Fallback: if no newsletter tags, estimate from customer count
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
    // Split inventory by locationId
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

  // Orders per month (assume 90-day window)
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

// ── Map generator ─────────────────────────────────────

export function generateCommerceMap(): MapModel {
  var data = getCommerceData();

  var nodes: MapNode[] = [];
  var connectors: Connector[] = [];
  var regions: Region[] = [];

  // ── Regions (3 zones) ──

  // Sales Channels: Online Store + Retail
  regions.push({
    id: cid(),
    label: "Sales Channels",
    fromTile: [9, 13],
    toTile: [17, 17],
    color: "#5eead4",      // teal
    strokeColor: "#0d9488",
  });

  // Operations: Warehouse + Shipping
  regions.push({
    id: cid(),
    label: "Operations",
    fromTile: [17, 13],
    toTile: [25, 17],
    color: "#93c5fd",      // blue
    strokeColor: "#2563eb",
  });

  // Acquisition: Marketing
  regions.push({
    id: cid(),
    label: "Acquisition",
    fromTile: [13, 9],
    toTile: [17, 13],
    color: "#f9a8d4",      // pink
    strokeColor: "#db2777",
  });

  // ── Online Store (hero building, 1.15x scale) ──
  var onlineStoreId = cid();
  var conversionRate = "3.2%";
  nodes.push({
    id: onlineStoreId,
    category: "online-store",
    label: "Online Store",
    description: "Kaz's Candles online storefront",
    tileX: BUILDING_POSITIONS["online-store"][0],
    tileY: BUILDING_POSITIONS["online-store"][1],
    buildingLevel: levelFromCount(data.totalOrders, [30, 60, 100, 200]),
    activityLevel: 0.8,
    labelHeight: 28,
    stats: [
      { label: "Revenue", value: "$" + Math.round(data.totalRevenue).toLocaleString(), trend: "up" },
      { label: "Products", value: data.activeProducts + " listed", trend: "flat" },
      { label: "Orders", value: data.totalOrders + " total", trend: "up" },
      { label: "Conversion", value: conversionRate, trend: "up" },
    ],
    alertCount: data.pendingOrders,
  });

  // ── Retail (Queen St) ──
  var retailId = cid();
  nodes.push({
    id: retailId,
    category: "retail",
    label: "Queen St Retail",
    description: "Queen Street brick-and-mortar POS location",
    tileX: BUILDING_POSITIONS["retail"][0],
    tileY: BUILDING_POSITIONS["retail"][1],
    buildingLevel: levelFromCount(data.retailInventory, [20, 50, 100, 200]),
    activityLevel: 0.5,
    labelHeight: 20,
    stats: [
      { label: "In-store Items", value: data.retailInventory + " units" },
      { label: "Stock Count", value: data.retailInventory > 0 ? "stocked" : "empty", trend: data.retailInventory > 20 ? "up" : "down" },
    ],
    alertCount: 0,
  });

  // ── Warehouse ──
  var warehouseId = cid();
  var inventoryAlerts = data.lowStockItems + data.outOfStockItems;
  nodes.push({
    id: warehouseId,
    category: "warehouse",
    label: "Main Warehouse",
    description: "Central fulfillment center and inventory storage",
    tileX: BUILDING_POSITIONS["warehouse"][0],
    tileY: BUILDING_POSITIONS["warehouse"][1],
    buildingLevel: levelFromCount(data.totalInventoryItems, [20, 50, 100, 200]),
    activityLevel: 0.4,
    labelHeight: 20,
    stats: [
      { label: "Items Tracked", value: data.totalInventoryItems + " SKUs" },
      { label: "Low Stock", value: data.lowStockItems + " items", trend: data.lowStockItems > 5 ? "down" : "flat" },
      { label: "Out of Stock", value: data.outOfStockItems + " items", trend: data.outOfStockItems > 0 ? "down" : "flat" },
    ],
    alertCount: inventoryAlerts,
  });

  // ── Marketing ──
  var marketingId = cid();
  nodes.push({
    id: marketingId,
    category: "marketing",
    label: "Marketing",
    description: "Customer acquisition and campaigns",
    tileX: BUILDING_POSITIONS["marketing"][0],
    tileY: BUILDING_POSITIONS["marketing"][1],
    buildingLevel: levelFromCount(data.newsletterSubscribers, [20, 40, 60, 100]),
    activityLevel: 0.5,
    labelHeight: 20,
    stats: [
      { label: "Subscribers", value: data.newsletterSubscribers + " contacts" },
      { label: "Campaigns", value: "3 active", trend: "up" },
    ],
    alertCount: 0,
  });

  // ── Shipping ──
  var shippingId = cid();
  nodes.push({
    id: shippingId,
    category: "shipping",
    label: "Shipping",
    description: "Outbound logistics and delivery",
    tileX: BUILDING_POSITIONS["shipping"][0],
    tileY: BUILDING_POSITIONS["shipping"][1],
    buildingLevel: levelFromCount(data.fulfilledOrders, [10, 30, 60, 100]),
    activityLevel: 0.7,
    labelHeight: 20,
    stats: [
      { label: "Fulfilled", value: data.fulfilledOrders + " orders", trend: "up" },
      { label: "Pending", value: data.unfulfilledOrders + " shipments", trend: data.unfulfilledOrders > 20 ? "down" : "flat" },
    ],
    alertCount: data.unfulfilledOrders > 20 ? data.unfulfilledOrders : 0,
  });

  // ── Connectors (5 flows) ──

  // Marketing → Online Store (drives traffic) — solid
  connectors.push({
    id: cid(), sourceId: marketingId, targetId: onlineStoreId, path: [],
    flowRate: 0.5,
    style: "solid",
    label: "traffic",
  });

  // Online Store → Warehouse (orders flow to fulfillment) — solid
  connectors.push({
    id: cid(), sourceId: onlineStoreId, targetId: warehouseId, path: [],
    flowRate: clamp(data.ordersPerMonth / 100, 0.2, 1),
    style: "solid",
    label: "~" + data.ordersPerMonth + " orders/mo",
  });

  // Warehouse → Shipping (ship orders) — solid
  connectors.push({
    id: cid(), sourceId: warehouseId, targetId: shippingId, path: [],
    flowRate: clamp(data.fulfilledOrders / 150, 0.2, 1),
    style: "solid",
    label: "ship",
  });

  // Warehouse → Retail (restock) — dashed
  connectors.push({
    id: cid(), sourceId: warehouseId, targetId: retailId, path: [],
    flowRate: 0.3,
    style: "dashed",
    label: "restock",
  });

  // Online Store → Retail (product/price sync) — dotted
  connectors.push({
    id: cid(), sourceId: onlineStoreId, targetId: retailId, path: [],
    flowRate: 0.2,
    style: "dotted",
    label: "sync",
  });

  return {
    nodes: nodes,
    connectors: connectors,
    regions: regions,
    gridWidth: 30,
    gridHeight: 30,
  };
}
