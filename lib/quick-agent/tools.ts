import type { RegisteredTool } from "./types";
import { getMockStore } from "./mock-store";

// ── Tool builder helper ─────────────────────────────────

function tool(
  name: string,
  description: string,
  parameters: Record<string, unknown>,
  implementation: (args: Record<string, unknown>) => Promise<unknown>
): RegisteredTool {
  return {
    definition: {
      type: "function",
      function: { name, description, parameters },
    },
    implementation,
  };
}

// ── Orders ──────────────────────────────────────────────

const orderTools: RegisteredTool[] = [
  tool(
    "list_orders",
    "List recent orders with optional filters. Returns order summaries with totals, status, and customer info.",
    {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "paid", "refunded", "partially_refunded"],
          description: "Filter by financial status",
        },
        fulfillment: {
          type: "string",
          enum: ["unfulfilled", "fulfilled", "partial"],
          description: "Filter by fulfillment status",
        },
        limit: {
          type: "number",
          description: "Max results (default 10)",
        },
        days: {
          type: "number",
          description: "Only orders from the last N days",
        },
      },
    },
    async (args) => {
      const store = getMockStore();
      let orders = [...store.orders];

      if (args.status) orders = orders.filter((o) => o.financialStatus === args.status);
      if (args.fulfillment) orders = orders.filter((o) => o.fulfillmentStatus === args.fulfillment);
      if (args.days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (args.days as number));
        orders = orders.filter((o) => new Date(o.createdAt) >= cutoff);
      }

      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const limit = (args.limit as number) || 10;

      return {
        orders: orders.slice(0, limit).map((o) => ({
          id: o.id,
          name: o.name,
          customer: `${o.customer.firstName} ${o.customer.lastName}`,
          email: o.email,
          totalPrice: `$${o.totalPrice} ${o.currency}`,
          financialStatus: o.financialStatus,
          fulfillmentStatus: o.fulfillmentStatus,
          itemCount: o.lineItems.reduce((s, li) => s + li.quantity, 0),
          createdAt: o.createdAt,
        })),
        totalCount: orders.length,
      };
    }
  ),

  tool(
    "get_order",
    "Get full details of a specific order by ID or order name (e.g. #1001). Includes line items, customer, and financial details.",
    {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Order ID or name like #1001" },
      },
      required: ["order_id"],
    },
    async (args) => {
      const store = getMockStore();
      const id = args.order_id as string;
      const order = store.orders.find((o) => o.id === id || o.name === id);
      if (!order) return { error: `Order ${id} not found` };
      return order;
    }
  ),

  tool(
    "get_order_stats",
    "Get aggregate order statistics: total revenue, order count, average order value, fulfillment rates for a given time period.",
    {
      type: "object",
      properties: {
        days: { type: "number", description: "Time period in days (default 30)" },
      },
    },
    async (args) => {
      const store = getMockStore();
      const days = (args.days as number) || 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const recent = store.orders.filter((o) => new Date(o.createdAt) >= cutoff);

      const totalRevenue = recent.reduce((s, o) => s + parseFloat(o.totalPrice), 0);
      const paidOrders = recent.filter((o) => o.financialStatus === "paid");
      const fulfilledOrders = recent.filter((o) => o.fulfillmentStatus === "fulfilled");

      return {
        period: `Last ${days} days`,
        totalOrders: recent.length,
        totalRevenue: `$${totalRevenue.toFixed(2)} CAD`,
        averageOrderValue: `$${recent.length > 0 ? (totalRevenue / recent.length).toFixed(2) : "0.00"} CAD`,
        paidRate: `${recent.length > 0 ? ((paidOrders.length / recent.length) * 100).toFixed(1) : 0}%`,
        fulfillmentRate: `${paidOrders.length > 0 ? ((fulfilledOrders.length / paidOrders.length) * 100).toFixed(1) : 0}%`,
        pendingOrders: recent.filter((o) => o.financialStatus === "pending").length,
        unfulfilledOrders: recent.filter((o) => o.fulfillmentStatus === "unfulfilled" && o.financialStatus === "paid").length,
      };
    }
  ),
];

