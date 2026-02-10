import type { NodeCategory, NodeCategoryDef } from "./types";

// Visual definitions for each merchant infrastructure node category
// Each has 3-face isometric colors (top, left, right) for the building rendering
export const NODE_CATEGORIES: NodeCategoryDef[] = [
  {
    category: "online-store",
    label: "Online Store",
    icon: "monitor",
    colorTop: "#5eead4",    // teal-300
    colorLeft: "#0d9488",   // teal-600
    colorRight: "#0f766e",  // teal-700
    colorStroke: "#134e4a",
  },
  {
    category: "retail",
    label: "Retail",
    icon: "store",
    colorTop: "#fcd34d",    // amber-300
    colorLeft: "#d97706",   // amber-600
    colorRight: "#b45309",  // amber-700
    colorStroke: "#78350f",
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
    category: "marketing",
    label: "Marketing",
    icon: "megaphone",
    colorTop: "#f9a8d4",    // pink-300
    colorLeft: "#db2777",   // pink-600
    colorRight: "#be185d",  // pink-700
    colorStroke: "#831843",
  },
  {
    category: "shipping",
    label: "Shipping",
    icon: "truck",
    colorTop: "#86efac",    // green-300
    colorLeft: "#16a34a",   // green-600
    colorRight: "#15803d",  // green-700
    colorStroke: "#14532d",
  },
];

export function getCategoryDef(category: NodeCategory): NodeCategoryDef {
  var found = NODE_CATEGORIES.filter(function(c) { return c.category === category; });
  return found.length > 0 ? found[0] : NODE_CATEGORIES[0];
}
