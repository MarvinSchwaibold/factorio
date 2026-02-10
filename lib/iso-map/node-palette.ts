import type { NodeCategory, NodeCategoryDef } from "./types";

// Visual definitions for each merchant infrastructure node category
// Each has a primary accent color and a muted tint for card backgrounds
export var NODE_CATEGORIES: NodeCategoryDef[] = [
  // ── Core (always present) ──
  {
    category: "back-office",
    label: "Back Office",
    icon: "B",
    color: "#64748b",       // slate-500
    colorMuted: "#cbd5e1",  // slate-300
  },
  {
    category: "online-store",
    label: "Online Store",
    icon: "S",
    color: "#0d9488",       // teal-600
    colorMuted: "#99f6e4",  // teal-200
  },
  // ── Revenue Path ──
  {
    category: "checkout",
    label: "Checkout",
    icon: "C",
    color: "#ea580c",       // orange-600
    colorMuted: "#fed7aa",  // orange-200
  },
  {
    category: "payments",
    label: "Payments",
    icon: "P",
    color: "#059669",       // emerald-600
    colorMuted: "#a7f3d0",  // emerald-200
  },
  {
    category: "balance",
    label: "Balance",
    icon: "$",
    color: "#0284c7",       // sky-600
    colorMuted: "#bae6fd",  // sky-200
  },
  // ── Acquisition ──
  {
    category: "marketing",
    label: "Marketing",
    icon: "M",
    color: "#db2777",       // pink-600
    colorMuted: "#fbcfe8",  // pink-200
  },
  {
    category: "retail",
    label: "Retail",
    icon: "R",
    color: "#d97706",       // amber-600
    colorMuted: "#fde68a",  // amber-200
  },
  // ── Operations ──
  {
    category: "inventory",
    label: "Inventory",
    icon: "I",
    color: "#4f46e5",       // indigo-600
    colorMuted: "#c7d2fe",  // indigo-200
  },
  {
    category: "shipping",
    label: "Shipping",
    icon: "T",
    color: "#16a34a",       // green-600
    colorMuted: "#bbf7d0",  // green-200
  },
  // ── Financial ──
  {
    category: "tax",
    label: "Tax",
    icon: "X",
    color: "#7c3aed",       // violet-600
    colorMuted: "#ddd6fe",  // violet-200
  },
  {
    category: "billing",
    label: "Billing",
    icon: "B",
    color: "#4b5563",       // gray-600
    colorMuted: "#d1d5db",  // gray-300
  },
  {
    category: "capital",
    label: "Capital",
    icon: "K",
    color: "#b45309",       // amber-700
    colorMuted: "#fde68a",  // amber-200
  },
];

export function getCategoryDef(category: NodeCategory): NodeCategoryDef {
  var found = NODE_CATEGORIES.filter(function(c) { return c.category === category; });
  return found.length > 0 ? found[0] : NODE_CATEGORIES[0];
}
