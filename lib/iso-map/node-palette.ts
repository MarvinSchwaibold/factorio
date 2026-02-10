import type { NodeCategory, NodeCategoryDef } from "./types";

// Visual definitions for each node category
// Each has 3-face isometric colors (top, left, right) for the cube rendering
export const NODE_CATEGORIES: NodeCategoryDef[] = [
  {
    category: "store",
    label: "Store",
    icon: "store",
    colorTop: "#5eead4",    // teal-300
    colorLeft: "#0d9488",   // teal-600
    colorRight: "#0f766e",  // teal-700
    colorStroke: "#134e4a",
  },
  {
    category: "warehouse",
    label: "Warehouse",
    icon: "warehouse",
    colorTop: "#a5b4fc",    // indigo-300
    colorLeft: "#4f46e5",   // indigo-600
    colorRight: "#4338ca",  // indigo-700
    colorStroke: "#312e81",
  },
  {
    category: "fulfillment",
    label: "Fulfillment",
    icon: "package",
    colorTop: "#fcd34d",    // amber-300
    colorLeft: "#d97706",   // amber-600
    colorRight: "#b45309",  // amber-700
    colorStroke: "#78350f",
  },
  {
    category: "marketing",
    label: "Marketing",
    icon: "megaphone",
    colorTop: "#f9a8d4",    // pink-300
    colorLeft: "#db2777",   // pink-600
    colorRight: "#be185d",  // pink-700
    colorStroke: "#831843",
  },
  {
    category: "payment",
    label: "Payment",
    icon: "credit-card",
    colorTop: "#86efac",    // green-300
    colorLeft: "#16a34a",   // green-600
    colorRight: "#15803d",  // green-700
    colorStroke: "#14532d",
  },
  {
    category: "shipping",
    label: "Shipping",
    icon: "truck",
    colorTop: "#93c5fd",    // blue-300
    colorLeft: "#2563eb",   // blue-600
    colorRight: "#1d4ed8",  // blue-700
    colorStroke: "#1e3a5f",
  },
  {
    category: "analytics",
    label: "Analytics",
    icon: "bar-chart-3",
    colorTop: "#c4b5fd",    // purple-300
    colorLeft: "#7c3aed",   // purple-600
    colorRight: "#6d28d9",  // purple-700
    colorStroke: "#4c1d95",
  },
  {
    category: "custom",
    label: "Custom",
    icon: "box",
    colorTop: "#d4d4d4",    // gray-300
    colorLeft: "#525252",   // gray-600
    colorRight: "#404040",  // gray-700
    colorStroke: "#262626",
  },
];

export function getCategoryDef(category: NodeCategory): NodeCategoryDef {
  var found = NODE_CATEGORIES.filter(function(c) { return c.category === category; });
  return found.length > 0 ? found[0] : NODE_CATEGORIES[NODE_CATEGORIES.length - 1];
}
