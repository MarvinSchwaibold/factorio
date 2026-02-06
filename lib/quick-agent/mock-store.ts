import type { Product, Order, Customer, InventoryLevel, OrderLineItem } from "./types";

// ── Seed helpers ────────────────────────────────────────

let _counter = 1000;
const uid = () => `gid://shopify/${++_counter}`;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const money = (min: number, max: number) =>
  (Math.random() * (max - min) + min).toFixed(2);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// ── Product catalog ─────────────────────────────────────

const PRODUCT_DATA: {
  title: string;
  type: string;
  variants: string[];
  priceRange: [number, number];
}[] = [
  // Candles
  { title: "Cedar & Sage Candle", type: "Candle", variants: ["Small (4oz)", "Medium (8oz)", "Large (12oz)"], priceRange: [18, 42] },
  { title: "Lavender Fields Candle", type: "Candle", variants: ["Small (4oz)", "Medium (8oz)", "Large (12oz)"], priceRange: [18, 42] },
  { title: "Vanilla Bourbon Candle", type: "Candle", variants: ["Small (4oz)", "Large (12oz)"], priceRange: [22, 45] },
  { title: "Ocean Breeze Candle", type: "Candle", variants: ["Medium (8oz)", "Large (12oz)"], priceRange: [24, 42] },
  { title: "Fireside Ember Candle", type: "Candle", variants: ["Small (4oz)", "Medium (8oz)", "Large (12oz)"], priceRange: [20, 48] },
  { title: "Japanese Cherry Blossom Candle", type: "Candle", variants: ["Medium (8oz)"], priceRange: [28, 28] },
  { title: "Tobacco & Honey Candle", type: "Candle", variants: ["Small (4oz)", "Medium (8oz)", "Large (12oz)"], priceRange: [22, 48] },
  { title: "Fresh Linen Candle", type: "Candle", variants: ["Small (4oz)", "Medium (8oz)"], priceRange: [16, 32] },
  { title: "Midnight Jasmine Candle", type: "Candle", variants: ["Medium (8oz)", "Large (12oz)"], priceRange: [26, 44] },
  { title: "Pumpkin Spice Candle", type: "Candle", variants: ["Small (4oz)", "Medium (8oz)", "Large (12oz)"], priceRange: [18, 40] },
  { title: "Eucalyptus Mint Candle", type: "Candle", variants: ["Small (4oz)", "Medium (8oz)"], priceRange: [20, 34] },
  { title: "Woodsmoke Candle", type: "Candle", variants: ["Large (12oz)"], priceRange: [44, 44] },
  // Diffusers
  { title: "Reed Diffuser — Sandalwood", type: "Diffuser", variants: ["100ml", "200ml"], priceRange: [32, 54] },
  { title: "Reed Diffuser — Rose Garden", type: "Diffuser", variants: ["100ml", "200ml"], priceRange: [32, 54] },
  { title: "Reed Diffuser — Bergamot", type: "Diffuser", variants: ["100ml"], priceRange: [36, 36] },
  { title: "Electric Diffuser — Matte Black", type: "Diffuser", variants: ["Standard"], priceRange: [68, 68] },
  { title: "Electric Diffuser — Ceramic White", type: "Diffuser", variants: ["Standard"], priceRange: [72, 72] },
  // Accessories
  { title: "Wick Trimmer — Matte Black", type: "Accessory", variants: ["Standard"], priceRange: [14, 14] },
  { title: "Candle Snuffer — Brass", type: "Accessory", variants: ["Standard"], priceRange: [16, 16] },
  { title: "Match Cloche — Clear Glass", type: "Accessory", variants: ["Standard"], priceRange: [22, 22] },
  { title: "Candle Care Kit", type: "Accessory", variants: ["Standard"], priceRange: [38, 38] },
  { title: "Wooden Match Box Set", type: "Accessory", variants: ["Cedar", "Walnut"], priceRange: [12, 14] },
  // Gift Sets
  { title: "Signature Trio Gift Set", type: "Gift Set", variants: ["Standard"], priceRange: [85, 85] },
  { title: "Discovery Sampler (6-pack)", type: "Gift Set", variants: ["Standard"], priceRange: [64, 64] },
  { title: "Date Night Gift Box", type: "Gift Set", variants: ["Standard"], priceRange: [78, 78] },
  { title: "Housewarming Gift Set", type: "Gift Set", variants: ["Standard"], priceRange: [92, 92] },
  // Wax Melts
  { title: "Wax Melts — Cinnamon Chai", type: "Wax Melt", variants: ["6-pack", "12-pack"], priceRange: [10, 18] },
  { title: "Wax Melts — Coastal Driftwood", type: "Wax Melt", variants: ["6-pack", "12-pack"], priceRange: [10, 18] },
  { title: "Wax Melts — Wild Honeysuckle", type: "Wax Melt", variants: ["6-pack"], priceRange: [10, 10] },
  { title: "Wax Melts Variety Pack", type: "Wax Melt", variants: ["12-pack"], priceRange: [22, 22] },
];

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Sophia", "Jackson", "Isabella",
  "Lucas", "Mia", "Aiden", "Charlotte", "Ethan", "Amelia", "Harper", "Mason",
  "Ella", "Logan", "Aria", "James", "Luna", "Benjamin", "Chloe", "Elijah",
  "Penelope", "Oliver", "Layla", "Jacob", "Riley", "Michael", "Zoey", "Daniel",
  "Nora", "Henry", "Lily", "Sebastian", "Eleanor", "Caleb", "Hannah", "Owen",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Moore",
  "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Clark",
  "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott",
];

