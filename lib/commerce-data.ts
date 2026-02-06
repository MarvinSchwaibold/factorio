import { getMockStore } from "./quick-agent/mock-store";
import type { Order, InventoryLevel, Customer } from "./quick-agent/types";

// ── Types ────────────────────────────────────────────────

export interface CommerceMetrics {
  revenue: number;
  orderCount: number;
  aov: number;
  revenueChange: number; // percent
  lowStockCount: number;
}

export interface Observation {
  message: string;
  time: string;
}

export interface RecentOrder {
  name: string;
  customerName: string;
  total: string;
  financialStatus: string;
  fulfillmentStatus: string;
}

export interface TopProduct {
  title: string;
  revenue: number;
  units: number;
}

export interface InventoryAlert {
  productTitle: string;
  variantTitle: string;
  available: number;
}

export interface TopCustomer {
  name: string;
  email: string;
  totalSpent: number;
}

export interface CommerceData {
  metrics: CommerceMetrics;
  observations: Observation[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  inventoryAlerts: InventoryAlert[];
  topCustomers: TopCustomer[];
}

// ── Helpers ──────────────────────────────────────────────

function daysAgoDate(n: number): Date {
  var d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isWithinDays(dateStr: string, days: number): boolean {
  var cutoff = daysAgoDate(days);
  return new Date(dateStr) >= cutoff;
}

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Main ─────────────────────────────────────────────────

export function getCommerceData(): CommerceData {
  var store = getMockStore();

  // ── Revenue & orders (current 30d vs prior 30d) ──
  var now = new Date();
  var cutoff30 = daysAgoDate(30);
  var cutoff60 = daysAgoDate(60);

  var current30dOrders: Order[] = [];
  var prior30dOrders: Order[] = [];

  store.orders.forEach(function (o) {
    var d = new Date(o.createdAt);
    if (d >= cutoff30) {
      current30dOrders.push(o);
    } else if (d >= cutoff60) {
      prior30dOrders.push(o);
    }
  });

  var paidCurrent = current30dOrders.filter(function (o) { return o.financialStatus === "paid"; });
  var paidPrior = prior30dOrders.filter(function (o) { return o.financialStatus === "paid"; });

  var revenue = paidCurrent.reduce(function (sum, o) { return sum + parseFloat(o.totalPrice); }, 0);
  var revenuePrior = paidPrior.reduce(function (sum, o) { return sum + parseFloat(o.totalPrice); }, 0);
  var orderCount = current30dOrders.length;
  var aov = orderCount > 0 ? revenue / orderCount : 0;
  var revenueChange = revenuePrior > 0 ? ((revenue - revenuePrior) / revenuePrior) * 100 : 0;

  // ── Low stock (aggregate across locations per product+variant) ──
  var stockMap: { [key: string]: { productTitle: string; variantTitle: string; available: number } } = {};
  store.inventory.forEach(function (inv) {
    var key = inv.productTitle + "|" + inv.variantTitle;
    if (!stockMap[key]) {
      stockMap[key] = { productTitle: inv.productTitle, variantTitle: inv.variantTitle, available: 0 };
    }
    stockMap[key].available += inv.available;
  });

  var stockItems = Object.keys(stockMap).map(function (k) { return stockMap[k]; });
  var lowStockItems = stockItems
    .filter(function (s) { return s.available < 10; })
    .sort(function (a, b) { return a.available - b.available; });

  // ── Recent orders ──
  var sortedOrders = store.orders.slice().sort(function (a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  var recentOrders: RecentOrder[] = sortedOrders.slice(0, 5).map(function (o) {
    return {
      name: o.name,
      customerName: o.customer.firstName + " " + o.customer.lastName.charAt(0) + ".",
      total: "$" + parseFloat(o.totalPrice).toFixed(0),
      financialStatus: o.financialStatus,
      fulfillmentStatus: o.fulfillmentStatus,
    };
  });

  // ── Top products (by revenue in 30d paid orders) ──
  var productRevMap: { [title: string]: { revenue: number; units: number } } = {};
  paidCurrent.forEach(function (o) {
    o.lineItems.forEach(function (li) {
      if (!productRevMap[li.title]) {
        productRevMap[li.title] = { revenue: 0, units: 0 };
      }
      productRevMap[li.title].revenue += parseFloat(li.price) * li.quantity;
      productRevMap[li.title].units += li.quantity;
    });
  });

  var topProducts: TopProduct[] = Object.keys(productRevMap)
    .map(function (title) {
      return {
        title: title,
        revenue: productRevMap[title].revenue,
        units: productRevMap[title].units,
      };
    })
    .sort(function (a, b) { return b.revenue - a.revenue; })
    .slice(0, 5);

  // ── Inventory alerts ──
  var inventoryAlerts: InventoryAlert[] = lowStockItems.slice(0, 8).map(function (s) {
    return {
      productTitle: s.productTitle,
      variantTitle: s.variantTitle,
      available: s.available,
    };
  });

  // ── Top customers ──
  var topCustomers: TopCustomer[] = store.customers
    .slice()
    .sort(function (a, b) { return parseFloat(b.totalSpent) - parseFloat(a.totalSpent); })
    .slice(0, 5)
    .map(function (c) {
      return {
        name: c.firstName + " " + c.lastName,
        email: c.email,
        totalSpent: parseFloat(c.totalSpent),
      };
    });

  // ── Unfulfilled paid orders ──
  var unfulfilledPaid = store.orders.filter(function (o) {
    return o.financialStatus === "paid" && o.fulfillmentStatus === "unfulfilled";
  }).length;

  // ── AOV comparison ──
  var aovPrior = paidPrior.length > 0
    ? paidPrior.reduce(function (sum, o) { return sum + parseFloat(o.totalPrice); }, 0) / paidPrior.length
    : 0;
  var aovChange = aovPrior > 0 ? ((aov - aovPrior) / aovPrior) * 100 : 0;

  // ── Observations ──
  var observations: Observation[] = [];

  // 1. Revenue trend
  var changeDir = revenueChange >= 0 ? "up" : "down";
  observations.push({
    message: "Revenue " + changeDir + " " + Math.abs(revenueChange).toFixed(1) + "% vs prior 30 days",
    time: "Just now",
  });

  // 2. Unfulfilled orders
  if (unfulfilledPaid > 0) {
    observations.push({
      message: unfulfilledPaid + " paid orders awaiting fulfillment",
      time: "Just now",
    });
  }

  // 3. Low stock
  if (lowStockItems.length > 0) {
    observations.push({
      message: lowStockItems.length + " products below reorder threshold",
      time: "Just now",
    });
  }

  // 4. Top seller
  if (topProducts.length > 0) {
    observations.push({
      message: "Top seller: " + topProducts[0].title + " (" + formatCurrency(topProducts[0].revenue) + ")",
      time: "Just now",
    });
  }

  // 5. AOV trend
  if (aovPrior > 0) {
    var aovDir = aovChange >= 0 ? "up" : "down";
    observations.push({
      message: "Average order value " + aovDir + " " + Math.abs(aovChange).toFixed(1) + "% to " + formatCurrency(aov),
      time: "Just now",
    });
  }

  return {
    metrics: {
      revenue: revenue,
      orderCount: orderCount,
      aov: aov,
      revenueChange: revenueChange,
      lowStockCount: lowStockItems.length,
    },
    observations: observations,
    recentOrders: recentOrders,
    topProducts: topProducts,
    inventoryAlerts: inventoryAlerts,
    topCustomers: topCustomers,
  };
}
