# Shopify Admin Commerce Objects

> A reference guide to the commerce objects (primitives) supported in the Shopify Admin, their domain ownership, relationships, and strategic role in the Commerce OS.

**Source:** Vault internal documentation (Commerce OS RFC, Systems of Work & Truth, Orders Domain Boundaries, Next Gen Events Framework, Admin Design docs, Product Docs assignments, and more)

---

## The Commerce OS Model

Shopify operates as a **Commerce Operating System** built in three layers:

| Layer | Description | Examples |
|-------|-------------|---------|
| **Kernel / Primitives** | The building blocks of commerce | Orders, Products, Customers, Inventory |
| **Platform / Interfaces** | APIs and tools to work with commerce models | Admin API (GraphQL + REST), Storefront API |
| **Applications / Apps** | User-facing workflows and experiences | 1P features, 3P apps, channels |

---

## Systems of Work & Truth

Shopify has defined its strategic relationship to core data types:

| Data Type | System of Work | System of Truth | What This Means |
|-----------|:-:|:-:|-----------------|
| **Order** | Yes | Yes | Shopify is the place merchants create, update, and trust order data |
| **Customer** | -- | Yes | Shopify has complete, accurate, up-to-date customer records |
| **Inventory** | -- | Yes | Shopify is the trusted source for inventory state |
| **Product** | -- | Yes | Shopify is the trusted source for product catalog data |
| **Content** | -- | Yes | Shopify is the trusted source for content data |

**System of Truth (SOT):** Reads are trustworthy; data is accurate and complete.
**System of Work (SOW):** SOT + merchants can create/update instances and changes propagate to connected systems.

---

## Commerce Objects by Domain

### 1. Merchandising

The objects that let merchants define *what* they sell.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **Product** | The core item a merchant sells | Has many Variants, Images, belongs to Collections |
| **ProductVariant** | A specific version of a product (size, color, etc.) | Belongs to Product, has InventoryItem |
| **Collection** | A grouping of products (manual or automated) | Has many Products |
| **ProductImage / Media** | Visual assets for products | Belongs to Product |
| **ProductOption** | Options like Size, Color that generate variants | Belongs to Product |
| **PriceList** | Custom pricing for B2B or market-specific pricing | Used by Markets, B2B |
| **Catalog** | A curated product assortment for a specific context | Used by Markets |

**Domain ownership:** Merchandising (Products & Pricing, Discovery Experience)
**Admin nav:** Products, Collections

---

### 2. Orders & Returns

The objects that represent *transactions* and post-purchase workflows.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **Order** | A completed transaction record | Has LineItems, Fulfillments, Refunds, Customer |
| **LineItem** | A single product line within an order | Belongs to Order, references ProductVariant |
| **DraftOrder** | A merchant-created order before completion | Converts to Order via checkout |
| **Refund** | A reimbursement of funds to a buyer | Belongs to Order, has RefundLineItems |
| **Return** | A formal return process | Belongs to Order, has ReverseDelivery, ReverseFulfillmentOrder |
| **Exchange** | Swapping returned items for new ones | Related to Return and Order |
| **Sale / SaleAgreement** | Financial record of a sale event | Powers analytics and financial reporting |

**Primitives owned by Orders team:**
- Return, Reverse Delivery, Reverse Fulfillment Order, Return Reason
- Refund, Refund Line Item, Refund Shipping Line, Refund Duty
- Exchange, Exchange Line Item
- Sale Agreement, Sale, Sale Tax, Sale Discount

**GraphQL Queries:** `order`, `orders`, `refund`, `return`, `reverseDelivery`, `reverseFulfillmentOrder`

**Admin nav:** Orders

---

### 3. Customers

The objects representing *who* merchants sell to.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **Customer** | A person who has interacted with the store | Has Orders, Addresses, Segments |
| **CustomerSegment** | A dynamic or static grouping of customers | Defined by queries |
| **CustomerAddress** | Shipping/billing addresses | Belongs to Customer |
| **Company** | A B2B business entity | Has CompanyLocations, CompanyContacts |
| **CompanyLocation** | A specific location within a B2B company | Belongs to Company, has payment terms |
| **CompanyContact** | A person at a B2B company | Links Customer to Company |

**Admin nav:** Customers

---

### 4. Inventory

The objects tracking *where* and *how much* stock exists.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **InventoryItem** | A trackable unit of inventory | Linked to ProductVariant (different domain) |
| **InventoryLevel** | Stock quantity at a specific location | Links InventoryItem to Location |
| **Location** | A physical place or app where inventory is stocked | Has InventoryLevels, can fulfill orders |

