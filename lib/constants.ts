import type { Scenario, WorkflowState } from "./types";

export const GRID_SIZE = 20;
export const WIDGET_GAP = 20;
export const TASK_ROW_HEIGHT = 100;
export const TASK_CONNECTION_Y = 45;
export const AGENT_CENTER_Y = 220;
export const CONNECTION_LINE_Y = TASK_CONNECTION_Y;
export const CONNECTION_WIDTH = 160;
export const CONNECTION_BEND_X = 80;
export const SUB_TASK_ROW_HEIGHT = GRID_SIZE * 4; // 80px
export const SUB_CONNECTION_WIDTH = GRID_SIZE * 4; // 80px

export const scenarios: Scenario[] = [
  {
    id: "email-campaign",
    buttonLabel: "Send Email Campaign",
    side: "right",
    tasks: [
      { label: "[ANALYZING CAMPAIGN GOALS]", subtext: "Setting objectives", duration: 1500 },
      { label: "[CRAFTING EMAIL COPY]", subtext: "Generating content", duration: 2000 },
      { label: "[REVIEW EMAIL COPY]", subtext: "AI generated draft", duration: 0, requiresResolve: true, resolveType: "email_copy" },
      { label: "[CREATING EMAIL LAYOUT]", subtext: "Designing template", duration: 2000 },
      { label: "[OPTIMIZING SUBJECT LINE]", subtext: "A/B testing options", duration: 1800 },
      { label: "[SEGMENTING AUDIENCE]", subtext: "Analyzing customers", duration: 1800 },
      { label: "[REVIEW AUDIENCE]", subtext: "2,847 recipients selected", duration: 0, requiresApproval: true },
      { label: "[PERSONALIZING CONTENT]", subtext: "Dynamic variables", duration: 1500 },
      { label: "[SETTING UP TRACKING]", subtext: "Analytics configuration", duration: 1200 },
      { label: "[SCHEDULING DELIVERY]", subtext: "Optimizing send time", duration: 1500 },
      { label: "[SEND CAMPAIGN]", subtext: "Ready to dispatch 2,847 emails", duration: 0, requiresApproval: true },
    ]
  },
  {
    id: "analyze-sales",
    buttonLabel: "Analyze Sales Data",
    side: "left",
    tasks: [
      { label: "[FETCHING SALES DATA]", subtext: "Connecting to Shopify", duration: 1500 },
      { label: "[PROCESSING METRICS]", subtext: "Calculating KPIs", duration: 2000 },
      { label: "[IDENTIFYING TRENDS]", subtext: "Pattern recognition", duration: 2500 },
      { label: "[REVIEW INSIGHTS]", subtext: "5 key findings detected", duration: 0, requiresResolve: true, resolveType: "insights" },
      { label: "[GENERATING REPORT]", subtext: "Creating PDF", duration: 1500 },
    ]
  },
  {
    id: "inventory-check",
    buttonLabel: "Check Inventory",
    side: "right",
    tasks: [
      { label: "[SCANNING INVENTORY]", subtext: "Reading stock levels", duration: 1800 },
      { label: "[LOW STOCK ALERT]", subtext: "12 items below threshold", duration: 0, requiresResolve: true, resolveType: "inventory" },
      { label: "[PREDICTING DEMAND]", subtext: "Forecasting sales", duration: 2200 },
      { label: "[CONFIRM REORDER]", subtext: "$4,230 purchase order", duration: 0, requiresApproval: true },
    ]
  },
  {
    id: "product-catalog",
    buttonLabel: "Product Catalog",
    side: "left",
    tasks: [
      { label: "[IMPORTING PRODUCTS]", subtext: "Uploading 47 new items", duration: 2000 },
      { label: "[GENERATING DESCRIPTIONS]", subtext: "AI writing product copy", duration: 2500 },
      { label: "[REVIEW DESCRIPTIONS]", subtext: "Check AI-generated content", duration: 0, requiresResolve: true, resolveType: "product_descriptions" },
      { label: "[OPTIMIZING IMAGES]", subtext: "Resizing & compressing", duration: 1800 },
      { label: "[CREATING VARIANTS]", subtext: "Sizes, colors, materials", duration: 2200 },
      { label: "[CALCULATING PRICING]", subtext: "Market analysis & margins", duration: 1500 },
      { label: "[REVIEW PRICING]", subtext: "Approve pricing strategy", duration: 0, requiresApproval: true },
      { label: "[PUBLISHING CATALOG]", subtext: "47 products ready to go live", duration: 1600 },
    ]
  }
];

