export interface Activity {
  id: string;
  agentId: string;
  type: "completed" | "started" | "flagged" | "awaiting_review" | "auto_action";
  title: string;
  detail: string;
  workspaceId: string | null;
  taskId: string | null;
  timestamp: string;
}

export var seedActivities: Activity[] = [
  {
    id: "a1",
    agentId: "content-writer",
    type: "awaiting_review",
    title: "Created homepage banner copy",
    detail: "3 options drafted for the holiday sale landing page. Recommends Option B for urgency.",
    workspaceId: "holiday-campaign",
    taskId: "hc-4",
    timestamp: "2026-02-10T09:42:00Z",
  },
  {
    id: "a2",
    agentId: "merchant-analyst",
    type: "started",
    title: "Segmenting customer list",
    detail: "Building VIP, lapsed, and new-buyer segments for holiday targeting.",
    workspaceId: "holiday-campaign",
    taskId: "hc-5",
    timestamp: "2026-02-10T09:15:00Z",
  },
  {
    id: "a3",
    agentId: "inventory-planner",
    type: "flagged",
    title: "Vanilla Bean 4oz below reorder point",
    detail: "Current stock: 12 units. Reorder point: 55. Suggested PO: 150 units to Supplier A.",
    workspaceId: "inventory-audit",
    taskId: null,
    timestamp: "2026-02-10T08:30:00Z",
  },
  {
    id: "a4",
    agentId: "sidekick",
    type: "started",
    title: "Pulling full inventory snapshot",
    detail: "Exporting all products, variants, and locations for the quarterly audit.",
    workspaceId: "inventory-audit",
    taskId: "ia-3",
    timestamp: "2026-02-10T08:00:00Z",
  },
  {
    id: "a5",
    agentId: "content-writer",
    type: "completed",
    title: "Finished holiday email sequence",
    detail: "3-part sequence ready: Black Friday early access, Cyber Monday, and shipping deadline.",
    workspaceId: "holiday-campaign",
    taskId: "hc-1",
    timestamp: "2026-02-09T17:20:00Z",
  },
  {
    id: "a6",
    agentId: "merchant-analyst",
    type: "completed",
    title: "Holiday YoY analysis complete",
    detail: "Revenue up 37%, AOV +7.7%. Gift bundles drove 40% of revenue — recommends expanding.",
    workspaceId: "holiday-campaign",
    taskId: "hc-2",
    timestamp: "2026-02-09T16:45:00Z",
  },
  {
    id: "a7",
    agentId: "inventory-planner",
    type: "awaiting_review",
    title: "Reorder points calculated for top 15 SKUs",
    detail: "Based on 30-day rolling average with 1.5x safety stock. Ready for approval.",
    workspaceId: "inventory-audit",
    taskId: "ia-2",
    timestamp: "2026-02-09T14:10:00Z",
  },
  {
    id: "a8",
    agentId: "inventory-planner",
    type: "completed",
    title: "Dead stock report generated",
    detail: "Found 3 products with zero sales in 90 days — 101 units total. Recommends clearance.",
    workspaceId: "inventory-audit",
    taskId: "ia-1",
    timestamp: "2026-02-09T11:00:00Z",
  },
  {
    id: "a9",
    agentId: "sidekick",
    type: "auto_action",
    title: "Updated shipping rates for Q1",
    detail: "Carrier rate changes detected. USPS Priority +3.2%, UPS Ground +1.8%. Rates synced.",
    workspaceId: null,
    taskId: null,
    timestamp: "2026-02-09T07:00:00Z",
  },
  {
    id: "a10",
    agentId: "content-writer",
    type: "started",
    title: "Drafting social media calendar",
    detail: "Planning 2 weeks of posts leading up to and through the holiday sale.",
    workspaceId: "holiday-campaign",
    taskId: "hc-3",
    timestamp: "2026-02-08T15:30:00Z",
  },
];