// ── Products ────────────────────────────────────────────

const productTools: RegisteredTool[] = [
  tool(
    "list_products",
    "List products in the catalog with optional filters. Returns product titles, status, prices, and variant counts.",
    {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["active", "draft", "archived"],
          description: "Filter by product status",
        },
        product_type: {
          type: "string",
          description: "Filter by product type (e.g. Candle, Diffuser, Accessory)",
        },
        limit: { type: "number", description: "Max results (default 10)" },
        search: { type: "string", description: "Search product titles" },
      },
    },
    async (args) => {
      const store = getMockStore();
      let products = [...store.products];

      if (args.status) products = products.filter((p) => p.status === args.status);
      if (args.product_type) products = products.filter((p) => p.productType === args.product_type);
      if (args.search) {
        const q = (args.search as string).toLowerCase();
        products = products.filter((p) => p.title.toLowerCase().includes(q));
      }

      const limit = (args.limit as number) || 10;
      return {
        products: products.slice(0, limit).map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          productType: p.productType,
          priceRange: `$${p.variants[0].price} - $${p.variants[p.variants.length - 1].price}`,
          variantCount: p.variants.length,
          tags: p.tags,
        })),
        totalCount: products.length,
      };
    }
  ),

  tool(
    "get_product",
    "Get full product details including all variants, pricing, and inventory by product ID.",
    {
      type: "object",
      properties: {
        product_id: { type: "string", description: "Product ID" },
      },
      required: ["product_id"],
    },
    async (args) => {
      const store = getMockStore();
      const product = store.products.find((p) => p.id === args.product_id);
      if (!product) return { error: `Product ${args.product_id} not found` };
      return product;
    }
  ),

  tool(
    "update_product",
    "Update a product's fields (title, description, status, tags). Returns the updated product.",
    {
      type: "object",
      properties: {
        product_id: { type: "string", description: "Product ID" },
        title: { type: "string", description: "New title" },
        description: { type: "string", description: "New description" },
        status: { type: "string", enum: ["active", "draft", "archived"] },
        tags: { type: "array", items: { type: "string" }, description: "Replace tags" },
      },
      required: ["product_id"],
    },
    async (args) => {
      const store = getMockStore();
      const product = store.products.find((p) => p.id === args.product_id);
      if (!product) return { error: `Product ${args.product_id} not found` };

      if (args.title) product.title = args.title as string;
      if (args.description) product.description = args.description as string;
      if (args.status) product.status = args.status as Product["status"];
      if (args.tags) product.tags = args.tags as string[];
      product.updatedAt = new Date().toISOString();

      return { updated: true, product };
    }
  ),
];

// ── Inventory ───────────────────────────────────────────