export const subWorkflowConfigs: Record<string, { tasks: { label: string; subtext?: string; duration: number }[] }> = {
  inventory: {
    tasks: [
      { label: "[ANALYZING STOCK]", subtext: "Checking levels", duration: 1200 },
      { label: "[FINDING SUPPLIERS]", subtext: "Best prices", duration: 1500 },
      { label: "[CREATING PO]", subtext: "Purchase order", duration: 1000 },
      { label: "[RESOLVED]", subtext: "Ready to continue", duration: 800 },
    ]
  },
  insights: {
    tasks: [
      { label: "[DEEP ANALYSIS]", subtext: "Statistical review", duration: 1000 },
      { label: "[GENERATING CHARTS]", subtext: "Visualizations", duration: 1200 },
      { label: "[SUMMARY]", subtext: "Key takeaways", duration: 800 },
    ]
  },
  email_copy: {
    tasks: [] // Email copy uses a special preview widget instead
  },
  product_descriptions: {
    tasks: [
      { label: "[CHECKING SEO]", subtext: "Optimizing keywords", duration: 1200 },
      { label: "[TONE ADJUSTMENT]", subtext: "Brand voice alignment", duration: 1000 },
      { label: "[ENRICHING DETAILS]", subtext: "Adding specifications", duration: 1400 },
      { label: "[RESOLVED]", subtext: "Descriptions approved", duration: 800 },
    ]
  }
};

export const initialWorkflowState: WorkflowState = {
  isRunning: false,
  tasks: [],
  lineProgress: 0,
  awaitingApproval: false,
  isCompleted: false,
  isCollapsing: false,
  completedScenarioLabel: "",
  currentScenarioLabel: "",
  subWorkflowActive: false,
  subWorkflowTasks: [],
  subWorkflowCollapsing: false,
  resolveTaskIndex: null,
  resolveType: null,
  insightsApplied: false,
  deepCleanComplete: false,
};

export const cleanLabels = [
  // Inventory & Stock
  "[SYNCING INVENTORY]", "[FIXING STOCK COUNTS]", "[RESOLVING OVERSELLS]", "[UPDATING SKU DATA]",
  "[RESYNCING WAREHOUSES]", "[CLEARING GHOST STOCK]", "[FIXING VARIANT LINKS]", "[RECONCILING COUNTS]",
  // Orders & Fulfillment
  "[FIXING STUCK ORDERS]", "[CLEARING ORDER QUEUE]", "[RESOLVING DUPLICATES]", "[UPDATING TRACKING]",
  "[SYNCING FULFILLMENTS]", "[FIXING FAILED ORDERS]", "[CLEARING DRAFT ORDERS]", "[RETRYING WEBHOOKS]",
  // Products & Catalog
  "[FIXING BROKEN IMAGES]", "[RESYNCING PRODUCTS]", "[UPDATING METAFIELDS]", "[CLEANING DEAD LINKS]",
  "[FIXING SEO HANDLES]", "[REBUILDING SEARCH INDEX]", "[CLEARING PRODUCT CACHE]", "[FIXING COLLECTIONS]",
  // Payments & Transactions
  "[RETRYING PAYMENTS]", "[FIXING FAILED CAPTURES]", "[RECONCILING REFUNDS]", "[CLEARING PENDING TXN]",
  "[UPDATING TAX RATES]", "[FIXING CURRENCY RATES]", "[SYNCING PAYOUTS]", "[RESOLVING DISPUTES]",
  // Customers & Data
  "[MERGING DUPLICATES]", "[CLEANING GUEST DATA]", "[FIXING EMAIL TAGS]", "[UPDATING SEGMENTS]",
  "[SYNCING LOYALTY POINTS]", "[CLEARING ABANDONED CARTS]", "[FIXING ACCOUNT LINKS]", "[PRUNING OLD DATA]",
  // Shipping & Rates
  "[RECALCULATING RATES]", "[FIXING ZONE ERRORS]", "[UPDATING CARRIERS]", "[SYNCING LABELS]",
  "[CLEARING RATE CACHE]", "[FIXING WEIGHT ISSUES]", "[UPDATING DIMENSIONS]", "[RESOLVING DELAYS]",
  // Discounts & Pricing
  "[FIXING DISCOUNT CONFLICTS]", "[CLEARING EXPIRED CODES]", "[RECALCULATING PRICES]", "[SYNCING SALES]",
  "[FIXING BUNDLE PRICES]", "[UPDATING PRICE RULES]", "[RESOLVING PROMO ERRORS]", "[CLEARING DUPLICATES]",
  // Integrations & Apps
  "[RESYNCING APPS]", "[FIXING API ERRORS]", "[CLEARING STALE TOKENS]", "[RETRYING SYNC JOBS]",
  "[UPDATING WEBHOOKS]", "[FIXING OAUTH ISSUES]", "[RECONNECTING CHANNELS]", "[RESOLVING CONFLICTS]"
];

export const cleanSubtexts = [
  "Syncing data...", "Checking records...", "Resolving conflicts...", "Updating store...", "Processing...",
  "Fixing issues...", "Validating data...", "Reconciling...", "Retrying failed...", "Cleaning up...",
  "Rebuilding index...", "Refreshing cache...", "Merging records...", "Recalculating...", "Reconnecting...",
  "Verifying integrity...", "Updating references...", "Clearing stale...", "Patching errors...", "Finalizing..."
];
