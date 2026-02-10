import type { NodeCategory, NodeCategoryDef } from "./types";

// Visual definitions for each admin nav node category
// Each has a primary accent color and a muted tint for card backgrounds
export var NODE_CATEGORIES: NodeCategoryDef[] = [
  // ── Center hub ──
  {
    category: "back-office",
    label: "Admin",
    icon: "A",
    color: "#5E8E3E",       // Shopify green
    colorMuted: "#b8d99a",  // light green
  },
  // ── Core commerce ──
  {
    category: "orders",
    nodeType: "core",
    label: "Orders",
    icon: "O",
    color: "#ea580c",       // orange-600
    colorMuted: "#fed7aa",  // orange-200
  },
  {
    category: "products",
    nodeType: "core",
    label: "Products",
    icon: "P",
    color: "#7c3aed",       // violet-600
    colorMuted: "#ddd6fe",  // violet-200
  },
  {
    category: "customers",
    nodeType: "core",
    label: "Customers",
    icon: "C",
    color: "#2563eb",       // blue-600
    colorMuted: "#bfdbfe",  // blue-200
  },
  // ── Growth ──
  {
    category: "marketing",
    nodeType: "core",
    label: "Marketing",
    icon: "M",
    color: "#db2777",       // pink-600
    colorMuted: "#fbcfe8",  // pink-200
  },
  {
    category: "discounts",
    nodeType: "core",
    label: "Discounts",
    icon: "%",
    color: "#e11d48",       // rose-600
    colorMuted: "#fecdd3",  // rose-200
  },
  {
    category: "content",
    nodeType: "core",
    label: "Content",
    icon: "I",
    color: "#4f46e5",       // indigo-600
    colorMuted: "#c7d2fe",  // indigo-200
  },
  // ── Platform ──
  {
    category: "markets",
    nodeType: "core",
    label: "Markets",
    icon: "G",
    color: "#0891b2",       // cyan-600
    colorMuted: "#a5f3fc",  // cyan-200
  },
  {
    category: "finance",
    nodeType: "core",
    label: "Finance",
    icon: "F",
    color: "#059669",       // emerald-600
    colorMuted: "#a7f3d0",  // emerald-200
  },
  {
    category: "analytics",
    nodeType: "core",
    label: "Analytics",
    icon: "A",
    color: "#d97706",       // amber-600
    colorMuted: "#fde68a",  // amber-200
  },
  // ── Sales Channels (blues/teals) ──
  {
    category: "online-store",
    nodeType: "channel",
    label: "Online Store",
    icon: "S",
    color: "#0284c7",       // sky-600
    colorMuted: "#bae6fd",  // sky-200
  },
  {
    category: "pos",
    nodeType: "channel",
    label: "Point of Sale",
    icon: "P",
    color: "#0d9488",       // teal-600
    colorMuted: "#99f6e4",  // teal-200
  },
  {
    category: "shop-channel",
    nodeType: "channel",
    label: "Shop",
    icon: "S",
    color: "#6366f1",       // indigo-500
    colorMuted: "#c7d2fe",  // indigo-200
  },
  {
    category: "facebook-instagram",
    nodeType: "channel",
    label: "Facebook & Instagram",
    icon: "F",
    color: "#1877f2",       // FB blue
    colorMuted: "#bfdbfe",  // blue-200
  },
  {
    category: "google-youtube",
    nodeType: "channel",
    label: "Google & YouTube",
    icon: "G",
    color: "#ea4335",       // Google red
    colorMuted: "#fecaca",  // red-200
  },
  {
    category: "tiktok",
    nodeType: "channel",
    label: "TikTok",
    icon: "T",
    color: "#010101",       // TikTok black
    colorMuted: "#d4d4d4",  // gray-300
  },
  // ── Apps (purples/grays) ──
  {
    category: "app-klaviyo",
    nodeType: "app",
    label: "Klaviyo",
    icon: "K",
    color: "#8b5cf6",       // violet-500
    colorMuted: "#ddd6fe",  // violet-200
  },
  {
    category: "app-judgeme",
    nodeType: "app",
    label: "Judge.me",
    icon: "J",
    color: "#f59e0b",       // amber-500
    colorMuted: "#fde68a",  // amber-200
  },
  {
    category: "app-flow",
    nodeType: "app",
    label: "Shopify Flow",
    icon: "Z",
    color: "#6366f1",       // indigo-500
    colorMuted: "#c7d2fe",  // indigo-200
  },
  // ── Agents ──
  {
    category: "agent-sidekick",
    nodeType: "agent",
    label: "Sidekick",
    icon: "S",
    color: "#8b5cf6",       // violet-500
    colorMuted: "#ede9fe",  // violet-100
  },
];

export function getCategoryDef(category: NodeCategory): NodeCategoryDef {
  var found = NODE_CATEGORIES.filter(function(c) { return c.category === category; });
  return found.length > 0 ? found[0] : NODE_CATEGORIES[0];
}
