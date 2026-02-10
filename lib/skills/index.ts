export interface Skill {
  id: string;
  name: string;
  description: string;
  markdown: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  markdown: string;
  status: "Active" | "Inactive";
  skills: Skill[];
  connected: boolean;
}

var sidekickOverview = `# Sidekick

Sidekick is an AI assistant built into the Shopify Admin. It understands your store's data and can answer questions, surface insights, and take actions on your behalf.

## How it works

Sidekick uses a **tool-use loop** — when you ask a question, it decides which tools to call (order lookups, product searches, analytics queries, etc.), executes them against the Shopify Admin API, and synthesizes the results into a natural-language response.

Each tool call is scoped to your store's data. Sidekick never accesses data outside your store or makes changes without confirmation.

## When to use it

- **Quick lookups** — "What's the status of order #1042?" instead of navigating to the orders page
- **Aggregations** — "How many orders did we get last week?" without building a report
- **Comparisons** — "How is product X performing vs product Y?"
- **Triage** — "Are there any orders that need attention?" to surface unfulfilled or flagged items

## Limitations

- Read-only by default — Sidekick can look up data but won't modify orders, products, or settings unless you explicitly enable write actions
- Scoped to Admin API — it can't access third-party apps, custom storefronts, or external services
- Context window — very long conversations may lose earlier context; start a new chat for unrelated questions`;

var storeOpsMarkdown = `# Store Operations

The **Store Operations** skill gives Sidekick deep knowledge of your store's day-to-day commerce data and the ability to act on it.

## Capabilities

### Order Management
- Look up orders by ID, customer, or date range
- Summarize recent order activity and fulfillment status
- Flag orders that need attention (unfulfilled, high-value, at-risk)

### Product Catalog
- Search and browse products by title, type, vendor, or tag
- Surface inventory levels and low-stock warnings
- Compare product performance (revenue, units sold, conversion)

### Customer Insights
- Retrieve customer profiles and purchase history
- Identify top customers by lifetime value
- Segment customers by recency, frequency, and monetary value

### Inventory Tracking
- Check current stock levels across variants
- Alert on items approaching reorder thresholds
- Summarize inventory movement over a given period

### Analytics & Reporting
- Generate sales summaries (daily, weekly, monthly)
- Break down revenue by product, channel, or region
- Highlight trends — what's growing, what's declining

## Example Prompts

| Prompt | What Sidekick does |
|---|---|
| "Show me yesterday's orders" | Fetches and summarizes orders from the last 24 hours |
| "Which products are low on stock?" | Scans inventory for items below reorder threshold |
| "Who are my top 5 customers?" | Ranks customers by lifetime spend |
| "How did sales trend this week vs last?" | Compares weekly revenue and highlights changes |

## Data Sources

This skill reads from the store's **Orders**, **Products**, **Customers**, and **Inventory** data via the Shopify Admin API. All queries are scoped to the currently authenticated store.`;

export var skills: Record<string, Skill> = {
  "sidekick-store-ops": {
    id: "sidekick-store-ops",
    name: "Store Operations",
    description: "Day-to-day commerce data — orders, products, customers, inventory",
    markdown: storeOpsMarkdown,
  },
  "analyst-cohorts": {
    id: "analyst-cohorts",
    name: "Cohort Analysis",
    description: "Group customers by behavior, acquisition, and retention patterns",
    markdown: "# Cohort Analysis\n\nSegment customers into cohorts by acquisition date, first purchase, or behavioral triggers. Track retention and repeat purchase rates over time to understand which channels and campaigns produce the highest-value customers.",
  },
  "analyst-forecasting": {
    id: "analyst-forecasting",
    name: "Trend Forecasting",
    description: "Project revenue, volume, and traffic from historical patterns",
    markdown: "# Trend Forecasting\n\nUse historical sales, traffic, and order data to project future performance. Detect seasonality, flag anomalies, and highlight upcoming peaks or dips so you can plan inventory and marketing spend accordingly.",
  },
  "writer-product-copy": {
    id: "writer-product-copy",
    name: "Product Copy",
    description: "SEO-friendly product descriptions matched to your brand voice",
    markdown: "# Product Copy\n\nGenerate compelling product descriptions from basic attributes like title, type, and tags. Matches your existing brand tone and creates variant-specific copy for different audiences and channels.",
  },
  "writer-email": {
    id: "writer-email",
    name: "Email Campaigns",
    description: "Subject lines, body copy, and sequences for lifecycle emails",
    markdown: "# Email Campaigns\n\nWrite subject lines, preview text, and body copy for transactional and marketing emails. Create sequences for welcome series, abandoned cart recovery, and win-back flows with A/B test variations.",
  },
  "planner-demand": {
    id: "planner-demand",
    name: "Demand Forecasting",
    description: "Project future demand per SKU from sales velocity and seasonality",
    markdown: "# Demand Forecasting\n\nProject future demand for each SKU based on historical sales velocity, seasonal patterns, and upcoming events. Account for promotions, launches, and holidays to avoid stockouts or overstock situations.",
  },
  "planner-reorder": {
    id: "planner-reorder",
    name: "Reorder Management",
    description: "Calculate optimal reorder points, quantities, and purchase order drafts",
    markdown: "# Reorder Management\n\nCalculate optimal reorder points and quantities for each variant, factoring in supplier lead times, reliability scores, and safety stock levels. Generate purchase order drafts ready for review.",
  },
  "support-triage": {
    id: "support-triage",
    name: "Ticket Triage",
    description: "Categorize and prioritize incoming support tickets automatically",
    markdown: "# Ticket Triage\n\nAutomatically categorize incoming tickets by topic (shipping, returns, product questions, billing), prioritize by urgency and customer value, and route to the right team or workflow.",
  },
  "support-drafts": {
    id: "support-drafts",
    name: "Reply Drafts",
    description: "Context-aware response drafts based on ticket and order history",
    markdown: "# Reply Drafts\n\nGenerate response drafts that incorporate ticket content, customer profile, and order history. Suggest resolutions with links to relevant help articles while maintaining a consistent tone across all communications.",
  },
};