const CITIES = [
  { city: "Toronto", province: "ON", zip: "M5V 2H1" },
  { city: "Vancouver", province: "BC", zip: "V6B 1A1" },
  { city: "Montreal", province: "QC", zip: "H3B 1A7" },
  { city: "Calgary", province: "AB", zip: "T2P 1J9" },
  { city: "Ottawa", province: "ON", zip: "K1P 5G3" },
  { city: "New York", province: "NY", zip: "10001" },
  { city: "Los Angeles", province: "CA", zip: "90001" },
  { city: "Chicago", province: "IL", zip: "60601" },
  { city: "Portland", province: "OR", zip: "97201" },
  { city: "Austin", province: "TX", zip: "73301" },
];

const CUSTOMER_TAGS = [
  "vip", "wholesale", "repeat-buyer", "newsletter", "gift-buyer",
  "seasonal", "local", "influencer", "early-adopter", "b2b",
];

const LOCATIONS = [
  { id: "loc-warehouse", name: "Main Warehouse" },
  { id: "loc-retail", name: "Queen St Retail" },
];

// ── Generator ───────────────────────────────────────────

export interface MockStore {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  inventory: InventoryLevel[];
}

let _store: MockStore | null = null;

export function getMockStore(): MockStore {
  if (_store) return _store;
  _store = generateStore();
  return _store;
}

function generateStore(): MockStore {
  // ── Products ──
  const products: Product[] = PRODUCT_DATA.map((p, i) => {
    const status: Product["status"] = i < 26 ? "active" : pick(["active", "draft"]);
    const createdDays = rand(30, 365);
    const variants = p.variants.map((v, vi) => {
      const priceFraction = vi / Math.max(p.variants.length - 1, 1);
      const price = (
        p.priceRange[0] + priceFraction * (p.priceRange[1] - p.priceRange[0])
      ).toFixed(2);
      return {
        id: uid(),
        title: v,
        price,
        compareAtPrice: Math.random() > 0.7 ? (parseFloat(price) * 1.2).toFixed(2) : null,
        sku: `${p.type.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}-${String(vi + 1).padStart(2, "0")}`,
        inventoryQuantity: rand(0, 120),
      };
    });
    return {
      id: uid(),
      title: p.title,
      description: `Premium handcrafted ${p.type.toLowerCase()}. Made with natural ingredients.`,
      status,
      vendor: "Kaz's Candles",
      productType: p.type,
      tags: [p.type.toLowerCase(), ...(Math.random() > 0.5 ? ["bestseller"] : []), ...(Math.random() > 0.7 ? ["new-arrival"] : [])],
      variants,
      createdAt: daysAgo(createdDays),
      updatedAt: daysAgo(rand(0, createdDays)),
    };
  });

  // ── Customers ──
  const customers: Customer[] = Array.from({ length: 80 }, (_, i) => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const ordersCount = rand(0, 12);
    const totalSpent = (ordersCount * rand(25, 95)).toFixed(2);
    const createdDays = rand(5, 365);
    return {
      id: uid(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rand(1, 99)}@${pick(["gmail.com", "outlook.com", "yahoo.com", "icloud.com"])}`,
      firstName,
      lastName,
      ordersCount,
      totalSpent,
      tags: pickN(CUSTOMER_TAGS, rand(0, 3)),
      createdAt: daysAgo(createdDays),
      lastOrderAt: ordersCount > 0 ? daysAgo(rand(0, createdDays)) : null,
      state: "enabled",
    };
  });

  // ── Orders ──
  const activeProducts = products.filter((p) => p.status === "active");
  const orders: Order[] = Array.from({ length: 150 }, (_, i) => {
    const customer = pick(customers);
    const numItems = rand(1, 4);
    const lineItems: OrderLineItem[] = Array.from({ length: numItems }, () => {
      const product = pick(activeProducts);
      const variant = pick(product.variants);
      const qty = rand(1, 3);
      return {
        id: uid(),
        title: product.title,
        quantity: qty,
        price: variant.price,
        sku: variant.sku,
        variantTitle: variant.title,
      };
    });
    const subtotal = lineItems.reduce(
      (sum, li) => sum + parseFloat(li.price) * li.quantity,
      0
    );
    const tax = subtotal * 0.13;
    const total = subtotal + tax;
    const createdDays = rand(0, 90);
    const financial: Order["financialStatus"] = pick(["paid", "paid", "paid", "paid", "pending", "refunded"]);
    const fulfillment: Order["fulfillmentStatus"] =
      financial === "paid" ? pick(["fulfilled", "fulfilled", "fulfilled", "unfulfilled", "partial"]) : "unfulfilled";
    return {
      id: uid(),
      name: `#${1001 + i}`,
      email: customer.email,
      createdAt: daysAgo(createdDays),
      financialStatus: financial,
      fulfillmentStatus: fulfillment,
      totalPrice: total.toFixed(2),
      subtotalPrice: subtotal.toFixed(2),
      totalTax: tax.toFixed(2),
      currency: "CAD",
      lineItems,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
      tags: Math.random() > 0.8 ? [pick(["rush", "gift-wrap", "wholesale"])] : [],
    };
  });

  // ── Inventory ──
  const inventory: InventoryLevel[] = [];
  for (const product of products) {
    for (const variant of product.variants) {
      for (const location of LOCATIONS) {
        inventory.push({
          inventoryItemId: uid(),
          locationId: location.id,
          locationName: location.name,
          available: location.id === "loc-warehouse" ? variant.inventoryQuantity : rand(0, Math.floor(variant.inventoryQuantity / 3)),
          sku: variant.sku,
          productTitle: product.title,
          variantTitle: variant.title,
        });
      }
    }
  }

  return { products, orders, customers, inventory };
}
