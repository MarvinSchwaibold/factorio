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
  status: "Active" | "Inactive";
  skills: Skill[];
}

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
    status: "Active",
    skills: [skills["sidekick-store-ops"]],
  },
];