**Note:** InventoryItem exists in the **Inventory domain**, separate from ProductVariant (Merchandising domain). This cross-domain relationship means InventoryItem gets its own webhook topic despite being linked to variants.

**Admin nav:** Products > Inventory, Settings > Locations

---

### 5. Fulfillment & Delivery

The objects managing *how* orders get to buyers.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **FulfillmentOrder** | A request to fulfill items from a specific location | Belongs to Order, assigned to Location |
| **Fulfillment** | The actual act of shipping/delivering items | Belongs to Order, has tracking info |
| **FulfillmentService** | A 3P fulfillment provider | Handles fulfillment on behalf of merchant |
| **DeliveryProfile** | Shipping rate configuration | Links Products to shipping rates |
| **DeliveryMethod** | How an order will be delivered | Part of checkout flow |
| **ShippingLine** | The shipping charge on an order | Belongs to Order |
| **CarrierService** | A custom shipping rate provider | Returns dynamic rates at checkout |

**Admin nav:** Orders (fulfillment actions), Settings > Shipping and delivery

---

### 6. Discounts & Marketing

The objects for *promoting* and *incentivizing* purchases.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **DiscountCode** | A code-based discount (e.g., "SAVE10") | Applied at checkout |
| **DiscountAutomatic** | An automatically applied discount | Triggers based on conditions |
| **PriceRule** | Legacy discount configuration | Being replaced by newer discount types |
| **MarketingEvent** | A marketing campaign or activity | Tracks attribution |
| **MarketingActivity** | A specific marketing action | Part of a MarketingEvent |

**Discount types by mutation:**
- `discountCodeBasicCreate` / `discountCodeBxgyCreate` / `discountCodeFreeShippingCreate`
- `discountAutomaticBasicCreate` / `discountAutomaticBxgyCreate`
- Shopify Functions can create custom discount logic

**Admin nav:** Discounts, Marketing

---

### 7. Payments & Billing

The objects handling *money movement*.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **Payment** | An intent to transfer money from buyer to merchant | Authorization + Capture or Sale |
| **Transaction** | A record of a payment event | Belongs to Order |
| **Refund (financial)** | Reimbursement of funds | Linked to Payment |
| **GiftCard** | A prepaid store credit instrument | Can be used as payment |
| **PaymentTerms** | B2B payment terms (Net 30, etc.) | Belongs to CompanyLocation |

**Admin nav:** Settings > Payments, Orders (payment details)

---

### 8. Checkout & Cart

The objects powering the *buying flow*.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **Cart** | A buyer's shopping session | Contains line items, becomes Checkout |
| **Checkout** | The transaction negotiation flow | Becomes Order on completion |
| **CheckoutBranding** | Customization of checkout appearance | Per-shop settings |
| **AbandonedCheckout** | A checkout that wasn't completed | Has buyer and cart data |

**Note:** Cart APIs span Storefront API, Ajax API, and Admin API (in prototype). All operate on the same cart object for shops on Checkout One (C1).

---

### 9. Content & Custom Data

The objects for *extending* the commerce data model.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **Metafield** | Custom data attached to any resource | Key-value pairs with types |
| **Metaobject** | A standalone custom data structure | Defined by MetaobjectDefinition |
| **MetaobjectDefinition** | Schema for a custom object type | Defines fields and access |
| **Page** | A static content page | Part of Online Store |
| **Blog / Article** | Blog content | Part of Online Store |
| **File** | Uploaded media assets | Images, videos, documents |

**Extensibility primitives:** Metafields & Metaobjects are the primary way to extend the Shopify object model without modifying Core.

**Admin nav:** Content, Settings > Custom data

---

### 10. Markets & Localization

The objects for *selling globally*.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **Market** | A geographic or context-based selling region | Has conditions and responders |
| **MarketRegion** | Countries/regions within a market | Defines where a market applies |
| **MarketCurrencySettings** | Currency configuration per market | Part of Market |
| **Translation** | Localized content for resources | Attached to Products, Collections, etc. |

**Markets Platform Primitives:**
- **Drivers** - Buyer properties (region, company_location, app, retail location)
- **Conditions** - Rules buyers must satisfy
- **Responders** - Resources tied to conditions (theme, catalog, delivery strategy)
- **Markets** - Presentation layer on top of conditions

**Admin nav:** Settings > Markets

---

### 11. Store Configuration

The objects defining *how the store operates*.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **Shop** | The merchant's store | Root object for everything |
| **ShopPolicy** | Store policies (privacy, returns, etc.) | Belongs to Shop |
| **Domain** | Custom domains for the store | Primary and additional domains |
| **Theme** | Storefront templates | Online Store appearance |
| **Channel / Publication** | Sales channels (Online Store, POS, etc.) | Controls where products are published |
| **ScriptTag** | Legacy storefront customization | Being replaced by extensions |

