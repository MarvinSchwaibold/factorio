# Shopify Merchant Workflows & Jobs to Be Done
## A Comprehensive Reference for Rethinking Admin from First Principles

**Purpose:** This document synthesizes internal Shopify documentation, project data, product architecture, and domain models to provide a complete picture of how merchants work, what they need, and where the current system creates friction. It is designed to feed context to an AI system tasked with rethinking the Shopify Admin from first principles.

**Sourced from:** Vault Pages, Vault Projects, Vault Posts, Product Hierarchy, Data Domain documentation, Admin Navigation guidelines, Growth Strategies Playbook, Merchant Sales Domain, and various team documentation.

---

## Table of Contents

1. [Order Lifecycle](#1-order-lifecycle)
2. [Product Lifecycle](#2-product-lifecycle)
3. [Customer Lifecycle](#3-customer-lifecycle)
4. [Cross-Domain Handoffs](#4-cross-domain-handoffs)
5. [Merchant Mental Model vs. Object Model](#5-merchant-mental-model-vs-object-model)
6. [Jobs to Be Done by Merchant Role](#6-jobs-to-be-done-by-merchant-role)
7. [Jobs to Be Done by Business Stage](#7-jobs-to-be-done-by-business-stage)
8. [Domain Boundary Map](#8-domain-boundary-map)
9. [Common Cross-Section Workflows](#9-common-cross-section-workflows)
10. [Pain Points in Cross-Domain Workflows](#10-pain-points-in-cross-domain-workflows)

---

## 1. Order Lifecycle

### Order Creation Channels

There are three primary ways orders enter the Shopify system:

```
                    +------------------+
                    |  MARKETING       |
                    |  CHANNELS        |
                    |  (Google, Meta,  |
                    |   Instagram)     |
                    +--------+---------+
                             |
                             v
+------------------+  +-----+------+  +------------------+
|  STOREFRONTS     |  |  MARKET-   |  |  WHOLESALE /     |
|  - Online Store  |  |  PLACES    |  |  DRAFT ORDERS    |
|  - Buy Button    |  |  (Amazon,  |  |  - Admin UI      |
|  - Custom (SFAPI)|  |   eBay)    |  |  - Wholesale Ch. |
|  - POS           |  |            |  |  - Phone/Email   |
+--------+---------+  +-----+------+  +--------+---------+
         |                   |                  |
         v                   v                  v
  +-----------+     +--------+------+    +------+-------+
  | Checkout  |     | Order Import  |    | Draft Order  |
  | (Web/API) |     | API           |    | API          |
  +-----------+     +---------------+    +------+-------+
         |                   |                  |
         +-------------------+------------------+
                             |
                             v
                    +--------+---------+
                    |      ORDER       |
                    +------------------+
```

**Source:** [Order creation view](https://vault.shopify.io/docs/craft/2200-Engineering/development_handbook/overview/platform/architecture/additional-views/order-creation-view)

### Key Creation Paths

| Path | Source | Mechanism | Notes |
|------|--------|-----------|-------|
| Buyer checkout | Online Store, Custom Storefronts | Checkout API / Web Checkout | Most common path |
| POS sale | Physical retail | Checkout API (online) / Order Import API (offline fallback) | Dual-mode operation |
| Marketplace import | Amazon, eBay, etc. | Order Import API | Marketplace brokers the transaction |
| Draft order | Admin, phone orders, B2B | Draft Order API -> Checkout for payment | Manual creation, custom pricing |
| Subscription renewal | Subscription contracts | Automated order creation | Recurring, no buyer interaction |

### Full Order Lifecycle Flow

```
CREATION         PAYMENT           FULFILLMENT        DELIVERY          POST-PURCHASE
---------        --------          ------------       ---------         --------------

Order     -->    Payment    -->    Pick/Pack    -->    Shipped    -->    Delivered
Created          Captured         (In Progress)       (Tracking)
                                                                        |
Draft     -->    Invoice    -->    Fulfill      -->    In Transit -->    +-> Return
Order            Sent             (Full/Partial)                        |   Request
                                                                        |
POS       -->    Payment    -->    Fulfilled    -->    Handed     -->    +-> Exchange
Sale             (Immediate)      (Immediate)         to Buyer          |
                                                                        +-> Refund
                                                                        |
                                                                        +-> Review /
                                                                            Feedback
```

### Order States & Transitions

| State | Financial Status | Fulfillment Status | Merchant Action Required |
|-------|-----------------|-------------------|------------------------|
| Open | Authorized / Partially paid | Unfulfilled | Capture payment, begin fulfillment |
| Open | Paid | Unfulfilled | Begin fulfillment |
| Open | Paid | Partially fulfilled | Fulfill remaining items |
| Open | Paid | Fulfilled | Monitor delivery |
| Closed | Paid | Fulfilled + Delivered | Handle any returns |
| Cancelled | Voided / Refunded | Cancelled | Restock inventory |

### Returns & Exchanges (Post-Purchase)

The returns system is being unified across platforms. Key entities:

- **Returns**: Complete return lifecycle entity for post-purchase order changes
- **Exchanges**: Swapping returned products with different items/variants
- **Refunds**: Full or partial return of funds
- **Store Credit**: Alternative to cash refund, retains revenue

**Current state (from Vault projects):**
- Orders team is migrating Returns & Post Purchase to the Checkout One calculation engine ([Project #48392](https://vault.shopify.io/projects/48392))
- POS is moving returns & exchanges into the cart UI for modular workflows ([Project #46968](https://vault.shopify.io/projects/46968))
- Fulfillment card statuses being redesigned with "In Progress" status ([Project #45174](https://vault.shopify.io/projects/45174))

**Source:** [Merchant Sales Domain](https://vault.shopify.io/disciplines/26-Data-Insights/docs/domains-merchant-sales/summary), [Orders & Returns Vision](https://vault.shopify.io/posts/287140)

---

## 2. Product Lifecycle

### Product Creation to Archive Flow

```
CREATION           ENRICHMENT         PUBLISHING          MANAGEMENT         END OF LIFE
---------          -----------        -----------         -----------        -----------

Create      -->    Add Images   -->   Publish to    -->   Update       -->   Archive
Product            Add Variants       Online Store        Pricing
                   Set Pricing        Publish to          Update Stock       Unlist from
Import      -->    Add Metafields     POS                 Add to             Channels
via CSV            Set Inventory      Publish to          Collections
                   Set Shipping       Markets             Run Promos         Delete
Duplicate   -->    Categorize         Publish to          Bundle
Existing           (Taxonomy)         Channels            Adjust SEO
                   Set Tax Info       Publish to
AI Generate -->    Add Options        B2B Catalogs
(Sidekick)         (Size, Color)
```

### Product Object Model

```
Product
├── Title, Description, SEO fields
├── Images / Media / 3D Models
├── Variants (1 to 100+)
│   ├── Price / Compare-at Price
│   ├── SKU / Barcode
│   ├── Inventory Item
│   │   ├── Inventory Levels (per Location)
│   │   │   ├── On Hand
│   │   │   ├── Committed
│   │   │   ├── Available
│   │   │   └── Unavailable
│   │   └── Requires Shipping (bool)
│   ├── Weight / Dimensions
│   └── Options (Size, Color, Material)
├── Collections (many-to-many)
├── Tags
├── Metafields (custom data)
├── Product Type / Vendor
├── Taxonomy Category
├── Publication Status (per Channel/Market/Catalog)
└── Status (Active, Draft, Archived)
```

### Key Product Capabilities Being Built

| Capability | Project | Status | Impact |
|-----------|---------|--------|--------|
| Variant-level publishing | [#47626](https://vault.shopify.io/projects/47626) | Build | Publish/unpublish variants per channel, not just whole products |
| Product Loader Gem | [#46160](https://vault.shopify.io/projects/46160) | Build | Centralize complex market-context product resolution |
| Managed Markets sellability | [#46309](https://vault.shopify.io/projects/46309) | Observe | Real-time sellability decisions using taxonomy |
| Catalog quality | [#48906](https://vault.shopify.io/projects/48906) | Prototype | Fix publishing errors, price mismatches in catalog API |

**Source:** [Products and Pricing team docs](https://vault.shopify.io/teams/146-Products-and-Pricing/docs), Vault product hierarchy

---

## 3. Customer Lifecycle

### Shopify Growth Funnel (AARR Framework)

Shopify uses the AARR framework for merchant customers: Acquisition, Activation, Retention, Revenue.

```
ACQUISITION              ACTIVATION              RETENTION               REVENUE
(Get them to try)        (Get them to value)     (Keep them coming back) (Grow the relationship)

Awareness         -->    Onboard            -->  Initial Repeat   -->    Upsell /
                                                 Usage                   Cross-sell
Interest          -->    First Key           --> Regular           -->    Plan
                         Action                  Usage                   Upgrade
Consideration     -->    Repeat Key          --> Habitual          -->    Product
                         Action                  Usage                   Adoption
Trial             -->                        --> Power User        -->    Expansion
                                                                         (Plus, Markets)
Conversion        -->                        -->                   -->    Advocacy
(Paying Customer)
```

**Source:** [Growth Strategies Playbook](https://vault.shopify.io/docs/shopify-platform-and-product/Growth/Growth%20Strategies)

### Merchant's Customer Lifecycle (Buyer-Side)

The merchant manages their own customers through these stages:

```
ACQUISITION              ENGAGEMENT              RETENTION              WIN-BACK
(Finding buyers)         (Building relationship) (Preventing churn)     (Re-engaging)

Marketing         -->    Order Confirmation -->  Loyalty Programs  -->  Re-engagement
Campaigns                                                               Emails

Social Media      -->    Follow-up Emails   --> Subscription      -->  Win-back
Channels                                        Offers                  Offers

SEO / Organic     -->    Customer Account  -->  Personalized      -->  Targeted
Traffic                  Creation               Recommendations         Discounts

Paid Ads          -->    Support            --> Birthday /         -->  Abandoned
(Audiences,              Interactions           Anniversary             Cart Recovery
Shop Campaigns)                                 Campaigns

Referrals /       -->    Social Proof      -->  VIP / Tiered      -->  Product
Word of Mouth            (Reviews)              Programs                Updates
```

### Customer Data Model in Admin

```
Customer
├── Name, Email, Phone
├── Addresses (shipping, billing)
├── Order History
├── Customer Segments (automated via rules)
├── Tags
├── Metafields
├── Marketing Consent (email, SMS)
├── Tax Exemptions
├── B2B Company (if applicable)
│   ├── Company Locations
│   ├── Catalogs (B2B pricing)
│   └── Payment Terms
├── Customer Events (behavioral tracking)
└── Lifetime Value / Spend metrics
```

### Merchant Marketing Tools (1P)

| Tool | Purpose | Admin Section |
|------|---------|---------------|
| Shopify Email | Send branded emails to segments | Marketing > Campaigns |
| Shopify Forms | Capture leads on storefront | Apps |
| Marketing Automations | Trigger-based flows (abandoned cart, welcome, etc.) | Marketing > Automations |
| Shopify Audiences | Custom audience lists for ad platforms | Apps |
| Shop Campaigns | Shop Cash offers for acquisition | Apps |
| Shopify Collabs | Creator/influencer management | Apps |
| Segmentation | Dynamic customer grouping | Customers > Segments |

**Source:** [Marketing Automation Tools](https://vault.shopify.io/docs/shopify-platform-and-product/Marketing-Automation-Tools), Product hierarchy

---

## 4. Cross-Domain Handoffs

### The Order as Cross-Domain Connector

An order is the single most cross-cutting entity in Shopify. It touches nearly every domain:

```
                         +-----------+
                         |  PRODUCTS |
                         |  (What)   |
                         +-----+-----+
                               |
              +----------------+----------------+
              |                |                |
        +-----+-----+   +-----+-----+   +------+------+
        | INVENTORY  |   | PRICING / |   | COLLECTIONS |
        | (How many) |   | DISCOUNTS |   | (Where)     |
        +-----+------+   | (How much)|   +-------------+
              |           +-----+-----+
              |                 |
              v                 v
        +-----+-----------------+-----+
        |         O R D E R           |
        +----+------+------+----+----+
             |      |      |    |
             v      v      v    v
        +----+-+ +--+--+ +-+--+ +---+-----+
        |FULFILL| |PAY- | |TAX | |CUSTOMERS|
        |MENT   | |MENTS| |    | |         |
        +----+--+ +--+--+ +----+ +---------+
             |        |
             v        v
        +----+--+ +---+------+
        |SHIPPING| |FINANCIAL |
        |TRACKING| |REPORTING |
        +--------+ +----------+
```

### Handoff Map: Where Responsibility Transfers

| From Domain | To Domain | Trigger | Data Exchanged |
|-------------|-----------|---------|----------------|
| **Buyer Activity** | **Merchant Sales** | Order submitted | Order, line items, shipping address |
| **Merchant Sales** | **Logistics** | Fulfillment requested | Order items, destination, shipping method |
| **Merchant Sales** | **Money Products** | Payment processing | Payment amount, method, gateway |
| **Merchant Sales** | **Finance** | Order completed | Revenue, GMV, tax data |
| **Products** | **Inventory** | Product created/updated | Variant -> Inventory Item mapping |
| **Inventory** | **Fulfillment** | Stock allocated at checkout | Committed quantities, location |
| **Fulfillment** | **Shipping** | Package shipped | Tracking number, carrier, ETA |
| **Marketing** | **Merchant Sales** | Campaign drives sale | Attribution data, UTM params |
| **Customers** | **Marketing** | Segment qualification | Customer lists, behavior data |
| **Returns** | **Inventory** | Item restocked | Restock location, quantity adjustment |
| **Returns** | **Payments** | Refund issued | Refund amount, payment method |

**Source:** [Merchant Sales Domain](https://vault.shopify.io/disciplines/26-Data-Insights/docs/domains-merchant-sales/summary), [Data Domains](https://vault.shopify.io/disciplines/26-Data-Insights/docs/data-warehouse/design/domains)

### Cross-Domain Entity: The Order Entity Across Domains

A single entity like `order` appears across multiple data domains with different perspectives:

| Domain | Perspective on "Order" |
|--------|----------------------|
| **Merchant Sales** | The sale agreement: line items, pricing, discounts, tax |
| **Logistics** | The fulfillment task: what to ship, where, when |
| **Marketing** | The conversion event: attribution, campaign effectiveness |
| **Money Products** | The payment transaction: amount captured, fees, payouts |
| **Finance** | The revenue event: GMV, recognized revenue, tax liability |
| **Buyer Activity** | The purchase experience: checkout flow, cart behavior |

**Source:** [Data Domains FAQ](https://vault.shopify.io/disciplines/26-Data-Insights/docs/data-warehouse/design/domains) - "Domains organize around business processes, not entities."

---

## 5. Merchant Mental Model vs. Object Model

### The Core Tension

Merchants think in terms of **business activities and outcomes**. The Shopify Admin is organized around **objects and data types**. This creates a fundamental mismatch.

```
MERCHANT MENTAL MODEL                     ADMIN OBJECT MODEL
(What they want to do)                    (How the system is organized)
==========================                ============================

"I need to get this order out"     vs.    Orders > Order Details >
                                          Fulfillment Section >
                                          Mark as Fulfilled >
                                          (separately) Shipping Settings

"I want to sell in France"         vs.    Settings > Markets >
                                          Settings > Shipping >
                                          Settings > Taxes >
                                          Settings > Payments >
                                          Products > Publishing

"How's my business doing?"         vs.    Analytics (sales) +
                                          Finance (payouts) +
                                          Home (overview) +
                                          Marketing (attribution)

"I need to run a sale"             vs.    Discounts (create code) +
                                          Products (update compare-at) +
                                          Online Store (banner) +
                                          Marketing (promote) +
                                          Email (announce)
```

### Key Mental Model Mismatches (from Vault research)

| Merchant Thinks | System Requires | Friction Created |
|----------------|-----------------|------------------|
| "My product" (singular concept) | Product + Variants + Inventory Items + Inventory Levels (per location) | Multi-step creation across multiple concepts |
| "My price" | Base price + Compare-at price + B2B catalog price + Market price + Discount price | Pricing scattered across 4+ surfaces |
| "Ship this order" | Fulfillment + Shipping Labels + Tracking + Delivery profiles + Locations | Configuration in Settings, execution in Orders |
| "Handle this return" | Return request + Restock + Refund + Exchange + Store Credit | Multiple screens, different logic per path |
| "On hand" vs "Available" | On hand = physical count. Available = on hand minus committed minus unavailable | Mental model shift required (see [inventory launch post](https://vault.shopify.io/posts/161838)) |
| "My sales channels" | Online Store + POS + Each marketplace + Each social channel (separate apps) | No unified "where I sell" view |

### Admin Navigation: Design Philosophy

The Admin navigation is designed to **tell the story of Shopify, not expose the org chart**. Key principles from the [Admin Navigation guidelines](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin/19870-A-dmin-navigation):

- **The "L" Frame**: Left sidebar + topbar is the persistent wayfinding structure
- **Editorial Control**: What appears in nav is an editorial decision requiring Tobi's approval
- **No Experiments in Nav**: Navigation must be stable and consistent
- **Left Sidebar Contents**: Orders, Products, Customers, Sales Channels, Apps, Settings
- **Customization**: Staff can pin channels and apps to the nav
- **Search/Command-K**: Acts as alternate navigation for everything

### What Merchants See vs. What the System Does

```
LEFT NAV (Merchant View)          UNDERLYING SYSTEM (Object Model)
========================          ================================

Home                    -->       Onboarding guides, analytics summary,
                                  action cards, setup progress

Orders                  -->       Orders, Draft Orders, Abandoned Checkouts
  (no sub-nav visible)            (Returns, Exchanges, Refunds are within
                                   individual order detail pages)

Products                -->       Products, Variants, Collections, Inventory,
                                  Transfers, Purchase Orders, Gift Cards

Customers               -->       Customer profiles, Segments, Companies (B2B)

Content                 -->       Files, Metaobjects, Blog posts, Pages

Finance                 -->       Balance, Payouts, Billing, Capital, Credit,
                                  Bill Pay

Analytics               -->       Reports, Live View, ShopifyQL Notebooks

Marketing               -->       Campaigns, Automations, (soon: Growth/S4M)

Discounts               -->       Code discounts, Automatic discounts

[Sales Channels]        -->       Online Store, POS, Shop, Google, Meta, etc.

[Apps]                  -->       3P and 1P apps (pinnable to nav)

Settings (bottom)       -->       ~20 settings pages: Store details, Plan,
                                  Payments, Checkout, Shipping, Taxes,
                                  Markets, Domains, Users, etc.
```

---

## 6. Jobs to Be Done by Merchant Role

### Solo Founder / Owner-Operator

The most common Shopify merchant. Does everything themselves.

| Priority | JTBD | Frequency | Admin Sections Used |
|----------|------|-----------|-------------------|
| 1 | Get orders out the door quickly | Daily | Orders, Shipping |
| 2 | Know how my business is doing at a glance | Daily | Home, Analytics |
| 3 | Add and update products efficiently | Weekly | Products |
| 4 | Respond to customer inquiries | Daily | Customers, Inbox |
| 5 | Run promotions to drive sales | Bi-weekly | Discounts, Marketing, Email |
| 6 | Make sure I get paid and understand fees | Weekly | Finance, Settings > Payments |
| 7 | Keep my storefront looking good | Monthly | Online Store Editor |
| 8 | Understand where my sales come from | Weekly | Analytics, Marketing |
| 9 | Handle returns without losing money | As needed | Orders > Returns |
| 10 | Stay compliant with taxes | Quarterly | Settings > Taxes, Finance |

### Operations Manager (Growing Business)

Focused on efficiency, process, and scaling.

| Priority | JTBD | Frequency | Admin Sections Used |
|----------|------|-----------|-------------------|
| 1 | Process high volumes of orders efficiently | Daily | Orders (bulk actions) |
| 2 | Manage inventory across locations | Daily | Products > Inventory, Transfers |
| 3 | Coordinate fulfillment across warehouses/3PLs | Daily | Orders, Settings > Shipping |
| 4 | Automate repetitive tasks | Weekly | Flow, Automations |
| 5 | Handle returns/exchanges at scale | Daily | Orders > Returns |
| 6 | Manage staff permissions and access | Monthly | Settings > Users |
| 7 | Monitor shipping costs and carrier performance | Weekly | Analytics, Shipping Labels |
| 8 | Manage purchase orders and vendor relationships | Weekly | Inventory > Transfers/POs |
| 9 | Ensure accurate inventory counts (stocktakes) | Monthly | Inventory |
| 10 | Set up and maintain multi-location operations | As needed | Settings > Locations |

### Marketer / Growth Lead

Focused on customer acquisition, retention, and revenue growth.

| Priority | JTBD | Frequency | Admin Sections Used |
|----------|------|-----------|-------------------|
| 1 | Run targeted campaigns across channels | Weekly | Marketing, Email, Audiences |
| 2 | Understand campaign ROI and attribution | Daily | Analytics, Marketing |
| 3 | Segment customers for personalized outreach | Weekly | Customers > Segments |
| 4 | Create and manage discount promotions | Bi-weekly | Discounts |
| 5 | Optimize storefront for conversion | Ongoing | Online Store, Analytics |
| 6 | Build email automation flows | Monthly | Marketing > Automations |
| 7 | Manage social media selling channels | Weekly | Sales Channels (Meta, TikTok) |
| 8 | Run A/B tests on pricing/promotions | Monthly | Discounts, Analytics |
| 9 | Track customer lifetime value | Monthly | Analytics, Customers |
| 10 | Manage SEO and organic traffic | Monthly | Products (SEO), Blog, Pages |

### Retail / POS Manager

Focused on in-person selling operations.

| Priority | JTBD | Frequency | Admin Sections Used |
|----------|------|-----------|-------------------|
| 1 | Process in-store sales quickly | Continuous | POS App |
| 2 | Handle in-store returns and exchanges | Daily | POS App, Orders |
| 3 | Manage in-store inventory | Daily | POS App, Inventory |
| 4 | Set up and manage POS hardware | As needed | POS Channel, Settings |
| 5 | Train and manage retail staff | Monthly | Settings > Users, POS |
| 6 | Reconcile cash and transactions | Daily | POS App, Finance |
| 7 | Manage store-specific promotions | Weekly | Discounts |
| 8 | Handle multi-location stock transfers | Weekly | Inventory > Transfers |
| 9 | Offer local delivery and pickup | Ongoing | Settings > Shipping |
| 10 | Customize POS checkout flow | Monthly | POS Channel Settings |

### B2B / Wholesale Manager

Focused on business-to-business sales operations.

| Priority | JTBD | Frequency | Admin Sections Used |
|----------|------|-----------|-------------------|
| 1 | Manage company accounts and locations | Weekly | Customers > Companies |
| 2 | Create B2B-specific pricing catalogs | Monthly | Products > Catalogs |
| 3 | Process wholesale/draft orders | Daily | Orders > Draft Orders |
| 4 | Set up payment terms (Net 30, etc.) | As needed | Settings > Payments |
| 5 | Send invoices and track payments | Weekly | Draft Orders, Finance |
| 6 | Manage quantity rules (min/max/increment) | Monthly | Products |
| 7 | Provide volume/tiered pricing | Monthly | Products > Pricing |
| 8 | Control product visibility per company | Monthly | Catalogs, Publishing |
| 9 | Handle bulk reorders efficiently | Weekly | Draft Orders |
| 10 | Generate B2B-specific reports | Monthly | Analytics |

---

## 7. Jobs to Be Done by Business Stage

### Stage 1: Starting (0-10 orders, pre-revenue or early revenue)

**Primary goal:** Get to first sale

| JTBD | Critical Path | Current Friction |
|------|---------------|-----------------|
| Set up my store quickly | Setup guide on Home | Many steps feel disconnected |
| Add my first products | Products > Add product | Need to learn variants, inventory, etc. |
| Choose a theme and customize | Online Store > Themes | Separate editing layer (OSE) |
| Set up payments | Settings > Payments | Technical jargon, compliance requirements |
| Configure shipping | Settings > Shipping | Complex: zones, profiles, rates |
| Get my domain | Settings > Domains | Multi-step, DNS knowledge required |
| Make my first sale | Marketing, Social sharing | No unified "promote" action |
| Understand Shopify basics | Help Center, Sidekick | Context-switching out of workflow |

### Stage 2: Growing (10-1000 orders/month, establishing market fit)

**Primary goal:** Scale operations and grow revenue

| JTBD | Critical Path | Current Friction |
|------|---------------|-----------------|
| Process orders faster | Orders list, bulk actions | Limited bulk operations |
| Expand to new sales channels | Sales Channels | Each channel = separate app setup |
| Run my first marketing campaigns | Marketing section | Fragmented across Email, Discounts, Channels |
| Understand my best-selling products | Analytics | Limited product-level insights |
| Start building customer relationships | Customers, Email | Segment creation is powerful but complex |
| Hire staff and delegate | Settings > Users | Permissions model is coarse |
| Sell internationally | Settings > Markets | Requires touching 5+ settings areas |
| Automate repetitive tasks | Flow | Requires understanding triggers/conditions/actions |

### Stage 3: Scaling (1000+ orders/month, multi-channel, multi-location)

**Primary goal:** Operational excellence and efficiency

| JTBD | Critical Path | Current Friction |
|------|---------------|-----------------|
| Manage multi-location inventory | Inventory, Transfers, POs | Transfers UX is basic; POs were paused/redesigned |
| Integrate with ERP/WMS | Apps, API | Requires developer resources |
| Handle high return volumes | Orders > Returns | Returns not fully unified across channels |
| Optimize fulfillment routing | Settings > Shipping | Order routing configuration is complex |
| Manage large product catalogs (10K+) | Products, CSV import/export | Performance degrades at scale |
| Run sophisticated promotions | Discounts, Apps | Native discounts limited; apps fragment experience |
| Advanced analytics and reporting | Analytics, ShopifyQL | Steep learning curve for ShopifyQL |
| Multi-currency/market pricing | Markets, Catalogs | Catalog management is tedious |

### Stage 4: Enterprise (Plus merchants, high GMV, complex operations)

**Primary goal:** Platform flexibility, compliance, customization

| JTBD | Critical Path | Current Friction |
|------|---------------|-----------------|
| Customize checkout experience | Checkout extensibility | Requires developer; limited extension points |
| Multi-store / Organization management | Organization admin | Separate admin layer, limited cross-store views |
| Complex B2B operations | B2B features, Draft Orders | B2B still maturing; draft orders 2.0 in progress |
| Compliance and tax management | Settings > Taxes, Tax app | Tax complexity across jurisdictions |
| API-first operations | Admin API, Storefront API | Rate limits, API versioning complexity |
| Custom workflows | Flow, Functions, Apps | Functions have limited scope |
| Advanced permission controls | Settings > Users | Need granular, role-based permissions |
| Enterprise integrations | Apps, Custom apps | Integration maintenance burden |

---

## 8. Domain Boundary Map

### Shopify Product Hierarchy (Simplified)

The complete product hierarchy from Vault, organized by merchant-facing domains:

```
SHOPIFY PLATFORM
├── SHOPIFY ADMIN (Vanessa Lee / Lawrence Mandel)
│   ├── Home
│   ├── Orders (Manuel Darveau / Mani Fazeli)
│   │   ├── Returns
│   │   ├── Exchanges
│   │   └── Refunds
│   ├── Products (Manuel Darveau / Mani Fazeli)
│   ├── Collections
│   ├── Inventory
│   ├── Customers (Masha Savitskaia / Samir Pradhan)
│   ├── B2B
│   ├── Discounts (Manuel Darveau / Mani Fazeli)
│   ├── Markets + Managed Markets
│   ├── Finance (Weiqing Tu)
│   │   ├── Balance, BillPay, Capital, Credit, Tax
│   ├── Analytics / Reportify
│   ├── Flow (automation)
│   ├── Sidekick (AI assistant)
│   ├── Shopify Mobile App
│   ├── Admin API + App Extensions + Functions
│   └── Metafields + Metaobjects
│
├── CHECKOUT (Manuel Darveau / Mani Fazeli)
│   ├── Cart
│   ├── Checkout Page
│   ├── Draft Orders
│   ├── Gift Cards / Store Credit
│   ├── Payment Methods / Shopify Payments / Shop Pay
│   └── Customer Accounts
│
├── STOREFRONTS (Vanessa Lee / Manuel Darveau)
│   ├── Online Store Editor
│   ├── Themes (1P + Theme Store)
│   ├── Hydrogen + Oxygen (headless)
│   ├── Storefront API
│   └── Storefront Search
│
├── SHOPIFY RETAIL (Patrick Joyce / Ray Reddy)
│   ├── POS App
│   ├── POS Channel
│   ├── POS Checkout
│   └── POS Hardware
│
├── FULFILLMENT (Patrick Joyce)
│   ├── SFN (Fulfillment Network)
│   └── Shop Promise
│
├── SHOPIFY APPS (Vanessa Lee)
│   ├── Marketing: Email, Audiences, Campaigns, Collabs, Collective
│   ├── Shop Campaigns
│   ├── Marketplace Connect
│   ├── Shopify Inbox
│   └── Sell for Me (Growth Agent)
│
├── SHOPIFY ECOSYSTEM (Lawrence Mandel / Eytan Seidman)
│   ├── App Store
│   ├── Developer Platform
│   ├── Shopify CLI
│   └── Dev Docs
│
├── SHOP (Archie Abrams / Max Da Silva)
│   ├── Shop App (buyer-facing)
│   ├── Shop Web
│   └── Shop Package Tracking
│
└── PLATFORM INFRASTRUCTURE (Mattie Toia)
    ├── Data Storage, Networking, Observability
    ├── Identity, Trust, Security
    ├── Catalogue (product understanding)
    ├── Search Platform
    ├── Webhooks
    └── Shopify Data Platform
```

**Source:** [Vault Product Hierarchy](https://vault.shopify.io/products/0-Shopify)

### Data Domain Boundary Map

Data domains represent stable business process boundaries, organized differently from product teams:

```
COMMERCE CLUSTER                    FOUNDATIONS CLUSTER
├── Logistics                       ├── Accounts & Administration
│   (fulfillment, shipping,         │   (merchants, staff, shops,
│    delivery, tracking)            │    permissions, organizations)
│                                   │
├── Merchandising                   ├── Apps & Developers
│   (products, collections,         │   (app installs, API usage,
│    catalogs, inventory)           │    partner ecosystem)
│                                   │
└── Merchant Sales                  ├── Finance
    (orders, line items,            │   (revenue, billing, GMV,
     returns, exchanges,            │    subscriptions, payouts)
     draft orders, tax)             │
                                    └── Infrastructure
UPSELL CLUSTER                          (platform, services,
├── Buyer Activity                       compute, storage)
│   (checkout, cart, sessions,
│    storefront behavior)          SENSITIVE CLUSTER
│                                   ├── People (HR data)
├── Marketing                       ├── Risk (merchant trust)
│   (campaigns, attribution,        └── Security
│    channels, SEO)
│
├── Money Products
│   (Shopify Payments, Balance,
│    Capital, Credit, Lending)
│
├── Sales
│   (revenue ops, sales team
│    activities, pipeline)
│
└── Support
    (tickets, advisor metrics,
     support quality)
```

### Domain Boundary Handoffs (from Merchant Sales Domain doc)

```
                    +-------------------+
                    | BUYER ACTIVITY    |
                    | (checkout,        |
                    |  storefront)      |
                    +--------+----------+
                             |
                    INBOUND: Order submitted
                             |
                             v
                    +--------+----------+
                    | MERCHANT SALES    |
                    | (orders, returns, |
                    |  tax, discounts)  |
                    +--+------+------+--+
                       |      |      |
          OUTBOUND:    |      |      |    OUTBOUND:
          Fulfillment  |      |      |    Revenue/GMV
          requested    |      |      |    rollups
                       v      |      v
              +--------+--+  |  +---+---------+
              | LOGISTICS  |  |  | FINANCE     |
              | (shipping, |  |  | (revenue,   |
              |  delivery) |  |  |  reporting) |
              +------------+  |  +-------------+
                              |
                    OUTBOUND: Payment
                    processing
                              |
                              v
                    +---------+---------+
                    | MONEY PRODUCTS    |
                    | (payments,        |
                    |  payouts, fees)   |
                    +-------------------+
```

**Source:** [Merchant Sales Domain summary](https://vault.shopify.io/disciplines/26-Data-Insights/docs/domains-merchant-sales/summary)

---

## 9. Common Cross-Section Workflows

These are workflows merchants perform regularly that require navigating multiple Admin sections.

### Workflow 1: "Launch a New Product"

```
Step 1: Products > Add Product           (create product, variants, media)
Step 2: Products > Product > Inventory   (set stock levels per location)
Step 3: Products > Product > Publishing  (publish to channels)
Step 4: Collections > Add to collection  (organize for storefront)
Step 5: Online Store > Editor            (feature on homepage)
Step 6: Marketing > Create campaign      (announce via email)
Step 7: Discounts > Create discount      (launch promotion)

Sections touched: Products, Inventory, Collections, Online Store,
                  Marketing, Discounts (6 sections, minimum 7 navigation events)
```

### Workflow 2: "Fulfill an Order"

```
Step 1: Orders > Select order            (review order details)
Step 2: Orders > Fulfill items           (select items, location)
Step 3: Orders > Buy shipping label      (if using Shopify Shipping)
                 OR
         Mark as fulfilled + add tracking (if using 3P carrier)
Step 4: (Automatically) Customer gets    (tracking notification)
         notification

Pre-requisites configured in:
- Settings > Shipping (delivery profiles, rates)
- Settings > Locations (fulfillment locations)
- Settings > Notifications (email templates)

Sections touched: Orders + 3 Settings sub-pages (if configuring)
```

### Workflow 3: "Expand to a New International Market"

```
Step 1:  Settings > Markets > Add market          (define market)
Step 2:  Settings > Markets > Currency             (set pricing)
Step 3:  Settings > Markets > Domains              (set localized URL)
Step 4:  Settings > Markets > Languages            (translations)
Step 5:  Settings > Shipping > Add shipping zone   (international rates)
Step 6:  Settings > Taxes > Configure for region   (tax collection)
Step 7:  Settings > Payments > Check availability  (payment methods)
Step 8:  Products > Review publishing              (per-market availability)
Step 9:  Settings > Duties (if applicable)         (import duties)
Step 10: Settings > Checkout > Customize           (localized checkout)

Sections touched: 6+ Settings sub-pages, Products (10+ navigation events)
```

### Workflow 4: "Handle a Return"

```
Step 1: Orders > Find order                  (search/filter)
Step 2: Orders > Order detail > Create return (select items, reason)
Step 3: Orders > Return > Issue refund        (choose amount, method)
                 OR
         Orders > Return > Create exchange    (select replacement items)
Step 4: Orders > Return > Restock items       (update inventory)
Step 5: (If exchange) New order created        (may need separate fulfillment)

Sections touched: Orders (primarily), but inventory is affected behind the scenes
Complexity: Different flows for online vs. POS vs. 3P returns app
```

### Workflow 5: "Run a Holiday Sale"

```
Step 1: Discounts > Create discount code   (or automatic discount)
Step 2: Products > Update compare-at prices (show strikethrough pricing)
Step 3: Online Store > Editor              (add sale banner, featured collection)
Step 4: Marketing > Create email campaign  (announce to subscribers)
Step 5: Marketing > Create ad campaign     (paid promotion)
Step 6: Analytics > Monitor performance    (track during sale)
Step 7: Products > Revert prices           (end sale)
Step 8: Discounts > Deactivate codes       (close promotion)

Sections touched: Discounts, Products, Online Store, Marketing, Analytics
                  (5 sections, 8+ steps)
```

### Workflow 6: "Set Up POS for a New Retail Location"

```
Step 1:  Settings > Locations > Add location     (physical address)
Step 2:  POS Channel > Set up location           (POS-specific config)
Step 3:  Settings > Shipping > Local delivery    (if offering)
Step 4:  Settings > Shipping > Local pickup      (configure pickup)
Step 5:  Products > Inventory > Stock location   (assign inventory)
Step 6:  POS App > Connect hardware              (card reader, printer)
Step 7:  POS App > Configure smart grid          (customize checkout)
Step 8:  Settings > Users > Add staff            (POS access)
Step 9:  POS Channel > Staff permissions         (retail roles)
Step 10: Settings > Taxes > Location tax         (register for location)

Sections touched: Settings (multiple sub-pages), POS Channel, POS App,
                  Products, Inventory (10+ steps across 5+ sections)
```

---

## 10. Pain Points in Cross-Domain Workflows

### Structural Pain Points

| Pain Point | Description | Impact | Evidence |
|-----------|-------------|--------|----------|
| **Settings Sprawl** | Settings contains 20+ sub-pages with no hierarchy | Merchants can't find what they need | Shipping settings page "more than twice the height of the sidebar" ([Project #47929](https://vault.shopify.io/projects/47929)) |
| **Object-Oriented Navigation** | Nav organized by data type (Orders, Products) not by workflow | Merchants must learn Shopify's data model | Admin Navigation principles doc: "tell the story of Shopify, not expose org chart" |
| **Channel Fragmentation** | Each sales channel is a separate app with separate setup | No unified "where I sell" view | Each channel requires separate onboarding, separate config |
| **Config/Execution Split** | Configuration in Settings, execution in Orders/Products | Context-switching for simple tasks | Shipping config in Settings, label buying in Orders |
| **Returns Fragmentation** | Returns logic differs between online, POS, and apps | Inconsistent merchant experience | POS migrating to cart-based returns ([Project #46968](https://vault.shopify.io/projects/46968)); Returns being unified on Checkout One engine ([Project #48392](https://vault.shopify.io/projects/48392)) |

### Workflow-Specific Pain Points

| Workflow | Pain Point | Description |
|----------|-----------|-------------|
| **Product Creation** | Publishing complexity | Can't publish/unpublish at variant level (being fixed: [#47626](https://vault.shopify.io/projects/47626)). Must create product before stocking inventory at scale. |
| **Inventory Management** | Multi-location complexity | "On hand" vs "Available" mental model shift caused confusion at launch. Transfers UX was paused and redesigned. SKU sharing limitations for fulfillment services ([#47563](https://vault.shopify.io/projects/47563)). |
| **International Expansion** | 10+ step workflow | Requires touching Markets, Shipping, Taxes, Payments, Products, Duties, Languages, Domains. No unified "sell in [country]" workflow. |
| **Discounts** | Limited native capabilities | Apps break system of record for products, discounts, inventory. Gift-with-purchase apps create workarounds using draft orders and product duplication. Discounts platform being rebuilt for extensibility. |
| **Shipping Configuration** | Complexity at scale | Delivery profiles, zones, rates, conditions, carrier services. "Incredibly complex space" per project updates. Being redesigned with new shipping options UI. |
| **B2B Operations** | Maturity gaps | Catalog management tedious (must duplicate and swap). Draft orders workflow needs modernization. Payment terms, volume pricing, net terms still evolving. |
| **Analytics** | Fragmented data views | Sales data in Analytics, marketing attribution in Marketing, financial data in Finance. No single "how's my business" view. |
| **Domain Renewals** | Self-serve gaps | Autorenew fails >40% of the time. No way for merchants to manually retry renewal. 13% of domain tickets ([#48162](https://vault.shopify.io/projects/48162)). |

### Emerging Shifts & Opportunities

| Shift | Description | Implications for Admin Redesign |
|-------|-------------|-------------------------------|
| **Agentic Commerce** | AI agents ordering on behalf of consumers | Orders may come from non-human sources; need new order creation paths |
| **Sell for Me** | Growth Agent replacing Marketing tab | Merchant sets goals and guardrails, agent executes |
| **Product Network** | Cross-merchant product syndication | Publishers need visibility into network orders |
| **Merchant-driven Optimizations** | Native A/B testing and scheduling | Theme drafts, scheduled changes across surfaces |
| **Checkout One Unification** | Single calculation engine for all order modifications | Returns, exchanges, post-purchase all on one engine |
| **Package Architecture** | Isolated packages in Admin codebase | Enables faster development, better AI tooling ([#47421](https://vault.shopify.io/projects/47421)) |

---

## Appendix A: Vault Source References

### Pages
- [Order Creation View](https://vault.shopify.io/docs/craft/2200-Engineering/development_handbook/overview/platform/architecture/additional-views/order-creation-view)
- [Admin Navigation](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin/19870-A-dmin-navigation)
- [Commerce Components Product](https://vault.shopify.io/docs/shopify-platform-and-product/Commerce-Components/product)
- [Data Domains](https://vault.shopify.io/disciplines/26-Data-Insights/docs/data-warehouse/design/domains)
- [Merchant Sales Domain](https://vault.shopify.io/disciplines/26-Data-Insights/docs/domains-merchant-sales/summary)
- [Growth Strategies Playbook](https://vault.shopify.io/docs/shopify-platform-and-product/Growth/Growth%20Strategies)
- [Marketing Automation Tools](https://vault.shopify.io/docs/shopify-platform-and-product/Marketing-Automation-Tools)
- [Products and Pricing](https://vault.shopify.io/teams/146-Products-and-Pricing/docs)
- [Customers Architecture - DDD Primer](https://vault.shopify.io/docs/craft/2200-Engineering/development_handbook/developing_at_Shopify/core/components/customers/architecture_primer)
- [Inventory Surface Areas](https://vault.shopify.io/teams/126-Inventory/docs/16371-How-we-work/19585-A-ddressing-Bugs/19600-I-nventory-Surface-Areas)
- [Creating Guides in Core](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Communications/Growth-Systems/Guides/Creating-Guides/Building-Guides)

### Projects
- [Variant Level Publishing (#47626)](https://vault.shopify.io/projects/47626)
- [Fulfillment Statuses Redesign (#45174)](https://vault.shopify.io/projects/45174)
- [Returns & Post Purchase on Checkout One (#48392)](https://vault.shopify.io/projects/48392)
- [POS Returns & Exchanges in Cart (#46968)](https://vault.shopify.io/projects/46968)
- [Uplift Shipping Settings (#47929)](https://vault.shopify.io/projects/47929)
- [Admin Package Architecture (#47421)](https://vault.shopify.io/projects/47421)
- [Enable SKU Sharing (#47563)](https://vault.shopify.io/projects/47563)
- [Product Loader Gem (#46160)](https://vault.shopify.io/projects/46160)
- [Domain Self-Serve Renewals (#48162)](https://vault.shopify.io/projects/48162)
- [Catalog Quality (#48906)](https://vault.shopify.io/projects/48906)
- [Managed Markets Migration (#48172)](https://vault.shopify.io/projects/48172)
- [Discounts by Market (#43504)](https://vault.shopify.io/projects/43504)

### Posts & Discussions
- [Orders & Returns Vision Discussion](https://vault.shopify.io/posts/287140)
- [Returns & Exchanges in Cart Greenpath](https://vault.shopify.io/posts/301526)
- [Inventory On Hand/Unavailable Launch](https://vault.shopify.io/posts/161838)
- [Merchant Mental Model for Apps](https://vault.shopify.io/posts/33381)
- [Shipping JTBD and Problems](https://vault.shopify.io/posts/191561)
- [Finances JTBD](https://vault.shopify.io/posts/105669)

### Missions
- [Merchant-driven Optimizations](https://vault.shopify.io/gsd/missions/8538)

---

## Appendix B: Commerce Components (Platform View)

The Commerce Components breakdown shows how Shopify positions its platform capabilities:

| Component Group | Components |
|----------------|------------|
| **Storefront** | Storefront API, Liquid, Content, Hydrogen, Oxygen, Storefront Search |
| **Cart + Checkout** | Cart, Payments Platform, Fraud Protection, Checkout Platform, Tax Platform |
| **Core Commerce** | Product Catalog, Markets, Customer Data, Functions, Custom Data Models, Subscriptions, Discounts, B2B |
| **Data + Compliance** | Data Analysis, Card Data/Vaulting, Marketing Insights, Security/Compliance |
| **Shipping + Logistics** | Fulfillment, Inventory, Order Management, Shipping Labels API, Returns |
| **Omnichannel** | POS, Customer Accounts, Social Commerce |

**Source:** [Commerce Components](https://vault.shopify.io/docs/shopify-platform-and-product/Commerce-Components/product)

---

*Last updated: 2026-02-05*