var merchantAnalystMarkdown = `# Business Analyst

Business Analyst is a data-focused agent that helps you understand your store's performance through deep analytics, cohort analysis, and trend forecasting.

## Capabilities

### Cohort Analysis
- Group customers by acquisition date, first purchase, or behavior
- Track retention and repeat purchase rates across cohorts
- Identify which acquisition channels produce the highest-value customers

### Trend Forecasting
- Project revenue, order volume, and traffic based on historical patterns
- Detect seasonality and highlight upcoming peaks or dips
- Flag anomalies — sudden spikes or drops that need attention

### Deep-Dive Reports
- Break down performance by product category, region, or marketing channel
- Compare time periods with automatic variance analysis
- Generate executive-ready summaries with key takeaways

## When to use it

- Monthly and quarterly business reviews
- Planning inventory for upcoming seasons
- Evaluating the ROI of marketing campaigns
- Understanding customer lifetime value trends`;

var contentWriterMarkdown = `# Content Writer

Content Writer helps you create compelling product descriptions, blog posts, email campaigns, and other marketing copy tailored to your brand voice.

## Capabilities

### Product Descriptions
- Generate SEO-friendly product copy from basic attributes
- Match your existing brand tone and style
- Create variant-specific descriptions for different audiences

### Blog & Editorial
- Draft blog posts from a topic or outline
- Suggest headlines and meta descriptions
- Structure long-form content with proper headings and flow

### Email Campaigns
- Write subject lines, preview text, and body copy
- Create sequences for welcome series, abandoned cart, and win-back flows
- A/B test variations for key messages

## When to use it

- Launching new products that need descriptions
- Building out your content marketing calendar
- Creating email flows for customer lifecycle stages
- Refreshing stale or underperforming copy`;

var inventoryPlannerMarkdown = `# Inventory Planner

Inventory Planner helps you stay ahead of stock levels by forecasting demand, flagging reorder points, and optimizing purchasing decisions.

## Capabilities

### Demand Forecasting
- Project future demand per SKU based on sales velocity and seasonality
- Account for upcoming promotions, launches, and holidays
- Flag slow-moving inventory that may need markdowns

### Reorder Management
- Calculate optimal reorder points and quantities per variant
- Factor in lead times, supplier reliability, and safety stock
- Generate purchase order drafts ready for review

### Stock Health
- Surface dead stock and overstock risks before they become problems
- Track sell-through rates across product categories
- Compare planned vs actual inventory turnover

## When to use it

- Planning purchases for the next quarter or season
- Running lean on cash flow and need precise reorder timing
- Preparing for a sale or launch with demand spikes
- Auditing current inventory health across your catalog`;

var supportAgentMarkdown = `# Support Agent

Support Agent helps you manage customer inquiries by triaging tickets, drafting replies, and identifying issues that need escalation.

## Capabilities

### Ticket Triage
- Categorize incoming tickets by topic (shipping, returns, product questions, billing)
- Prioritize by urgency and customer value
- Route to the right team or workflow automatically

### Draft Replies
- Generate context-aware response drafts based on ticket content and order history
- Suggest resolutions with links to relevant help articles
- Maintain consistent tone across all customer communications

### Escalation Detection
- Flag tickets that indicate systemic issues (multiple complaints about the same product or shipment)
- Identify VIP customers who need priority handling
- Surface trending topics across your support queue

## When to use it

- Managing high-volume support periods (sales events, launches)
- Maintaining fast response times with draft assistance
- Spotting product or fulfillment issues early through ticket patterns
- Onboarding new support team members with guided responses`;

export var agents: Agent[] = [
  {
    id: "sidekick",
    name: "Sidekick",
    description: "Your AI assistant for store operations",
    markdown: sidekickOverview,
    status: "Active",
    skills: [skills["sidekick-store-ops"]],
    connected: true,
  },
  {
    id: "merchant-analyst",
    name: "Business Analyst",
    description: "Deep-dive analytics, cohort analysis, and trend forecasting",
    markdown: merchantAnalystMarkdown,
    status: "Inactive",
    skills: [skills["analyst-cohorts"], skills["analyst-forecasting"]],
    connected: false,
  },
  {
    id: "content-writer",
    name: "Content Writer",
    description: "Product descriptions, blog posts, and email campaigns",
    markdown: contentWriterMarkdown,
    status: "Inactive",
    skills: [skills["writer-product-copy"], skills["writer-email"]],
    connected: false,
  },
  {
    id: "support-agent",
    name: "Support Agent",
    description: "Customer ticket triage, draft replies, and escalation",
    markdown: supportAgentMarkdown,
    status: "Inactive",
    skills: [skills["support-triage"], skills["support-drafts"]],
    connected: false,
  },
  {
    id: "inventory-planner",
    name: "Inventory Planner",
    description: "Demand forecasting, reorder management, and stock health",
    markdown: inventoryPlannerMarkdown,
    status: "Inactive",
    skills: [skills["planner-demand"], skills["planner-reorder"]],
    connected: false,
  },
];