**Admin nav:** Settings, Online Store

---

### 12. Apps & Automation

The objects for *extending and automating* Shopify.

| Object | Description | Key Relationships |
|--------|-------------|-------------------|
| **App** | An installed application | Has permissions, webhooks |
| **WebhookSubscription** | Event notification subscription | Triggers on resource changes |
| **Flow** | Automation workflows | Triggered by events, performs actions |
| **ShopifyFunction** | Custom backend logic (discounts, shipping, etc.) | Runs in managed Wasm runtime |

---

## Object Independence & Webhook Topics

From the Next Gen Events Framework, objects get their own webhook topic if they can **exist independently** within their domain:

| Object | Domain | Independent? | Has Own Topic? |
|--------|--------|:---:|:---:|
| Product | Merchandising | Yes | Yes |
| ProductVariant | Merchandising | No (depends on Product) | No |
| InventoryItem | Inventory | Yes (cross-domain from Variant) | Yes |
| Shop | Shop Identity | Yes | Yes |
| FulfillmentOrder | Fulfillments | Yes | Yes |
| Fulfillment | Fulfillments | No (depends on FulfillmentOrder) | No |
| FulfillmentService | Fulfillments | Yes | Yes |
| Order | Orders | Yes | Yes |

---

## How Objects Appear in Admin Navigation

```
Admin/
├── Home                          (shop metrics, guides, insights)
├── Orders                        (Order, DraftOrder, AbandonedCheckout)
├── Products                      (Product, Variant, Collection, Inventory, GiftCard)
├── Customers                     (Customer, Segment, Company)
├── Content                       (Metaobject, File, Page, Blog)
├── Analytics                     (powered by Sales primitives)
├── Marketing                     (MarketingActivity, Campaigns)
├── Discounts                     (DiscountCode, DiscountAutomatic)
├── Online Store                  (Theme, Page, Blog, Domain)
├── Point of Sale                 (Location, Staff, Hardware)
└── Settings
    ├── Shipping and delivery     (DeliveryProfile, CarrierService)
    ├── Payments                  (PaymentProvider)
    ├── Checkout                  (CheckoutBranding)
    ├── Markets                   (Market, MarketRegion)
    ├── Custom data               (Metafield definitions, MetaobjectDefinition)
    ├── Locations                 (Location)
    ├── Taxes and duties          (Tax configuration)
    └── Apps and channels         (App, Channel)
```

---

## Key Architectural Concepts

### Core Extensibility Primitives
1. **Metafields & Metaobjects** - Extend the data model
2. **Functions** - Extend backend logic (discounts, shipping, payment)
3. **UI Extensions** - Extend admin and buyer-facing UIs
4. **APIs, Kits & SDKs** - Programmatic access to commerce data

### Index-to-Detail Pattern
The Admin organizes core primitives (Customers, Orders, Products, Content) into **large indexes** with filtering, sorting, and saved views, linking to detail views. Non-hierarchical organization (tags/attributes) is preferred over fixed hierarchy.

### The Flexible Indexes Principle
> "Our core primitives -- Customers, Orders, Products and even Content -- are organized into large indexes that allow for complex sorting and retrieval of instances of those objects."

---

## Vault References

| Topic | Vault Page |
|-------|-----------|
| Commerce Operating System | [Commerce OS](https://vault.shopify.io/docs/craft/2200-Engineering/development_handbook/overview/platform/Commerce%20Operating%20System) |
| Build Extensibly (Core Kernel) | [RFC](https://vault.shopify.io/docs/codex/rfcs/build-extensibly) |
| Systems of Work & Truth | [RFC](https://vault.shopify.io/docs/codex/rfcs/systems-of-work-and-truth) |
| Orders Domain Boundaries | [Orders Team](https://vault.shopify.io/teams/1672-Orders-and-Returns/docs/Orders%20Domain%20Boundaries) |
| Next Gen Events Framework | [Event Foundations](https://vault.shopify.io/teams/16424-Event-Foundations/docs/next_gen_events/framework) |
| Admin Flexible Indexes | [Admin Design](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin/19872-F-lexible-indexes) |
| Markets Platform Primitives | [Markets](https://vault.shopify.io/teams/16582-Markets/docs/markets-docs/architecture-overview/primitives) |
| Cart APIs | [Cart Team](https://vault.shopify.io/teams/13728-Cart-API/docs/Intro-To-Cart-APIs) |
| Payments Domain Models | [Payments Platform](https://vault.shopify.io/teams/2048-Payments-Platform-Risk/docs/architecture/payments_apps/domain_models) |

---

*Last updated: 2026-02-05*