const inventoryTools: RegisteredTool[] = [
  tool(
    "get_inventory_levels",
    "Get current inventory levels. Can filter by location, low stock threshold, or specific SKU.",
    {
      type: "object",
      properties: {
        location: { type: "string", description: "Filter by location name" },
        low_stock_threshold: {
          type: "number",
          description: "Only show items with stock below this number",
        },
        sku: { type: "string", description: "Filter by specific SKU" },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
    async (args) => {
      const store = getMockStore();
      let levels = [...store.inventory];

      if (args.location) {
        const loc = (args.location as string).toLowerCase();
        levels = levels.filter((l) => l.locationName.toLowerCase().includes(loc));
      }
      if (args.sku) levels = levels.filter((l) => l.sku === args.sku);
      if (args.low_stock_threshold) {
        levels = levels.filter((l) => l.available < (args.low_stock_threshold as number));
      }

      levels.sort((a, b) => a.available - b.available);
      const limit = (args.limit as number) || 20;

      return {
        levels: levels.slice(0, limit).map((l) => ({
          productTitle: l.productTitle,
          variantTitle: l.variantTitle,
          sku: l.sku,
          location: l.locationName,
          available: l.available,
          status: l.available === 0 ? "OUT_OF_STOCK" : l.available < 10 ? "LOW_STOCK" : "IN_STOCK",
        })),
        totalItems: levels.length,
        outOfStock: levels.filter((l) => l.available === 0).length,
        lowStock: levels.filter((l) => l.available > 0 && l.available < 10).length,
      };
    }
  ),

  tool(
    "adjust_inventory",
    "Adjust inventory quantity for a SKU at a location. Positive number adds stock, negative removes.",
    {
      type: "object",
      properties: {
        sku: { type: "string", description: "SKU to adjust" },
        location: { type: "string", description: "Location name" },
        adjustment: { type: "number", description: "Amount to adjust (positive = add, negative = remove)" },
        reason: { type: "string", description: "Reason for adjustment" },
      },
      required: ["sku", "adjustment"],
    },
    async (args) => {
      const store = getMockStore();
      const sku = args.sku as string;
      const loc = (args.location as string || "").toLowerCase();
      const level = store.inventory.find(
        (l) => l.sku === sku && (loc ? l.locationName.toLowerCase().includes(loc) : true)
      );
      if (!level) return { error: `Inventory for SKU ${sku} not found` };

      const oldQty = level.available;
      level.available = Math.max(0, level.available + (args.adjustment as number));

      return {
        adjusted: true,
        sku: level.sku,
        product: level.productTitle,
        location: level.locationName,
        previousQuantity: oldQty,
        newQuantity: level.available,
        adjustment: args.adjustment,
        reason: args.reason || "Manual adjustment",
      };
    }
  ),
];

// ── Customers ───────────────────────────────────────────

const customerTools: RegisteredTool[] = [
  tool(
    "list_customers",
    "List customers with optional filters. Returns customer names, emails, order counts, and total spent.",
    {
      type: "object",
      properties: {
        tag: { type: "string", description: "Filter by customer tag (e.g. vip, wholesale)" },
        min_orders: { type: "number", description: "Minimum order count" },
        min_spent: { type: "number", description: "Minimum total spent" },
        search: { type: "string", description: "Search by name or email" },
        limit: { type: "number", description: "Max results (default 10)" },
        sort_by: {
          type: "string",
          enum: ["total_spent", "orders_count", "created_at"],
          description: "Sort field",
        },
      },
    },
    async (args) => {
      const store = getMockStore();
      let customers = [...store.customers];

      if (args.tag) customers = customers.filter((c) => c.tags.includes(args.tag as string));
      if (args.min_orders) customers = customers.filter((c) => c.ordersCount >= (args.min_orders as number));
      if (args.min_spent) customers = customers.filter((c) => parseFloat(c.totalSpent) >= (args.min_spent as number));
      if (args.search) {
        const q = (args.search as string).toLowerCase();
        customers = customers.filter(
          (c) => c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        );
      }

      const sortBy = args.sort_by as string || "total_spent";
      customers.sort((a, b) => {
        if (sortBy === "total_spent") return parseFloat(b.totalSpent) - parseFloat(a.totalSpent);
        if (sortBy === "orders_count") return b.ordersCount - a.ordersCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const limit = (args.limit as number) || 10;
      return {
        customers: customers.slice(0, limit).map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          ordersCount: c.ordersCount,
          totalSpent: `$${c.totalSpent} CAD`,
          tags: c.tags,
          lastOrderAt: c.lastOrderAt,
        })),
        totalCount: customers.length,
      };
    }
  ),

  tool(
    "get_customer",
    "Get full customer details and their order history by customer ID.",
    {
      type: "object",
      properties: {
        customer_id: { type: "string", description: "Customer ID" },
      },
      required: ["customer_id"],
    },
    async (args) => {
      const store = getMockStore();
      const customer = store.customers.find((c) => c.id === args.customer_id);
      if (!customer) return { error: `Customer ${args.customer_id} not found` };

      const orders = store.orders
        .filter((o) => o.customer.id === customer.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return { ...customer, recentOrders: orders };
    }
  ),
];

// ── Analytics ───────────────────────────────────────────

const analyticsTools: RegisteredTool[] = [
  tool(
    "sales_summary",
    "Get a sales performance summary: revenue, orders, AOV, top products, and trends for a time period.",
    {
      type: "object",
      properties: {
        days: { type: "number", description: "Time period in days (default 30)" },
      },
    },
    async (args) => {
      const store = getMockStore();
      const days = (args.days as number) || 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const recent = store.orders.filter((o) => new Date(o.createdAt) >= cutoff);

      // Previous period for comparison
      const prevCutoff = new Date(cutoff);
      prevCutoff.setDate(prevCutoff.getDate() - days);
      const previous = store.orders.filter(
        (o) => new Date(o.createdAt) >= prevCutoff && new Date(o.createdAt) < cutoff
      );

      const revenue = recent.reduce((s, o) => s + parseFloat(o.totalPrice), 0);
      const prevRevenue = previous.reduce((s, o) => s + parseFloat(o.totalPrice), 0);
      const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

      // Top products by revenue
      const productRevenue = new Map<string, { title: string; revenue: number; units: number }>();
      for (const order of recent) {
        for (const li of order.lineItems) {
          const existing = productRevenue.get(li.title) || { title: li.title, revenue: 0, units: 0 };
          existing.revenue += parseFloat(li.price) * li.quantity;
          existing.units += li.quantity;
          productRevenue.set(li.title, existing);
        }
      }
      const topProducts = Array.from(productRevenue.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({ ...p, revenue: `$${p.revenue.toFixed(2)}` }));

      return {
        period: `Last ${days} days`,
        revenue: `$${revenue.toFixed(2)} CAD`,
        revenueChange: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%`,
        orderCount: recent.length,
        averageOrderValue: `$${recent.length > 0 ? (revenue / recent.length).toFixed(2) : "0.00"} CAD`,
        topProducts,
        uniqueCustomers: new Set(recent.map((o) => o.customer.id)).size,
      };
    }
  ),

  tool(
    "top_products",
    "Get the top selling products ranked by revenue or units sold.",
    {
      type: "object",
      properties: {
        days: { type: "number", description: "Time period in days (default 30)" },
        sort_by: {
          type: "string",
          enum: ["revenue", "units"],
          description: "Sort by revenue or units sold (default revenue)",
        },
        limit: { type: "number", description: "Number of products (default 10)" },
      },
    },
    async (args) => {
      const store = getMockStore();
      const days = (args.days as number) || 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const recent = store.orders.filter((o) => new Date(o.createdAt) >= cutoff);

      const productMap = new Map<string, { title: string; revenue: number; units: number; orders: number }>();
      for (const order of recent) {
        for (const li of order.lineItems) {
          const existing = productMap.get(li.title) || { title: li.title, revenue: 0, units: 0, orders: 0 };
          existing.revenue += parseFloat(li.price) * li.quantity;
          existing.units += li.quantity;
          existing.orders += 1;
          productMap.set(li.title, existing);
        }
      }

      const sortBy = args.sort_by as string || "revenue";
      const limit = (args.limit as number) || 10;
      const sorted = Array.from(productMap.values())
        .sort((a, b) => (sortBy === "units" ? b.units - a.units : b.revenue - a.revenue))
        .slice(0, limit);

      return {
        period: `Last ${days} days`,
        products: sorted.map((p, i) => ({
          rank: i + 1,
          title: p.title,
          revenue: `$${p.revenue.toFixed(2)}`,
          unitsSold: p.units,
          orderCount: p.orders,
        })),
      };
    }
  ),
];

// ── Marketing ───────────────────────────────────────────

const marketingTools: RegisteredTool[] = [
  tool(
    "segment_audience",
    "Build a customer audience segment based on criteria like tags, minimum orders, spending, or recency. Returns matching customers and count.",
    {
      type: "object",
      properties: {
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Customer tags to include",
        },
        min_orders: { type: "number", description: "Minimum order count" },
        min_spent: { type: "number", description: "Minimum total spent" },
        active_days: {
          type: "number",
          description: "Only customers who ordered in the last N days",
        },
      },
    },
    async (args) => {
      const store = getMockStore();
      let customers = [...store.customers];

      if (args.tags) {
        const tags = args.tags as string[];
        customers = customers.filter((c) => tags.some((t) => c.tags.includes(t)));
      }
      if (args.min_orders) customers = customers.filter((c) => c.ordersCount >= (args.min_orders as number));
      if (args.min_spent) customers = customers.filter((c) => parseFloat(c.totalSpent) >= (args.min_spent as number));
      if (args.active_days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (args.active_days as number));
        customers = customers.filter((c) => c.lastOrderAt && new Date(c.lastOrderAt) >= cutoff);
      }

      return {
        segmentSize: customers.length,
        averageOrderCount: customers.length > 0
          ? (customers.reduce((s, c) => s + c.ordersCount, 0) / customers.length).toFixed(1)
          : 0,
        averageSpent: customers.length > 0
          ? `$${(customers.reduce((s, c) => s + parseFloat(c.totalSpent), 0) / customers.length).toFixed(2)}`
          : "$0.00",
        topTags: getTopTags(customers),
        sampleCustomers: customers.slice(0, 5).map((c) => ({
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          orders: c.ordersCount,
          spent: `$${c.totalSpent}`,
        })),
      };
    }
  ),

  tool(
    "draft_email",
    "Draft a marketing email with subject line and body. Returns the draft for review. Does NOT send.",
    {
      type: "object",
      properties: {
        campaign_name: { type: "string", description: "Name of the campaign" },
        goal: { type: "string", description: "Campaign goal (e.g. promote new products, re-engage lapsed customers)" },
        tone: {
          type: "string",
          enum: ["friendly", "professional", "urgent", "playful"],
          description: "Email tone",
        },
        include_discount: { type: "boolean", description: "Include a discount offer" },
        discount_percent: { type: "number", description: "Discount percentage if applicable" },
      },
      required: ["campaign_name", "goal"],
    },
    async (args) => {
      // The LLM itself will generate the actual copy — this tool structures the request
      return {
        status: "draft_created",
        campaign: args.campaign_name,
        goal: args.goal,
        tone: args.tone || "friendly",
        includesDiscount: args.include_discount || false,
        discountPercent: args.discount_percent || null,
        note: "Email copy should be generated by the assistant based on these parameters. Present the draft to the merchant for review before sending.",
      };
    }
  ),
];

// ── Helpers ─────────────────────────────────────────────

function getTopTags(customers: { tags: string[] }[]): { tag: string; count: number }[] {
  const tagCounts = new Map<string, number>();
  for (const c of customers) {
    for (const t of c.tags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Keep Product type in scope for update_product
type Product = import("./types").Product;

// ── Registry ────────────────────────────────────────────

const TOOL_REGISTRY: Record<string, RegisteredTool[]> = {
  orders: orderTools,
  products: productTools,
  inventory: inventoryTools,
  customers: customerTools,
  analytics: analyticsTools,
  marketing: marketingTools,
};

export function getToolsForCategories(categories: string[]): RegisteredTool[] {
  const tools: RegisteredTool[] = [];
  for (const cat of categories) {
    const categoryTools = TOOL_REGISTRY[cat];
    if (categoryTools) tools.push(...categoryTools);
  }
  return tools;
}

export function getAllTools(): RegisteredTool[] {
  return Object.values(TOOL_REGISTRY).flat();
}
