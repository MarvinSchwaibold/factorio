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
};

export var agents: Agent[] = [
  {
    id: "sidekick",
    name: "Sidekick",
    description: "Your AI assistant for store operations",
    markdown: sidekickOverview,
    status: "Active",
    skills: [skills["sidekick-store-ops"]],
  },
];
