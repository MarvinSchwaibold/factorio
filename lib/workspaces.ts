export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  agentId: string | null;
  column: "backlog" | "in_progress" | "review" | "done";
  output: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  icon: string;
  agentIds: string[];
  tasks: WorkspaceTask[];
}

export var seedWorkspaces: Workspace[] = [
  {
    id: "holiday-campaign",
    name: "Holiday Campaign",
    description: "Plan and execute the holiday season marketing push across email, social, and on-site content.",
    icon: "🎄",
    agentIds: ["content-writer", "merchant-analyst"],
    tasks: [
      {
        id: "hc-1",
        title: "Write holiday email sequence",
        description: "Create a 3-part email sequence for Black Friday → Cyber Monday → Holiday shipping deadline reminders.",
        agentId: "content-writer",
        column: "done",
        output: "**Email 1 — Black Friday Early Access**\n\nSubject: Your early access starts now\n\nHi {{first_name}},\n\nWe're giving you a head start. Shop our biggest sale of the year before anyone else — up to 40% off sitewide.\n\n[Shop Early Access →]\n\n---\n\n**Email 2 — Cyber Monday**\n\nSubject: Last call: Cyber Monday deals end tonight\n\nDon't miss out — today is the final day to grab 40% off everything. Free shipping on orders over $50.\n\n[Shop Now →]\n\n---\n\n**Email 3 — Shipping Deadline**\n\nSubject: Order by Friday for guaranteed holiday delivery\n\nThe clock is ticking! Place your order by December 15 to ensure it arrives in time for the holidays.\n\n[Shop Gifts →]",
        createdAt: "2026-01-15T10:00:00Z",
      },
      {
        id: "hc-2",
        title: "Analyze last year's holiday performance",
        description: "Pull YoY comparison for holiday period — revenue, AOV, conversion rate, top products.",
        agentId: "merchant-analyst",
        column: "done",
        output: "**Holiday 2025 vs 2024 Performance**\n\n| Metric | 2024 | 2025 | Change |\n|---|---|---|---|\n| Revenue | $42,300 | $58,100 | +37% |\n| AOV | $67.20 | $72.40 | +7.7% |\n| Conversion | 3.1% | 3.8% | +0.7pp |\n| Orders | 629 | 802 | +27.5% |\n\n**Top Products:** Evergreen Candle Set (#1), Winter Pine Collection (#2), Gift Box Bundle (#3)\n\n**Key Insight:** Gift bundles drove 40% of revenue — recommend expanding bundle options this year.",
        createdAt: "2026-01-14T09:00:00Z",
      },
      {
        id: "hc-3",
        title: "Draft social media content calendar",
        description: "Plan 2 weeks of social posts leading up to and through the holiday sale period.",
        agentId: "content-writer",
        column: "in_progress",
        output: "",
        createdAt: "2026-01-16T14:00:00Z",
      },
      {
        id: "hc-4",
        title: "Create homepage banner copy",
        description: "Write hero banner headlines and CTAs for the holiday sale landing page.",
        agentId: "content-writer",
        column: "review",
        output: "**Option A:** \"The Season of Giving Starts Here\" — Shop gifts they'll love, with free shipping on every order.\n\n**Option B:** \"Unwrap 40% Off Everything\" — Our biggest sale of the year is live. Don't wait.\n\n**Option C:** \"Handcrafted Holiday Favorites\" — Discover candles made for cozy winter nights.\n\nRecommendation: Option B for highest urgency + clear value prop.",
        createdAt: "2026-01-17T11:00:00Z",
      },
      {
        id: "hc-5",
        title: "Segment customer list for targeting",
        description: "Build customer segments: VIP (top 10%), lapsed (90+ days), new (first purchase within 30 days).",
        agentId: "merchant-analyst",
        column: "in_progress",
        output: "",
        createdAt: "2026-01-18T08:00:00Z",
      },
      {
        id: "hc-6",
        title: "Write product descriptions for gift guide",
        description: "Create short, punchy descriptions for the top 10 holiday gift picks.",
        agentId: "content-writer",
        column: "backlog",
        output: "",
        createdAt: "2026-01-19T10:00:00Z",
      },
    ],
  },
  {
    id: "inventory-audit",
    name: "Inventory Audit",
    description: "End-of-quarter inventory review — identify dead stock, reorder needs, and optimize purchasing.",
    icon: "📦",
    agentIds: ["inventory-planner", "sidekick"],
    tasks: [
      {
        id: "ia-1",
        title: "Flag dead stock items",
        description: "Identify products with zero sales in the last 90 days that still have inventory on hand.",
        agentId: "inventory-planner",
        column: "done",
        output: "**Dead Stock Report (Last 90 Days)**\n\n| Product | Variant | On Hand | Last Sold |\n|---|---|---|---|\n| Summer Breeze Candle | 8oz | 47 | 2025-09-12 |\n| Tropical Mango Set | Gift Box | 23 | 2025-10-01 |\n| Beach Day Diffuser | Standard | 31 | 2025-09-28 |\n\n**Recommendation:** Run a clearance at 50%+ discount or bundle with popular items to move through remaining stock before Q1 purchasing.",
        createdAt: "2026-01-20T09:00:00Z",
      },
      {
        id: "ia-2",
        title: "Calculate reorder points for top sellers",
        description: "Compute optimal reorder points and quantities for the top 15 SKUs by sales velocity.",
        agentId: "inventory-planner",
        column: "review",
        output: "**Reorder Points — Top 15 SKUs**\n\n| SKU | Product | Reorder Point | Order Qty | Lead Time |\n|---|---|---|---|---|\n| EC-8OZ | Evergreen Candle 8oz | 45 units | 120 | 14 days |\n| WP-12OZ | Winter Pine 12oz | 30 units | 80 | 14 days |\n| LV-8OZ | Lavender Dreams 8oz | 38 units | 100 | 14 days |\n| VN-4OZ | Vanilla Bean 4oz | 55 units | 150 | 10 days |\n| GB-SET | Gift Box Bundle | 20 sets | 60 | 21 days |\n\n*Based on 30-day rolling average sales velocity with 1.5x safety stock multiplier.*",
        createdAt: "2026-01-21T10:00:00Z",
      },
      {
        id: "ia-3",
        title: "Pull current stock levels across all variants",
        description: "Export a full inventory snapshot — every product, variant, and location.",
        agentId: "sidekick",
        column: "in_progress",
        output: "",
        createdAt: "2026-01-22T08:00:00Z",
      },
      {
        id: "ia-4",
        title: "Draft purchase orders for Q2",
        description: "Based on reorder analysis, generate PO drafts for the top 3 suppliers.",
        agentId: "inventory-planner",
        column: "backlog",
        output: "",
        createdAt: "2026-01-23T09:00:00Z",
      },
    ],
  },
  {
    id: "new-store-launch",
    name: "New Store Launch",
    description: "Everything needed to launch the new product line — from product setup to go-live.",
    icon: "🚀",
    agentIds: [],
    tasks: [],
  },
];
